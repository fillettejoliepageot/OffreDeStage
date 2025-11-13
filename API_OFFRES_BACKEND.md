# 💼 API Offres de Stage - Backend

## 📋 Vue d'ensemble

API complète pour gérer les offres de stage (CRUD).

**Base URL:** `http://localhost:5000/api/offres`

---

## 🗄️ Structure de la table `offres`

```sql
CREATE TABLE offres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  domaine VARCHAR(255),
  nombre_places INTEGER DEFAULT 1,
  localisation VARCHAR(255),
  type_stage VARCHAR(50) CHECK (type_stage IN ('Présentiel', 'Distanciel', 'Hybride')),
  remuneration BOOLEAN DEFAULT FALSE,
  montant_remuneration NUMERIC(10,2),
  date_debut DATE,
  date_fin DATE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## 📡 Routes disponibles

### **1. Créer une offre**

**POST** `/api/offres`

Crée une nouvelle offre de stage.

**Access:** Private (Company only)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Stage Développeur Full Stack",
  "description": "Nous recherchons un stagiaire motivé...",
  "domaine": "Technologies de l'information",
  "nombre_places": 2,
  "localisation": "Paris",
  "type_stage": "Hybride",
  "remuneration": true,
  "montant_remuneration": 600.00,
  "date_debut": "2025-06-01",
  "date_fin": "2025-08-31"
}
```

**Champs obligatoires:**
- `title` (string) - Titre de l'offre
- `description` (text) - Description détaillée
- `domaine` (string) - Domaine du stage

**Champs optionnels:**
- `nombre_places` (integer) - Nombre de places (défaut: 1)
- `localisation` (string) - Lieu du stage
- `type_stage` (enum) - 'Présentiel', 'Distanciel', 'Hybride'
- `remuneration` (boolean) - Stage rémunéré (défaut: false)
- `montant_remuneration` (decimal) - Montant de la rémunération
- `date_debut` (date) - Date de début
- `date_fin` (date) - Date de fin

**Réponse (201 Created):**
```json
{
  "success": true,
  "message": "Offre créée avec succès",
  "data": {
    "id": "uuid",
    "title": "Stage Développeur Full Stack",
    "description": "...",
    "domaine": "Technologies de l'information",
    "nombre_places": 2,
    "localisation": "Paris",
    "type_stage": "Hybride",
    "remuneration": true,
    "montant_remuneration": "600.00",
    "date_debut": "2025-06-01",
    "date_fin": "2025-08-31",
    "company_id": "uuid",
    "created_at": "2025-10-13T10:00:00Z"
  }
}
```

---

### **2. Récupérer toutes les offres**

**GET** `/api/offres`

Récupère toutes les offres avec filtres optionnels.

**Access:** Public

**Query Parameters (optionnels):**
- `domaine` - Filtrer par domaine
- `type_stage` - Filtrer par type (Présentiel, Distanciel, Hybride)
- `localisation` - Filtrer par localisation (recherche partielle)
- `remuneration` - Filtrer par rémunération (true/false)
- `search` - Recherche dans titre et description

**Exemples:**
```
GET /api/offres
GET /api/offres?domaine=Technologies de l'information
GET /api/offres?type_stage=Hybride
GET /api/offres?localisation=Paris
GET /api/offres?remuneration=true
GET /api/offres?search=développeur
GET /api/offres?domaine=IT&type_stage=Distanciel&remuneration=true
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": "uuid",
      "title": "Stage Développeur Full Stack",
      "description": "...",
      "domaine": "Technologies de l'information",
      "nombre_places": 2,
      "localisation": "Paris",
      "type_stage": "Hybride",
      "remuneration": true,
      "montant_remuneration": "600.00",
      "date_debut": "2025-06-01",
      "date_fin": "2025-08-31",
      "company_id": "uuid",
      "created_at": "2025-10-13T10:00:00Z",
      "company_name": "Tech Solutions SA",
      "logo_url": "data:image/png;base64,...",
      "sector": "Technologies de l'information"
    },
    ...
  ]
}
```

---

### **3. Récupérer une offre spécifique**

**GET** `/api/offres/:id`

Récupère les détails d'une offre avec les informations de l'entreprise.

**Access:** Public

**Réponse (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Stage Développeur Full Stack",
    "description": "Description complète...",
    "domaine": "Technologies de l'information",
    "nombre_places": 2,
    "localisation": "Paris",
    "type_stage": "Hybride",
    "remuneration": true,
    "montant_remuneration": "600.00",
    "date_debut": "2025-06-01",
    "date_fin": "2025-08-31",
    "company_id": "uuid",
    "created_at": "2025-10-13T10:00:00Z",
    "company_name": "Tech Solutions SA",
    "logo_url": "data:image/png;base64,...",
    "sector": "Technologies de l'information",
    "address": "123 Rue de la Tech, Paris",
    "company_description": "Entreprise spécialisée..."
  }
}
```

---

### **4. Récupérer les offres de l'entreprise connectée**

**GET** `/api/offres/company/mes-offres`

Récupère toutes les offres de l'entreprise connectée avec le nombre de candidatures.

**Access:** Private (Company only)

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "uuid",
      "title": "Stage Développeur Full Stack",
      "description": "...",
      "domaine": "Technologies de l'information",
      "nombre_places": 2,
      "localisation": "Paris",
      "type_stage": "Hybride",
      "remuneration": true,
      "montant_remuneration": "600.00",
      "date_debut": "2025-06-01",
      "date_fin": "2025-08-31",
      "company_id": "uuid",
      "created_at": "2025-10-13T10:00:00Z",
      "nombre_candidatures": 12
    },
    ...
  ]
}
```

