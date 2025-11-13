# ✅ Modal de Modification d'Offre - Connecté au Backend

## 🎯 Ce qui a été ajouté

Un **modal de modification** complet pour les offres de stage, entièrement connecté au backend.

---

## 📁 Fichier modifié

### **`front/app/entreprise/offres/page.tsx`**

**Nouvelles fonctionnalités :**
- ✅ Modal de modification avec formulaire complet
- ✅ Pré-remplissage automatique des champs
- ✅ Modification via PUT `/api/offres/:id`
- ✅ Validation des champs obligatoires
- ✅ Rechargement automatique après modification
- ✅ Loader pendant la mise à jour
- ✅ Notifications toast
- ✅ Gestion des erreurs

---

## 🔄 Flux complet

### **Modification d'une offre**

```
1. Entreprise clique sur "Modifier" sur une offre
   ↓
2. Modal s'ouvre avec les données pré-remplies
   ↓
3. Entreprise modifie les champs souhaités
   ↓
4. Clique sur "Modifier" dans le modal
   ↓
5. Validation frontend
   ↓
6. PUT /api/offres/:id (avec token JWT)
   ↓
7. Backend vérifie que l'offre appartient à l'entreprise
   ↓
8. Backend met à jour l'offre dans PostgreSQL
   ↓
9. Notification "✅ Offre modifiée avec succès"
   ↓
10. Modal se ferme automatiquement
    ↓
11. Liste des offres rechargée automatiquement
    ↓
12. ✅ Modifications visibles immédiatement !
```

---

## 🎨 Interface du modal

### **Modal de modification**

```
┌─────────────────────────────────────────────────────┐
│ Modifier l'offre                              [×]   │
│ Modifiez les informations de votre offre de stage  │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Titre de l'offre *                                  │
│ [Stage Développeur Full Stack]                      │
│                                                      │
│ Description *                                        │
│ [Nous recherchons un stagiaire motivé...]          │
│                                                      │
│ Domaine *                                           │
│ [Technologies de l'information ▼]                   │
│                                                      │
│ Localisation              Type de stage             │
│ [Paris]                   [Hybride ▼]              │
│                                                      │
│ Date début               Date fin                   │
│ [01/06/2025]            [31/08/2025]               │
│                                                      │
│ Nombre de places *                                  │
│ [2]                                                  │
│                                                      │
│ ☑ Stage rémunéré                                   │
│   Montant (€/mois)                                  │
│   [600]                                              │
│                                                      │
│              [Annuler]        [Modifier]            │
└─────────────────────────────────────────────────────┘
```

---

## 💻 Code clé

### **Ouverture du modal**

```typescript
const handleEdit = (offer: Offre) => {
  setOfferToEdit(offer)
  
  // Pré-remplir le formulaire avec les données existantes
  setEditFormData({
    title: offer.title,
    description: offer.description,
    domaine: offer.domaine,
    nombre_places: offer.nombre_places,
    localisation: offer.localisation || "",
    type_stage: offer.type_stage || "",
    remuneration: offer.remuneration || false,
    montant_remuneration: offer.montant_remuneration || 0,
    date_debut: offer.date_debut || "",
    date_fin: offer.date_fin || "",
  })
  
  setEditDialogOpen(true)
}
```

### **Soumission de la modification**

```typescript
const handleUpdateSubmit = async () => {
  if (!offerToEdit) return

  try {
    setIsUpdating(true)

    // Validation
    if (!editFormData.title || !editFormData.description || !editFormData.domaine) {
      toast({
        title: "❌ Erreur de validation",
        description: "Le titre, la description et le domaine sont obligatoires",
        variant: "destructive",
      })
      return
    }

    // Appel API
    const response = await api.put(`/offres/${offerToEdit.id}`, editFormData)

    if (response.data.success) {
      toast({
        title: "✅ Succès",
        description: "Offre modifiée avec succès",
      })
      
      // Recharger les offres
      await loadOffers()
      
      // Fermer le modal
      setEditDialogOpen(false)
      setOfferToEdit(null)
    }
  } catch (error: any) {
    toast({
      title: "❌ Erreur",
      description: error.response?.data?.message || "Erreur lors de la modification",
      variant: "destructive",
    })
  } finally {
    setIsUpdating(false)
  }
}
```

---

## 🔌 Intégration avec le backend

### **Requête de modification**

