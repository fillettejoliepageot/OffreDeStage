# 📋 Gestion des Offres - Admin Panel

**Date:** 27 Octobre 2025  
**Fonctionnalité:** Supervision des offres avec activation/désactivation et suppression  
**Page:** `/admin/offres`

---

## ✅ Fonctionnalités Implémentées

### **1. Statistiques (4 cartes)**
- ✅ **Total offres** - Nombre total d'offres
- ✅ **Offres actives** - Offres visibles par les étudiants (vert)
- ✅ **Offres désactivées** - Offres masquées (rouge)
- ✅ **Total candidatures** - Somme de toutes les candidatures (violet)

### **2. Tableau des Offres**
- ✅ **Colonnes** : Titre, Entreprise, Domaine, Statut, Candidatures, Actions
- ✅ **Badge Statut** : 
  - 🟢 **Active** (vert) - Visible par les étudiants
  - 🔴 **Désactivée** (rouge) - Masquée

### **3. Actions Disponibles**
- ✅ **Activer** (bouton vert) - Rendre l'offre visible
- ✅ **Désactiver** (bouton orange) - Masquer l'offre
- ✅ **Supprimer** (bouton rouge) - Supprimer définitivement

### **4. Dialogs de Confirmation**
- ✅ Dialog "Désactiver l'offre"
- ✅ Dialog "Activer l'offre"
- ✅ Dialog "Supprimer l'offre"

---

## 🔧 Modifications Backend

### **Nouvelle Route : PUT /api/admin/offres/:id/status**

**Fichier :** `backend/routes/admin.js`

```javascript
router.put('/offres/:id/status', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  // Validation du statut
  if (!['active', 'désactivée'].includes(statut)) {
    return res.status(400).json({
      message: 'Statut invalide. Valeurs acceptées: active, désactivée',
    });
  }

  // Vérifier que l'offre existe
  const offreCheck = await pool.query('SELECT id FROM offres WHERE id = $1', [id]);
  
  if (offreCheck.rows.length === 0) {
    return res.status(404).json({ message: 'Offre non trouvée' });
  }

  // Mettre à jour le statut
  const result = await pool.query(
    'UPDATE offres SET statut = $1 WHERE id = $2 RETURNING id, title, statut',
    [statut, id]
  );

  res.status(200).json({
    success: true,
    message: statut === 'désactivée' ? 'Offre désactivée avec succès' : 'Offre activée avec succès',
    data: result.rows[0],
  });
});
```

**Caractéristiques :**
- ✅ Validation du statut ('active' ou 'désactivée')
- ✅ Vérification de l'existence de l'offre
- ✅ Mise à jour dans la base de données
- ✅ Message de succès personnalisé

---

## 🎨 Modifications Frontend

### **1. API Client** (`front/lib/api.ts`)

```typescript
// Activer/Désactiver une offre
updateOffreStatus: async (offreId: string, statut: 'active' | 'désactivée') => {
  const response = await api.put(`/admin/offres/${offreId}/status`, { statut });
  return response.data;
}
```

---

### **2. Page Admin Offres** (`front/app/admin/offres/page.tsx`)

#### **Interface TypeScript**
```typescript
interface Offre {
  id: string
  title: string
  domaine: string
  statut: 'active' | 'désactivée'  // ✅ AJOUTÉ
  company_name: string
  sector: string
  candidatures_count: number
  created_at: string
}
```

#### **États Ajoutés**
```typescript
const [actionDialog, setActionDialog] = useState<"delete" | "activate" | "deactivate" | null>(null)
const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
```

#### **Fonction de Mise à Jour du Statut**
```typescript
const handleUpdateStatus = async (offreId: string, statut: 'active' | 'désactivée') => {
  setIsUpdatingStatus(true)
  try {
    const response = await adminAPI.updateOffreStatus(offreId, statut)
    
    if (response.success) {
      toast({
        title: "✅ Succès",
        description: statut === 'désactivée' 
          ? "Offre désactivée avec succès" 
          : "Offre activée avec succès",
      })
      
      await loadOffers()
    }
  } catch (error: any) {
    toast({
      title: "❌ Erreur",
      description: error.response?.data?.message || "Erreur lors de la mise à jour",
      variant: "destructive",
    })
  } finally {
    setIsUpdatingStatus(false)
    setActionDialog(null)
    setSelectedOffer(null)
  }
}
```