---

### **5. Modifier une offre**

**PUT** `/api/offres/:id`

Modifie une offre existante (uniquement ses propres offres).

**Access:** Private (Company only - own offers)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Stage Développeur Full Stack (Modifié)",
  "description": "Description mise à jour...",
  "domaine": "Technologies de l'information",
  "nombre_places": 3,
  "localisation": "Paris",
  "type_stage": "Distanciel",
  "remuneration": true,
  "montant_remuneration": 700.00,
  "date_debut": "2025-06-01",
  "date_fin": "2025-08-31"
}
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "Offre mise à jour avec succès",
  "data": {
    "id": "uuid",
    "title": "Stage Développeur Full Stack (Modifié)",
    ...
  }
}
```

---

### **6. Supprimer une offre**

**DELETE** `/api/offres/:id`

Supprime une offre (uniquement ses propres offres).

**Access:** Private (Company only - own offers)

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "Offre supprimée avec succès"
}
```

---

## 🔒 Sécurité

### **Authentification**
- Routes protégées nécessitent un token JWT
- Token envoyé dans le header: `Authorization: Bearer <token>`

### **Autorisation**
- **Créer une offre:** Réservé aux entreprises
- **Modifier une offre:** Uniquement ses propres offres
- **Supprimer une offre:** Uniquement ses propres offres
- **Voir les offres:** Public (sauf "mes offres")

### **Validation**
- Vérification du rôle (company)
- Vérification de la propriété de l'offre
- Validation des champs obligatoires
- Vérification que l'entreprise a un profil

---

## ❌ Codes d'erreur

### **400 Bad Request**
```json
{
  "success": false,
  "message": "Le titre, la description et le domaine sont obligatoires"
}
```

### **403 Forbidden**
```json
{
  "success": false,
  "message": "Accès refusé. Réservé aux entreprises."
}
```

### **404 Not Found**
```json
{
  "success": false,
  "message": "Offre non trouvée"
}
```

```json
{
  "success": false,
  "message": "Profil entreprise non trouvé. Veuillez d'abord créer votre profil."
}
```

```json
{
  "success": false,
  "message": "Offre non trouvée ou vous n'avez pas les droits pour la modifier"
}
```

### **500 Internal Server Error**
```json
{
  "success": false,
  "message": "Erreur serveur",
  "error": "Message d'erreur détaillé"
}
```

---

## 🧪 Tests avec curl

### **Créer une offre**
```bash
curl -X POST http://localhost:5000/api/offres \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Stage Développeur Full Stack",
    "description": "Nous recherchons un stagiaire motivé",
    "domaine": "Technologies de l'\''information",
    "nombre_places": 2,
    "localisation": "Paris",
    "type_stage": "Hybride",
    "remuneration": true,
    "montant_remuneration": 600.00,
    "date_debut": "2025-06-01",
    "date_fin": "2025-08-31"
  }'
```

### **Récupérer toutes les offres**
```bash
curl http://localhost:5000/api/offres
```

### **Récupérer une offre**
```bash
curl http://localhost:5000/api/offres/UUID_DE_L_OFFRE
```

### **Récupérer mes offres**
```bash
curl http://localhost:5000/api/offres/company/mes-offres \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Modifier une offre**
```bash
curl -X PUT http://localhost:5000/api/offres/UUID_DE_L_OFFRE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Stage Développeur Full Stack (Modifié)",
    "description": "Description mise à jour",
    "domaine": "Technologies de l'\''information",
    "nombre_places": 3,
    "localisation": "Paris",
    "type_stage": "Distanciel",
    "remuneration": true,
    "montant_remuneration": 700.00,
    "date_debut": "2025-06-01",
    "date_fin": "2025-08-31"
  }'
```

### **Supprimer une offre**
```bash
curl -X DELETE http://localhost:5000/api/offres/UUID_DE_L_OFFRE \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Résumé des routes

| Méthode | Route | Access | Description |
|---------|-------|--------|-------------|
| POST | `/api/offres` | Private (Company) | Créer une offre |
| GET | `/api/offres` | Public | Liste toutes les offres |
| GET | `/api/offres/:id` | Public | Détail d'une offre |
| GET | `/api/offres/company/mes-offres` | Private (Company) | Mes offres |
| PUT | `/api/offres/:id` | Private (Company) | Modifier une offre |
| DELETE | `/api/offres/:id` | Private (Company) | Supprimer une offre |

---

## ✅ Étape 1 : Backend - TERMINÉ !

**Ce qui a été créé:**
- ✅ Routes CRUD complètes pour les offres
- ✅ Filtres de recherche (domaine, type, localisation, rémunération, search)
- ✅ Vérification du rôle (company only)
- ✅ Vérification de la propriété des offres
- ✅ Jointure avec la table companies
- ✅ Comptage des candidatures
- ✅ Validation des champs
- ✅ Gestion des erreurs

**Prochaine étape:**
- Frontend : Pages de gestion des offres pour l'entreprise

**Le backend des offres est prêt !** 🎉
