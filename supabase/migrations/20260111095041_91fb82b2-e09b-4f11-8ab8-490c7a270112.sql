-- Recréer la fonction set_student_pin avec le bon search_path
CREATE OR REPLACE FUNCTION public.set_student_pin(student_uuid UUID, pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE students 
  SET pin_code = crypt(pin, gen_salt('bf'))
  WHERE id = student_uuid;
  
  RETURN FOUND;
END;
$$;

-- Recréer la fonction verify_student_pin avec le bon search_path
CREATE OR REPLACE FUNCTION public.verify_student_pin(student_uuid UUID, pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  stored_pin TEXT;
BEGIN
  SELECT pin_code INTO stored_pin
  FROM students 
  WHERE id = student_uuid;
  
  IF stored_pin IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN stored_pin = crypt(pin, stored_pin);
END;
$$;