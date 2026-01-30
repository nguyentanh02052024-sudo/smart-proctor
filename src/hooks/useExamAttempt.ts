import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { ExamAttempt, Answer, ViolationLog, QuestionOption } from '@/types/exam';
import { toast } from 'sonner';

// Start an exam attempt
export function useStartAttempt() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (examId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      // Check for existing incomplete attempt
      const { data: existing } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('exam_id', examId)
        .eq('student_id', user.id)
        .is('submitted_at', null)
        .maybeSingle();
      
      if (existing) {
        return existing;
      }
      
      // Create new attempt
      const { data, error } = await supabase
        .from('exam_attempts')
        .insert({
          exam_id: examId,
          student_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-attempts'] });
    },
  });
}

// Get current attempt with exam details
export function useCurrentAttempt(attemptId: string) {
  return useQuery({
    queryKey: ['attempt', attemptId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_attempts')
        .select(`
          *,
          exam:exams(*),
          answers:answers(*),
          violations:violation_logs(*)
        `)
        .eq('id', attemptId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!attemptId,
  });
}

// Save answer
export function useSaveAnswer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      attemptId,
      questionId,
      selectedOptions,
      essayAnswer,
    }: {
      attemptId: string;
      questionId: string;
      selectedOptions?: string[];
      essayAnswer?: string;
    }) => {
      // Upsert answer
      const { error } = await supabase
        .from('answers')
        .upsert({
          attempt_id: attemptId,
          question_id: questionId,
          selected_options: selectedOptions,
          essay_answer: essayAnswer,
        }, {
          onConflict: 'attempt_id,question_id',
          ignoreDuplicates: false,
        });
      
      if (error) {
        // If upsert fails, try insert then update
        const { data: existing } = await supabase
          .from('answers')
          .select('id')
          .eq('attempt_id', attemptId)
          .eq('question_id', questionId)
          .maybeSingle();
        
        if (existing) {
          const { error: updateError } = await supabase
            .from('answers')
            .update({
              selected_options: selectedOptions,
              essay_answer: essayAnswer,
            })
            .eq('id', existing.id);
          
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from('answers')
            .insert({
              attempt_id: attemptId,
              question_id: questionId,
              selected_options: selectedOptions,
              essay_answer: essayAnswer,
            });
          
          if (insertError) throw insertError;
        }
      }
    },
  });
}

// Log violation
export function useLogViolation() {
  return useMutation({
    mutationFn: async ({
      attemptId,
      type,
      details,
    }: {
      attemptId: string;
      type: ViolationLog['type'];
      details?: string;
    }) => {
      const { error } = await supabase
        .from('violation_logs')
        .insert({
          attempt_id: attemptId,
          type,
          details,
        });
      
      if (error) throw error;
    },
  });
}

// Submit exam and get results
export function useSubmitExam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attemptId: string) => {
      // First, get the attempt with all answers and questions
      const { data: attempt, error: fetchError } = await supabase
        .from('exam_attempts')
        .select(`
          *,
          exam:exams!inner(*),
          answers:answers(
            *,
            question:questions(*)
          )
        `)
        .eq('id', attemptId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Calculate score for multiple choice questions
      let totalScore = 0;
      let maxScore = 0;
      
      // Get all questions for the exam
      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', attempt.exam_id);
      
      if (questions) {
        for (const question of questions) {
          maxScore += question.points;
          
          const answer = attempt.answers?.find((a: any) => a.question_id === question.id);
          
          if (question.type !== 'essay' && answer) {
            const selectedOptions = answer.selected_options || [];
            const correctAnswers = question.correct_answers || [];
            
            // Check if answer is correct
            const isCorrect = 
              selectedOptions.length === correctAnswers.length &&
              selectedOptions.every((opt: string) => correctAnswers.includes(opt));
            
            if (isCorrect) {
              totalScore += question.points;
            }
            
            // Update answer with points
            await supabase
              .from('answers')
              .update({
                points_awarded: isCorrect ? question.points : 0,
                is_graded: true,
              })
              .eq('id', answer.id);
          }
        }
      }
      
      // Update attempt with submission and score
      const { data: updatedAttempt, error: updateError } = await supabase
        .from('exam_attempts')
        .update({
          submitted_at: new Date().toISOString(),
          score: totalScore,
          total_points: totalScore,
          max_points: maxScore,
          graded_at: new Date().toISOString(),
        })
        .eq('id', attemptId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      return {
        attempt: updatedAttempt,
        totalScore,
        maxScore,
        percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-attempts'] });
      toast.success('Đã nộp bài thành công!');
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi nộp bài', { description: error.message });
    },
  });
}

// Get student's attempts
export function useStudentAttempts() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['student-attempts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('exam_attempts')
        .select(`
          *,
          exam:exams(
            *,
            teacher:profiles!exams_teacher_id_fkey(full_name)
          )
        `)
        .eq('student_id', user.id)
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Get available exams for students
export function useAvailableExams() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['available-exams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          teacher:profiles!exams_teacher_id_fkey(full_name),
          questions:questions(count)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get student's attempts to filter out completed exams
      if (user) {
        const { data: attempts } = await supabase
          .from('exam_attempts')
          .select('exam_id, submitted_at')
          .eq('student_id', user.id);
        
        const completedExamIds = attempts
          ?.filter(a => a.submitted_at)
          .map(a => a.exam_id) || [];
        
        return data.map(exam => ({
          ...exam,
          questions_count: exam.questions?.[0]?.count || 0,
          is_completed: completedExamIds.includes(exam.id),
        }));
      }
      
      return data.map(exam => ({
        ...exam,
        questions_count: exam.questions?.[0]?.count || 0,
      }));
    },
  });
}
