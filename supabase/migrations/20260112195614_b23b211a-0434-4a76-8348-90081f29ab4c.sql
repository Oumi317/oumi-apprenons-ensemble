
-- Create lesson_resources table
CREATE TABLE public.lesson_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'pdf' CHECK (type IN ('pdf', 'document', 'image', 'spreadsheet', 'link')),
  file_url TEXT NOT NULL,
  taille TEXT,
  ordre_affichage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_lesson_resources_lesson_id ON public.lesson_resources(lesson_id);

-- Enable RLS
ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;

-- RLS policies: Anyone authenticated can read
CREATE POLICY "Authenticated users can view lesson resources"
ON public.lesson_resources
FOR SELECT
TO authenticated
USING (true);

-- Admins can create resources
CREATE POLICY "Admins can create lesson resources"
ON public.lesson_resources
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update resources
CREATE POLICY "Admins can update lesson resources"
ON public.lesson_resources
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Admins can delete resources
CREATE POLICY "Admins can delete lesson resources"
ON public.lesson_resources
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_lesson_resources_updated_at
BEFORE UPDATE ON public.lesson_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for lesson resources
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-resources', 'lesson-resources', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for lesson-resources bucket
CREATE POLICY "Public can view lesson resources files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'lesson-resources');

CREATE POLICY "Admins can upload lesson resources files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-resources' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update lesson resources files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'lesson-resources' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete lesson resources files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'lesson-resources' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Enable realtime for lesson_resources
ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_resources;
