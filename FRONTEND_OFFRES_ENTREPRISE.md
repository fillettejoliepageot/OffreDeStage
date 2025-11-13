# ✅ Frontend Offres Entreprise - Connecté au Backend

## 🎯 Ce qui a été fait

Les pages de gestion des offres de l'entreprise sont maintenant **100% connectées au backend**.

---

## 📁 Fichiers modifiés

### **1. Page liste des offres** (`front/app/entreprise/offres/page.tsx`)

**Fonctionnalités :**
- ✅ Chargement automatique des offres depuis `/api/offres/company/mes-offres`
- ✅ Affichage dynamique des offres
- ✅ Filtres de recherche (titre, description)
- ✅ Filtre par domaine
- ✅ Suppression d'offre avec confirmation
- ✅ Affichage du nombre de candidatures par offre
- ✅ Loader pendant le chargement
- ✅ Notifications toast (succès/erreur)
- ✅ Gestion des erreurs

**Données affichées :**
```typescript
{
  id: string,
  title: string,
  description: string,
  domaine: string,
  nombre_places: number,
  localisation?: string,
  type_stage?: string,
  remuneration?: boolean,
  montant_remuneration?: number,
  date_debut?: string,
  date_fin?: string,
  nombre_candidatures?: number
}
```

**Nouvelles fonctionnalités visuelles :**
- 🗺️ Affichage de la localisation (si présente)
- 🏢 Badge pour le type de stage (Présentiel, Distanciel, Hybride)
- 💶 Affichage de la rémunération (si présente)
- 📊 Nombre de candidatures reçues

---

### **2. Page création d'offre** (`front/app/entreprise/offres/nouvelle/page.tsx`)

**Fonctionnalités :**
- ✅ Formulaire complet avec tous les champs
- ✅ Création d'offre via POST `/api/offres`
- ✅ Validation des champs obligatoires
- ✅ Redirection automatique après création
- ✅ Loader pendant la sauvegarde
- ✅ Notifications toast
- ✅ Gestion des erreurs

**Champs du formulaire :**

**Obligatoires :**
- ✅ **title** - Titre de l'offre
- ✅ **description** - Description détaillée
- ✅ **domaine** - Domaine du stage (select)
- ✅ **nombre_places** - Nombre de places

**Optionnels :**
- ✅ **localisation** - Lieu du stage
- ✅ **type_stage** - Présentiel, Distanciel, Hybride (select)
- ✅ **date_debut** - Date de début
- ✅ **date_fin** - Date de fin
- ✅ **remuneration** - Stage rémunéré (checkbox)
- ✅ **montant_remuneration** - Montant (si rémunéré)

---

## 🔄 Flux complet

### **Création d'une offre**

```
1. Entreprise clique sur "Créer une offre"
   ↓
2. Redirection vers /entreprise/offres/nouvelle
   ↓
3. Remplit le formulaire
   ↓
4. Clique sur "Publier l'offre"
   ↓
5. Validation frontend
   ↓
6. POST /api/offres (avec token JWT)
   ↓
7. Backend vérifie le rôle (company)
   ↓
8. Backend récupère company_id depuis companies
   ↓
9. Backend crée l'offre dans PostgreSQL
   ↓
10. Notification "✅ Offre créée avec succès"
    ↓
11. Redirection vers /entreprise/offres
    ↓
12. Liste des offres rechargée automatiquement
```

### **Suppression d'une offre**

```
1. Entreprise clique sur "Supprimer"
   ↓
2. Dialog de confirmation s'affiche
   ↓
3. Clique sur "Supprimer"
   ↓
4. DELETE /api/offres/:id (avec token JWT)
   ↓
5. Backend vérifie que l'offre appartient à l'entreprise
   ↓
6. Backend supprime l'offre
   ↓
7. Notification "✅ Offre supprimée avec succès"
   ↓
8. Liste des offres rechargée automatiquement
```

---

## 🎨 Interface utilisateur

### **Page liste des offres**

**En-tête :**
```
┌─────────────────────────────────────────────────────┐
│ Gestion des offres                 [+ Créer offre] │
│ 5 offres publiées                                   │
└─────────────────────────────────────────────────────┘
```

**Filtres :**
```
┌─────────────────────────────────────────────────────┐
│ [🔍 Rechercher...]  [Domaine ▼]                     │
└─────────────────────────────────────────────────────┘
```

**Carte d'offre :**
```
┌─────────────────────────────────────────────────────┐
│ Stage Développeur Full Stack        [Active]        │
│ Description de l'offre...                           │
│                                                      │
│ 💼 Technologies de l'information                    │
│ 🗺️ Paris                                            │
│ [Hybride]                                           │
│ 💶 Rémunéré - 600€/mois                            │
│                                                      │
│ 📅 Début: 01/06/2025    📅 Fin: 31/08/2025        │
│                                                      │
│ 👥 2 places              [12 candidatures]          │
│                                                      │
│ [✏️ Modifier]           [🗑️ Supprimer]             │
└─────────────────────────────────────────────────────┘
```

**État vide :**
```
┌─────────────────────────────────────────────────────┐
│                    💼                                │
│           Aucune offre trouvée                      │
│    Commencez par créer votre première offre         │
└─────────────────────────────────────────────────────┘
```

### **Page création d'offre**