---

## 📊 Interface Utilisateur

### **Statistiques**
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Total offres    │ Offres actives  │ Offres désact.  │ Total candidat. │
│      50         │       42        │        8        │       156       │
│  🔵 Bleu        │  🟢 Vert        │  🔴 Rouge       │  🟣 Violet      │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### **Tableau**
```
┌──────────────────────┬─────────────────┬──────────┬─────────────┬──────────────┬─────────────────────────┐
│ Titre                │ Entreprise      │ Domaine  │ Statut      │ Candidatures │ Actions                 │
├──────────────────────┼─────────────────┼──────────┼─────────────┼──────────────┼─────────────────────────┤
│ Stage Dev Full-Stack │ TechCorp        │ IT       │ 🟢 Active   │      12      │ [Désactiver] [Suppr]    │
│ Stage Marketing      │ MarketGroup     │ Marketing│ 🔴 Désactivée│     3       │ [Activer] [Suppr]       │
└──────────────────────┴─────────────────┴──────────┴─────────────┴──────────────┴─────────────────────────┘
```

---

## 🔄 Flux Utilisateur

### **Flux 1 : Admin désactive une offre**

```
1. Admin → /admin/offres
   ↓
2. Clique sur "Désactiver" (bouton orange)
   ↓
3. Dialog : "Êtes-vous sûr de vouloir désactiver..."
   ↓
4. Admin confirme
   ↓
5. PUT /api/admin/offres/:id/status { statut: 'désactivée' }
   ↓
6. Backend : UPDATE offres SET statut = 'désactivée'
   ↓
7. ✅ Toast : "Offre désactivée avec succès"
   ↓
8. Badge passe de 🟢 "Active" à 🔴 "Désactivée"
   ↓
9. Bouton change de "Désactiver" à "Activer"
   ↓
10. L'offre n'est plus visible par les étudiants
```

---

### **Flux 2 : Admin active une offre**

```
1. Admin → /admin/offres
   ↓
2. Clique sur "Activer" (bouton vert)
   ↓
3. Dialog : "Êtes-vous sûr de vouloir activer..."
   ↓
4. Admin confirme
   ↓
5. PUT /api/admin/offres/:id/status { statut: 'active' }
   ↓
6. Backend : UPDATE offres SET statut = 'active'
   ↓
7. ✅ Toast : "Offre activée avec succès"
   ↓
8. Badge passe de 🔴 "Désactivée" à 🟢 "Active"
   ↓
9. Bouton change de "Activer" à "Désactiver"
   ↓
10. L'offre est à nouveau visible par les étudiants
```

---

### **Flux 3 : Admin supprime une offre**

```
1. Admin → /admin/offres
   ↓
2. Clique sur "Supprimer" (bouton rouge)
   ↓
3. Dialog : "Êtes-vous sûr de vouloir supprimer..."
   ↓
4. Admin confirme
   ↓
5. DELETE /api/admin/offres/:id
   ↓
6. Backend : 
   - DELETE FROM candidatures WHERE offre_id = :id
   - DELETE FROM offres WHERE id = :id
   ↓
7. ✅ Toast : "Offre supprimée avec succès"
   ↓
8. L'offre disparaît du tableau
   ↓
9. Les statistiques sont mises à jour
```

---

## 📝 Composants UI

### **Badges de Statut**
```tsx
{offer.statut === 'désactivée' ? (
  <Badge variant="destructive" className="gap-1">
    <XCircle className="w-3 h-3" />
    Désactivée
  </Badge>
) : (
  <Badge variant="default" className="bg-emerald-600 gap-1">
    <CheckCircle2 className="w-3 h-3" />
    Active
  </Badge>
)}
```

