# 📊 État Actuel Complet du Projet StageConnect

**Date:** 11 Octobre 2025  
**Version:** 1.0.0

---

## 🎯 Vue d'ensemble

Application de gestion de stages avec 3 types d'utilisateurs :
- **Admin** - Gestion globale de la plateforme
- **Entreprise** - Publication d'offres et gestion des candidatures
- **Étudiant** - Recherche d'offres et candidatures

---

## 🗄️ Base de données PostgreSQL

### **Tables existantes**

```sql
-- users (table principale)
id, role, email, password_hash, created_at, updated_at

-- students (profil étudiant)
id, user_id, first_name, last_name, cv, domaine_etude, competencies

-- companies (profil entreprise)
id, user_id, company_name, sector, address, description, logo_url, telephone, nombre_employes

-- offres (offres de stage)
id, title, description, domaine, date_debut, date_fin, company_id, created_at

-- candidatures (candidatures)
id, date_candidature, statut, student_id, offre_id
```

---

## 🔧 Backend (Node.js + Express + PostgreSQL)

### **Structure des fichiers**

```
backend/
├── config/
│   └── database.js          ✅ Configuration PostgreSQL
├── middleware/
│   ├── auth.js              ✅ JWT (authenticateToken, authorizeRole)
│   └── validation.js        ✅ Validation des données
├── routes/
│   └── auth.js              ✅ Routes d'authentification
├── .env                     ✅ Variables d'environnement
├── server.js                ✅ Serveur Express
└── package.json             ✅ Dépendances
```

### **Routes API disponibles**

#### **Authentification** (`/api/auth`)

**✅ POST /api/auth/register**
- Inscription d'un nouvel utilisateur
- Body: `{ email, password, role, ...additionalData }`
- Crée automatiquement l'entrée dans `students` ou `companies`
- Retourne: `{ success, message, data: { user, token } }`

**✅ POST /api/auth/login**
- Connexion d'un utilisateur
- Body: `{ email, password, role }`
- Vérifie le mot de passe (bcrypt pour student/company, crypt pour admin)
- Retourne: `{ success, message, data: { user, token } }`

**✅ GET /api/auth/me**
- Récupère le profil de l'utilisateur connecté
- Headers: `Authorization: Bearer <token>`
- Retourne: `{ success, data: { user } }`

#### **Santé du serveur**

**✅ GET /api/health**
- Vérifie l'état du serveur et de la base de données
- Retourne: `{ success, message, database, timestamp }`

### **Middleware**

```javascript
// middleware/auth.js
authenticateToken(req, res, next)  // Vérifie le token JWT
authorizeRole(...roles)            // Vérifie le rôle de l'utilisateur
```

### **Configuration**

**Variables d'environnement (.env)**
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stageconnect
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe

# JWT
JWT_SECRET=votre_secret_jwt
JWT_EXPIRES_IN=7d
```

### **Serveur Express**

**Middlewares configurés:**
- ✅ CORS (origin: http://localhost:3000)
- ✅ express.json() - Parser JSON
- ✅ express.urlencoded() - Parser URL-encoded
- ✅ Logger des requêtes (développement)

**Gestion des erreurs:**
- ✅ 404 - Route non trouvée
- ✅ 500 - Erreur serveur globale
- ✅ Arrêt gracieux (SIGTERM, SIGINT)

---

## 🎨 Frontend (Next.js 15 + TypeScript + TailwindCSS)

### **Structure des fichiers**

```
front/
├── app/
│   ├── admin/              ✅ Pages admin
│   │   ├── dashboard/
│   │   ├── etudiants/
│   │   ├── entreprises/
│   │   ├── offres/
│   │   ├── rapports/
│   │   └── layout.tsx      ✅ Layout protégé (admin only)
│   ├── entreprise/         ✅ Pages entreprise
│   │   ├── dashboard/
│   │   ├── offres/
│   │   ├── candidatures/
│   │   ├── profil/         ⚠️ UI SEULEMENT (pas connecté au backend)
│   │   └── layout.tsx      ✅ Layout protégé (company only)
│   ├── etudiant/           ✅ Pages étudiant
│   │   ├── dashboard/
│   │   ├── offres/
│   │   ├── candidatures/
│   │   ├── profil/
│   │   └── layout.tsx      ✅ Layout protégé (student only)
│   ├── auth/
│   │   ├── login/          ✅ Page de connexion
│   │   └── register/       ✅ Page d'inscription
│   ├── layout.tsx          ✅ Layout racine avec AuthProvider
│   └── page.tsx            ✅ Page d'accueil
├── components/
│   ├── ui/                 ✅ Composants shadcn/ui
│   ├── admin-nav.tsx       ✅ Navigation admin
│   ├── company-nav.tsx     ✅ Navigation entreprise
│   ├── student-nav.tsx     ✅ Navigation étudiant
│   └── ProtectedRoute.tsx  ✅ Protection des routes
├── contexts/
│   └── AuthContext.tsx     ✅ Contexte d'authentification
├── lib/
│   └── api.ts              ✅ Configuration axios + API calls
└── hooks/
    └── use-toast.ts        ✅ Hook pour les notifications
