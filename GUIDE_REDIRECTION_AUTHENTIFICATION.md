# 🔐 Guide Complet - Authentification et Redirections

## ✅ Système de redirection implémenté

### 🎯 Redirections après connexion

Le système redirige automatiquement chaque utilisateur vers sa propre page selon son rôle :

| Rôle | Email de test | Mot de passe | Redirection |
|------|---------------|--------------|-------------|
| **Admin** | admin@stageapp.com | admin123 | `/admin/dashboard` |
| **Étudiant** | (à créer) | (min 8 car.) | `/etudiant/dashboard` |
| **Entreprise** | (à créer) | (min 8 car.) | `/entreprise/dashboard` |

### 🔒 Protection des routes

Chaque section est protégée et accessible uniquement par le bon rôle :

#### **Section Admin** (`/admin/*`)
- ✅ Accessible uniquement par les utilisateurs avec `role: "admin"`
- ❌ Si un étudiant ou entreprise tente d'accéder → Redirection vers leur dashboard
- ❌ Si non connecté → Redirection vers `/auth/login`

#### **Section Entreprise** (`/entreprise/*`)
- ✅ Accessible uniquement par les utilisateurs avec `role: "company"`
- ❌ Si un admin ou étudiant tente d'accéder → Redirection vers leur dashboard
- ❌ Si non connecté → Redirection vers `/auth/login`

#### **Section Étudiant** (`/etudiant/*`)
- ✅ Accessible uniquement par les utilisateurs avec `role: "student"`
- ❌ Si un admin ou entreprise tente d'accéder → Redirection vers leur dashboard
- ❌ Si non connecté → Redirection vers `/auth/login`

---

## 📁 Fichiers créés/modifiés

### ✅ Nouveaux fichiers

1. **`components/ProtectedRoute.tsx`**
   - Composant de protection des routes
   - Vérifie l'authentification
   - Vérifie le rôle de l'utilisateur
   - Redirige automatiquement si non autorisé

### ✅ Fichiers modifiés

2. **`app/admin/layout.tsx`**
   - Enveloppé avec `<ProtectedRoute allowedRoles={["admin"]}>`

3. **`app/entreprise/layout.tsx`**
   - Enveloppé avec `<ProtectedRoute allowedRoles={["company"]}>`

4. **`app/etudiant/layout.tsx`**
   - Enveloppé avec `<ProtectedRoute allowedRoles={["student"]}>`

5. **`components/admin-nav.tsx`**
   - Bouton déconnexion connecté à `useAuth().logout()`
   - Redirection vers `/` après déconnexion

6. **`components/company-nav.tsx`**
   - Bouton déconnexion connecté à `useAuth().logout()`
   - Redirection vers `/` après déconnexion

7. **`components/student-nav.tsx`**
   - Bouton déconnexion connecté à `useAuth().logout()`
   - Redirection vers `/` après déconnexion

---

## 🔄 Flux complet d'authentification

### 1️⃣ Connexion

```
Utilisateur remplit le formulaire de login
    ↓
Clique sur "Se connecter"
    ↓
Frontend appelle useAuth().login(email, password, role)
    ↓
Requête POST vers http://localhost:5000/api/auth/login
    ↓
Backend vérifie dans PostgreSQL
    ↓
Backend retourne { user, token }
    ↓
Frontend sauvegarde dans localStorage
    ↓
Redirection automatique selon le rôle:
  - admin → /admin/dashboard
  - student → /etudiant/dashboard
  - company → /entreprise/dashboard
```

### 2️⃣ Protection des routes

```
Utilisateur tente d'accéder à une page protégée
    ↓
ProtectedRoute vérifie:
  1. Est-il connecté ? (token existe ?)
  2. A-t-il le bon rôle ?
    ↓
Si NON connecté → Redirection vers /auth/login
Si MAUVAIS rôle → Redirection vers son dashboard
Si OK → Affiche la page
```

### 3️⃣ Déconnexion

```
Utilisateur clique sur "Déconnexion"
    ↓
Frontend appelle useAuth().logout()
    ↓
Supprime token et user du localStorage
    ↓
Redirection vers la page d'accueil (/)
```

---

## 🧪 Tests à effectuer

### Test 1 : Connexion Admin
1. Aller sur http://localhost:3000/auth/login
2. Email: `admin@stageapp.com`
3. Password: `admin123`
4. Rôle: **Administrateur**
5. ✅ Devrait rediriger vers `/admin/dashboard`

### Test 2 : Inscription Étudiant
1. Aller sur http://localhost:3000/auth/register
2. Email: `test@etudiant.com`
3. Password: `password123`
4. Rôle: **Étudiant**
5. ✅ Devrait rediriger vers `/etudiant/dashboard`

### Test 3 : Protection des routes
1. Se connecter en tant qu'étudiant
2. Essayer d'accéder à `/admin/dashboard`
3. ✅ Devrait rediriger vers `/etudiant/dashboard`

### Test 4 : Accès sans connexion
1. Se déconnecter
2. Essayer d'accéder à `/admin/dashboard`
3. ✅ Devrait rediriger vers `/auth/login`

### Test 5 : Déconnexion
1. Se connecter (n'importe quel rôle)
2. Cliquer sur "Déconnexion"
3. ✅ Devrait rediriger vers `/`
4. ✅ Essayer d'accéder au dashboard → Redirection vers login

---

## 🎨 Mapping des rôles

### Frontend → Backend

| Frontend | Backend |
|----------|---------|
| `etudiant` | `student` |
| `entreprise` | `company` |
| `admin` | `admin` |

### Backend → Routes Frontend

| Backend Role | Dashboard |
|--------------|-----------|
| `student` | `/etudiant/dashboard` |
| `company` | `/entreprise/dashboard` |
| `admin` | `/admin/dashboard` |

---

## 🔧 Code clé

### Redirection après login (login/page.tsx)

```typescript
const roleMap = {
  etudiant: "student",
  entreprise: "company",
  admin: "admin",
}

const redirectMap = {
  student: "/etudiant/dashboard",
  company: "/entreprise/dashboard",
  admin: "/admin/dashboard",
}

await login(email, password, backendRole)
router.push(redirectMap[backendRole])
```

### Protection des routes (ProtectedRoute.tsx)

```typescript
<ProtectedRoute allowedRoles={["admin"]}>
  {/* Contenu accessible uniquement par admin */}
</ProtectedRoute>
```

### Déconnexion

```typescript
const handleLogout = () => {
  logout() // Supprime token et user
  router.push("/") // Redirige vers accueil
}
```

---

## ✨ Résumé

✅ **Connexion** → Redirection automatique selon le rôle
✅ **Protection** → Chaque section accessible uniquement par le bon rôle
✅ **Déconnexion** → Nettoyage complet et redirection
✅ **Sécurité** → Token JWT vérifié à chaque requête
✅ **UX** → Loader pendant la vérification

---

## 🚀 Prochaines étapes

1. ✅ Étape 1 : Backend + Auth (TERMINÉE)
2. ✅ Étape 2 : Connexion Frontend-Backend (TERMINÉE)
3. ✅ Étape 2.5 : Redirections et protection (TERMINÉE)
4. ⏳ Étape 3 : Routes CRUD pour les offres
5. ⏳ Étape 4 : Routes pour les candidatures
6. ⏳ Étape 5 : Routes admin (gestion users)

---

**Tout est prêt ! Testez maintenant les redirections et la protection des routes.** 🎉
