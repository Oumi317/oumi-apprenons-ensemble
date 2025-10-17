-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE app_role AS ENUM ('parent', 'student', 'tutor', 'admin');
CREATE TYPE niveau_scolaire AS ENUM (
  'CP', 'CE1', 'CE2', 'CM1', 'CM2',
  '6eme', '5eme', '4eme', '3eme',
  'Seconde', 'Premiere', 'Terminale'
);
CREATE TYPE statut_session AS ENUM ('programmee', 'completee', 'annulee');
CREATE TYPE type_abonnement AS ENUM ('gratuit', 'premium_individuel', 'premium_famille');
CREATE TYPE statut_abonnement AS ENUM ('actif', 'annule', 'expire');
CREATE TYPE statut_paiement AS ENUM ('reussi', 'echec', 'en_attente');
CREATE TYPE type_contenu AS ENUM ('video', 'exercice', 'quiz', 'document');
CREATE TYPE difficulte AS ENUM ('facile', 'moyen', 'difficile');
CREATE TYPE statut_tuteur AS ENUM ('en_attente', 'approuve', 'refuse', 'suspendu');

-- Table profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'parent',
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  date_naissance DATE,
  pays TEXT DEFAULT 'France',
  fuseau_horaire TEXT DEFAULT 'Europe/Paris',
  telephone TEXT,
  langue_preferee TEXT DEFAULT 'fr',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  derniere_connexion TIMESTAMP WITH TIME ZONE,
  UNIQUE(email)
);

-- Table students
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prenom TEXT NOT NULL,
  date_naissance DATE NOT NULL,
  niveau_scolaire niveau_scolaire NOT NULL,
  besoins_specifiques TEXT,
  objectifs_apprentissage TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table tutors
CREATE TABLE public.tutors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  diplomes TEXT[] NOT NULL,
  matieres_enseignees TEXT[] NOT NULL,
  tarif_horaire_eur DECIMAL(10,2) NOT NULL,
  annees_experience INTEGER NOT NULL,
  bio TEXT,
  certifications TEXT[],
  disponibilites JSONB,
  verification_casier BOOLEAN DEFAULT false,
  statut_approbation statut_tuteur DEFAULT 'en_attente',
  notes_admin TEXT,
  note_moyenne DECIMAL(3,2) DEFAULT 0.00,
  nombre_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table parents (metadata supplémentaire)
CREATE TABLE public.parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  abonnement_actif BOOLEAN DEFAULT false,
  type_abonnement type_abonnement DEFAULT 'gratuit',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table sessions_tutorat
CREATE TABLE public.sessions_tutorat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  etudiant_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  tuteur_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
  date_heure_debut TIMESTAMP WITH TIME ZONE NOT NULL,
  duree_minutes INTEGER NOT NULL DEFAULT 60,
  matiere TEXT NOT NULL,
  statut statut_session DEFAULT 'programmee',
  lien_zoom TEXT,
  enregistrement_url TEXT,
  notes_tuteur TEXT,
  evaluation_etudiant INTEGER CHECK (evaluation_etudiant >= 1 AND evaluation_etudiant <= 5),
  commentaire_evaluation TEXT,
  montant_paye DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table lessons (ressources pédagogiques)
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre TEXT NOT NULL,
  description TEXT,
  niveau_scolaire niveau_scolaire NOT NULL,
  matiere TEXT NOT NULL,
  type_contenu type_contenu NOT NULL,
  duree_estimee_minutes INTEGER,
  difficulte difficulte DEFAULT 'moyen',
  contenu_url TEXT,
  thumbnail_url TEXT,
  alignement_socle_commun TEXT,
  gratuit BOOLEAN DEFAULT true,
  ordre_affichage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table student_progress
CREATE TABLE public.student_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  etudiant_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  statut_completion INTEGER DEFAULT 0 CHECK (statut_completion >= 0 AND statut_completion <= 100),
  score_quiz INTEGER,
  temps_passe_minutes INTEGER DEFAULT 0,
  date_debut TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_completion TIMESTAMP WITH TIME ZONE,
  tentatives INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(etudiant_id, lesson_id)
);

