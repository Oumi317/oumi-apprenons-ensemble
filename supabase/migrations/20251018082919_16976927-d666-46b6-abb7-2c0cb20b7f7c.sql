-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('session_reminder', 'new_message', 'progress_alert', 'booking_confirmed', 'booking_cancelled')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_read ON public.notifications(read) WHERE read = false;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications
  FOR DELETE
  USING (user_id = auth.uid());

-- Function to create session reminder notifications
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

-- Trigger for session reminders
CREATE TRIGGER session_reminder_trigger
  AFTER INSERT ON public.sessions_tutorat
  FOR EACH ROW
  EXECUTE FUNCTION create_session_reminder_notification();

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

-- Trigger for booking confirmations
CREATE TRIGGER booking_confirmation_trigger
  AFTER INSERT ON public.sessions_tutorat
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_confirmation();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;