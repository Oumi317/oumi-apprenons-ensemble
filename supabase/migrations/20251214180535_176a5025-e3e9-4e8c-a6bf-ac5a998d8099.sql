-- P0.1: Insert quiz questions for all existing lessons

-- First, let's get the lesson IDs and insert questions for each
-- CP Français - Les voyelles
INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Quelle lettre est une voyelle ?', 'multiple_choice', '["a", "b", "c", "d"]'::jsonb, 'a', 'Les voyelles sont : a, e, i, o, u. Elles font un son quand on les prononce seules.', 10, 1
FROM lessons WHERE titre = 'Les voyelles' AND matiere = 'Français';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Combien y a-t-il de voyelles dans l''alphabet français ?', 'multiple_choice', '["4", "5", "6", "7"]'::jsonb, '6', 'Il y a 6 voyelles : a, e, i, o, u et y (qui est parfois une voyelle).', 10, 2
FROM lessons WHERE titre = 'Les voyelles' AND matiere = 'Français';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Le "e" est une voyelle.', 'true_false', '["Vrai", "Faux"]'::jsonb, 'Vrai', 'Oui ! Le "e" est bien une voyelle.', 10, 3
FROM lessons WHERE titre = 'Les voyelles' AND matiere = 'Français';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Trouve la voyelle dans le mot "chat" :', 'multiple_choice', '["c", "h", "a", "t"]'::jsonb, 'a', 'Dans "chat", la voyelle est "a".', 10, 4
FROM lessons WHERE titre = 'Les voyelles' AND matiere = 'Français';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Quelle voyelle fait le son "ou" ?', 'multiple_choice', '["o", "u", "i", "a"]'::jsonb, 'u', 'La lettre "u" fait le son "ou" en français.', 10, 5
FROM lessons WHERE titre = 'Les voyelles' AND matiere = 'Français';

-- CP Français - Les consonnes
INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Quelle lettre est une consonne ?', 'multiple_choice', '["a", "e", "b", "i"]'::jsonb, 'b', 'Les consonnes sont toutes les lettres qui ne sont pas des voyelles. "b" est une consonne.', 10, 1
FROM lessons WHERE titre = 'Les consonnes' AND matiere = 'Français';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Le "m" est une consonne.', 'true_false', '["Vrai", "Faux"]'::jsonb, 'Vrai', 'Oui, "m" est bien une consonne !', 10, 2
FROM lessons WHERE titre = 'Les consonnes' AND matiere = 'Français';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Combien y a-t-il de consonnes dans "papa" ?', 'multiple_choice', '["1", "2", "3", "4"]'::jsonb, '2', 'Dans "papa", il y a 2 consonnes : p et p.', 10, 3
FROM lessons WHERE titre = 'Les consonnes' AND matiere = 'Français';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Quelle consonne fait le son "ssss" ?', 'multiple_choice', '["s", "z", "f", "v"]'::jsonb, 's', 'La lettre "s" fait le son "ssss" comme dans "serpent".', 10, 4
FROM lessons WHERE titre = 'Les consonnes' AND matiere = 'Français';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Le "y" est toujours une consonne.', 'true_false', '["Vrai", "Faux"]'::jsonb, 'Faux', 'Le "y" peut être une voyelle ou une consonne selon le mot.', 10, 5
FROM lessons WHERE titre = 'Les consonnes' AND matiere = 'Français';

-- CP Maths - Compter de 1 à 10
INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Quel nombre vient après 5 ?', 'multiple_choice', '["4", "6", "7", "3"]'::jsonb, '6', 'Après 5 vient 6 ! 1, 2, 3, 4, 5, 6...', 10, 1
FROM lessons WHERE titre = 'Compter de 1 à 10' AND matiere = 'Mathématiques';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Combien font 3 + 2 ?', 'multiple_choice', '["4", "5", "6", "7"]'::jsonb, '5', '3 + 2 = 5. Tu peux compter sur tes doigts !', 10, 2
FROM lessons WHERE titre = 'Compter de 1 à 10' AND matiere = 'Mathématiques';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, '8 est plus grand que 6.', 'true_false', '["Vrai", "Faux"]'::jsonb, 'Vrai', 'Oui, 8 est plus grand que 6.', 10, 3
FROM lessons WHERE titre = 'Compter de 1 à 10' AND matiere = 'Mathématiques';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Quel nombre vient avant 10 ?', 'multiple_choice', '["8", "9", "11", "7"]'::jsonb, '9', 'Avant 10, il y a 9.', 10, 4
FROM lessons WHERE titre = 'Compter de 1 à 10' AND matiere = 'Mathématiques';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Combien y a-t-il de doigts sur une main ?', 'multiple_choice', '["4", "5", "6", "10"]'::jsonb, '5', 'Il y a 5 doigts sur une main !', 10, 5
FROM lessons WHERE titre = 'Compter de 1 à 10' AND matiere = 'Mathématiques';

