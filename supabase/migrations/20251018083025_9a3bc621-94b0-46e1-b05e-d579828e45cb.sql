-- Create conversations table for messaging
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachment_url TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_conversations_parent ON public.conversations(parent_id);
CREATE INDEX idx_conversations_tutor ON public.conversations(tutor_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversation RLS Policies
CREATE POLICY "Parents can view their conversations"
  ON public.conversations
  FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "Tutors can view their conversations"
  ON public.conversations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tutors
      WHERE tutors.id = conversations.tutor_id
      AND tutors.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can create conversations"
  ON public.conversations
  FOR INSERT
  WITH CHECK (parent_id = auth.uid());

-- Messages RLS Policies
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        c.parent_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM tutors t
          WHERE t.id = c.tutor_id
          AND t.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        c.parent_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM tutors t
          WHERE t.id = c.tutor_id
          AND t.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages
  FOR UPDATE
  USING (sender_id = auth.uid());

-- Function to update conversation last_message_at
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

-- Trigger for updating conversation timestamp
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Function to create notification on new message
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

-- Trigger for new message notifications
CREATE TRIGGER new_message_notification
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;