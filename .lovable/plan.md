

## Refonte interactive de l'espace enfant

### Objectif
Rendre le calendrier, les leçons et les défis interactifs avec des fenêtres contextuelles, et ajouter un jeu d'énigmes.

### Modifications

#### 1. Calendrier interactif (`ChildPlanning.tsx`)
- Rendre chaque jour du calendrier cliquable
- Au clic, afficher un **Dialog** (fenêtre contextuelle) listant les sessions et leçons de ce jour
- Dans la section "Leçons à faire", rendre chaque leçon cliquable pour ouvrir un Dialog avec les détails et un bouton "Accéder"

#### 2. Ouverture intelligente des leçons (`StudentDashboard.tsx`)
- Quand on clique "Commencer" dans l'onglet "Mes Leçons", au lieu de naviguer vers `/lessons/:id`, ouvrir un **Dialog** contextuel qui :
  - **HTML/lien interactif** : affiche le contenu dans un iframe
  - **PDF** : propose "Ouvrir" (iframe inline) et "Télécharger"
  - **Vidéo** : ouvre le `VideoPlayer` intégré dans le Dialog
  - **Autre** : redirige normalement vers la page de leçon
- Charger les `lesson_resources` et `contenu_url` de la leçon dans le Dialog

#### 3. Nouveau composant `ChildRiddle.tsx` (Enigme du jour)
- Banque d'énigmes en dur (maths + culture générale, ~15-20 énigmes)
- Affiche une énigme aléatoire par jour (basée sur la date)
- L'enfant tape sa réponse dans un champ texte
- Le bouton "Vérifier" révèle si c'est correct ou non, puis affiche la solution
- Récompense XP si bonne réponse
- Intégré dans l'onglet Défis aux côtés de `WeeklyChallenges` et `ChildMiniGames`

### Fichiers impactés

| Fichier | Action |
|---------|--------|
| `src/components/ChildPlanning.tsx` | Ajouter Dialog au clic sur jour + clic sur leçon |
| `src/pages/StudentDashboard.tsx` | Remplacer `Link` par Dialog contextuel avec viewer intelligent |
| `src/components/ChildRiddle.tsx` | Créer - énigme maths/culture générale du jour |

### Pas de migration requise
Les données nécessaires (lessons, lesson_resources, contenu_url) sont déjà accessibles via les tables existantes.

