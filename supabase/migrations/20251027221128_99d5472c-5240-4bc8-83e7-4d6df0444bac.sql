-- Fix security warning: Add search_path to generate_slug function
DROP FUNCTION IF EXISTS public.generate_slug(TEXT);

CREATE OR REPLACE FUNCTION public.generate_slug(text_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(
                REGEXP_REPLACE(
                  REGEXP_REPLACE(
                    REGEXP_REPLACE(
                      REGEXP_REPLACE(
                        REGEXP_REPLACE(text_input, '[àáâãäå]', 'a', 'g'),
                        '[èéêë]', 'e', 'g'
                      ),
                      '[ìíîï]', 'i', 'g'
                    ),
                    '[òóôõö]', 'o', 'g'
                  ),
                  '[ùúûü]', 'u', 'g'
                ),
                '[ýÿ]', 'y', 'g'
              ),
              '[ñ]', 'n', 'g'
            ),
            '[ç]', 'c', 'g'
          ),
          '[œ]', 'oe', 'g'
        ),
        '[æ]', 'ae', 'g'
      ),
      '[^a-z0-9]+', '-', 'g'
    )
  );
END;
$$;