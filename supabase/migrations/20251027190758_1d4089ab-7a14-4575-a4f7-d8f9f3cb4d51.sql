-- Create interactive_resources table
CREATE TABLE IF NOT EXISTS public.interactive_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  titre TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'interactive_html',
  file_url TEXT NOT NULL,
  ordre_affichage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interactive_resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Everyone can view interactive resources
CREATE POLICY "Everyone can view interactive resources"
  ON public.interactive_resources
  FOR SELECT
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_interactive_resources_updated_at
  BEFORE UPDATE ON public.interactive_resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for interactive resources
INSERT INTO storage.buckets (id, name, public)
VALUES ('interactive-resources', 'interactive-resources', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies - Public read access
CREATE POLICY "Public read access for interactive resources"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'interactive-resources');

-- Allow authenticated users to upload (for admin interface later)
CREATE POLICY "Authenticated users can upload interactive resources"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'interactive-resources' 
    AND auth.role() = 'authenticated'
  );