-- Table pour les messages entre parents et tuteurs
CREATE TABLE public.tutor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachment_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les feedbacks post-session
CREATE TABLE public.session_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions_tutorat(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  
  -- Évaluation des compétences
  comprehension_score INTEGER CHECK (comprehension_score >= 1 AND comprehension_score <= 5),
  participation_score INTEGER CHECK (participation_score >= 1 AND participation_score <= 5),
  homework_completion_score INTEGER CHECK (homework_completion_score >= 1 AND homework_completion_score <= 5),
  
  -- Notes et recommandations
  strengths TEXT,
  areas_for_improvement TEXT,
  homework_assigned TEXT,
  next_session_focus TEXT,
  tutor_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(session_id)
);

-- Table pour la tarification dynamique
CREATE TABLE public.tutor_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  matiere TEXT NOT NULL,
  niveau_scolaire niveau_scolaire NOT NULL,
  tarif_horaire_eur NUMERIC(10, 2) NOT NULL CHECK (tarif_horaire_eur > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tutor_id, matiere, niveau_scolaire)
);

-- Table pour les forfaits (packages)
CREATE TABLE public.tutor_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  description TEXT,
  nombre_sessions INTEGER NOT NULL CHECK (nombre_sessions > 0),
  reduction_pourcentage NUMERIC(5, 2) NOT NULL CHECK (reduction_pourcentage >= 0 AND reduction_pourcentage <= 100),
  validite_jours INTEGER DEFAULT 90,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les templates de plan de cours
CREATE TABLE public.lesson_plan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  matiere TEXT NOT NULL,
  niveau_scolaire niveau_scolaire NOT NULL,
  duree_minutes INTEGER NOT NULL,
  objectifs TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  materiel_necessaire TEXT[] DEFAULT ARRAY[]::TEXT[],
  deroulement JSONB NOT NULL DEFAULT '[]'::JSONB,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tutor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plan_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour tutor_messages
CREATE POLICY "Users can view their conversation messages"
ON public.tutor_messages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM conversations c
  WHERE c.id = tutor_messages.conversation_id 
  AND (c.parent_id = auth.uid() OR EXISTS (
    SELECT 1 FROM tutors t WHERE t.id = c.tutor_id AND t.user_id = auth.uid()
  ))
));

CREATE POLICY "Users can send messages in their conversations"
ON public.tutor_messages
FOR INSERT
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages"
ON public.tutor_messages
FOR UPDATE
USING (sender_id = auth.uid());

-- RLS Policies pour session_feedback
CREATE POLICY "Tutors can manage feedback for their sessions"
ON public.session_feedback
FOR ALL
USING (EXISTS (
  SELECT 1 FROM tutors WHERE tutors.id = session_feedback.tutor_id AND tutors.user_id = auth.uid()
));

CREATE POLICY "Parents can view feedback for their students"
ON public.session_feedback
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM students WHERE students.id = session_feedback.student_id AND students.parent_id = auth.uid()
));

-- RLS Policies pour tutor_pricing
CREATE POLICY "Tutors can manage their own pricing"
ON public.tutor_pricing
FOR ALL
USING (EXISTS (
  SELECT 1 FROM tutors WHERE tutors.id = tutor_pricing.tutor_id AND tutors.user_id = auth.uid()
));

CREATE POLICY "Everyone can view tutor pricing"
ON public.tutor_pricing
FOR SELECT
USING (true);

-- RLS Policies pour tutor_packages
CREATE POLICY "Tutors can manage their own packages"
ON public.tutor_packages
FOR ALL
USING (EXISTS (
  SELECT 1 FROM tutors WHERE tutors.id = tutor_packages.tutor_id AND tutors.user_id = auth.uid()
));

CREATE POLICY "Everyone can view active packages"
ON public.tutor_packages
FOR SELECT
USING (is_active = true);

-- RLS Policies pour lesson_plan_templates
CREATE POLICY "Tutors can manage their own templates"
ON public.lesson_plan_templates
FOR ALL
USING (EXISTS (
  SELECT 1 FROM tutors WHERE tutors.id = lesson_plan_templates.tutor_id AND tutors.user_id = auth.uid()
));

CREATE POLICY "Everyone can view public templates"
ON public.lesson_plan_templates
FOR SELECT
USING (is_public = true);

-- Triggers pour updated_at
CREATE TRIGGER update_session_feedback_updated_at
BEFORE UPDATE ON public.session_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tutor_pricing_updated_at
BEFORE UPDATE ON public.tutor_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tutor_packages_updated_at
BEFORE UPDATE ON public.tutor_packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_plan_templates_updated_at
BEFORE UPDATE ON public.lesson_plan_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();