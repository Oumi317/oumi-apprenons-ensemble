-- Create study_sessions table for detailed tracking
CREATE TABLE public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('lesson', 'exercise', 'quiz', 'tutoring')),
  matiere TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_study_sessions_student ON public.study_sessions(student_id);
CREATE INDEX idx_study_sessions_created ON public.study_sessions(created_at DESC);
CREATE INDEX idx_study_sessions_matiere ON public.study_sessions(matiere);

-- Enable RLS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Parents can view their students' study sessions"
  ON public.study_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = study_sessions.student_id
      AND s.parent_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own study sessions"
  ON public.study_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = study_sessions.student_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert study sessions"
  ON public.study_sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = study_sessions.student_id
      AND s.parent_id = auth.uid()
    )
  );

-- Create achievements table for gamification
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('streak', 'milestone', 'mastery', 'challenge')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_achievements_student ON public.achievements(student_id);
CREATE INDEX idx_achievements_unlocked ON public.achievements(unlocked_at DESC);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Parents can view their students' achievements"
  ON public.achievements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = achievements.student_id
      AND s.parent_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own achievements"
  ON public.achievements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = achievements.student_id
      AND s.user_id = auth.uid()
    )
  );

-- Function to update student progress when session is completed
CREATE OR REPLACE FUNCTION track_study_session()
RETURNS TRIGGER AS $$
BEGIN
  -- Update student_progress if it's a lesson
  IF NEW.lesson_id IS NOT NULL AND NEW.completed THEN
    INSERT INTO public.student_progress (
      etudiant_id,
      lesson_id,
      statut_completion,
      temps_passe_minutes,
      score_quiz,
      date_completion
    )
    VALUES (
      NEW.student_id,
      NEW.lesson_id,
      100,
      NEW.duration_minutes,
      NEW.score,
      now()
    )
    ON CONFLICT (etudiant_id, lesson_id) DO UPDATE SET
      statut_completion = 100,
      temps_passe_minutes = student_progress.temps_passe_minutes + NEW.duration_minutes,
      score_quiz = GREATEST(student_progress.score_quiz, NEW.score),
      date_completion = now(),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for tracking study sessions
CREATE TRIGGER track_study_session_trigger
  AFTER INSERT ON public.study_sessions
  FOR EACH ROW
  WHEN (NEW.completed = true)
  EXECUTE FUNCTION track_study_session();

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements()
RETURNS TRIGGER AS $$
DECLARE
  session_count INTEGER;
  streak_days INTEGER;
BEGIN
  -- Check for 10 sessions milestone
  SELECT COUNT(*) INTO session_count
  FROM study_sessions
  WHERE student_id = NEW.student_id
  AND completed = true;
  
  IF session_count = 10 AND NOT EXISTS (
    SELECT 1 FROM achievements
    WHERE student_id = NEW.student_id
    AND type = 'milestone'
    AND title = '10 Sessions'
  ) THEN
    INSERT INTO achievements (student_id, type, title, description, icon, points)
    VALUES (
      NEW.student_id,
      'milestone',
      '10 Sessions',
      'Bravo ! Tu as complété 10 sessions d''étude',
      '🎯',
      100
    );
    
    -- Create notification
    INSERT INTO notifications (user_id, type, title, message, link)
    SELECT
      s.parent_id,
      'progress_alert',
      'Nouveau succès débloqué !',
      s.prenom || ' a débloqué le succès "10 Sessions"',
      '/student-progress/' || NEW.student_id
    FROM students s
    WHERE s.id = NEW.student_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for checking achievements
CREATE TRIGGER check_achievements_trigger
  AFTER INSERT ON public.study_sessions
  FOR EACH ROW
  WHEN (NEW.completed = true)
  EXECUTE FUNCTION check_achievements();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.achievements;