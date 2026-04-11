
-- 1. Create a safe view for quiz questions (no correct_answer, no explanation)
CREATE OR REPLACE VIEW public.quiz_questions_safe AS
  SELECT id, lesson_id, question, type, options, ordre, points, created_at, updated_at
  FROM public.quiz_questions;

-- Grant access to the safe view
GRANT SELECT ON public.quiz_questions_safe TO authenticated;
GRANT SELECT ON public.quiz_questions_safe TO anon;

-- 2. Drop the overly permissive policy on quiz_questions
DROP POLICY IF EXISTS "Everyone can view quiz questions" ON public.quiz_questions;

-- 3. Only admins can directly read quiz_questions (with correct_answer)
CREATE POLICY "Only admins can view quiz questions directly"
ON public.quiz_questions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Create RPC to verify a quiz answer server-side
CREATE OR REPLACE FUNCTION public.verify_quiz_answer(
  p_question_id uuid,
  p_answer text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_correct_answer text;
  v_explanation text;
  v_is_correct boolean;
  v_points integer;
BEGIN
  SELECT correct_answer, explanation, points
  INTO v_correct_answer, v_explanation, v_points
  FROM quiz_questions
  WHERE id = p_question_id;

  IF v_correct_answer IS NULL THEN
    RETURN jsonb_build_object('error', 'Question not found');
  END IF;

  v_is_correct := LOWER(TRIM(p_answer)) = LOWER(TRIM(v_correct_answer));

  RETURN jsonb_build_object(
    'is_correct', v_is_correct,
    'correct_answer', v_correct_answer,
    'explanation', v_explanation,
    'points', v_points
  );
END;
$$;
