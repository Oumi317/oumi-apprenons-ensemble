
CREATE TABLE public.lesson_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  consignes text,
  date_assignation timestamp with time zone NOT NULL,
  statut text NOT NULL DEFAULT 'assignee',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.lesson_assignments ENABLE ROW LEVEL SECURITY;

-- Parents can manage their own assignments
CREATE POLICY "Parents can manage their lesson assignments"
ON public.lesson_assignments
FOR ALL
USING (parent_id = auth.uid())
WITH CHECK (parent_id = auth.uid());

-- Students can view assignments for themselves (via parent session)
CREATE POLICY "Students can view their assignments"
ON public.lesson_assignments
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.students s
  WHERE s.id = lesson_assignments.student_id
  AND (s.parent_id = auth.uid() OR s.user_id = auth.uid())
));

-- Trigger for updated_at
CREATE TRIGGER update_lesson_assignments_updated_at
BEFORE UPDATE ON public.lesson_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
