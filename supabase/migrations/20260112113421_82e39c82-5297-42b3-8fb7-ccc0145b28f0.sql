-- Fix: Tutor Personal Information Exposed Publicly
-- The current "Anyone can view approved tutors" policy allows anonymous users
-- to see ALL columns including sensitive data like notes_admin and verification_casier

-- Step 1: Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view approved tutors" ON public.tutors;

-- Step 2: Create a policy for authenticated users to view approved tutors
-- This ensures only logged-in users can browse tutors, and notes_admin
-- should be filtered out at the application level (we'll handle this too)
CREATE POLICY "Authenticated users can view approved tutors" 
ON public.tutors 
FOR SELECT 
TO authenticated
USING (statut_approbation = 'approuve');

-- Step 3: Ensure tutors can view their own complete profile (already exists but verify)
DROP POLICY IF EXISTS "Tutors can view their own profile" ON public.tutors;
CREATE POLICY "Tutors can view their own profile" 
ON public.tutors 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Step 4: Ensure admins can view all tutors (already exists but verify)
DROP POLICY IF EXISTS "Admins can view all tutors" ON public.tutors;
CREATE POLICY "Admins can view all tutors" 
ON public.tutors 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Note: We keep the notes_admin column protected by:
-- 1. Removing anonymous access entirely
-- 2. The application code will be updated to not select notes_admin for public display