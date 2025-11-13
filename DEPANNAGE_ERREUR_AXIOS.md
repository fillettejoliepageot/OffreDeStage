# 🔧 Dépannage - Erreur de Connexion Axios

**Date:** 23 Octobre 2025  
**Erreur:** `settle@webpack-internal:///(app-pages-browser)/./node_modules/axios/lib/core/settle.js`

---

## ❌ Problème

Cette erreur Axios indique que le **frontend ne peut pas se connecter au backend**.

---

## ✅ Solutions

### **Solution 1 : Démarrer le Backend**

Le backend doit tourner sur le port **5000**.

#### **Étapes:**

1. **Ouvrir un terminal** dans le dossier `backend`
2. **Démarrer le serveur** :
   ```bash
   cd backend
   npm run dev
   ```

3. **Vérifier que le serveur démarre** :
   ```
   ✅ Connexion à la base de données PostgreSQL établie
   🚀 Serveur StageConnect démarré avec succès !
   📍 Port: 5000
   🌐 URL: http://localhost:5000
   🔗 CORS autorisé pour: http://localhost:3000
   ```

4. **Tester l'API** dans le navigateur :
   ```
   http://localhost:5000/api/health
   ```
   
   Vous devriez voir :
   ```json
   {
     "success": true,
     "message": "API StageConnect opérationnelle",
     "timestamp": "2025-10-23T10:00:00.000Z",
     "database": "connected"
   }
   ```

---

### **Solution 2 : Vérifier la Configuration**

#### **Backend - Port**

Le backend doit écouter sur le port **5000**.

**Fichier:** `backend/.env`
```env
PORT=5000
```

#### **Frontend - URL de l'API**

Le frontend doit pointer vers `http://localhost:5000/api`.

**Fichier:** `front/lib/api.ts` (ligne 4)
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
```

**Si vous voulez changer l'URL**, créez un fichier `front/.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

### **Solution 3 : Vérifier CORS**

Le backend doit autoriser les requêtes depuis `http://localhost:3000`.

**Fichier:** `backend/.env`
```env
FRONTEND_URL=http://localhost:3000
```

**Fichier:** `backend/server.js`
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

---

### **Solution 4 : Vérifier la Base de Données**

Le backend a besoin d'une connexion PostgreSQL.

**Fichier:** `backend/.env`
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
DB_NAME=schema
```

**Tester la connexion** :
```bash
psql -U postgres -d schema
```

---

## 🔍 Diagnostic

### **1. Vérifier les Ports Utilisés**

**Windows:**
```powershell
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```

**Linux/Mac:**
```bash
lsof -i :5000
lsof -i :3000
```

### **2. Vérifier les Logs**

**Backend:**
- Ouvrir le terminal où tourne le backend
- Vérifier les messages d'erreur

**Frontend:**
- Ouvrir la console du navigateur (F12)
- Onglet "Console"
- Chercher les erreurs Axios

---

## 🎯 Messages d'Erreur Améliorés

J'ai amélioré l'intercepteur Axios pour afficher des messages plus clairs :

**Avant:**
```
settle@webpack-internal:///(app-pages-browser)/./node_modules/axios/lib/core/settle.js:24:12
```

**Après:**
```
❌ Erreur de connexion au backend: Network Error
🔍 Vérifiez que le backend tourne sur http://localhost:5000
```

**Fichier modifié:** `front/lib/api.ts`

---

## 📋 Checklist de Dépannage

- [ ] **Backend démarré** sur le port 5000
- [ ] **Frontend démarré** sur le port 3000
- [ ] **Base de données** PostgreSQL accessible
- [ ] **Variables d'environnement** correctes
- [ ] **CORS** configuré correctement
- [ ] **Firewall** n'bloque pas les ports
- [ ] **Navigateur** à jour

---

## 🚀 Commandes Rapides

### **Démarrer le Backend**
```bash
cd backend
npm install
npm run dev
```

### **Démarrer le Frontend**
```bash
cd front
npm install
npm run dev
```

### **Vérifier la Connexion**
```bash
# Backend
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:3000
```

---

## ✅ Résultat Attendu

Une fois le backend démarré, vous devriez voir dans la console du frontend :

```
✅ Connexion au backend réussie
📊 Données chargées
```

Et plus d'erreur Axios !

---

## 💡 Conseils

1. **Toujours démarrer le backend AVANT le frontend**
2. **Vérifier les logs du backend** pour voir les requêtes
3. **Utiliser la console du navigateur** pour déboguer
4. **Tester l'API avec Postman** ou curl

---

**Le problème devrait être résolu !** ✅

Si le problème persiste, vérifiez :
- Les ports ne sont pas déjà utilisés
- Le firewall n'bloque pas les connexions
- PostgreSQL est bien démarré
