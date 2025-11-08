-- Table pour les tuteurs favoris des parents
CREATE TABLE public.favorite_tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(parent_id, tutor_id)
);

-- Table pour la gestion avancée des disponibilités des tuteurs
CREATE TABLE public.tutor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Dimanche, 6 = Samedi
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les indisponibilités (vacances, jours fériés)
CREATE TABLE public.tutor_unavailability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les fiches de suivi des élèves par tuteur
CREATE TABLE public.student_tracking_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions_tutorat(id) ON DELETE SET NULL,
  note_type TEXT NOT NULL CHECK (note_type IN ('observation', 'objectif', 'progression', 'recommandation')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour la bibliothèque de ressources des tuteurs
CREATE TABLE public.tutor_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  matiere TEXT NOT NULL,
  niveau_scolaire niveau_scolaire NOT NULL,
  is_public BOOLEAN DEFAULT false,
  shared_with_students UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les alertes budget des parents
CREATE TABLE public.budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_limit NUMERIC(10, 2) NOT NULL,
  alert_threshold NUMERIC(3, 2) DEFAULT 0.80 CHECK (alert_threshold > 0 AND alert_threshold <= 1),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.favorite_tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_unavailability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_tracking_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour favorite_tutors
CREATE POLICY "Parents can manage their favorite tutors"
ON public.favorite_tutors
FOR ALL
USING (parent_id = auth.uid());

-- RLS Policies pour tutor_availability
CREATE POLICY "Tutors can manage their own availability"
ON public.tutor_availability
FOR ALL
USING (EXISTS (
  SELECT 1 FROM tutors WHERE tutors.id = tutor_availability.tutor_id AND tutors.user_id = auth.uid()
));

CREATE POLICY "Everyone can view tutor availability"
ON public.tutor_availability
FOR SELECT
USING (true);

-- RLS Policies pour tutor_unavailability
CREATE POLICY "Tutors can manage their own unavailability"
ON public.tutor_unavailability
FOR ALL
USING (EXISTS (
  SELECT 1 FROM tutors WHERE tutors.id = tutor_unavailability.tutor_id AND tutors.user_id = auth.uid()
));

CREATE POLICY "Everyone can view tutor unavailability"
ON public.tutor_unavailability
FOR SELECT
USING (true);

-- RLS Policies pour student_tracking_notes
CREATE POLICY "Tutors can manage notes for their students"
ON public.student_tracking_notes
FOR ALL
USING (EXISTS (
  SELECT 1 FROM tutors WHERE tutors.id = student_tracking_notes.tutor_id AND tutors.user_id = auth.uid()
));

CREATE POLICY "Parents can view notes about their students"
ON public.student_tracking_notes
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM students WHERE students.id = student_tracking_notes.student_id AND students.parent_id = auth.uid()
));

-- RLS Policies pour tutor_resources
CREATE POLICY "Tutors can manage their own resources"
ON public.tutor_resources
FOR ALL
USING (EXISTS (
  SELECT 1 FROM tutors WHERE tutors.id = tutor_resources.tutor_id AND tutors.user_id = auth.uid()
));

CREATE POLICY "Students can view resources shared with them"
ON public.tutor_resources
FOR SELECT
USING (
  is_public = true OR
  EXISTS (
    SELECT 1 FROM students WHERE students.id = ANY(tutor_resources.shared_with_students) AND students.user_id = auth.uid()
  )
);

-- RLS Policies pour budget_alerts
CREATE POLICY "Parents can manage their own budget alerts"
ON public.budget_alerts
FOR ALL
USING (parent_id = auth.uid());

-- Trigger pour updated_at
CREATE TRIGGER update_tutor_availability_updated_at
BEFORE UPDATE ON public.tutor_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_tracking_notes_updated_at
BEFORE UPDATE ON public.student_tracking_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tutor_resources_updated_at
BEFORE UPDATE ON public.tutor_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_alerts_updated_at
BEFORE UPDATE ON public.budget_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();