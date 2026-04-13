

## Refonte de l'espace parent

### Objectif
Restructurer le `ChildCard` et le `ParentDashboard` pour que le parent puisse : assigner des leçons aux enfants, accéder à l'Assistant IA pour accompagner la progression, réserver des sessions tuteur, tout en conservant les encadrés de progression et fonctionnalités avancées.

### Modifications

#### 1. Nouvelle table `lesson_assignments` (migration DB)
```sql
CREATE TABLE lesson_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  student_id uuid NOT NULL,
  lesson_id uuid NOT NULL,
  consignes text,
  date_assignation timestamp with time zone NOT NULL,
  statut text NOT NULL DEFAULT 'assignee',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE lesson_assignments ENABLE ROW LEVEL SECURITY;
-- Parents CRUD their own assignments
-- Students can view assignments for themselves
```

#### 2. Nouveau composant `AssignLessonDialog.tsx`
- Dialog ouvert par le bouton "Assigner leçons" dans chaque `ChildCard`
- Charge les leçons filtrées par le `niveau_scolaire` de l'enfant
- Formulaire : sélecteur de leçon, champ consignes, date/heure picker
- Insère dans `lesson_assignments`

#### 3. Refonte du `ChildCard.tsx`
Remplacer le bouton "Assistant IA" par un bouton **"Assigner leçons"** qui ouvre le `AssignLessonDialog`. Le bouton "Réserver" reste. L'assistant IA sera accessible depuis le dashboard principal (fonctionnalités avancées) ou via un bouton secondaire plus discret.

#### 4. Refonte du `ParentDashboard.tsx`
- **Conserver** : QuickStats, liste des enfants (ChildCards), ProgressOverview, CREADOC Progress, Sessions à venir, Fonctionnalités Avancées
- **Supprimer** : les encadrés "Quick Actions" redondants (bibliothèque, Premium, "Pour bien démarrer") pour alléger
- **Ajouter dans Fonctionnalités Avancées** : un onglet "Assistant IA" utilisant le composant QuickAIChat existant, reconfiguré pour le parent (plans de cours, exercices avec logo OUMISCHOOL en filigrane)
- Les sessions réservées via `/tutors` apparaissent déjà dans "Sessions à venir" et dans le calendrier enfant (via `sessions_tutorat`)

#### 5. Intégration avec l'espace enfant
Les leçons assignées (`lesson_assignments`) seront affichées dans le `ChildPlanning.tsx` existant aux côtés des sessions tuteur, sans modification supplémentaire nécessaire car le composant sera mis à jour pour aussi requêter `lesson_assignments`.

### Fichiers impactés

| Fichier | Action |
|---------|--------|
| Migration SQL | Créer table `lesson_assignments` + RLS |
| `src/components/AssignLessonDialog.tsx` | Créer - formulaire d'assignation |
| `src/components/ChildCard.tsx` | Modifier - remplacer Assistant IA par Assigner leçons |
| `src/pages/ParentDashboard.tsx` | Simplifier layout, ajouter onglet Assistant IA dans Fonctionnalités Avancées |
| `src/components/ChildPlanning.tsx` | Ajouter requête `lesson_assignments` pour afficher les leçons assignées |

