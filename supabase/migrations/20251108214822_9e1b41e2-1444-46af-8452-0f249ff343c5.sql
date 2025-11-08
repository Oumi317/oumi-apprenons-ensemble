-- Corriger la fonction pour ajouter search_path
CREATE OR REPLACE FUNCTION check_session_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier s'il existe une session qui chevauche pour ce tuteur
  IF EXISTS (
    SELECT 1 FROM sessions_tutorat
    WHERE tuteur_id = NEW.tuteur_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND statut IN ('programmee', 'en_cours')
    AND (
      -- La nouvelle session commence pendant une session existante
      (NEW.date_heure_debut >= date_heure_debut 
       AND NEW.date_heure_debut < date_heure_debut + (duree_minutes || ' minutes')::interval)
      OR
      -- La nouvelle session se termine pendant une session existante
      (NEW.date_heure_debut + (NEW.duree_minutes || ' minutes')::interval > date_heure_debut
       AND NEW.date_heure_debut + (NEW.duree_minutes || ' minutes')::interval <= date_heure_debut + (duree_minutes || ' minutes')::interval)
      OR
      -- La nouvelle session englobe complètement une session existante
      (NEW.date_heure_debut <= date_heure_debut
       AND NEW.date_heure_debut + (NEW.duree_minutes || ' minutes')::interval >= date_heure_debut + (duree_minutes || ' minutes')::interval)
    )
  ) THEN
    RAISE EXCEPTION 'Ce créneau horaire est déjà réservé pour ce tuteur';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;