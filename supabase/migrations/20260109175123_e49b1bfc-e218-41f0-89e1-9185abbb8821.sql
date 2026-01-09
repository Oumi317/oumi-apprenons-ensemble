-- Supprimer l'ancienne politique d'insertion qui ne fonctionne pas
DROP POLICY IF EXISTS "Students can create their own quiz attempts" ON quiz_attempts;

-- Créer une nouvelle politique qui permet aux parents d'insérer pour leurs enfants
CREATE POLICY "Parents can create quiz attempts for their children"
  ON quiz_attempts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM students
    WHERE students.id = quiz_attempts.student_id
    AND students.parent_id = auth.uid()
  ));

-- Permettre aux étudiants avec leur propre compte de créer leurs attempts
CREATE POLICY "Students can create their own quiz attempts"
  ON quiz_attempts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM students
    WHERE students.id = quiz_attempts.student_id
    AND students.user_id = auth.uid()
  ));