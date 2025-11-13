# 🔔 Notifications et Connexion API - Guide Complet

## ✅ Notifications implémentées

### 📢 Types de notifications

#### 1. **Connexion réussie**
```
✅ Connexion réussie
Vous allez être redirigé vers votre tableau de bord...
```

#### 2. **Inscription réussie**
```
✅ Inscription réussie !
Votre compte a été créé avec succès. Bienvenue sur StageConnect !
```

#### 3. **Erreur de connexion**
```
❌ Erreur de connexion
[Message d'erreur du backend]
```

#### 4. **Erreur d'inscription**
```
❌ Erreur d'inscription
[Message d'erreur du backend]
```

---

## 🔗 Connexion au Backend (PAS de données statiques)

### ✅ Toutes les données viennent du backend

#### **Login (app/auth/login/page.tsx)**
```typescript
// ❌ AVANT (statique)
const validLogins = [
  { email: "admin@example.com", password: "admin123", ... }
]

// ✅ MAINTENANT (backend)
await login(email, password, backendRole)
// → Appelle http://localhost:5000/api/auth/login
// → Vérifie dans PostgreSQL
// → Retourne user + token
```

#### **Register (app/auth/register/page.tsx)**
```typescript
// ❌ AVANT (simulation)
setTimeout(() => {
  router.push("/auth/login")
}, 1500)

// ✅ MAINTENANT (backend)
await register({ email, password, role: backendRole })
// → Appelle http://localhost:5000/api/auth/register
// → Crée l'utilisateur dans PostgreSQL
// → Retourne user + token
// → Redirige vers dashboard
```

---

## 📁 Fichiers modifiés

### 1. **app/layout.tsx**
- ✅ Ajout du `<Toaster />` pour afficher les notifications

### 2. **app/auth/login/page.tsx**
- ✅ Import de `useToast`
- ✅ Notification de succès après connexion
- ✅ Notification d'erreur en cas d'échec
- ✅ Connexion 100% backend (pas de données statiques)

### 3. **app/auth/register/page.tsx**
- ✅ Import de `useToast`
- ✅ Notification de succès après inscription
- ✅ Notification d'erreur en cas d'échec
- ✅ Inscription 100% backend (pas de simulation)

### 4. **contexts/AuthContext.tsx**
- ✅ Gestion complète de l'authentification via API
- ✅ Sauvegarde du token dans localStorage
- ✅ Vérification automatique du token au chargement

---

## 🔄 Flux complet avec notifications

### Inscription

```
1. Utilisateur remplit le formulaire
   ↓
2. Clique sur "Créer mon compte"
   ↓
3. Frontend → POST http://localhost:5000/api/auth/register
   ↓
4. Backend crée l'utilisateur dans PostgreSQL
   ↓
5. Backend retourne { user, token }
   ↓
6. Frontend sauvegarde dans localStorage
   ↓
7. 🔔 Notification: "✅ Inscription réussie !"
   ↓
8. Redirection vers dashboard (après 1 seconde)
```

### Connexion

```
1. Utilisateur remplit le formulaire
   ↓
2. Clique sur "Se connecter"
   ↓
3. Frontend → POST http://localhost:5000/api/auth/login
   ↓
4. Backend vérifie dans PostgreSQL
   ↓
5. Backend retourne { user, token }
   ↓
6. Frontend sauvegarde dans localStorage
   ↓
7. 🔔 Notification: "✅ Connexion réussie"
   ↓
8. Redirection vers dashboard (après 0.5 seconde)
```

### Erreur

```
1. Utilisateur entre de mauvais identifiants
   ↓
2. Frontend → POST http://localhost:5000/api/auth/login
   ↓
3. Backend retourne erreur 401
   ↓
4. 🔔 Notification: "❌ Erreur de connexion"
   ↓
5. Message d'erreur affiché
```

---

## 🎨 Exemples de messages d'erreur du backend

### Connexion
- `"Email, mot de passe ou rôle incorrect"`
- `"Token d'authentification manquant"`
- `"Token invalide ou expiré"`

### Inscription
- `"Un compte avec cet email existe déjà"`
- `"Format d'email invalide"`
- `"Le mot de passe doit contenir au moins 8 caractères"`
- `"Rôle invalide. Doit être 'student' ou 'company'"`

---

## 🧪 Tests à effectuer

### Test 1: Inscription réussie
1. Aller sur `/auth/register`
2. Email: `nouveau@test.com`
3. Password: `password123`
4. Rôle: Étudiant
5. ✅ Devrait afficher: "✅ Inscription réussie !"
6. ✅ Redirection vers `/etudiant/dashboard`

### Test 2: Inscription avec email existant
1. Essayer de s'inscrire avec `admin@stageapp.com`
2. ❌ Devrait afficher: "❌ Un compte avec cet email existe déjà"

### Test 3: Connexion admin
1. Email: `admin@stageapp.com`
2. Password: `admin123`
3. Rôle: Administrateur
4. ✅ Devrait afficher: "✅ Connexion réussie"
5. ✅ Redirection vers `/admin/dashboard`

### Test 4: Mauvais mot de passe
1. Email: `admin@stageapp.com`
2. Password: `wrongpassword`
3. Rôle: Administrateur
4. ❌ Devrait afficher: "❌ Email, mot de passe ou rôle incorrect"

### Test 5: Mot de passe trop court
1. Inscription avec password: `123`
2. ❌ Devrait afficher: "❌ Le mot de passe doit contenir au moins 8 caractères"

---

## 🔧 Configuration requise

### Backend doit être démarré
```bash
cd backend
npm run dev
```

### Frontend doit avoir .env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## ✨ Résumé des améliorations

### ✅ Notifications
- Toast de succès pour connexion
- Toast de succès pour inscription
- Toast d'erreur avec message du backend
- Design moderne avec icônes

### ✅ Connexion API
- Aucune donnée statique
- Toutes les vérifications dans PostgreSQL
- Messages d'erreur du backend
- Token JWT sauvegardé
- Redirection automatique

### ✅ UX améliorée
- Feedback visuel immédiat
- Messages clairs et précis
- Délai avant redirection pour voir la notification
- Loader pendant le traitement

---

## 🚀 Prochaines étapes

1. ✅ Backend + Auth (TERMINÉ)
2. ✅ Connexion Frontend-Backend (TERMINÉ)
3. ✅ Redirections et protection (TERMINÉ)
4. ✅ Notifications et API (TERMINÉ)
5. ⏳ Routes CRUD pour les offres
6. ⏳ Routes pour les candidatures
7. ⏳ Routes admin (gestion users)

---

**Tout est connecté au backend ! Aucune donnée statique.** 🎉
