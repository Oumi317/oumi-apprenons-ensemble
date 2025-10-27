-- Function to generate proper slugs from French text
CREATE OR REPLACE FUNCTION public.generate_slug(text_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
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

-- Update existing slugs using the new function
UPDATE public.interactive_resources 
SET slug = TRIM(BOTH '-' FROM generate_slug(titre))
WHERE slug IS NOT NULL;

-- Drop the function after use (optional, keep it if you want to use it elsewhere)
-- DROP FUNCTION IF EXISTS public.generate_slug(TEXT);