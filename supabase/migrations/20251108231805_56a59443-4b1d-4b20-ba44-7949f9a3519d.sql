-- Add 'en_cours' to the statut_session enum
ALTER TYPE statut_session ADD VALUE IF NOT EXISTS 'en_cours';