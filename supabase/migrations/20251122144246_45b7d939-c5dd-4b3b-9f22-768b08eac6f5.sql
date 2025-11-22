-- Create notification triggers for important events

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_session_reminder_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify parent
  INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
  SELECT 
    s.parent_id,
    'session_reminder',
    'Session programmée demain',
    'Session de ' || NEW.matiere || ' prévue demain à ' || TO_CHAR(NEW.date_heure_debut, 'HH24:MI'),
    '/parent-dashboard',
    jsonb_build_object('session_id', NEW.id, 'student_id', NEW.etudiant_id)
  FROM students s
  WHERE s.id = NEW.etudiant_id
  AND NEW.date_heure_debut > now()
  AND NEW.date_heure_debut <= now() + interval '24 hours'
  AND NEW.statut = 'programmee';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to notify on booking confirmation
CREATE OR REPLACE FUNCTION notify_booking_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify parent
  INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
  SELECT 
    s.parent_id,
    'booking_confirmed',
    'Réservation confirmée',
    'Votre session de ' || NEW.matiere || ' a été confirmée pour le ' || TO_CHAR(NEW.date_heure_debut, 'DD/MM/YYYY à HH24:MI'),
    '/parent-dashboard',
    jsonb_build_object('session_id', NEW.id)
  FROM students s
  WHERE s.id = NEW.etudiant_id;
  
  -- Notify tutor
  INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
  SELECT 
    t.user_id,
    'booking_confirmed',
    'Nouvelle session réservée',
    'Session de ' || NEW.matiere || ' réservée pour le ' || TO_CHAR(NEW.date_heure_debut, 'DD/MM/YYYY à HH24:MI'),
    '/tutor-dashboard',
    jsonb_build_object('session_id', NEW.id)
  FROM tutors t
  WHERE t.id = NEW.tuteur_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update conversation timestamp on new message
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to notify on new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
  sender_name TEXT;
BEGIN
  -- Get sender name
  SELECT COALESCE(prenom || ' ' || nom, email)
  INTO sender_name
  FROM profiles
  WHERE id = NEW.sender_id;
  
  -- Determine recipient (if sender is parent, notify tutor, and vice versa)
  SELECT CASE
    WHEN c.parent_id = NEW.sender_id THEN t.user_id
    ELSE c.parent_id
  END
  INTO recipient_id
  FROM conversations c
  LEFT JOIN tutors t ON t.id = c.tutor_id
  WHERE c.id = NEW.conversation_id;
  
  -- Create notification
  INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
  VALUES (
    recipient_id,
    'new_message',
    'Nouveau message',
    sender_name || ': ' || LEFT(NEW.content, 50) || CASE WHEN LENGTH(NEW.content) > 50 THEN '...' ELSE '' END,
    '/parent-dashboard',
    jsonb_build_object('conversation_id', NEW.conversation_id, 'message_id', NEW.id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers (drop first if they exist)
DROP TRIGGER IF EXISTS on_session_created ON public.sessions_tutorat;
CREATE TRIGGER on_session_created
  AFTER INSERT ON public.sessions_tutorat
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_confirmation();

DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

DROP TRIGGER IF EXISTS on_message_update_conversation ON public.messages;
CREATE TRIGGER on_message_update_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

DROP TRIGGER IF EXISTS on_tutor_message_created ON public.tutor_messages;
CREATE TRIGGER on_tutor_message_created
  AFTER INSERT ON public.tutor_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

DROP TRIGGER IF EXISTS on_tutor_message_update_conversation ON public.tutor_messages;
CREATE TRIGGER on_tutor_message_update_conversation
  AFTER INSERT ON public.tutor_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();