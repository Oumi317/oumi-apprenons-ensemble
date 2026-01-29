-- Politique de fallback pour INSERT sur quiz_attempts
-- Permet aux parents de créer des tentatives de quiz pour leurs enfants quand user_id est NULL
CREATE POLICY "Fallback: Allow quiz attempts for children without user_id"
ON public.quiz_attempts
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM students
    WHERE students.id = quiz_attempts.student_id
    AND students.parent_id = auth.uid()
    AND students.user_id IS NULL
  )
);

-- Politique de fallback pour SELECT sur quiz_attempts  
-- Permet aux parents de voir les tentatives de quiz de leurs enfants quand user_id est NULL
CREATE POLICY "Fallback: View quiz attempts for children without user_id"
ON public.quiz_attempts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM students
    WHERE students.id = quiz_attempts.student_id
    AND students.parent_id = auth.uid()
    AND students.user_id IS NULL
  )
);