-- CP Maths - Addition simple
INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Combien font 2 + 3 ?', 'multiple_choice', '["4", "5", "6", "7"]'::jsonb, '5', '2 + 3 = 5', 10, 1
FROM lessons WHERE titre = 'Addition simple' AND matiere = 'Mathématiques';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Combien font 4 + 1 ?', 'multiple_choice', '["4", "5", "6", "3"]'::jsonb, '5', '4 + 1 = 5', 10, 2
FROM lessons WHERE titre = 'Addition simple' AND matiere = 'Mathématiques';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, '1 + 1 = 2', 'true_false', '["Vrai", "Faux"]'::jsonb, 'Vrai', 'Exact ! 1 + 1 = 2', 10, 3
FROM lessons WHERE titre = 'Addition simple' AND matiere = 'Mathématiques';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Combien font 3 + 3 ?', 'multiple_choice', '["5", "6", "7", "8"]'::jsonb, '6', '3 + 3 = 6', 10, 4
FROM lessons WHERE titre = 'Addition simple' AND matiere = 'Mathématiques';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Combien font 5 + 0 ?', 'multiple_choice', '["0", "5", "10", "50"]'::jsonb, '5', 'Quand on ajoute 0, le nombre ne change pas. 5 + 0 = 5', 10, 5
FROM lessons WHERE titre = 'Addition simple' AND matiere = 'Mathématiques';

-- CE1 Français - Les syllabes
INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Combien de syllabes dans le mot "papa" ?', 'multiple_choice', '["1", "2", "3", "4"]'::jsonb, '2', 'pa-pa = 2 syllabes', 10, 1
FROM lessons WHERE titre = 'Les syllabes' AND matiere = 'Français';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Combien de syllabes dans "chocolat" ?', 'multiple_choice', '["2", "3", "4", "5"]'::jsonb, '3', 'cho-co-lat = 3 syllabes', 10, 2
FROM lessons WHERE titre = 'Les syllabes' AND matiere = 'Français';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Le mot "chat" a une seule syllabe.', 'true_false', '["Vrai", "Faux"]'::jsonb, 'Vrai', 'Oui, "chat" n''a qu''une syllabe !', 10, 3
FROM lessons WHERE titre = 'Les syllabes' AND matiere = 'Français';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Combien de syllabes dans "ordinateur" ?', 'multiple_choice', '["3", "4", "5", "6"]'::jsonb, '4', 'or-di-na-teur = 4 syllabes', 10, 4
FROM lessons WHERE titre = 'Les syllabes' AND matiere = 'Français';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Une syllabe contient toujours au moins une voyelle.', 'true_false', '["Vrai", "Faux"]'::jsonb, 'Vrai', 'Exact ! Chaque syllabe a au moins une voyelle.', 10, 5
FROM lessons WHERE titre = 'Les syllabes' AND matiere = 'Français';

-- CE1 Français - La phrase simple
INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Une phrase commence toujours par :', 'multiple_choice', '["une minuscule", "une majuscule", "un point", "une virgule"]'::jsonb, 'une majuscule', 'Une phrase commence toujours par une majuscule.', 10, 1
FROM lessons WHERE titre = 'La phrase simple' AND matiere = 'Français';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Une phrase se termine par :', 'multiple_choice', '["une virgule", "un point", "une majuscule", "rien"]'::jsonb, 'un point', 'Une phrase se termine par un point (. ! ou ?).', 10, 2
FROM lessons WHERE titre = 'La phrase simple' AND matiere = 'Français';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, '"le chat dort" est une phrase correcte.', 'true_false', '["Vrai", "Faux"]'::jsonb, 'Faux', 'Il manque la majuscule au début et le point à la fin.', 10, 3
FROM lessons WHERE titre = 'La phrase simple' AND matiere = 'Français';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Quelle phrase est correcte ?', 'multiple_choice', '["le soleil brille", "Le soleil brille.", "le soleil brille.", "Le soleil brille"]'::jsonb, 'Le soleil brille.', 'La phrase correcte a une majuscule au début et un point à la fin.', 10, 4
FROM lessons WHERE titre = 'La phrase simple' AND matiere = 'Français';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Une phrase exprime une idée complète.', 'true_false', '["Vrai", "Faux"]'::jsonb, 'Vrai', 'Oui, une phrase doit avoir un sens complet.', 10, 5
FROM lessons WHERE titre = 'La phrase simple' AND matiere = 'Français';

