-- Corriger le search_path de la fonction check_resource_achievements
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;