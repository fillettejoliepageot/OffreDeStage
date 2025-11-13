      # 🎯 Panel Admin Dynamique - Documentation

## ✅ Résumé des modifications

Le panel admin a été entièrement rendu **dynamique** et connecté à la base de données PostgreSQL. Toutes les données statiques ont été remplacées par des appels API réels.

---

## 🔧 Backend - Routes Admin

### Fichier créé : `backend/routes/admin.js`

#### Routes implémentées :

1. **GET `/api/admin/stats`**
   - Statistiques globales de la plateforme
   - Nombre d'étudiants, entreprises, offres, candidatures
   - Croissance mensuelle (6 derniers mois)
   - Activité récente (dernières inscriptions, offres, candidatures)
   - **Access:** Admin uniquement

2. **GET `/api/admin/students`**
   - Liste complète de tous les étudiants
   - Informations : nom, email, domaine, niveau, nombre de candidatures
   - **Access:** Admin uniquement

3. **GET `/api/admin/companies`**
   - Liste complète de toutes les entreprises
   - Informations : nom, secteur, email, téléphone, nombre d'offres
   - **Access:** Admin uniquement

4. **GET `/api/admin/offres`**
   - Liste complète de toutes les offres
   - Informations : titre, entreprise, domaine, nombre de candidatures
   - **Access:** Admin uniquement

5. **DELETE `/api/admin/users/:id`**
   - Suppression d'un utilisateur (étudiant ou entreprise)
   - Suppression en cascade des données associées :
     - Pour étudiant : candidatures + profil
     - Pour entreprise : candidatures + offres + profil
   - Protection : impossible de supprimer un admin
   - **Access:** Admin uniquement

6. **DELETE `/api/admin/offres/:id`**
   - Suppression d'une offre
   - Suppression en cascade des candidatures associées
   - **Access:** Admin uniquement

### Middleware utilisé :
- `authenticateToken` : Vérification du JWT
- `authorizeRole('admin')` : Vérification du rôle admin

---

## 🎨 Frontend - Pages Admin

### 1. Dashboard Admin (`/admin/dashboard`)

**Fichier:** `front/app/admin/dashboard/page.tsx`

**Fonctionnalités:**
- ✅ Statistiques en temps réel :
  - Nombre d'étudiants inscrits
  - Nombre d'entreprises
  - Nombre d'offres actives
  - Nombre total de candidatures
- ✅ Activité récente avec timestamps relatifs
- ✅ Loading states avec spinner
- ✅ Gestion d'erreurs avec toasts

**API utilisée:** `adminAPI.getStats()`

---

### 2. Gestion des Étudiants (`/admin/etudiants`)

**Fichier:** `front/app/admin/etudiants/page.tsx`

**Fonctionnalités:**
- ✅ Liste de tous les étudiants avec :
  - Nom complet (ou "Non renseigné" si profil incomplet)
  - Email
  - Domaine d'étude
  - Niveau d'étude
  - Nombre de candidatures
- ✅ Recherche en temps réel (nom, email, domaine)
- ✅ Suppression d'étudiant avec confirmation
- ✅ Statistiques :
  - Total étudiants
  - Étudiants avec profil complet
- ✅ Loading states et feedback utilisateur

**API utilisée:** 
- `adminAPI.getStudents()`
- `adminAPI.deleteUser(userId)`

---

### 3. Gestion des Entreprises (`/admin/entreprises`)

**Fichier:** `front/app/admin/entreprises/page.tsx`

**Fonctionnalités:**
- ✅ Liste de toutes les entreprises avec :
  - Nom de l'entreprise
  - Secteur d'activité
  - Email
  - Téléphone
  - Nombre d'offres publiées
- ✅ Recherche en temps réel (nom, secteur, email)
- ✅ Suppression d'entreprise avec confirmation
- ✅ Statistiques :
  - Total entreprises
  - Entreprises avec profil complet
- ✅ Loading states et feedback utilisateur

**API utilisée:** 
- `adminAPI.getCompanies()`
- `adminAPI.deleteUser(userId)`