-- CE2 Maths - La multiplication
INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Que signifie 3 × 4 ?', 'multiple_choice', '["3 + 4", "3 fois 4", "3 - 4", "3 divisé par 4"]'::jsonb, '3 fois 4', '3 × 4 signifie "3 fois 4", soit 4 + 4 + 4 = 12', 10, 1
FROM lessons WHERE titre = 'La multiplication' AND matiere = 'Mathématiques';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Combien font 2 × 5 ?', 'multiple_choice', '["7", "10", "12", "15"]'::jsonb, '10', '2 × 5 = 10 (c''est 5 + 5)', 10, 2
FROM lessons WHERE titre = 'La multiplication' AND matiere = 'Mathématiques';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, '4 × 3 = 3 × 4', 'true_false', '["Vrai", "Faux"]'::jsonb, 'Vrai', 'La multiplication est commutative : l''ordre ne change pas le résultat.', 10, 3
FROM lessons WHERE titre = 'La multiplication' AND matiere = 'Mathématiques';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Combien font 6 × 2 ?', 'multiple_choice', '["8", "10", "12", "14"]'::jsonb, '12', '6 × 2 = 12', 10, 4
FROM lessons WHERE titre = 'La multiplication' AND matiere = 'Mathématiques';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Tout nombre multiplié par 0 donne :', 'multiple_choice', '["1", "0", "le même nombre", "10"]'::jsonb, '0', 'N''importe quel nombre × 0 = 0', 10, 5
FROM lessons WHERE titre = 'La multiplication' AND matiere = 'Mathématiques';

-- CE2 Maths - Tables de multiplication
INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Combien font 7 × 8 ?', 'multiple_choice', '["54", "56", "58", "64"]'::jsonb, '56', '7 × 8 = 56', 10, 1
FROM lessons WHERE titre = 'Tables de multiplication' AND matiere = 'Mathématiques';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Combien font 9 × 9 ?', 'multiple_choice', '["72", "81", "90", "99"]'::jsonb, '81', '9 × 9 = 81', 10, 2
FROM lessons WHERE titre = 'Tables de multiplication' AND matiere = 'Mathématiques';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, '6 × 7 = 42', 'true_false', '["Vrai", "Faux"]'::jsonb, 'Vrai', 'Exact ! 6 × 7 = 42', 10, 3
FROM lessons WHERE titre = 'Tables de multiplication' AND matiere = 'Mathématiques';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Combien font 8 × 5 ?', 'multiple_choice', '["35", "40", "45", "50"]'::jsonb, '40', '8 × 5 = 40', 10, 4
FROM lessons WHERE titre = 'Tables de multiplication' AND matiere = 'Mathématiques';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Combien font 4 × 6 ?', 'multiple_choice', '["20", "22", "24", "26"]'::jsonb, '24', '4 × 6 = 24', 10, 5
FROM lessons WHERE titre = 'Tables de multiplication' AND matiere = 'Mathématiques';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Combien font 3 × 9 ?', 'multiple_choice', '["24", "27", "30", "33"]'::jsonb, '27', '3 × 9 = 27', 10, 6
FROM lessons WHERE titre = 'Tables de multiplication' AND matiere = 'Mathématiques';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, '5 × 5 = 25', 'true_false', '["Vrai", "Faux"]'::jsonb, 'Vrai', 'Exact ! 5 × 5 = 25', 10, 7
FROM lessons WHERE titre = 'Tables de multiplication' AND matiere = 'Mathématiques';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Combien font 10 × 7 ?', 'multiple_choice', '["17", "70", "77", "100"]'::jsonb, '70', '10 × 7 = 70. Astuce : multiplier par 10, c''est ajouter un 0.', 10, 8
FROM lessons WHERE titre = 'Tables de multiplication' AND matiere = 'Mathématiques';

