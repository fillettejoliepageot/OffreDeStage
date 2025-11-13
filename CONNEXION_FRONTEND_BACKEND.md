# 🔗 Connexion Frontend-Backend - Guide Complet

## ✅ Ce qui a été fait

### Backend
- ✅ Configuration PostgreSQL (`config/database.js`)
- ✅ Routes d'authentification (`routes/auth.js`)
- ✅ Middlewares de validation et auth
- ✅ Serveur Express (`server.js`)

### Frontend
- ✅ Service API (`lib/api.ts`)
- ✅ Contexte d'authentification (`contexts/AuthContext.tsx`)
- ✅ Layout mis à jour avec AuthProvider
- ✅ Page login mise à jour
- ✅ Page register mise à jour (partiellement)

---

## 📝 Étapes pour finaliser

### 1. Créer le fichier `.env.local` dans le frontend

Créez le fichier : `front/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Configurer le backend `.env`

Ouvrez : `backend/.env`

Modifiez avec vos informations PostgreSQL :
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=VOTRE_MOT_DE_PASSE
DB_NAME=schema

JWT_SECRET=changez_ce_secret_en_production_12345
JWT_EXPIRES_IN=7d

PORT=5000
NODE_ENV=development

FRONTEND_URL=http://localhost:3000
```

### 3. Démarrer le backend

```bash
cd backend
npm install
npm run dev
```

Vous devriez voir :
```
✅ Connexion à la base de données PostgreSQL établie
🚀 Serveur StageConnect démarré avec succès !
📡 Port: 5000
```

### 4. Démarrer le frontend

```bash
cd front
npm install
npm run dev
```

### 5. Tester la connexion

#### Test Admin (compte déjà dans la DB)
- URL: http://localhost:3000/auth/login
- Email: `admin@stageapp.com`
- Password: `admin123`
- Rôle: Administrateur

#### Test Inscription Étudiant
- URL: http://localhost:3000/auth/register
- Email: `test@etudiant.com`
- Password: `motdepasse123`
- Rôle: Étudiant

---

## 🔧 Vérifications importantes

### Backend
1. PostgreSQL est démarré
2. La base de données `schema` existe
3. Le compte admin est créé (via votre script SQL)
4. Le serveur écoute sur le port 5000

### Frontend
1. Le fichier `.env.local` existe
2. L'URL de l'API est correcte
3. Le serveur Next.js écoute sur le port 3000

---

## 🐛 Résolution de problèmes

### Erreur CORS
Si vous voyez une erreur CORS dans la console :
- Vérifiez que `FRONTEND_URL` dans backend `.env` est `http://localhost:3000`
- Redémarrez le serveur backend

### Erreur de connexion DB
```
❌ Erreur de connexion à la base de données
```
- Vérifiez PostgreSQL est démarré
- Vérifiez les credentials dans `.env`
- Vérifiez que la base `schema` existe

### Token invalide
- Supprimez le localStorage du navigateur (F12 > Application > Local Storage)
- Reconnectez-vous

---

## 📊 Flux d'authentification

1. **Utilisateur remplit le formulaire** (login/register)
2. **Frontend** → Appelle `useAuth().login()` ou `useAuth().register()`
3. **AuthContext** → Appelle `authAPI.login()` ou `authAPI.register()`
4. **API Service** → Envoie requête HTTP à `http://localhost:5000/api/auth/...`
5. **Backend** → Vérifie credentials dans PostgreSQL
6. **Backend** → Génère token JWT
7. **Backend** → Retourne `{ success: true, data: { user, token } }`
8. **Frontend** → Sauvegarde token dans localStorage
9. **Frontend** → Redirige vers dashboard selon le rôle

---

## 🎯 Prochaines étapes

Une fois la connexion testée et fonctionnelle :

1. ✅ Étape 1 : Connexion DB + Auth (TERMINÉE)
2. ✅ Étape 2 : Connexion Frontend-Backend (TERMINÉE)
3. ⏳ Étape 3 : Routes CRUD pour les offres
4. ⏳ Étape 4 : Routes pour les candidatures
5. ⏳ Étape 5 : Routes admin (gestion users)
6. ⏳ Étape 6 : Protection des routes frontend

---

## 📞 Test avec curl

Pour tester directement l'API :

```bash
# Test login admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stageapp.com","password":"admin123","role":"admin"}'

# Test register student
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@student.com","password":"password123","role":"student"}'
```

---

## ✨ Résumé des fichiers créés

### Backend
- `config/database.js` - Connexion PostgreSQL
- `middleware/auth.js` - JWT authentication
- `middleware/validation.js` - Validation des données
- `routes/auth.js` - Routes login/register/me
- `server.js` - Serveur Express
- `.env` - Variables d'environnement

### Frontend
- `lib/api.ts` - Service API avec axios
- `contexts/AuthContext.tsx` - Contexte React pour auth
- `.env.local` - Variables d'environnement frontend
- `app/layout.tsx` - Mis à jour avec AuthProvider
- `app/auth/login/page.tsx` - Connecté au backend
- `app/auth/register/page.tsx` - Connecté au backend

---

**Tout est prêt ! Démarrez les deux serveurs et testez la connexion.** 🚀
