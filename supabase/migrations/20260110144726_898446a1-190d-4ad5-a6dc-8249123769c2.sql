-- Ajouter la colonne pin_code à la table students (stocké haché)
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS pin_code TEXT;

-- Créer l'extension pgcrypto si elle n'existe pas (pour le hachage)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Créer une fonction pour définir le PIN (haché)
CREATE OR REPLACE FUNCTION public.set_student_pin(student_uuid UUID, pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE students 
  SET pin_code = crypt(pin, gen_salt('bf'))
  WHERE id = student_uuid;
  
  RETURN FOUND;
END;
$$;

-- Créer une fonction pour vérifier le PIN
CREATE OR REPLACE FUNCTION public.verify_student_pin(student_uuid UUID, pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Permettre aux parents d'appeler ces fonctions pour leurs enfants
GRANT EXECUTE ON FUNCTION public.set_student_pin(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_student_pin(UUID, TEXT) TO authenticated;