```

### **Système d'authentification**

#### **AuthContext** (`contexts/AuthContext.tsx`)

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email, password, role) => Promise<void>;
  register: (data) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
```

**Fonctionnalités:**
- ✅ Sauvegarde du token et user dans `localStorage`
- ✅ Vérification automatique du token au chargement
- ✅ Gestion des erreurs de connexion/inscription
- ✅ Déconnexion avec nettoyage du localStorage

#### **ProtectedRoute** (`components/ProtectedRoute.tsx`)

```typescript
<ProtectedRoute allowedRoles={['admin']}>
  {/* Contenu accessible uniquement par admin */}
</ProtectedRoute>
```

**Fonctionnalités:**
- ✅ Vérifie si l'utilisateur est authentifié
- ✅ Vérifie si l'utilisateur a le bon rôle
- ✅ Redirige vers `/auth/login` si non authentifié
- ✅ Redirige vers le dashboard approprié si mauvais rôle
- ✅ Affiche un loader pendant la vérification

#### **API Client** (`lib/api.ts`)

```typescript
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Intercepteurs
- Ajoute automatiquement le token JWT
- Gère les erreurs 401 (redirection vers login)
```

### **Pages principales**

#### **Login** (`app/auth/login/page.tsx`)
- ✅ Formulaire avec email, password, rôle
- ✅ Validation frontend
- ✅ Appel API `/api/auth/login`
- ✅ Notifications toast (succès/erreur)
- ✅ Redirection automatique selon le rôle

#### **Register** (`app/auth/register/page.tsx`)
- ✅ Formulaire avec email, password, rôle
- ✅ Validation (password min 8 caractères)
- ✅ Appel API `/api/auth/register`
- ✅ Notifications toast (succès/erreur)
- ✅ Redirection automatique selon le rôle

#### **Dashboards**
- ✅ **Admin** (`app/admin/dashboard/page.tsx`) - Statistiques globales
- ✅ **Entreprise** (`app/entreprise/dashboard/page.tsx`) - Offres et candidatures
- ✅ **Étudiant** (`app/etudiant/dashboard/page.tsx`) - Offres suggérées

#### **Profil Entreprise** (`app/entreprise/profil/page.tsx`)

⚠️ **ÉTAT ACTUEL: UI SEULEMENT (PAS CONNECTÉ AU BACKEND)**

**Champs du formulaire:**
```typescript
{
  name: string,           // Nom de l'entreprise
  sector: string,         // Secteur d'activité
  address: string,        // Adresse
  email: string,          // Email
  phone: string,          // Téléphone
  website: string,        // Site web
  description: string,    // Description
  employees: string,      // Nombre d'employés (range)
  logo: string           // Logo (base64)
}
```

**Fonctionnalités:**
- ✅ Formulaire avec validation HTML5
- ✅ Upload de logo (conversion en base64)
- ✅ Select pour secteur et nombre d'employés
- ❌ **PAS de chargement automatique du profil**
- ❌ **PAS de sauvegarde dans la base de données**
- ❌ **PAS de notifications**
- ❌ **Données statiques en dur**

