-- Function to manually set admin role (for development/initial setup)
-- This allows creating the first admin user manually

COMMENT ON FUNCTION public.has_role IS 'Security definer function to check if a user has a specific role without triggering RLS recursion';

-- Insert a helpful comment for admins
COMMENT ON TABLE public.user_roles IS 'User roles table - Use INSERT to manually assign admin role to first user after signup';