```typescript
PUT http://localhost:5000/api/offres/:id
Headers: {
  Authorization: Bearer <token>,
  Content-Type: application/json
}
Body: {
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

### **Réponse du backend**

```json
{
  "success": true,
  "message": "Offre mise à jour avec succès",
  "data": {
    "id": "uuid",
    "title": "Stage Développeur Full Stack (Modifié)",
    "description": "Description mise à jour...",
    "domaine": "Technologies de l'information",
    "nombre_places": 3,
    "localisation": "Paris",
    "type_stage": "Distanciel",
    "remuneration": true,
    "montant_remuneration": "700.00",
    "date_debut": "2025-06-01",
    "date_fin": "2025-08-31",
    "company_id": "uuid",
    "created_at": "2025-10-13T10:00:00Z"
  }
}
```

---

## ✅ Fonctionnalités du modal

### **Champs modifiables**

**Obligatoires :**
- ✅ **Titre** - Titre de l'offre
- ✅ **Description** - Description détaillée
- ✅ **Domaine** - Domaine du stage (select)
- ✅ **Nombre de places** - Nombre de places

**Optionnels :**
- ✅ **Localisation** - Lieu du stage
- ✅ **Type de stage** - Présentiel, Distanciel, Hybride (select)
- ✅ **Date de début** - Date de début
- ✅ **Date de fin** - Date de fin
- ✅ **Rémunération** - Stage rémunéré (checkbox)
- ✅ **Montant** - Montant de la rémunération (conditionnel)

### **Fonctionnalités**

- ✅ Pré-remplissage automatique avec les données existantes
- ✅ Validation des champs obligatoires
- ✅ Champ montant conditionnel (si rémunéré)
- ✅ Loader pendant la mise à jour
- ✅ Désactivation des boutons pendant la mise à jour
- ✅ Fermeture automatique après succès
- ✅ Rechargement automatique de la liste
- ✅ Notifications toast
- ✅ Gestion des erreurs
- ✅ Scroll dans le modal (si contenu trop long)
- ✅ Responsive (adapté mobile)

---

## 🧪 Pour tester

### **Test : Modifier une offre**

1. Se connecter en tant qu'entreprise
2. Aller sur `/entreprise/offres`
3. Cliquer sur "Modifier" sur une offre
4. ✅ Modal s'ouvre avec les données pré-remplies
5. Modifier des champs :
   - Titre: "Stage Développeur Full Stack (Modifié)"
   - Localisation: "Lyon"
   - Type: "Distanciel"
   - Rémunération: 700€
6. Cliquer sur "Modifier"
7. ✅ Notification "Offre modifiée avec succès"
8. ✅ Modal se ferme
9. ✅ Liste rechargée
10. ✅ Modifications visibles immédiatement

### **Test : Validation**

1. Ouvrir le modal de modification
2. Effacer le titre
3. Cliquer sur "Modifier"
4. ✅ Notification d'erreur
5. ✅ Modal reste ouvert

### **Test : Annulation**

1. Ouvrir le modal
2. Modifier des champs
3. Cliquer sur "Annuler"
4. ✅ Modal se ferme
5. ✅ Modifications non sauvegardées

---

## 📊 Comparaison

### **Avant**
- ❌ Bouton "Modifier" non fonctionnel
- ❌ Pas de modal
- ❌ Pas de modification possible

### **Maintenant**
- ✅ Bouton "Modifier" fonctionnel
- ✅ Modal complet avec formulaire
- ✅ Modification en temps réel
- ✅ Pré-remplissage automatique
- ✅ Validation des données
- ✅ Notifications en temps réel
- ✅ Rechargement automatique
- ✅ Interface responsive

---

## 🎯 Résumé des actions disponibles

### **Sur chaque offre**

1. **Modifier** (bouton bleu)
   - Ouvre un modal
   - Formulaire pré-rempli
   - Modification via API
   - Rechargement automatique

2. **Supprimer** (bouton rouge)
   - Dialog de confirmation
   - Suppression via API
   - Rechargement automatique

---

## ✅ Résultat final

**Le système de gestion des offres est maintenant complet !**

**Fonctionnalités opérationnelles :**
- ✅ **Créer** une offre (page dédiée)
- ✅ **Lire** les offres (liste avec filtres)
- ✅ **Modifier** une offre (modal avec formulaire)
- ✅ **Supprimer** une offre (avec confirmation)

**CRUD complet pour les offres de stage !** 🎉

**Toutes les modifications sont en temps réel et connectées à PostgreSQL !** 🚀