**Code actuel:**
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  console.log("[v0] Profile updated:", formData)
  // Simulate API call  ❌ PAS D'APPEL API
}
```

### **Composants de navigation**

#### **admin-nav.tsx**
- ✅ Navigation avec liens vers toutes les pages admin
- ✅ Avatar avec dropdown
- ✅ Bouton déconnexion avec confirmation (AlertDialog)

#### **company-nav.tsx**
- ✅ Navigation entreprise
- ✅ Avatar avec dropdown
- ✅ Bouton déconnexion avec confirmation

#### **student-nav.tsx**
- ✅ Navigation étudiant
- ✅ Avatar avec dropdown
- ✅ Bouton déconnexion avec confirmation

---

## 🔄 Flux d'authentification complet

### **Inscription**
```
1. Utilisateur remplit le formulaire (/auth/register)
2. Frontend → POST /api/auth/register
3. Backend crée user dans PostgreSQL
4. Backend crée entrée dans students ou companies
5. Backend retourne { user, token }
6. Frontend sauvegarde dans localStorage
7. Notification "✅ Inscription réussie"
8. Redirection selon le rôle:
   - student → /etudiant/dashboard
   - company → /entreprise/dashboard
```

### **Connexion**
```
1. Utilisateur remplit le formulaire (/auth/login)
2. Frontend → POST /api/auth/login
3. Backend vérifie email + password + role
4. Backend retourne { user, token }
5. Frontend sauvegarde dans localStorage
6. Notification "✅ Connexion réussie"
7. Redirection selon le rôle:
   - admin → /admin/dashboard
   - student → /etudiant/dashboard
   - company → /entreprise/dashboard
```

### **Protection des routes**
```
1. Utilisateur tente d'accéder à une page protégée
2. ProtectedRoute vérifie:
   - Token existe dans localStorage ?
   - Token valide ?
   - Rôle correspond ?
3. Si NON → Redirection vers /auth/login
4. Si mauvais rôle → Redirection vers son dashboard
5. Si OK → Affiche la page
```

### **Déconnexion**
```
1. Utilisateur clique sur "Déconnexion"
2. AlertDialog s'affiche: "Voulez-vous vous déconnecter ?"
3. Si "Non" → Ferme le dialogue
4. Si "Oui":
   - Supprime token et user du localStorage
   - Redirige vers la page d'accueil (/)
```

---

## ✅ Fonctionnalités implémentées

### **Backend**
- ✅ Connexion PostgreSQL
- ✅ Routes d'authentification (register, login, me)
- ✅ Middleware JWT (authenticateToken, authorizeRole)
- ✅ Validation des données
- ✅ Gestion des erreurs
- ✅ CORS configuré
- ✅ Transactions pour l'inscription

### **Frontend**
- ✅ Système d'authentification complet
- ✅ Protection des routes par rôle
- ✅ Contexte d'authentification global
- ✅ Notifications toast
- ✅ Redirections automatiques
- ✅ Confirmation de déconnexion
- ✅ Loaders pendant les requêtes
- ✅ Gestion des erreurs
- ✅ Interface responsive
- ✅ Dashboards pour les 3 rôles
- ✅ Pages de profil (UI seulement)

---

## ❌ Fonctionnalités NON implémentées

### **Backend**
- ❌ Routes CRUD pour les profils (company, student)
- ❌ Routes CRUD pour les offres
- ❌ Routes CRUD pour les candidatures
- ❌ Routes admin (gestion users, stats)
- ❌ Upload de fichiers (CV, logos)
- ❌ Recherche et filtres
- ❌ Notifications par email

### **Frontend**
- ❌ **Connexion backend pour les profils** ⚠️ PRIORITÉ
- ❌ Gestion des offres (création, édition, suppression)
- ❌ Gestion des candidatures
- ❌ Recherche d'offres avec filtres
- ❌ Upload de fichiers
- ❌ Tableau de bord admin fonctionnel
- ❌ Statistiques en temps réel

---

## ⚠️ Points d'attention

### **1. Profil Entreprise**
**Problème:** La page `/entreprise/profil` a une belle UI mais n'est PAS connectée au backend.

**Données actuelles:**
- Données statiques en dur (TechCorp, etc.)
- Pas de chargement depuis la base de données
- Pas de sauvegarde dans la base de données
- Juste un `console.log()` lors de la soumission

**Ce qui manque:**
1. Routes backend pour gérer le profil entreprise
2. Fonction `loadProfile()` pour charger les données
3. Fonction `handleSubmit()` pour sauvegarder
4. Notifications de succès/erreur
5. Loaders pendant les requêtes

### **2. Structure de la base de données**

**Table `companies` actuelle:**
```sql
id, user_id, company_name, sector, address, description, logo_url, telephone, nombre_employes
```

**Champs du formulaire frontend:**
```typescript
name, sector, address, email, phone, website, description, employees, logo
```

**Incompatibilités:**
- `name` (frontend) ≠ `company_name` (backend)
- `phone` (frontend) ≠ `telephone` (backend)
- `employees` (frontend) = range string ≠ `nombre_employes` (backend) = integer
- `email` (frontend) n'existe pas dans `companies` (dans `users`)
- `website` (frontend) n'existe pas dans `companies`
- `logo` (frontend) ≠ `logo_url` (backend)

### **3. Limite de payload**

**Problème potentiel:** Les images en base64 peuvent être très volumineuses.

**Solution:** Augmenter la limite dans `server.js`:
```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

