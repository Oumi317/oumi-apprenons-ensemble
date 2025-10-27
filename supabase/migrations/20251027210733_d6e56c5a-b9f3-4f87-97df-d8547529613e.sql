-- Add slug column to interactive_resources table
ALTER TABLE public.interactive_resources 
ADD COLUMN slug text;

-- Create unique index on slug
CREATE UNIQUE INDEX idx_interactive_resources_slug ON public.interactive_resources(slug);

-- Generate slugs from existing titles
UPDATE public.interactive_resources 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(titre, '[éèêë]', 'e', 'g'),
      '[àâä]', 'a', 'g'
    ),
    '[^a-z0-9]+', '-', 'g'
  )
);

-- Make slug required for future inserts
ALTER TABLE public.interactive_resources 
ALTER COLUMN slug SET NOT NULL;