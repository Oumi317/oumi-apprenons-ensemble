-- Fix search_path for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, prenom, nom)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent')::app_role,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Prénom'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Nom')
  );
  
  -- Create parent record if role is parent
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'parent') = 'parent' THEN
    INSERT INTO public.parents (user_id)
    VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;