# 🔒 Gestion Complète du Blocage des Comptes

**Date:** 27 Octobre 2025  
**Fonctionnalité:** Blocage/Déblocage des comptes étudiants et entreprises avec message d'alerte

---

## ✅ Fonctionnalités Implémentées

### **1. Gestion des Étudiants** (`/admin/etudiants`)
- ✅ Colonne "Statut" avec badges visuels
- ✅ Bouton "Bloquer" pour comptes actifs
- ✅ Bouton "Débloquer" pour comptes bloqués
- ✅ 4 statistiques : Total, Actifs, Bloqués, Profils complets
- ✅ Dialogs de confirmation

### **2. Gestion des Entreprises** (`/admin/entreprises`)
- ✅ Colonne "Statut" avec badges visuels
- ✅ Bouton "Bloquer" pour comptes actifs
- ✅ Bouton "Débloquer" pour comptes bloqués
- ✅ 4 statistiques : Total, Actifs, Bloqués, Profils complets
- ✅ Dialogs de confirmation

### **3. Message d'Alerte pour Comptes Bloqués**
- ✅ Alerte visuelle détaillée sur la page de connexion
- ✅ Icône Ban rouge
- ✅ Message explicatif
- ✅ Email de contact support
- ✅ Distinction entre erreur normale et compte bloqué

---

## 🔧 Modifications Backend

### **1. Route GET /api/admin/students**
```javascript
SELECT 
  u.id,
  u.email,
  u.statut,  // ✅ AJOUTÉ
  u.created_at,
  s.first_name,
  s.last_name,
  ...
FROM users u
LEFT JOIN students s ON u.id = s.user_id
WHERE u.role = 'student'
```

### **2. Route GET /api/admin/companies**
```javascript
SELECT 
  u.id,
  u.email,
  u.statut,  // ✅ AJOUTÉ
  u.created_at,
  c.company_name,
  c.sector,
  ...
FROM users u
LEFT JOIN companies c ON u.id = c.user_id
WHERE u.role = 'company'
```

### **3. Route PUT /api/admin/users/:id/status**
```javascript
// Bloquer/Débloquer un utilisateur
router.put('/users/:id/status', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const { statut } = req.body; // 'actif' ou 'bloqué'
  
  // Validation
  if (!['actif', 'bloqué'].includes(statut)) {
    return res.status(400).json({ message: 'Statut invalide' });
  }
  
  // Protection admin
  if (user.role === 'admin') {
    return res.status(403).json({ message: 'Impossible de bloquer un admin' });
  }
  
  // Mise à jour
  await pool.query('UPDATE users SET statut = $1 WHERE id = $2', [statut, id]);
});
```

### **4. Route POST /api/auth/login**
```javascript
// Vérification du statut lors de la connexion
if (user.statut === 'bloqué') {
  return res.status(403).json({
    success: false,
    message: 'Votre compte a été bloqué par un administrateur. Veuillez contacter le support.',
  });
}
```

**Fichiers modifiés :**
- ✅ `backend/routes/admin.js`
- ✅ `backend/routes/auth.js`

---

## 🎨 Modifications Frontend

### **1. API Client** (`front/lib/api.ts`)
```typescript
// Fonction pour bloquer/débloquer
updateUserStatus: async (userId: string, statut: 'actif' | 'bloqué') => {
  const response = await api.put(`/admin/users/${userId}/status`, { statut });
  return response.data;
}
```

---

### **2. Page Admin Étudiants** (`front/app/admin/etudiants/page.tsx`)

#### **Interface TypeScript**
```typescript
interface Student {
  id: string
  email: string
  statut: 'actif' | 'bloqué'  // ✅ AJOUTÉ
  first_name: string | null
  last_name: string | null
  domaine_etude: string | null
  niveau_etude: string | null
  candidatures_count: number
}
```

#### **Statistiques (4 cartes)**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Total étudiants */}
  {/* Comptes actifs */}
  {/* Comptes bloqués */}
  {/* Profils complets */}
</div>
```

#### **Tableau avec colonne Statut**
```tsx
<TableHead>Statut</TableHead>
...
<TableCell>
  {student.statut === 'bloqué' ? (
    <Badge variant="destructive" className="gap-1">
      <Ban className="w-3 h-3" />
      Bloqué
    </Badge>
  ) : (
    <Badge variant="default" className="bg-emerald-600 gap-1">
      <CheckCircle2 className="w-3 h-3" />
      Actif
    </Badge>
  )}
