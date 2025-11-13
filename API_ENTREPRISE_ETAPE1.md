# 🏢 API Profil Entreprise - Étape 1

## 📋 Vue d'ensemble

API pour gérer le profil des entreprises après l'authentification.

**Base URL:** `http://localhost:5000/api/company`

---

## 🔐 Authentification

Toutes les routes nécessitent un token JWT dans le header :
```
Authorization: Bearer <votre_token_jwt>
```

**Rôle requis:** `company`

---

## 📡 Routes disponibles

### 1. **Vérifier si le profil existe**

**GET** `/api/company/check-profile`

Vérifie si l'entreprise a complété son profil.

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse (profil existe):**
```json
{
  "success": true,
  "hasProfile": true,
  "data": {
    "id": "uuid",
    "company_name": "Tech Solutions SA",
    "sector": "Technologies de l'information"
  }
}
```

**Réponse (profil n'existe pas):**
```json
{
  "success": true,
  "hasProfile": false,
  "message": "Veuillez compléter votre profil entreprise"
}
```

---

### 2. **Récupérer le profil complet**

**GET** `/api/company/profile`

Récupère toutes les informations du profil de l'entreprise.

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "company_name": "Tech Solutions SA",
    "sector": "Technologies de l'information",
    "address": "123 Rue de la Tech, 75001 Paris",
    "logo_url": "data:image/png;base64,...",
    "nombre_employes": 50,
    "telephone": "+33 1 23 45 67 89",
    "description": "Entreprise spécialisée dans le développement web",
    "email": "contact@techsolutions.fr"
  }
}
```

**Réponse (404 Not Found):**
```json
{
  "success": false,
  "message": "Profil entreprise non trouvé"
}
```

---

### 3. **Créer ou mettre à jour le profil**

**POST** `/api/company/profile`

Crée un nouveau profil ou met à jour le profil existant (upsert).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "company_name": "Tech Solutions SA",
  "sector": "Technologies de l'information",
  "address": "123 Rue de la Tech, 75001 Paris",
  "logo_url": "data:image/png;base64,...",
  "nombre_employes": 50,
  "telephone": "+33 1 23 45 67 89",
  "description": "Entreprise spécialisée dans le développement web"
}
```

**Champs obligatoires:**
- `company_name` (string) - Nom de l'entreprise
- `sector` (string) - Secteur d'activité

**Champs optionnels:**
- `address` (string) - Adresse complète
- `logo_url` (string) - URL ou base64 du logo
- `nombre_employes` (integer) - Nombre d'employés
- `telephone` (string) - Numéro de téléphone
- `description` (text) - Description de l'entreprise

**Réponse (201 Created - nouveau profil):**
```json
{
  "success": true,
  "message": "Profil créé avec succès",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "company_name": "Tech Solutions SA",
    "sector": "Technologies de l'information",
    ...
  }
}
```

**Réponse (200 OK - mise à jour):**
```json
{
  "success": true,
  "message": "Profil mis à jour avec succès",
  "data": { ... }
}
```

---

### 4. **Mise à jour partielle du profil**

**PUT** `/api/company/profile`

Met à jour uniquement les champs fournis (patch).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (exemple - seulement les champs à modifier):**
```json
{
  "telephone": "+33 1 99 88 77 66",
  "nombre_employes": 75
}
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "Profil mis à jour avec succès",
  "data": { ... }
}
```

---

## 🔄 Flux d'utilisation recommandé

```
1. Entreprise s'inscrit
   ↓
2. Connexion → Reçoit token JWT
   ↓
3. GET /api/company/check-profile
   ↓
4. Si hasProfile = false
   → Redirection vers page de création de profil
   ↓
5. POST /api/company/profile (création)
   ↓
6. Profil créé → Accès au dashboard
   ↓
7. PUT /api/company/profile (mises à jour ultérieures)
```

---

## 🧪 Tests avec curl

```bash
# 1. Vérifier le profil
curl -X GET http://localhost:5000/api/company/check-profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Récupérer le profil
curl -X GET http://localhost:5000/api/company/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Créer/Mettre à jour le profil
curl -X POST http://localhost:5000/api/company/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Tech Solutions SA",
    "sector": "Technologies de l'\''information",
    "address": "123 Rue de la Tech, Paris",
    "nombre_employes": 50,
    "telephone": "+33 1 23 45 67 89",
    "description": "Entreprise spécialisée en développement web"
  }'
```

---

## ✅ Étape 1 : Backend - TERMINÉ !

**Ce qui a été créé:**
- ✅ Routes API pour le profil entreprise
- ✅ Vérification du rôle (company only)
- ✅ Validation des champs obligatoires
- ✅ Gestion des erreurs
- ✅ Limite de payload augmentée (10MB pour les images)

**Prochaine étape:**
- Connecter le frontend à ces routes
- Charger automatiquement le profil
- Sauvegarder les modifications
- Ajouter les notifications

**Le backend est prêt !** 🎉