---

### 4. Supervision des Offres (`/admin/offres`)

**Fichier:** `front/app/admin/offres/page.tsx`

**Fonctionnalités:**
- ✅ Liste de toutes les offres avec :
  - Titre de l'offre
  - Entreprise
  - Domaine
  - Secteur
  - Nombre de candidatures
  - Date de publication
- ✅ Recherche en temps réel (titre, entreprise, domaine)
- ✅ Suppression d'offre avec confirmation
- ✅ Statistiques :
  - Total offres
  - Total candidatures
- ✅ Loading states et feedback utilisateur

**API utilisée:** 
- `adminAPI.getOffres()`
- `adminAPI.deleteOffre(offreId)`

---

## 📡 API Frontend

### Fichier modifié : `front/lib/api.ts`

**Nouveau module ajouté : `adminAPI`**

```typescript
export const adminAPI = {
  getStats: async () => { ... },
  getStudents: async () => { ... },
  getCompanies: async () => { ... },
  getOffres: async () => { ... },
  deleteUser: async (userId: string) => { ... },
  deleteOffre: async (offreId: string) => { ... },
}
```

---

## 🔐 Sécurité

### Protection des routes :
1. **Backend :** Middleware `authorizeRole('admin')` sur toutes les routes admin
2. **Frontend :** `ProtectedRoute` avec `allowedRoles={["admin"]}` dans le layout admin

### Suppressions en cascade :
- Suppression d'un étudiant → supprime ses candidatures
- Suppression d'une entreprise → supprime ses offres ET les candidatures associées
- Suppression d'une offre → supprime les candidatures associées

---

## 🎯 Fonctionnalités implémentées

### ✅ Toutes les pages sont maintenant :
- **Dynamiques** : Données réelles depuis la base de données
- **Interactives** : Recherche, filtres, suppressions
- **Responsives** : Design adaptatif mobile/desktop
- **User-friendly** : Loading states, messages d'erreur, confirmations
- **Sécurisées** : Authentification et autorisation requises

### ✅ Gestion d'état :
- Loading states avec spinners
- Messages de succès/erreur avec toasts
- Rechargement automatique après modifications
- Dialogues de confirmation pour actions destructives

---

## 🚀 Comment tester

### 1. Démarrer le backend :
```bash
cd backend
npm start
```

### 2. Démarrer le frontend :
```bash
cd front
npm run dev
```

### 3. Se connecter en tant qu'admin :
- Email : `admin@stageconnect.com` (ou votre compte admin)
- Mot de passe : votre mot de passe admin
- Rôle : Admin

### 4. Accéder au panel admin :
- Dashboard : `http://localhost:3000/admin/dashboard`
- Étudiants : `http://localhost:3000/admin/etudiants`
- Entreprises : `http://localhost:3000/admin/entreprises`
- Offres : `http://localhost:3000/admin/offres`

---

## 📊 Statistiques disponibles

### Dashboard :
- Nombre total d'utilisateurs (étudiants + entreprises)
- Nombre d'offres actives
- Nombre de candidatures
- Activité récente (10 dernières actions)

### Pages de gestion :
- Compteurs en temps réel
- Filtres et recherche
- Actions de modération

---

## 🔄 Prochaines améliorations possibles

1. **Pagination** : Pour les grandes listes (>100 éléments)
2. **Filtres avancés** : Par date, statut, etc.
3. **Export de données** : CSV, Excel
4. **Graphiques** : Visualisation des statistiques
5. **Logs d'activité** : Historique des actions admin
6. **Notifications** : Alertes pour activités suspectes
7. **Modération** : Bloquer/débloquer des comptes
8. **Validation** : Approuver les nouvelles entreprises

---

## ✨ Conclusion

Le panel admin est maintenant **100% fonctionnel et dynamique** ! Toutes les données sont chargées depuis la base de données PostgreSQL et les administrateurs peuvent gérer efficacement la plateforme.

**Date de mise à jour :** 27 octobre 2025
**Version :** 1.0.0
