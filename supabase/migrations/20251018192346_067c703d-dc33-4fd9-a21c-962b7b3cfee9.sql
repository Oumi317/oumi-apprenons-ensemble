-- Table pour les questions de quiz
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'true_false', 'fill_blank')),
  options JSONB, -- Pour les choix multiples: ["option1", "option2", ...]
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER NOT NULL DEFAULT 10,
  ordre INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les tentatives de quiz
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  time_spent_seconds INTEGER,
  answers JSONB NOT NULL, -- Structure: {question_id: {answer, is_correct}}
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_questions (everyone can view)
CREATE POLICY "Everyone can view quiz questions"
  ON public.quiz_questions FOR SELECT
  USING (true);

-- RLS Policies for quiz_attempts
CREATE POLICY "Students can view their own quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.students
    WHERE students.id = quiz_attempts.student_id
    AND students.user_id = auth.uid()
  ));

CREATE POLICY "Parents can view their students' quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.students
    WHERE students.id = quiz_attempts.student_id
    AND students.parent_id = auth.uid()
  ));

CREATE POLICY "Students can create their own quiz attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.students
    WHERE students.id = quiz_attempts.student_id
    AND students.user_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX idx_quiz_questions_lesson_id ON public.quiz_questions(lesson_id);
CREATE INDEX idx_quiz_questions_ordre ON public.quiz_questions(ordre);
CREATE INDEX idx_quiz_attempts_student_id ON public.quiz_attempts(student_id);
CREATE INDEX idx_quiz_attempts_lesson_id ON public.quiz_attempts(lesson_id);
CREATE INDEX idx_quiz_attempts_completed_at ON public.quiz_attempts(completed_at);

-- Trigger for updated_at
CREATE TRIGGER update_quiz_questions_updated_at
  BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update student_progress with quiz score
CREATE OR REPLACE FUNCTION update_progress_with_quiz()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.student_progress
  SET 
    score_quiz = GREATEST(COALESCE(score_quiz, 0), NEW.score),
    tentatives = tentatives + 1,
    updated_at = now()
  WHERE etudiant_id = NEW.student_id
    AND lesson_id = NEW.lesson_id;
  
  -- If no progress record exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.student_progress (
      etudiant_id,
      lesson_id,
      score_quiz,
      tentatives,
      statut_completion
    ) VALUES (
      NEW.student_id,
      NEW.lesson_id,
      NEW.score,
      1,
      CASE WHEN NEW.percentage >= 70 THEN 100 ELSE 50 END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update progress when quiz is completed
CREATE TRIGGER on_quiz_attempt_created
  AFTER INSERT ON public.quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_progress_with_quiz();