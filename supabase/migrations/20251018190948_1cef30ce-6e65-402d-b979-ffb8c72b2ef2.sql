-- Table pour les conversations AI
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nouvelle conversation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les messages AI
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_conversations
CREATE POLICY "Students can view their own AI conversations"
  ON public.ai_conversations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.students
    WHERE students.id = ai_conversations.student_id
    AND students.user_id = auth.uid()
  ));

CREATE POLICY "Parents can view their students' AI conversations"
  ON public.ai_conversations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.students
    WHERE students.id = ai_conversations.student_id
    AND students.parent_id = auth.uid()
  ));

CREATE POLICY "Students can create their own AI conversations"
  ON public.ai_conversations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.students
    WHERE students.id = ai_conversations.student_id
    AND students.user_id = auth.uid()
  ));

CREATE POLICY "Students can update their own AI conversations"
  ON public.ai_conversations FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.students
    WHERE students.id = ai_conversations.student_id
    AND students.user_id = auth.uid()
  ));

-- RLS Policies for ai_messages
CREATE POLICY "Users can view messages in their AI conversations"
  ON public.ai_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ai_conversations c
    JOIN public.students s ON s.id = c.student_id
    WHERE c.id = ai_messages.conversation_id
    AND (s.user_id = auth.uid() OR s.parent_id = auth.uid())
  ));

CREATE POLICY "Students can create messages in their AI conversations"
  ON public.ai_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.ai_conversations c
    JOIN public.students s ON s.id = c.student_id
    WHERE c.id = ai_messages.conversation_id
    AND s.user_id = auth.uid()
  ));

-- Trigger to update updated_at
CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_ai_conversations_student_id ON public.ai_conversations(student_id);
CREATE INDEX idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created_at ON public.ai_messages(created_at);