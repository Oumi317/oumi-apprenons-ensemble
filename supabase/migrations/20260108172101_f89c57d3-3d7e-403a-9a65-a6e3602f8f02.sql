-- D'abord, rendre lesson_id nullable pour permettre des ressources indépendantes
ALTER TABLE interactive_resources ALTER COLUMN lesson_id DROP NOT NULL;

-- Insérer les 4 nouveaux manuels CREADOC
INSERT INTO interactive_resources (titre, description, file_url, type, slug, ordre_affichage)
VALUES 
  ('Manuel Interactif Mathématiques Primaire', 
   '15 leçons de mathématiques du CP au CM2 avec exercices interactifs', 
   '/resources/Manuel_Interactif_Mathematiques_Primaire.html', 
   'interactive_html', 
   'manuel-maths-primaire', 
   1),
  ('Manuel Interactif Sciences Primaire', 
   '15 leçons de sciences du CP au CM2 - corps humain, environnement, énergie', 
   '/resources/Manuel_Interactif_Sciences_Primaire.html', 
   'interactive_html', 
   'manuel-sciences-primaire', 
   2),
  ('Manuel Interactif Histoire-Géo Primaire', 
   '15 leçons d''histoire-géographie du CP au CM2 - chronologie, France, monde', 
   '/resources/Manuel_Interactif_HistoireGeo_Primaire.html', 
   'interactive_html', 
   'manuel-histoire-geo-primaire', 
   3),
  ('Manuel Interactif Anglais Cambridge', 
   '15 leçons d''anglais style Cambridge - vocabulaire, grammaire, lecture', 
   '/resources/Manuel_Interactif_Anglais_Cambridge.html', 
   'interactive_html', 
   'manuel-anglais-cambridge', 
   4);