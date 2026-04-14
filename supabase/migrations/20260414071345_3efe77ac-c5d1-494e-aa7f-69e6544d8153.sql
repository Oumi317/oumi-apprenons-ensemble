-- Fix 1: Interactive-resources storage bucket - restrict INSERT to admins only
DROP POLICY IF EXISTS "Authenticated users can upload interactive resources" ON storage.objects;

CREATE POLICY "Admins can upload interactive resources" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'interactive-resources'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::public.app_role
    )
  );

CREATE POLICY "Admins can delete interactive resources files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'interactive-resources'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::public.app_role
    )
  );

CREATE POLICY "Admins can update interactive resources files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'interactive-resources'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::public.app_role
    )
  );

-- Fix 2: Quiz questions - restrict direct table SELECT to admins only
DROP POLICY IF EXISTS "Authenticated users can view quiz questions" ON public.quiz_questions;

CREATE POLICY "Admins can view quiz questions" ON public.quiz_questions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::public.app_role
    )
  );