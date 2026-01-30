import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Question, QuestionOption } from '@/types/exam';
import type { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';

// Fetch teacher's exams
export function useTeacherExams() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['teacher-exams', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          questions:questions(count),
          attempts:exam_attempts(count)
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(exam => ({
        ...exam,
        questions_count: (exam.questions as any)?.[0]?.count || 0,
        attempts_count: (exam.attempts as any)?.[0]?.count || 0,
      }));
    },
    enabled: !!user,
  });
}

// Fetch single exam with questions
export function useExam(examId: string) {
  return useQuery({
    queryKey: ['exam', examId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          questions:questions(*)
        `)
        .eq('id', examId)
        .single();
      
      if (error) throw error;
      
      // Transform questions options from jsonb to typed array
      const questions = (data.questions as any[])?.map((q) => ({
        ...q,
        options: q.options as QuestionOption[] | null,
      })).sort((a, b) => a.order_index - b.order_index);
      
      return {
        ...data,
        questions,
      };
    },
    enabled: !!examId,
  });
}

// Fetch exam by access key - using explicit fetch to avoid TypeScript depth issues
export function useExamByKey(accessKey: string) {
  return useQuery({
    queryKey: ['exam-by-key', accessKey],
    queryFn: async () => {
      if (!accessKey || accessKey.length < 6) return null;
      
      // Use fetch to bypass TS depth issues with chained Supabase methods
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/exams?access_key=eq.${accessKey.toUpperCase()}&is_published=eq.true&select=*`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );
      
      const exams = await response.json();
      const exam = exams?.[0];
      
      if (!exam) return null;
      
      // Get teacher info
      const teacherResponse = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${exam.teacher_id}&select=full_name`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );
      
      const teachers = await teacherResponse.json();
      
      return { ...exam, teacher: teachers?.[0] || null };
    },
    enabled: !!accessKey && accessKey.length >= 6,
  });
}

// Create new exam
export function useCreateExam() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (examData: {
      title: string;
      description?: string;
      duration_minutes: number;
      max_violations: number;
      require_camera: boolean;
      auto_submit_on_violation: boolean;
      start_time?: string;
      end_time?: string;
      questions: Partial<Question>[];
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Create exam
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .insert({
          title: examData.title,
          description: examData.description,
          duration_minutes: examData.duration_minutes,
          max_violations: examData.max_violations,
          require_camera: examData.require_camera,
          auto_submit_on_violation: examData.auto_submit_on_violation,
          start_time: examData.start_time,
          end_time: examData.end_time,
          teacher_id: user.id,
        })
        .select()
        .single();
      
      if (examError) throw examError;
      
      // Create questions
      if (examData.questions.length > 0) {
        const questionsToInsert = examData.questions.map((q, index) => ({
          exam_id: exam.id,
          type: q.type || ('multiple_choice_single' as const),
          content: q.content || '',
          points: q.points || 1,
          order_index: index,
          options: (q.options as unknown as Json) || null,
          correct_answers: q.correct_answers || [],
          image_url: q.image_url || null,
        }));
        
        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questionsToInsert);
        
        if (questionsError) throw questionsError;
      }
      
      return exam;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-exams'] });
      toast.success('Đã tạo bài kiểm tra thành công!');
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi tạo bài kiểm tra', { description: error.message });
    },
  });
}

// Publish/unpublish exam
export function usePublishExam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ examId, isPublished }: { examId: string; isPublished: boolean }) => {
      const { error } = await supabase
        .from('exams')
        .update({ is_published: isPublished })
        .eq('id', examId);
      
      if (error) throw error;
    },
    onSuccess: (_, { isPublished }) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-exams'] });
      toast.success(isPublished ? 'Đã xuất bản bài kiểm tra' : 'Đã ẩn bài kiểm tra');
    },
  });
}

// Delete exam
export function useDeleteExam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (examId: string) => {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-exams'] });
      toast.success('Đã xóa bài kiểm tra');
    },
  });
}
