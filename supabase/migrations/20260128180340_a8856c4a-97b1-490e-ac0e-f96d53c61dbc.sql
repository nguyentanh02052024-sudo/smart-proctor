-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('teacher', 'student');

-- Create enum for question types
CREATE TYPE public.question_type AS ENUM ('multiple_choice_single', 'multiple_choice_multiple', 'essay');

-- Create enum for violation types
CREATE TYPE public.violation_type AS ENUM ('tab_switch', 'window_blur', 'camera_off', 'camera_denied', 'browser_minimize');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create exams table
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  max_violations INTEGER NOT NULL DEFAULT 3,
  require_camera BOOLEAN NOT NULL DEFAULT true,
  auto_submit_on_violation BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on exams
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Exams policies
CREATE POLICY "Teachers can manage their own exams"
ON public.exams FOR ALL
TO authenticated
USING (teacher_id = auth.uid());

CREATE POLICY "Students can view published exams"
ON public.exams FOR SELECT
TO authenticated
USING (is_published = true);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  type question_type NOT NULL DEFAULT 'multiple_choice_single',
  content TEXT NOT NULL,
  image_url TEXT,
  options JSONB,
  correct_answers TEXT[],
  points NUMERIC NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Questions policies
CREATE POLICY "Teachers can manage questions for their exams"
ON public.questions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.exams 
    WHERE exams.id = questions.exam_id 
    AND exams.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view questions for published exams during attempt"
ON public.questions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.exams 
    WHERE exams.id = questions.exam_id 
    AND exams.is_published = true
  )
);

-- Create exam_attempts table
CREATE TABLE public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  score NUMERIC,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  flag_reason TEXT,
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  cancel_reason TEXT,
  UNIQUE(exam_id, student_id)
);

-- Enable RLS on exam_attempts
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

-- Exam attempts policies
CREATE POLICY "Students can manage their own attempts"
ON public.exam_attempts FOR ALL
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Teachers can view attempts for their exams"
ON public.exam_attempts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.exams 
    WHERE exams.id = exam_attempts.exam_id 
    AND exams.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can update attempts for their exams"
ON public.exam_attempts FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.exams 
    WHERE exams.id = exam_attempts.exam_id 
    AND exams.teacher_id = auth.uid()
  )
);

-- Create answers table
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_options TEXT[],
  essay_answer TEXT,
  points_awarded NUMERIC,
  is_graded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on answers
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Answers policies
CREATE POLICY "Students can manage their own answers"
ON public.answers FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.exam_attempts 
    WHERE exam_attempts.id = answers.attempt_id 
    AND exam_attempts.student_id = auth.uid()
  )
);

CREATE POLICY "Teachers can view and grade answers for their exams"
ON public.answers FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.exam_attempts 
    JOIN public.exams ON exams.id = exam_attempts.exam_id
    WHERE exam_attempts.id = answers.attempt_id 
    AND exams.teacher_id = auth.uid()
  )
);

-- Create violation_logs table
CREATE TABLE public.violation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  type violation_type NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  details TEXT
);

-- Enable RLS on violation_logs
ALTER TABLE public.violation_logs ENABLE ROW LEVEL SECURITY;

-- Violation logs policies
CREATE POLICY "Students can insert violations for their attempts"
ON public.violation_logs FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.exam_attempts 
    WHERE exam_attempts.id = violation_logs.attempt_id 
    AND exam_attempts.student_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own violations"
ON public.violation_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.exam_attempts 
    WHERE exam_attempts.id = violation_logs.attempt_id 
    AND exam_attempts.student_id = auth.uid()
  )
);

CREATE POLICY "Teachers can view violations for their exams"
ON public.violation_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.exam_attempts 
    JOIN public.exams ON exams.id = exam_attempts.exam_id
    WHERE exam_attempts.id = violation_logs.attempt_id 
    AND exams.teacher_id = auth.uid()
  )
);

-- Enable realtime for violation_logs (for real-time monitoring)
ALTER PUBLICATION supabase_realtime ADD TABLE public.violation_logs;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exams_updated_at
BEFORE UPDATE ON public.exams
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_answers_updated_at
BEFORE UPDATE ON public.answers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();