-- Table subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  type type_abonnement NOT NULL,
  statut statut_abonnement DEFAULT 'actif',
  date_debut TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_fin TIMESTAMP WITH TIME ZONE,
  montant_mensuel DECIMAL(10,2) NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  montant DECIMAL(10,2) NOT NULL,
  devise TEXT DEFAULT 'EUR',
  methode_paiement TEXT NOT NULL,
  statut statut_paiement DEFAULT 'en_attente',
  transaction_id TEXT UNIQUE,
  pour_quoi TEXT NOT NULL,
  metadata JSONB,
  date_transaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions_tutorat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for students
CREATE POLICY "Parents can view their own students"
  ON public.students FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "Parents can create students"
  ON public.students FOR INSERT
  WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can update their students"
  ON public.students FOR UPDATE
  USING (parent_id = auth.uid());

CREATE POLICY "Parents can delete their students"
  ON public.students FOR DELETE
  USING (parent_id = auth.uid());

-- RLS Policies for tutors
CREATE POLICY "Anyone can view approved tutors"
  ON public.tutors FOR SELECT
  USING (statut_approbation = 'approuve');

CREATE POLICY "Tutors can view their own profile"
  ON public.tutors FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Tutors can update their own profile"
  ON public.tutors FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for parents
CREATE POLICY "Parents can view their own data"
  ON public.parents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Parents can update their own data"
  ON public.parents FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for sessions_tutorat
CREATE POLICY "Parents can view sessions of their students"
  ON public.sessions_tutorat FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.id = sessions_tutorat.etudiant_id
      AND students.parent_id = auth.uid()
    )
  );

CREATE POLICY "Tutors can view their own sessions"
  ON public.sessions_tutorat FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tutors
      WHERE tutors.id = sessions_tutorat.tuteur_id
      AND tutors.user_id = auth.uid()
    )
  );

CREATE POLICY "Tutors can update their own sessions"
  ON public.sessions_tutorat FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tutors
      WHERE tutors.id = sessions_tutorat.tuteur_id
      AND tutors.user_id = auth.uid()
    )
  );

-- RLS Policies for lessons (everyone can view)
CREATE POLICY "Everyone can view lessons"
  ON public.lessons FOR SELECT
  USING (true);

-- RLS Policies for student_progress
CREATE POLICY "Parents can view progress of their students"
  ON public.student_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.id = student_progress.etudiant_id
      AND students.parent_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own progress"
  ON public.student_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.id = student_progress.etudiant_id
      AND students.user_id = auth.uid()
    )
  );

-- RLS Policies for subscriptions
CREATE POLICY "Parents can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parents
      WHERE parents.id = subscriptions.parent_id
      AND parents.user_id = auth.uid()
    )
  );

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (user_id = auth.uid());

-- Trigger function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, prenom, nom)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent')::app_role,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Prénom'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Nom')
  );
  
  -- Create parent record if role is parent
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'parent') = 'parent' THEN
    INSERT INTO public.parents (user_id)
    VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to call handle_new_user on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tutors_updated_at
  BEFORE UPDATE ON public.tutors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parents_updated_at
  BEFORE UPDATE ON public.parents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions_tutorat
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON public.student_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_students_parent_id ON public.students(parent_id);
CREATE INDEX idx_students_niveau ON public.students(niveau_scolaire);
CREATE INDEX idx_tutors_user_id ON public.tutors(user_id);
CREATE INDEX idx_tutors_statut ON public.tutors(statut_approbation);
CREATE INDEX idx_sessions_etudiant ON public.sessions_tutorat(etudiant_id);
CREATE INDEX idx_sessions_tuteur ON public.sessions_tutorat(tuteur_id);
CREATE INDEX idx_sessions_date ON public.sessions_tutorat(date_heure_debut);
CREATE INDEX idx_lessons_niveau ON public.lessons(niveau_scolaire);
CREATE INDEX idx_lessons_matiere ON public.lessons(matiere);
CREATE INDEX idx_progress_etudiant ON public.student_progress(etudiant_id);
CREATE INDEX idx_progress_lesson ON public.student_progress(lesson_id);
CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_subscriptions_parent ON public.subscriptions(parent_id);
