-- Fix: Add search_path to check_resource_achievements() SECURITY DEFINER function
-- This prevents privilege escalation through search path manipulation

CREATE OR REPLACE FUNCTION check_resource_achievements()
RETURNS TRIGGER AS $$
DECLARE
  v_student_id UUID;
  v_completed_count INTEGER;
  v_total_resources INTEGER;
BEGIN
  v_student_id := NEW.student_id;
  
  -- Count completed resources for this student
  SELECT COUNT(*) INTO v_completed_count
  FROM public.interactive_resource_progress
  WHERE student_id = v_student_id AND certificate_earned = true;
  
  -- Award achievement for first certificate
  IF NEW.certificate_earned = true THEN
    -- Check if they already have this achievement
    IF NOT EXISTS (
      SELECT 1 FROM public.achievements 
      WHERE student_id = v_student_id AND type = 'resource_first_certificate'
    ) THEN
      INSERT INTO public.achievements (student_id, type, title, description, points, icon)
      VALUES (
        v_student_id, 
        'resource_first_certificate', 
        'Premier Certificat', 
        'Tu as obtenu ton premier certificat de ressource interactive !',
        50,
        '🎓'
      );
      
      -- Award XP
      PERFORM public.award_experience(v_student_id, 50);
    END IF;
    
    -- Check for 5 certificates
    IF v_completed_count >= 5 AND NOT EXISTS (
      SELECT 1 FROM public.achievements 
      WHERE student_id = v_student_id AND type = 'resource_5_certificates'
    ) THEN
      INSERT INTO public.achievements (student_id, type, title, description, points, icon)
      VALUES (
        v_student_id, 
        'resource_5_certificates', 
        'Collectionneur de Savoirs', 
        'Tu as obtenu 5 certificats de ressources interactives !',
        100,
        '📚'
      );
      
      PERFORM public.award_experience(v_student_id, 100);
    END IF;
    
    -- Check for 10 certificates
    IF v_completed_count >= 10 AND NOT EXISTS (
      SELECT 1 FROM public.achievements 
      WHERE student_id = v_student_id AND type = 'resource_10_certificates'
    ) THEN
      INSERT INTO public.achievements (student_id, type, title, description, points, icon)
      VALUES (
        v_student_id, 
        'resource_10_certificates', 
        'Expert Interactif', 
        'Tu as obtenu 10 certificats de ressources interactives ! Tu es un vrai champion !',
        200,
        '🏆'
      );
      
      PERFORM public.award_experience(v_student_id, 200);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;