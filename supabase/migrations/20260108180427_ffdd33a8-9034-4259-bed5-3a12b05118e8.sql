-- Table pour suivre la progression dans les ressources interactives
CREATE TABLE interactive_resource_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES interactive_resources(id) ON DELETE CASCADE,
  completed_lessons JSONB DEFAULT '[]'::jsonb,
  lesson_scores JSONB DEFAULT '{}'::jsonb,
  total_lessons INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  average_score NUMERIC(5,2) DEFAULT 0,
  certificate_earned BOOLEAN DEFAULT false,
  certificate_date TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, resource_id)
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_resource_progress_student ON interactive_resource_progress(student_id);
CREATE INDEX idx_resource_progress_resource ON interactive_resource_progress(resource_id);

-- Activer RLS
ALTER TABLE interactive_resource_progress ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les parents
CREATE POLICY "Parents can view their children's resource progress"
  ON interactive_resource_progress FOR SELECT
  USING (student_id IN (
    SELECT id FROM students WHERE parent_id = auth.uid()
  ));

-- Politiques RLS pour les étudiants
CREATE POLICY "Students can manage their own progress"
  ON interactive_resource_progress FOR ALL
  USING (student_id IN (
    SELECT id FROM students WHERE user_id = auth.uid() OR parent_id = auth.uid()
  ));

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_resource_progress_updated_at
  BEFORE UPDATE ON interactive_resource_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour vérifier et attribuer des achievements
CREATE OR REPLACE FUNCTION check_resource_achievements()
RETURNS TRIGGER AS $$
BEGIN
  -- Badge "Premier manuel interactif complété"
  IF NEW.certificate_earned = true AND OLD.certificate_earned = false THEN
    -- Vérifier si c'est le premier certificat
    IF NOT EXISTS (
      SELECT 1 FROM achievements 
      WHERE student_id = NEW.student_id 
      AND title = 'Premier manuel interactif'
    ) THEN
      INSERT INTO achievements (student_id, type, title, description, icon, points)
      VALUES (NEW.student_id, 'resource', 'Premier manuel interactif', 
              'Tu as complété ton premier manuel interactif !', '📚', 100);
      PERFORM award_experience(NEW.student_id, 100);
    END IF;
    
    -- Badge "Expert des manuels" (5 manuels complétés)
    IF (SELECT COUNT(*) FROM interactive_resource_progress 
        WHERE student_id = NEW.student_id AND certificate_earned = true) >= 5 
       AND NOT EXISTS (
         SELECT 1 FROM achievements 
         WHERE student_id = NEW.student_id 
         AND title = 'Expert des manuels'
       ) THEN
      INSERT INTO achievements (student_id, type, title, description, icon, points)
      VALUES (NEW.student_id, 'resource', 'Expert des manuels', 
              'Tu as complété 5 manuels interactifs !', '🏆', 500);
      PERFORM award_experience(NEW.student_id, 500);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour les achievements
CREATE TRIGGER on_resource_progress_update
  AFTER UPDATE ON interactive_resource_progress
  FOR EACH ROW
  EXECUTE FUNCTION check_resource_achievements();

-- Activer realtime pour la table
ALTER PUBLICATION supabase_realtime ADD TABLE interactive_resource_progress;