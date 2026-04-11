

## Refonte de l'espace enfant (Student Dashboard)

### Objectif
Transformer le tableau de bord enfant en un espace structuré avec 4 sections principales : **Planning**, **Mes Leçons**, **Défis & Mini-jeux**, et **Classement & Gamification**.

### Architecture actuelle
Le `StudentDashboard.tsx` utilise déjà un système d'onglets (Tabs) avec : Apprendre, Assistant IA, Défis, Classement, Succès. Les composants existants (`DailyLessons`, `WeeklyChallenges`, `StudentLeaderboard`, `AchievementBadges`, etc.) sont fonctionnels.

### Plan de refonte

#### 1. Nouveau composant `ChildPlanning.tsx`
- Calendrier visuel de la semaine avec les sessions tuteur à venir (depuis `sessions_tutorat`)
- Liste des leçons assignées par le parent (depuis `lessons` filtré par `niveau_scolaire`)
- Code couleur par matière (réutilisation des `matiereColors` existants)
- Indicateur visuel "aujourd'hui" / "demain" / "cette semaine"

#### 2. Refonte du `StudentDashboard.tsx`
- Restructurer les onglets en 4 sections claires :
  - **Planning** : nouveau composant `ChildPlanning` (calendrier + sessions + leçons à venir)
  - **Mes Leçons** : intégrer le contenu de `ChildLessons` directement dans l'onglet (filtrage par matière, progression, accès direct)
  - **Défis** : conserver `WeeklyChallenges` existant, ajouter une section mini-jeux visuels
  - **Classement** : combiner `StudentLeaderboard` + `AchievementBadges` + stats de gamification (XP, niveau, streak) dans un onglet unifié
- Garder la barre de session enfant en haut (timer, nom, bouton quitter)
- Conserver les stats rapides (Niveau, XP, Streak, Succès)
- Garder le système XP popup et les subscriptions realtime

#### 3. Composant `ChildMiniGames.tsx`
- Section mini-jeux dans l'onglet Défis
- Quiz rapides aléatoires (réutilisation des `quiz_questions` existantes)
- Défis chronométrés avec récompenses XP

#### 4. Mise à jour des routes
- Conserver `/student-dashboard` comme point d'entrée principal
- `/child-lessons` redirigera vers le dashboard (onglet leçons) pour éviter la duplication

### Fichiers impactés

| Fichier | Action |
|---------|--------|
| `src/components/ChildPlanning.tsx` | Créer - calendrier hebdo + sessions |
| `src/components/ChildMiniGames.tsx` | Créer - mini-jeux dans onglet défis |
| `src/pages/StudentDashboard.tsx` | Refonte - 4 onglets restructurés |
| `src/pages/ChildLessons.tsx` | Redirection vers dashboard |

### Aucune migration requise
Toutes les données nécessaires existent déjà dans les tables `sessions_tutorat`, `lessons`, `student_progress`, `quiz_questions`, `achievements`, `student_challenges`.

