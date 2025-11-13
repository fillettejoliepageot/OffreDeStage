# Backend StageConnect - API Node.js

## 📋 Étape 1 : Configuration et Authentification

### ✅ Fichiers créés

1. **Configuration**
   - `config/database.js` - Connexion PostgreSQL
   - `.env` - Variables d'environnement
   - `.env.example` - Template des variables

2. **Middlewares**
   - `middleware/auth.js` - Authentification JWT
   - `middleware/validation.js` - Validation des données

3. **Routes**
   - `routes/auth.js` - Routes d'authentification

4. **Serveur**
   - `server.js` - Serveur Express principal

---

## 🚀 Installation et Démarrage

### 1. Configurer les variables d'environnement

Ouvrez le fichier `.env` et modifiez les valeurs :

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=VOTRE_MOT_DE_PASSE_POSTGRESQL
DB_NAME=schema

JWT_SECRET=changez_ce_secret_en_production
JWT_EXPIRES_IN=7d

PORT=5000
NODE_ENV=development

FRONTEND_URL=http://localhost:3000
```

### 2. Installer les dépendances

```bash
cd backend
npm install
```

### 3. Démarrer le serveur

**Mode développement (avec auto-reload) :**
```bash
npm run dev
```

**Mode production :**
```bash
npm start
```

---

## 🔐 Routes d'Authentification

### 1. **POST** `/api/auth/register` - Inscription

**Corps de la requête (Student) :**
```json
{
  "email": "etudiant@example.com",
  "password": "motdepasse123",
  "role": "student",
  "first_name": "Jean",
  "last_name": "Dupont",
  "domaine_etude": "Informatique"
}
```

**Corps de la requête (Company) :**
```json
{
  "email": "entreprise@example.com",
  "password": "motdepasse123",
  "role": "company",
  "company_name": "TechCorp",
  "sector": "Informatique",
  "address": "123 Rue Example, Paris"
}
```

### 2. **POST** `/api/auth/login` - Connexion

```json
{
  "email": "admin@stageapp.com",
  "password": "admin123",
  "role": "admin"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@stageapp.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. **GET** `/api/auth/me` - Profil utilisateur

**Headers :**
```
Authorization: Bearer <votre_token>
```

---

## 🧪 Tester l'API

### Avec curl :

```bash
# Test de connexion admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stageapp.com","password":"admin123","role":"admin"}'
```

### Avec Postman ou Thunder Client :

1. Créer une requête POST vers `http://localhost:5000/api/auth/login`
2. Body (JSON) :
```json
{
  "email": "admin@stageapp.com",
  "password": "admin123",
  "role": "admin"
}
```

---

## ✅ Vérifications

1. **Serveur démarré** : `http://localhost:5000`
2. **Health check** : `http://localhost:5000/api/health`
3. **Base de données** : Vérifier la connexion PostgreSQL

---

## 📝 Notes importantes

- ⚠️ **Admin** : Pas d'inscription, compte déjà dans la base de données
- 🔑 **Mot de passe admin** : `admin123` (email: `admin@stageapp.com`)
- 🔐 **JWT** : Token valide pendant 7 jours
- 📊 **Base de données** : Nom `schema` (comme dans votre SQL)

---

## 🐛 Dépannage

**Erreur de connexion PostgreSQL :**
- Vérifier que PostgreSQL est démarré
- Vérifier les credentials dans `.env`
- Vérifier que la base `schema` existe

**Port déjà utilisé :**
- Changer le PORT dans `.env`
- Ou arrêter le processus sur le port 5000

---

## 📦 Prochaines étapes

✅ Étape 1 : Connexion DB + Authentification (TERMINÉE)
⏳ Étape 2 : Routes CRUD pour les offres
⏳ Étape 3 : Routes pour les candidatures
⏳ Étape 4 : Routes admin
⏳ Étape 5 : Intégration frontend
