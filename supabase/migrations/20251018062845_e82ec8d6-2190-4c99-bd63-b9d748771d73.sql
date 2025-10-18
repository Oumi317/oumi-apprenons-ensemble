-- Add RLS policies for sessions_tutorat INSERT
CREATE POLICY "Parents can create sessions for their students"
ON public.sessions_tutorat
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.students
    WHERE students.id = sessions_tutorat.etudiant_id
      AND students.parent_id = auth.uid()
  )
);

-- Add RLS policy for tutors to view approved status
CREATE POLICY "Admins can view all tutors"
ON public.tutors
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
  )
);

-- Add RLS policy for admins to update tutor status
CREATE POLICY "Admins can update tutor status"
ON public.tutors
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
  )
);

-- Allow tutor creation during signup
CREATE POLICY "Users can create their own tutor profile"
ON public.tutors
FOR INSERT
WITH CHECK (user_id = auth.uid());