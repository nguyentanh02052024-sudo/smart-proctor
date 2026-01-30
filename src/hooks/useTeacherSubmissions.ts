import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Get all submissions for teacher's exams
export function useTeacherSubmissions(examId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['teacher-submissions', user?.id, examId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('exam_attempts')
        .select(`
          *,
          exam:exams!inner(*),
          student:profiles!exam_attempts_student_id_fkey(id, full_name, email),
          violations:violation_logs(count)
        `)
        .eq('exams.teacher_id', user.id)
        .order('started_at', { ascending: false });
      
      if (examId) {
        query = query.eq('exam_id', examId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data.map(submission => ({
        ...submission,
        violations_count: submission.violations?.[0]?.count || 0,
      }));
    },
    enabled: !!user,
  });
}

// Get detailed submission with answers
export function useSubmissionDetails(attemptId: string) {
  return useQuery({
    queryKey: ['submission-details', attemptId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_attempts')
        .select(`
          *,
          exam:exams(*),
          student:profiles!exam_attempts_student_id_fkey(*),
          answers:answers(
            *,
            question:questions(*)
          ),
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

// Flag/unflag submission
export function useFlagSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      attemptId,
      isFlagged,
      reason,
    }: {
      attemptId: string;
      isFlagged: boolean;
      reason?: string;
    }) => {
      const { error } = await supabase
        .from('exam_attempts')
        .update({
          is_flagged: isFlagged,
          flag_reason: reason || null,
        })
        .eq('id', attemptId);
      
      if (error) throw error;
    },
    onSuccess: (_, { isFlagged }) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-submissions'] });
      toast.success(isFlagged ? 'Đã đánh dấu nghi vấn gian lận' : 'Đã bỏ đánh dấu');
    },
  });
}

// Cancel submission
export function useCancelSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      attemptId,
      reason,
    }: {
      attemptId: string;
      reason: string;
    }) => {
      const { error } = await supabase
        .from('exam_attempts')
        .update({
          is_cancelled: true,
          cancel_reason: reason,
        })
        .eq('id', attemptId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-submissions'] });
      toast.success('Đã hủy kết quả bài thi');
    },
  });
}

// Grade essay answer
export function useGradeAnswer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      answerId,
      points,
    }: {
      answerId: string;
      points: number;
    }) => {
      const { error } = await supabase
        .from('answers')
        .update({
          points_awarded: points,
          is_graded: true,
        })
        .eq('id', answerId);
      
      if (error) throw error;
      
      // Recalculate total score for the attempt
      const { data: answer } = await supabase
        .from('answers')
        .select('attempt_id')
        .eq('id', answerId)
        .single();
      
      if (answer) {
        const { data: allAnswers } = await supabase
          .from('answers')
          .select('points_awarded')
          .eq('attempt_id', answer.attempt_id);
        
        const totalScore = allAnswers?.reduce((sum, a) => sum + (a.points_awarded || 0), 0) || 0;
        
        await supabase
          .from('exam_attempts')
          .update({
            score: totalScore,
            total_points: totalScore,
          })
          .eq('id', answer.attempt_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission-details'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-submissions'] });
      toast.success('Đã chấm điểm');
    },
  });
}

// Get violation logs for an attempt (realtime)
export function useViolationLogs(attemptId: string) {
  return useQuery({
    queryKey: ['violations', attemptId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('violation_logs')
        .select('*')
        .eq('attempt_id', attemptId)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!attemptId,
    refetchInterval: 5000, // Poll every 5 seconds for near-realtime
  });
}
