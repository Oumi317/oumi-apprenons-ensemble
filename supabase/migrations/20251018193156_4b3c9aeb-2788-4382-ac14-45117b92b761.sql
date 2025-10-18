-- Create lesson_notes table for student notes during lessons
CREATE TABLE IF NOT EXISTS public.lesson_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp INTEGER DEFAULT 0, -- Video timestamp in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lesson_notes
CREATE POLICY "Students can manage their own notes"
ON public.lesson_notes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = lesson_notes.student_id
    AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Parents can view their students' notes"
ON public.lesson_notes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = lesson_notes.student_id
    AND s.parent_id = auth.uid()
  )
);

-- Create index for better performance
CREATE INDEX idx_lesson_notes_lesson_student ON public.lesson_notes(lesson_id, student_id);

-- Add trigger for updated_at
CREATE TRIGGER update_lesson_notes_updated_at
  BEFORE UPDATE ON public.lesson_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();