-- CM1 Sciences - Le cycle de l'eau
INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Comment s''appelle le passage de l''eau liquide à la vapeur ?', 'multiple_choice', '["condensation", "évaporation", "précipitation", "solidification"]'::jsonb, 'évaporation', 'L''évaporation est le passage de l''état liquide à l''état gazeux.', 10, 1
FROM lessons WHERE titre = 'Le cycle de l''eau' AND matiere = 'Sciences';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Les nuages sont formés de :', 'multiple_choice', '["fumée", "gouttelettes d''eau", "poussière", "air chaud"]'::jsonb, 'gouttelettes d''eau', 'Les nuages sont formés de minuscules gouttelettes d''eau en suspension.', 10, 2
FROM lessons WHERE titre = 'Le cycle de l''eau' AND matiere = 'Sciences';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'La pluie est un exemple de précipitation.', 'true_false', '["Vrai", "Faux"]'::jsonb, 'Vrai', 'La pluie, la neige et la grêle sont des précipitations.', 10, 3
FROM lessons WHERE titre = 'Le cycle de l''eau' AND matiere = 'Sciences';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Où va l''eau de pluie ?', 'multiple_choice', '["Elle disparaît", "Dans les rivières et nappes phréatiques", "Dans l''espace", "Elle reste sur place"]'::jsonb, 'Dans les rivières et nappes phréatiques', 'L''eau s''infiltre dans le sol ou rejoint les cours d''eau.', 10, 4
FROM lessons WHERE titre = 'Le cycle de l''eau' AND matiere = 'Sciences';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Le cycle de l''eau est un processus qui s''arrête.', 'true_false', '["Vrai", "Faux"]'::jsonb, 'Faux', 'Le cycle de l''eau est continu et se répète sans fin.', 10, 5
FROM lessons WHERE titre = 'Le cycle de l''eau' AND matiere = 'Sciences';

-- CM2 Histoire - La Révolution française
INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'En quelle année a commencé la Révolution française ?', 'multiple_choice', '["1789", "1792", "1799", "1804"]'::jsonb, '1789', 'La Révolution française a commencé en 1789 avec la prise de la Bastille.', 10, 1
FROM lessons WHERE titre = 'La Révolution française' AND matiere = 'Histoire';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Quel événement a eu lieu le 14 juillet 1789 ?', 'multiple_choice', '["Sacre de Napoléon", "Prise de la Bastille", "Déclaration des droits", "Fuite du roi"]'::jsonb, 'Prise de la Bastille', 'Le 14 juillet 1789, le peuple a pris la Bastille, symbole du pouvoir royal.', 10, 2
FROM lessons WHERE titre = 'La Révolution française' AND matiere = 'Histoire';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'La devise de la République française est "Liberté, Égalité, Fraternité".', 'true_false', '["Vrai", "Faux"]'::jsonb, 'Vrai', 'Cette devise date de la Révolution française.', 10, 3
FROM lessons WHERE titre = 'La Révolution française' AND matiere = 'Histoire';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'Qui était le roi de France pendant la Révolution ?', 'multiple_choice', '["Louis XIV", "Louis XV", "Louis XVI", "Napoléon"]'::jsonb, 'Louis XVI', 'Louis XVI était roi pendant la Révolution et fut guillotiné en 1793.', 10, 4
FROM lessons WHERE titre = 'La Révolution française' AND matiere = 'Histoire';

INSERT INTO public.quiz_questions (lesson_id, question, type, options, correct_answer, explanation, points, ordre)
SELECT id, 'La Déclaration des droits de l''homme date de 1789.', 'true_false', '["Vrai", "Faux"]'::jsonb, 'Vrai', 'Elle a été adoptée le 26 août 1789.', 10, 5
FROM lessons WHERE titre = 'La Révolution française' AND matiere = 'Histoire';

-- P0.3: Update weekly challenges dates to current week
UPDATE public.weekly_challenges 
SET date_debut = date_trunc('week', now()),
    date_fin = date_trunc('week', now()) + interval '7 days';

-- P0.3: Create function to automatically award achievements
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_student_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lesson_count INTEGER;
  v_quiz_perfect_count INTEGER;
  v_current_streak INTEGER;
  v_matiere_count INTEGER;
