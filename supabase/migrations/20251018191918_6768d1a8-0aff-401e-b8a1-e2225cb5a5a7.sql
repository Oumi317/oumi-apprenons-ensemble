-- Add policy to allow parents to create AI conversations for their students
CREATE POLICY "Parents can create AI conversations for their students"
  ON public.ai_conversations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.students
    WHERE students.id = ai_conversations.student_id
    AND students.parent_id = auth.uid()
  ));