</TableCell>
```

#### **Boutons d'action**
```tsx
{student.statut === 'bloqué' ? (
  <Button onClick={() => handleUpdateStatus(student.id, 'actif')}>
    Débloquer
  </Button>
) : (
  <Button onClick={() => handleUpdateStatus(student.id, 'bloqué')}>
    Bloquer
  </Button>
)}
```

#### **3 Dialogs**
1. **Dialog Supprimer**
2. **Dialog Bloquer**
3. **Dialog Débloquer**

---

### **3. Page Admin Entreprises** (`front/app/admin/entreprises/page.tsx`)

**Identique à la page étudiants :**
- ✅ 4 statistiques
- ✅ Colonne "Statut"
- ✅ Badges "Actif" / "Bloqué"
- ✅ Boutons "Bloquer" / "Débloquer" / "Supprimer"
- ✅ 3 Dialogs de confirmation

---

### **4. Page de Connexion** (`front/app/auth/login/page.tsx`)

#### **Imports ajoutés**
```typescript
import { Ban, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
```

#### **État ajouté**
```typescript
const [isBlocked, setIsBlocked] = useState(false)
```

#### **Détection du blocage**
```typescript
catch (err: any) {
  const errorMessage = err.message || "Email, mot de passe ou rôle incorrect"
  const isAccountBlocked = errorMessage.includes("bloqué") || err.response?.status === 403
  
  setIsBlocked(isAccountBlocked)
  setError(errorMessage)
  
  toast({
    title: isAccountBlocked ? "🚫 Compte bloqué" : "❌ Erreur de connexion",
    description: errorMessage,
    variant: "destructive",
  })
}
```

#### **Alerte visuelle pour compte bloqué**
```tsx
{error && isBlocked && (
  <Alert variant="destructive" className="border-2">
    <Ban className="h-5 w-5" />
    <AlertTitle className="font-bold text-lg">Compte bloqué</AlertTitle>
    <AlertDescription className="mt-2 space-y-2">
      <p className="font-medium">{error}</p>
      <p className="text-sm">
        Votre compte a été suspendu par un administrateur. 
        Pour plus d'informations ou pour contester cette décision, 
        veuillez contacter le support à{" "}
        <a href="mailto:support@stageconnect.com" className="underline font-medium">
          support@stageconnect.com
        </a>
      </p>
    </AlertDescription>
  </Alert>
)}

{error && !isBlocked && (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

---

## 📊 Interface Utilisateur

### **Page Admin Étudiants**

#### **Statistiques**
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Total étudiants │ Comptes actifs  │ Comptes bloqués │ Profils complets│
│      50         │       45        │        5        │       42        │
│  ✅ Vert        │  ✅ Vert        │  🔴 Rouge       │  🔵 Bleu        │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

#### **Tableau**
```
┌──────────────┬─────────────────┬──────────┬─────────┬─────────┬──────────────┬─────────────────────┐
│ Nom          │ Email           │ Domaine  │ Niveau  │ Statut  │ Candidatures │ Actions             │
├──────────────┼─────────────────┼──────────┼─────────┼─────────┼──────────────┼─────────────────────┤
│ Jean Dupont  │ jean@mail.com   │ IT       │ L3      │ 🟢 Actif│      5       │ [Bloquer] [Suppr]   │
│ Marie Martin │ marie@mail.com  │ Finance  │ M1      │ 🔴 Bloqué│     2       │ [Débloquer] [Suppr] │
└──────────────┴─────────────────┴──────────┴─────────┴─────────┴──────────────┴─────────────────────┘
```

---

### **Page Admin Entreprises**

#### **Statistiques**
```
┌──────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Total entreprises│ Comptes actifs  │ Comptes bloqués │ Profils complets│
│       25         │       22        │        3        │       20        │
│  ✅ Vert         │  ✅ Vert        │  🔴 Rouge       │  🔵 Bleu        │
└──────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

#### **Tableau**
```
┌─────────────────┬──────────────┬─────────────────┬────────────┬─────────┬────────┬─────────────────────┐
│ Nom             │ Secteur      │ Email           │ Téléphone  │ Statut  │ Offres │ Actions             │
├─────────────────┼──────────────┼─────────────────┼────────────┼─────────┼────────┼─────────────────────┤
│ TechCorp        │ IT           │ tech@mail.com   │ 0612345678 │ 🟢 Actif│   10   │ [Bloquer] [Suppr]   │
│ FinanceGroup    │ Finance      │ fin@mail.com    │ 0687654321 │ 🔴 Bloqué│  3    │ [Débloquer] [Suppr] │
└─────────────────┴──────────────┴─────────────────┴────────────┴─────────┴────────┴─────────────────────┘
```

---

### **Page de Connexion - Compte Bloqué**

```
┌────────────────────────────────────────────────────────────┐
│  🔴 Compte bloqué                                          │
│                                                            │
│  Votre compte a été bloqué par un administrateur.         │
│  Veuillez contacter le support.                           │
│                                                            │
│  Votre compte a été suspendu par un administrateur.       │
│  Pour plus d'informations ou pour contester cette         │
│  décision, veuillez contacter le support à                │
│  support@stageconnect.com                                 │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux Complet

### **Flux 1 : Admin bloque un étudiant**

```
1. Admin → /admin/etudiants
   ↓
2. Clique sur "Bloquer" (bouton orange)
   ↓
3. Dialog : "Êtes-vous sûr de vouloir bloquer..."
   ↓
4. Admin confirme
   ↓
5. PUT /api/admin/users/:id/status { statut: 'bloqué' }
   ↓
6. Backend : UPDATE users SET statut = 'bloqué'
   ↓
7. ✅ Toast : "Étudiant bloqué avec succès"
   ↓
8. Badge passe de 🟢 "Actif" à 🔴 "Bloqué"
   ↓
9. Bouton change de "Bloquer" à "Débloquer"
```

---

### **Flux 2 : Étudiant bloqué tente de se connecter**

```
1. Étudiant → /auth/login
   ↓
2. Entre email, mot de passe, rôle
   ↓
3. Clique sur "Se connecter"
   ↓
4. POST /api/auth/login
   ↓
5. Backend vérifie : user.statut === 'bloqué' ?
   ↓
6. ❌ Retourne erreur 403
   ↓
7. Frontend détecte : err.response.status === 403
   ↓
8. setIsBlocked(true)
   ↓
9. Affiche Alert rouge avec :
   - Icône Ban
   - Titre "Compte bloqué"
   - Message détaillé
   - Email support
   ↓
10. 🚫 Toast : "Compte bloqué"
```

---

### **Flux 3 : Admin débloque un étudiant**

```
1. Admin → /admin/etudiants
   ↓
2. Clique sur "Débloquer" (bouton vert)
   ↓
3. Dialog : "Êtes-vous sûr de vouloir débloquer..."
   ↓
4. Admin confirme
   ↓
5. PUT /api/admin/users/:id/status { statut: 'actif' }
   ↓
6. Backend : UPDATE users SET statut = 'actif'
   ↓
7. ✅ Toast : "Étudiant débloqué avec succès"
   ↓
8. Badge passe de 🔴 "Bloqué" à 🟢 "Actif"
   ↓
9. Bouton change de "Débloquer" à "Bloquer"
   ↓
10. L'étudiant peut maintenant se connecter
```

---

## 📝 Fichiers Modifiés

### **Backend (2 fichiers)**
- ✅ `backend/routes/admin.js`
  - Ajout `u.statut` dans GET /students
  - Ajout `u.statut` dans GET /companies
  - Nouvelle route PUT /users/:id/status

- ✅ `backend/routes/auth.js`
  - Vérification `user.statut === 'bloqué'` dans POST /login

### **Frontend (4 fichiers)**
- ✅ `front/lib/api.ts`
  - Fonction `updateUserStatus(userId, statut)`

- ✅ `front/app/admin/etudiants/page.tsx`
  - Interface avec `statut`
  - 4 statistiques
  - Colonne "Statut"
  - Boutons Bloquer/Débloquer
  - 3 Dialogs

- ✅ `front/app/admin/entreprises/page.tsx`
  - Interface avec `statut`
  - 4 statistiques
  - Colonne "Statut"
  - Boutons Bloquer/Débloquer
  - 3 Dialogs

- ✅ `front/app/auth/login/page.tsx`
  - État `isBlocked`
  - Détection erreur 403
  - Alert visuelle pour compte bloqué
  - Email support

---

## 🎯 Résumé

### **Fonctionnalités**
✅ Blocage/Déblocage étudiants  
✅ Blocage/Déblocage entreprises  
✅ Statistiques (actifs/bloqués)  
✅ Badges visuels  
✅ Dialogs de confirmation  
✅ Vérification à la connexion  
✅ Message d'alerte détaillé  
✅ Email de contact support  

### **Sécurité**
✅ Impossible de bloquer un admin  
✅ Validation du statut  
✅ Authentification requise  
✅ Autorisation admin uniquement  

### **UX/UI**
✅ Interface intuitive  
✅ Badges colorés (vert/rouge)  
✅ Boutons contextuels  
✅ Notifications toast  
✅ Alerte visuelle détaillée  
✅ Animations fluides  

---

**La fonctionnalité de gestion du blocage est maintenant 100% opérationnelle pour les étudiants ET les entreprises !** 🎉

Les utilisateurs bloqués reçoivent un message clair et détaillé avec les coordonnées du support.