BEGIN
  -- Get stats
  SELECT COUNT(*) INTO v_lesson_count
  FROM student_progress
  WHERE etudiant_id = p_student_id AND statut_completion = 100;
  
  SELECT COUNT(*) INTO v_quiz_perfect_count
  FROM quiz_attempts
  WHERE student_id = p_student_id AND percentage >= 100;
  
  SELECT current_streak INTO v_current_streak
  FROM students
  WHERE id = p_student_id;
  
  SELECT COUNT(DISTINCT l.matiere) INTO v_matiere_count
  FROM student_progress sp
  JOIN lessons l ON l.id = sp.lesson_id
  WHERE sp.etudiant_id = p_student_id AND sp.statut_completion = 100;
  
  -- Award "Première leçon" achievement
  IF v_lesson_count >= 1 AND NOT EXISTS (
    SELECT 1 FROM achievements WHERE student_id = p_student_id AND title = 'Première leçon'
  ) THEN
    INSERT INTO achievements (student_id, type, title, description, icon, points)
    VALUES (p_student_id, 'milestone', 'Première leçon', 'Tu as complété ta première leçon !', '📖', 50);
    PERFORM award_experience(p_student_id, 50);
  END IF;
  
  -- Award "Explorateur" achievement (10 lessons)
  IF v_lesson_count >= 10 AND NOT EXISTS (
    SELECT 1 FROM achievements WHERE student_id = p_student_id AND title = 'Explorateur'
  ) THEN
    INSERT INTO achievements (student_id, type, title, description, icon, points)
    VALUES (p_student_id, 'milestone', 'Explorateur', 'Tu as complété 10 leçons !', '🗺️', 100);
    PERFORM award_experience(p_student_id, 100);
  END IF;
  
  -- Award "Polyvalent" achievement (3 different subjects)
  IF v_matiere_count >= 3 AND NOT EXISTS (
    SELECT 1 FROM achievements WHERE student_id = p_student_id AND title = 'Polyvalent'
  ) THEN
    INSERT INTO achievements (student_id, type, title, description, icon, points)
    VALUES (p_student_id, 'milestone', 'Polyvalent', 'Tu as étudié 3 matières différentes !', '🎨', 75);
    PERFORM award_experience(p_student_id, 75);
  END IF;
  
  -- Award streak achievements
  IF v_current_streak >= 3 AND NOT EXISTS (
    SELECT 1 FROM achievements WHERE student_id = p_student_id AND title = 'Série de 3 jours'
  ) THEN
    INSERT INTO achievements (student_id, type, title, description, icon, points)
    VALUES (p_student_id, 'streak', 'Série de 3 jours', 'Tu as étudié 3 jours de suite !', '🔥', 30);
    PERFORM award_experience(p_student_id, 30);
  END IF;
  
  IF v_current_streak >= 7 AND NOT EXISTS (
    SELECT 1 FROM achievements WHERE student_id = p_student_id AND title = 'Série de 7 jours'
  ) THEN
    INSERT INTO achievements (student_id, type, title, description, icon, points)
    VALUES (p_student_id, 'streak', 'Série de 7 jours', 'Tu as étudié 7 jours de suite ! Incroyable !', '💪', 100);
    PERFORM award_experience(p_student_id, 100);
  END IF;
  
  IF v_current_streak >= 30 AND NOT EXISTS (
    SELECT 1 FROM achievements WHERE student_id = p_student_id AND title = 'Un mois de feu'
  ) THEN
    INSERT INTO achievements (student_id, type, title, description, icon, points)
    VALUES (p_student_id, 'streak', 'Un mois de feu', 'Tu as étudié 30 jours de suite ! Tu es une légende !', '👑', 500);
    PERFORM award_experience(p_student_id, 500);
  END IF;
END;
$$;

-- Create trigger to check achievements after quiz completion
CREATE OR REPLACE FUNCTION public.trigger_check_achievements_after_quiz()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM check_and_award_achievements(NEW.student_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_achievements_after_quiz ON quiz_attempts;
CREATE TRIGGER check_achievements_after_quiz
  AFTER INSERT ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_achievements_after_quiz();

-- Create trigger to check achievements after progress update
CREATE OR REPLACE FUNCTION public.trigger_check_achievements_after_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.statut_completion = 100 THEN
    PERFORM check_and_award_achievements(NEW.etudiant_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_achievements_after_progress ON student_progress;
CREATE TRIGGER check_achievements_after_progress
  AFTER INSERT OR UPDATE ON student_progress
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_achievements_after_progress();