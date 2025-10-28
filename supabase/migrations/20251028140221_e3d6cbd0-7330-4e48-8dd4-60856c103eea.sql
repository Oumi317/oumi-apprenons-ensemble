-- Enable admins to manage lessons
CREATE POLICY "Admins can insert lessons"
ON public.lessons
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can update lessons"
ON public.lessons
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can delete lessons"
ON public.lessons
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
);

-- Create storage bucket for lesson content if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-content', 'lesson-content', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for lesson content
CREATE POLICY "Admins can upload lesson content"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-content'
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
);

CREATE POLICY "Everyone can view lesson content"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'lesson-content');

CREATE POLICY "Admins can update lesson content"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'lesson-content'
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can delete lesson content"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'lesson-content'
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
);