### **Boutons d'Action**
```tsx
{offer.statut === 'désactivée' ? (
  <Button
    variant="outline"
    size="sm"
    onClick={() => setActionDialog("activate")}
    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
  >
    <Power className="w-4 h-4 mr-1" />
    Activer
  </Button>
) : (
  <Button
    variant="outline"
    size="sm"
    onClick={() => setActionDialog("deactivate")}
    className="border-orange-600 text-orange-600 hover:bg-orange-50"
  >
    <PowerOff className="w-4 h-4 mr-1" />
    Désactiver
  </Button>
)}
```

---

## 📊 Structure de la Base de Données

### **Table `offres`**
```sql
CREATE TABLE offres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  domaine VARCHAR(255),
  statut VARCHAR(20) DEFAULT 'active' CHECK (statut IN ('active','désactivée')),
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

**Colonne importante :**
- `statut VARCHAR(20) DEFAULT 'active' CHECK (statut IN ('active','désactivée'))`

---

## 🎯 Cas d'Usage

### **1. Modération des Offres**
L'admin peut désactiver temporairement une offre qui :
- Contient des informations inappropriées
- Est en cours de vérification
- A été signalée par des utilisateurs
- Nécessite des modifications

### **2. Gestion Temporaire**
L'admin peut :
- Désactiver une offre pendant les vacances
- Réactiver une offre après mise à jour
- Masquer une offre expirée sans la supprimer

### **3. Suppression Définitive**
L'admin peut supprimer une offre qui :
- Est frauduleuse
- Viole les conditions d'utilisation
- N'est plus pertinente
- A été créée par erreur

---

## 📝 Fichiers Modifiés

### **Backend (1 fichier)**
- ✅ `backend/routes/admin.js`
  - Nouvelle route PUT `/api/admin/offres/:id/status`

### **Frontend (2 fichiers)**
- ✅ `front/lib/api.ts`
  - Fonction `updateOffreStatus(offreId, statut)`

- ✅ `front/app/admin/offres/page.tsx`
  - Interface avec `statut`
  - 4 statistiques (Total, Actives, Désactivées, Candidatures)
  - Colonne "Statut" avec badges
  - Boutons Activer/Désactiver/Supprimer
  - 3 Dialogs de confirmation
  - Fonction `handleUpdateStatus`

---

## 🎨 Icônes Utilisées

| Icône | Nom | Usage |
|-------|-----|-------|
| ✅ `CheckCircle2` | Check Circle | Badge "Active" (vert) |
| ❌ `XCircle` | X Circle | Badge "Désactivée" (rouge) |
| ⚡ `Power` | Power | Bouton "Activer" |
| 🔌 `PowerOff` | Power Off | Bouton "Désactiver" |
| 🗑️ `Trash2` | Trash | Bouton "Supprimer" |
| 💼 `Briefcase` | Briefcase | Icône des statistiques |
| 🔄 `Loader2` | Loader | Animation de chargement |

---

## ✅ Résumé

### **Fonctionnalités**
✅ 4 statistiques (Total, Actives, Désactivées, Candidatures)  
✅ Colonne "Statut" avec badges colorés  
✅ Bouton "Activer" pour offres désactivées  
✅ Bouton "Désactiver" pour offres actives  
✅ Bouton "Supprimer" pour toutes les offres  
✅ 3 Dialogs de confirmation  
✅ Notifications toast  
✅ Rechargement automatique après action  

### **Sécurité**
✅ Authentification requise  
✅ Autorisation admin uniquement  
✅ Validation du statut  
✅ Vérification de l'existence de l'offre  
✅ Transactions pour la suppression  

### **UX/UI**
✅ Interface intuitive  
✅ Badges colorés (vert/rouge)  
✅ Boutons contextuels  
✅ Dialogs explicatifs  
✅ Animations fluides  
✅ Feedback immédiat  

---

**La page de gestion des offres est maintenant 100% opérationnelle !** 🎉

L'admin peut désactiver/activer et supprimer les offres avec une interface claire et des confirmations appropriées.
