-- Add gamification columns to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS experience_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS niveau INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;

-- Create weekly challenges table
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  objectif INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'sessions', 'quiz_score', 'streak', 'lessons_completed'
  points_recompense INTEGER NOT NULL DEFAULT 50,
  icone TEXT DEFAULT '🎯',
  date_debut TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT date_trunc('week', now()),
  date_fin TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT date_trunc('week', now()) + INTERVAL '7 days',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create student_challenges table for tracking progress
CREATE TABLE IF NOT EXISTS public.student_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  progression INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for weekly_challenges
CREATE POLICY "Everyone can view challenges"
ON public.weekly_challenges FOR SELECT
USING (true);

-- RLS Policies for student_challenges
CREATE POLICY "Students can view their own challenges"
ON public.student_challenges FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = student_challenges.student_id
    AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Parents can view their students' challenges"
ON public.student_challenges FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = student_challenges.student_id
    AND s.parent_id = auth.uid()
  )
);

CREATE POLICY "System can manage student challenges"
ON public.student_challenges FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = student_challenges.student_id
    AND (s.user_id = auth.uid() OR s.parent_id = auth.uid())
  )
);

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION public.calculate_level(xp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Level = floor(sqrt(xp / 100))
  -- Level 1: 0 XP, Level 2: 100 XP, Level 3: 400 XP, Level 4: 900 XP, etc.
  RETURN GREATEST(1, FLOOR(SQRT(xp / 100.0)) + 1);
END;
$$;

-- Function to update student XP and level
CREATE OR REPLACE FUNCTION public.award_experience(student_uuid UUID, xp_amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_xp INTEGER;
  new_level INTEGER;
  old_level INTEGER;
BEGIN
  -- Get current level
  SELECT niveau INTO old_level FROM students WHERE id = student_uuid;
  
  -- Update XP
  UPDATE students 
  SET experience_points = experience_points + xp_amount
  WHERE id = student_uuid
  RETURNING experience_points INTO new_xp;
  
  -- Calculate and update new level
  new_level := calculate_level(new_xp);
  
  UPDATE students 
  SET niveau = new_level
  WHERE id = student_uuid;
  
  -- If leveled up, create achievement
  IF new_level > old_level THEN
    INSERT INTO achievements (student_id, type, title, description, icon, points)
    VALUES (
      student_uuid,
      'level_up',
      'Niveau ' || new_level,
      'Bravo ! Tu as atteint le niveau ' || new_level,
      '⭐',
      new_level * 10
    );
  END IF;
END;
$$;

-- Improved achievement trigger
CREATE OR REPLACE FUNCTION public.check_achievements()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_count INTEGER;
  quiz_perfect_count INTEGER;
BEGIN
  -- Award XP for completing session
  IF NEW.completed = true THEN
    PERFORM award_experience(NEW.student_id, 20);
  END IF;
  
  -- Check for session milestones
  SELECT COUNT(*) INTO session_count
  FROM study_sessions
  WHERE student_id = NEW.student_id
  AND completed = true;
  
  IF session_count = 5 AND NOT EXISTS (
    SELECT 1 FROM achievements
    WHERE student_id = NEW.student_id
    AND title = '5 Sessions'
  ) THEN
    INSERT INTO achievements (student_id, type, title, description, icon, points)
    VALUES (
      NEW.student_id,
      'milestone',
      '5 Sessions',
      'Félicitations ! Tu as complété 5 sessions d''étude',
      '🎯',
      50
    );
    PERFORM award_experience(NEW.student_id, 50);
  END IF;
  
  IF session_count = 10 AND NOT EXISTS (
    SELECT 1 FROM achievements
    WHERE student_id = NEW.student_id
    AND title = '10 Sessions'
  ) THEN
    INSERT INTO achievements (student_id, type, title, description, icon, points)
    VALUES (
      NEW.student_id,
      'milestone',
      '10 Sessions',
      'Excellent ! Tu as complété 10 sessions d''étude',
      '🏆',
      100
    );
    PERFORM award_experience(NEW.student_id, 100);
  END IF;
  
  IF session_count = 25 AND NOT EXISTS (
    SELECT 1 FROM achievements
    WHERE student_id = NEW.student_id
    AND title = '25 Sessions'
  ) THEN
    INSERT INTO achievements (student_id, type, title, description, icon, points)
    VALUES (
      NEW.student_id,
      'milestone',
      '25 Sessions',
      'Incroyable ! Tu as complété 25 sessions d''étude',
      '⚡',
      250
    );
    PERFORM award_experience(NEW.student_id, 250);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for quiz achievements
CREATE OR REPLACE FUNCTION public.check_quiz_achievements()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Award XP based on score
  PERFORM award_experience(NEW.student_id, NEW.score);
  
  -- Perfect score achievement
  IF NEW.percentage >= 100 AND NOT EXISTS (
    SELECT 1 FROM achievements
    WHERE student_id = NEW.student_id
    AND type = 'perfect_quiz'
    AND DATE(unlocked_at) = CURRENT_DATE
  ) THEN
    INSERT INTO achievements (student_id, type, title, description, icon, points)
    VALUES (
      NEW.student_id,
      'perfect_quiz',
      'Score Parfait !',
      'Bravo ! Tu as obtenu 100% à un quiz',
      '💯',
      100
    );
    PERFORM award_experience(NEW.student_id, 50);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for quiz achievements
DROP TRIGGER IF EXISTS on_quiz_completed ON public.quiz_attempts;
CREATE TRIGGER on_quiz_completed
  AFTER INSERT ON public.quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION check_quiz_achievements();

-- Insert sample weekly challenges
INSERT INTO public.weekly_challenges (titre, description, objectif, type, points_recompense, icone)
VALUES
  ('Champion de la semaine', 'Complète 5 sessions d''étude cette semaine', 5, 'sessions', 100, '🏆'),
  ('Expert des quiz', 'Obtiens 80% ou plus à 3 quiz cette semaine', 3, 'quiz_score', 75, '🎓'),
  ('Série de feu', 'Étudie 3 jours consécutifs cette semaine', 3, 'streak', 50, '🔥'),
  ('Explorateur', 'Termine 3 nouvelles leçons cette semaine', 3, 'lessons_completed', 60, '🗺️')
ON CONFLICT DO NOTHING;