-- Drop the old check constraint
ALTER TABLE public.achievements DROP CONSTRAINT IF EXISTS achievements_type_check;

-- Add the updated check constraint with all valid types
ALTER TABLE public.achievements ADD CONSTRAINT achievements_type_check 
CHECK (type = ANY (ARRAY['streak', 'milestone', 'mastery', 'challenge', 'perfect_quiz', 'level_up']));