
## Plan pour sécuriser les fichiers .env

### Problème actuel
Le fichier `.gitignore` actuel n'exclut pas les fichiers `.env`, ce qui représente un **risque de sécurité majeur** car les clés d'API pourraient être exposées dans le dépôt Git.

### Actions à réaliser

#### 1. Modifier le fichier `.gitignore`

Ajouter une section dédiée aux variables d'environnement :

```text
# Environment variables
.env
.env.local
.env.development
.env.development.local
.env.test
.env.test.local
.env.production
.env.production.local
.env*.local
```

#### 2. Créer le fichier `.env.example`

Ce fichier servira de template pour les développeurs, avec des valeurs vides ou d'exemple :

```text
# Lovable Cloud Configuration (auto-populated by Lovable)
VITE_SUPABASE_PROJECT_ID="your_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="your_anon_key"
VITE_SUPABASE_URL="https://your-project.supabase.co"

# Note: Les variables ci-dessus sont automatiquement configurées par Lovable Cloud.
# Ne modifiez pas ce fichier manuellement.
```

### Variables d'environnement utilisées dans le projet

| Variable | Utilisation | Stockage |
|----------|-------------|----------|
| `VITE_SUPABASE_PROJECT_ID` | ID du projet | `.env` (frontend) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clé publique | `.env` (frontend) |
| `VITE_SUPABASE_URL` | URL du backend | `.env` (frontend) |
| `SUPABASE_URL` | URL (edge functions) | Auto-injecté |
| `SUPABASE_ANON_KEY` | Clé anonyme | Auto-injecté |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé admin | Auto-injecté |
| `BRAINTREE_MERCHANT_ID` | Paiements | Secrets Lovable |
| `BRAINTREE_PUBLIC_KEY` | Paiements | Secrets Lovable |
| `BRAINTREE_PRIVATE_KEY` | Paiements | Secrets Lovable |
| `BRAINTREE_ENVIRONMENT` | Environnement | Secrets Lovable |
| `LOVABLE_API_KEY` | AI Tutor | Secrets Lovable |

### Note importante

Dans Lovable Cloud :
- Les variables `VITE_*` dans `.env` sont **publiques** (accessibles côté client) - elles contiennent des clés publiables, donc pas de risque
- Les secrets sensibles (Braintree, etc.) sont stockés dans les **Secrets Lovable** et injectés automatiquement dans les edge functions
- Le fichier `.env` est auto-généré par Lovable, mais il est préférable de l'exclure du dépôt Git pour les bonnes pratiques

### Fichiers à modifier/créer

| Fichier | Action |
|---------|--------|
| `.gitignore` | Ajouter les exclusions `.env*` |
| `.env.example` | Créer avec les variables template |

### Résultat attendu

- Tous les fichiers `.env` sont exclus du suivi Git
- Les développeurs ont un template `.env.example` pour comprendre les variables nécessaires
- Meilleure hygiène de sécurité du dépôt