---

## 🚀 Prochaines étapes recommandées

### **Priorité 1 - Profil Entreprise (URGENT)**

1. **Backend:**
   - Créer `routes/company.js`
   - GET `/api/company/profile` - Récupérer le profil
   - POST `/api/company/profile` - Créer/Mettre à jour le profil
   - PUT `/api/company/profile` - Mise à jour partielle
   - GET `/api/company/check-profile` - Vérifier si le profil existe

2. **Frontend:**
   - Connecter la page profil au backend
   - Ajouter `useEffect` pour charger le profil
   - Modifier `handleSubmit` pour appeler l'API
   - Ajouter les notifications toast
   - Ajouter les loaders

3. **Alignement des données:**
   - Décider si on garde `company_name` ou `name`
   - Ajouter `website` dans la table `companies` ?
   - Gérer `employees` (range string vs integer)

### **Priorité 2 - Offres de stage**

1. Créer routes backend CRUD offres
2. Créer page création d'offre (entreprise)
3. Créer page liste des offres (entreprise)
4. Créer page liste des offres (étudiant)
5. Créer page détail d'une offre

### **Priorité 3 - Candidatures**

1. Créer routes backend CRUD candidatures
2. Créer fonctionnalité "Postuler" (étudiant)
3. Créer page gestion candidatures (entreprise)
4. Créer page mes candidatures (étudiant)

### **Priorité 4 - Admin**

1. Créer routes backend admin (stats, users)
2. Connecter le dashboard admin
3. Créer pages de gestion (users, offres, candidatures)

---

## 📝 Notes importantes

1. **Base de données**: Les tables existent mais ne sont pas toutes utilisées
2. **Profils**: Les pages de profil existent mais avec des données statiques ⚠️
3. **Offres/Candidatures**: Uniquement l'UI, pas de backend
4. **Admin**: Dashboard avec données statiques uniquement
5. **Upload**: Pas de système d'upload de fichiers implémenté
6. **Email**: Pas de système d'envoi d'emails

---

## 🐛 Bugs connus

- Aucun bug critique identifié pour l'instant
- L'authentification fonctionne correctement
- Les redirections fonctionnent correctement
- Les notifications fonctionnent correctement

---

## 📦 Dépendances

### **Backend**
```json
{
  "express": "^5.1.0",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "pg": "^8.16.3",
  "bcryptjs": "^3.0.2",
  "jsonwebtoken": "^9.0.2",
  "nodemon": "^3.1.10"
}
```

### **Frontend**
```json
{
  "next": "15.0.3",
  "react": "^19.0.0",
  "typescript": "^5",
  "tailwindcss": "^3.4.1",
  "axios": "^1.6.5",
  "@radix-ui/react-*": "..." (composants UI)
}
```

---

## 🎯 Résumé

### **✅ Ce qui fonctionne**
- Authentification complète (register, login, logout)
- Protection des routes par rôle
- Redirections automatiques
- Interface utilisateur moderne et responsive
- Base de données PostgreSQL configurée

### **⚠️ Ce qui est en cours**
- Profil entreprise (UI prête, backend manquant)

### **❌ Ce qui manque**
- Connexion backend pour les profils
- Gestion des offres de stage
- Gestion des candidatures
- Fonctionnalités admin

---

**État du projet: Fondations solides, prêt pour connecter le profil entreprise au backend** ✅

**Prochaine étape: Créer les routes backend pour le profil entreprise** 🚀
