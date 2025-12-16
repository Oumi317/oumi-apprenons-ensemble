-- Enable realtime for students table (for XP updates)
ALTER TABLE public.students REPLICA IDENTITY FULL;

-- Try adding to publication (may already exist)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;