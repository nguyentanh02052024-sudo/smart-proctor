export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  teacher_id: string;
  duration_minutes: number;
  start_time?: string;
  end_time?: string;
  max_violations: number;
  require_camera: boolean;
  auto_submit_on_violation: boolean;
  is_published: boolean;
  created_at: string;
}

export interface Question {
  id: string;
  exam_id: string;
  type: 'multiple_choice_single' | 'multiple_choice_multiple' | 'essay';
  content: string;
  image_url?: string;
  options?: QuestionOption[];
  correct_answers?: string[];
  points: number;
  order_index: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  image_url?: string;
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  student_id: string;
  started_at: string;
  submitted_at?: string;
  score?: number;
  is_flagged: boolean;
  flag_reason?: string;
  is_cancelled: boolean;
  cancel_reason?: string;
}

export interface Answer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_options?: string[];
  essay_answer?: string;
  points_awarded?: number;
  is_graded: boolean;
}

export interface ViolationLog {
  id: string;
  attempt_id: string;
  type: 'tab_switch' | 'window_blur' | 'camera_off' | 'camera_denied' | 'browser_minimize';
  timestamp: string;
  details?: string;
}

export interface ExamWithQuestions extends Exam {
  questions: Question[];
}

export interface AttemptWithDetails extends ExamAttempt {
  exam: Exam;
  student: User;
  violations: ViolationLog[];
  answers: Answer[];
}
