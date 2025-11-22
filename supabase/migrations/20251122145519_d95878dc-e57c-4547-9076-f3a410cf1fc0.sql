-- Fix 1: Add explicit deny policy for anonymous access to profiles table
-- This adds defense-in-depth to prevent any potential anonymous access
CREATE POLICY "deny_anonymous_access_to_profiles"
ON public.profiles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Fix 2: Verify all SECURITY DEFINER functions have search_path set
-- All functions already have this, but documenting for clarity:
-- ✓ has_role - SET search_path TO 'public'
-- ✓ handle_new_user - SET search_path TO 'public'
-- ✓ sync_user_role - SET search_path TO 'public'
-- ✓ notify_booking_confirmation - SET search_path TO 'public'
-- ✓ create_session_reminder_notification - SET search_path TO 'public'
-- ✓ update_conversation_timestamp - SET search_path TO 'public'
-- ✓ notify_new_message - SET search_path TO 'public'
-- ✓ track_study_session - SET search_path TO 'public'
-- ✓ check_achievements - SET search_path TO 'public'
-- ✓ check_quiz_achievements - SET search_path TO 'public'
-- ✓ award_experience - SET search_path TO 'public'
-- ✓ update_progress_with_quiz - SET search_path TO 'public'
-- ✓ generate_slug - SET search_path TO 'public'
-- ✓ check_session_overlap - SET search_path TO 'public'
-- ✓ calculate_level - SET search_path TO 'public'
-- ✓ update_updated_at_column - SET search_path TO 'public'

-- All SECURITY DEFINER functions are already properly secured with fixed search_path