**Formulaire complet :**
```
┌─────────────────────────────────────────────────────┐
│ [←] Créer une offre de stage                        │
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Informations de l'offre                         │ │
│ │                                                  │ │
│ │ Titre de l'offre *                              │ │
│ │ [Ex: Développeur Full Stack]                    │ │
│ │                                                  │ │
│ │ Description *                                    │ │
│ │ [Décrivez les missions...]                      │ │
│ │                                                  │ │
│ │ Domaine *                    Localisation        │ │
│ │ [Sélectionnez ▼]            [Paris, Lyon...]    │ │
│ │                                                  │ │
│ │ Type de stage                                    │ │
│ │ [Présentiel/Distanciel/Hybride ▼]              │ │
│ │                                                  │ │
│ │ Date début         Date fin                      │ │
│ │ [01/06/2025]      [31/08/2025]                  │ │
│ │                                                  │ │
│ │ Nombre de places *                               │ │
│ │ [2]                                              │ │
│ │                                                  │ │
│ │ ☑ Stage rémunéré                                │ │
│ │   Montant (€/mois)                              │ │
│ │   [600]                                          │ │
│ │                                                  │ │
│ │ [Annuler]              [💾 Publier l'offre]     │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 🔌 Intégration avec le backend

### **Chargement des offres**
```typescript
GET http://localhost:5000/api/offres/company/mes-offres
Headers: {
  Authorization: Bearer <token>
}
```

**Réponse :**
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
      "nombre_candidatures": 12
    }
  ]
}
```

### **Création d'une offre**
```typescript
POST http://localhost:5000/api/offres
Headers: {
  Authorization: Bearer <token>,
  Content-Type: application/json
}
Body: {
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

### **Suppression d'une offre**
```typescript
DELETE http://localhost:5000/api/offres/:id
Headers: {
  Authorization: Bearer <token>
}
```

---

## ✅ Fonctionnalités implémentées

### **Page liste**
- ✅ Chargement automatique depuis le backend
- ✅ Loader pendant le chargement
- ✅ Affichage dynamique des offres
- ✅ Filtres de recherche (titre, description)
- ✅ Filtre par domaine
- ✅ Suppression avec confirmation
- ✅ Affichage du nombre de candidatures
- ✅ Affichage de tous les champs (localisation, type, rémunération)
- ✅ Notifications toast
- ✅ Gestion des erreurs
- ✅ État vide élégant

### **Page création**
- ✅ Formulaire complet avec tous les champs
- ✅ Validation des champs obligatoires
- ✅ Création via API
- ✅ Loader pendant la sauvegarde
- ✅ Redirection automatique après création
- ✅ Checkbox pour la rémunération
- ✅ Champ conditionnel pour le montant
- ✅ Notifications toast
- ✅ Gestion des erreurs

---

## 🧪 Pour tester

### **1. Créer une offre**
1. Se connecter en tant qu'entreprise
2. Aller sur `/entreprise/offres`
3. Cliquer sur "Créer une offre"
4. Remplir le formulaire :
   - Titre: "Stage Développeur Full Stack"
   - Description: "Nous recherchons..."
   - Domaine: "Technologies de l'information"
   - Localisation: "Paris"
   - Type: "Hybride"
   - Places: 2
   - ☑ Rémunéré: 600€
5. Cliquer sur "Publier l'offre"
6. ✅ Notification "Offre créée avec succès"
7. ✅ Redirection vers la liste
8. ✅ Nouvelle offre affichée

### **2. Supprimer une offre**
1. Cliquer sur "Supprimer" sur une offre
2. Confirmer dans le dialog
3. ✅ Notification "Offre supprimée avec succès"
4. ✅ Offre disparaît de la liste

### **3. Filtrer les offres**
1. Taper dans la barre de recherche
2. ✅ Filtrage en temps réel
3. Sélectionner un domaine
4. ✅ Filtrage par domaine

---

## 📊 Résumé

### **Avant**
- ❌ Données statiques en dur
- ❌ Pas de connexion au backend
- ❌ Création simulée
- ❌ Suppression locale uniquement

### **Maintenant**
- ✅ Données dynamiques depuis PostgreSQL
- ✅ Connexion complète au backend
- ✅ Création réelle dans la base de données
- ✅ Suppression avec vérification de propriété
- ✅ Affichage du nombre de candidatures
- ✅ Tous les champs de la table `offres` utilisés
- ✅ Notifications en temps réel
- ✅ Gestion des erreurs complète

---

## 🚀 Prochaines étapes

**Ce qui fonctionne maintenant :**
- ✅ Liste des offres de l'entreprise
- ✅ Création d'offre
- ✅ Suppression d'offre

**Ce qui reste à faire :**
- ⏳ Modification d'offre (page `/entreprise/offres/[id]/modifier`)
- ⏳ Détail d'une offre (page `/entreprise/offres/[id]`)
- ⏳ Gestion des candidatures reçues

---

## ✅ Résultat final

**Les pages de gestion des offres de l'entreprise sont maintenant 100% fonctionnelles et connectées au backend !**

**Fonctionnalités principales :**
- ✅ Création d'offres avec tous les champs
- ✅ Affichage dynamique depuis PostgreSQL
- ✅ Suppression sécurisée
- ✅ Filtres de recherche
- ✅ Notifications en temps réel
- ✅ Interface responsive et moderne

**Le système de gestion des offres est opérationnel !** 🎉
