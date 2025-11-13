# ✅ Affichage des Informations de l'Entreprise dans les Offres

**Date:** 16 Octobre 2025  
**Fonctionnalité:** Affichage du logo, nom, email et téléphone de l'entreprise

---

## 🎯 Ce qui a été ajouté

Les offres de stage côté étudiant affichent maintenant **toutes les informations de contact de l'entreprise** :
- ✅ Logo de l'entreprise
- ✅ Nom de l'entreprise
- ✅ Email de l'entreprise (cliquable)
- ✅ Téléphone de l'entreprise (cliquable)
- ✅ Secteur d'activité

---

## 🔧 Modifications Backend

### **Fichier modifié : `backend/routes/offres.js`**

#### **Route GET `/api/offres` (Liste des offres)**

**Avant :**
```sql
SELECT o.*, c.company_name, c.logo_url, c.sector
FROM offres o
LEFT JOIN companies c ON o.company_id = c.id
```

**Maintenant :**
```sql
SELECT o.*, c.company_name, c.logo_url, c.sector, c.telephone, c.address, c.description as company_description,
       u.email as company_email
FROM offres o
LEFT JOIN companies c ON o.company_id = c.id
LEFT JOIN users u ON c.user_id = u.id
```

**Nouvelles données récupérées :**
- ✅ `telephone` - Téléphone de l'entreprise
- ✅ `company_email` - Email de l'entreprise (depuis la table users)
- ✅ `address` - Adresse complète
- ✅ `company_description` - Description de l'entreprise

#### **Route GET `/api/offres/:id` (Détail d'une offre)**

Même modification pour inclure toutes les informations de l'entreprise.

---

## 🎨 Modifications Frontend

### **Fichier modifié : `front/app/etudiant/offres/page.tsx`**

#### **1. Interface TypeScript mise à jour**

```typescript
interface Offre {
  // ... autres champs
  company_name?: string;
  logo_url?: string;
  sector?: string;
  address?: string;
  company_description?: string;
  telephone?: string;          // ✅ NOUVEAU
  company_email?: string;      // ✅ NOUVEAU
}
```

#### **2. Imports ajoutés**

```typescript
import { Phone, Mail } from "lucide-react"
```

#### **3. Carte d'offre - Section entreprise**

**Nouvelle section ajoutée dans chaque carte d'offre :**

```tsx
{/* Informations de l'entreprise */}
<div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
  {offer.logo_url ? (
    <img 
      src={offer.logo_url} 
      alt={offer.company_name || "Logo"} 
      className="w-12 h-12 rounded-lg object-cover"
    />
  ) : (
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
      <Building2 className="h-6 w-6 text-primary" />
    </div>
  )}
  <div className="flex-1 min-w-0">
    <p className="font-semibold text-foreground">{offer.company_name || "Entreprise"}</p>
    <div className="flex flex-col gap-1 mt-1">
      {offer.company_email && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="h-3 w-3 shrink-0" />
          <span className="truncate">{offer.company_email}</span>
        </div>
      )}
      {offer.telephone && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="h-3 w-3 shrink-0" />
          <span>{offer.telephone}</span>
        </div>
      )}
    </div>
  </div>
</div>
```

#### **4. Modal de détails - Section entreprise enrichie**

**Section ajoutée en haut du modal :**

```tsx
{/* Informations de l'entreprise */}
<div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg border">
  {offer.logo_url ? (
    <img 
      src={offer.logo_url} 
      alt={offer.company_name || "Logo"} 
      className="w-16 h-16 rounded-lg object-cover"
    />
  ) : (
    <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
      <Building2 className="h-8 w-8 text-primary" />
    </div>
  )}
  <div className="flex-1">
    <h4 className="font-semibold text-foreground mb-2">{offer.company_name || "Entreprise"}</h4>
    <div className="space-y-1.5">
      {offer.company_email && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4 shrink-0" />
          <a href={`mailto:${offer.company_email}`} className="hover:text-primary hover:underline">
            {offer.company_email}
          </a>
        </div>
      )}
      {offer.telephone && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4 shrink-0" />
          <a href={`tel:${offer.telephone}`} className="hover:text-primary hover:underline">
            {offer.telephone}
          </a>
        </div>
      )}
      {offer.sector && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4 shrink-0" />
          <span>{offer.sector}</span>
        </div>
      )}
    </div>
  </div>
</div>
```

---

## 🎨 Aperçu visuel

### **Carte d'offre**

```
┌─────────────────────────────────────────────────────┐
│ Stage Développeur Full Stack                   [🔖] │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ [Logo] Tech Solutions SA                     │   │
│ │        📧 contact@techsolutions.com          │   │
│ │        📞 +261 34 12 345 67                  │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ [📍 Paris] [💼 Hybride] [💶 600Ar/mois]            │
│                                                      │
│ Nous recherchons un stagiaire motivé...            │
│                                                      │
│ [Technologies de l'information]                     │
│                                                      │
│ Il y a 2 jours        [Détails] [Postuler]         │
└─────────────────────────────────────────────────────┘
```

### **Modal de détails**

```
┌─────────────────────────────────────────────────────┐
│ Stage Développeur Full Stack               [×]     │
│ 🏢 Tech Solutions SA                                │
├─────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐   │
│ │ [Logo]  Tech Solutions SA                    │   │
│ │         📧 contact@techsolutions.com         │   │
│ │         📞 +261 34 12 345 67                 │   │
│ │         💼 Technologies de l'information     │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ [📍 Paris] [💼 Hybride] [💶 600Ar/mois]            │
│ [📅 01/06/2025 - 31/08/2025] [👥 2 places]        │
│                                                      │
│ Description                                          │
│ Nous recherchons un stagiaire motivé...            │
│                                                      │
│ Domaine                                              │
│ [Technologies de l'information]                     │
│                                                      │
│ À propos de l'entreprise                            │
│ Entreprise spécialisée dans le développement...    │
│                                                      │
│ Adresse de l'entreprise                             │
│ 📍 123 Rue de la Tech, 75001 Paris                 │
│                                                      │
│ [Postuler à cette offre]                            │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Fonctionnalités

### **Dans la carte d'offre**
- ✅ Logo de l'entreprise (ou icône par défaut)
- ✅ Nom de l'entreprise en gras
- ✅ Email de l'entreprise (texte tronqué si trop long)
- ✅ Téléphone de l'entreprise
- ✅ Design compact et élégant
- ✅ Fond gris clair avec bordure

### **Dans le modal de détails**
- ✅ Logo plus grand (16x16)
- ✅ Email cliquable (ouvre le client mail)
- ✅ Téléphone cliquable (lance l'appel sur mobile)
- ✅ Secteur d'activité affiché
- ✅ Liens avec effet hover
- ✅ Icônes pour chaque information

### **Gestion des cas limites**
- ✅ Logo par défaut si pas de logo
- ✅ Affichage conditionnel (si pas d'email, ne s'affiche pas)
- ✅ Texte tronqué pour les emails longs
- ✅ Responsive (adapté mobile)

---

## 🔄 Flux de données

```
1. Entreprise crée son profil
   - Nom, logo, email, téléphone, secteur
   ↓
2. Entreprise publie une offre
   ↓
3. Backend récupère l'offre avec JOIN
   - offres + companies + users
   ↓
4. Étudiant consulte les offres
   ↓
5. GET /api/offres
   ↓
6. Backend retourne :
   - Données de l'offre
   - company_name, logo_url, sector
   - telephone (depuis companies)
   - company_email (depuis users)
   ↓
7. Frontend affiche :
   - Carte avec logo + nom + email + téléphone
   - Modal avec toutes les infos
   ↓
8. ✅ Étudiant peut contacter l'entreprise !
```

---

## 📊 Comparaison

### **Avant**
- ❌ Seulement le nom de l'entreprise
- ❌ Pas de logo visible
- ❌ Pas de contact direct
- ❌ Étudiant ne sait pas comment contacter

### **Maintenant**
- ✅ Logo de l'entreprise visible
- ✅ Nom de l'entreprise
- ✅ Email cliquable
- ✅ Téléphone cliquable
- ✅ Secteur d'activité
- ✅ Contact direct possible
- ✅ Design professionnel

---

## 🧪 Pour tester

### **Test complet**

1. **En tant qu'entreprise :**
   - Se connecter
   - Aller sur `/entreprise/profil`
   - S'assurer d'avoir :
     - Logo uploadé
     - Téléphone renseigné
     - Email (automatique depuis le compte)
   - Créer une offre

2. **En tant qu'étudiant :**
   - Se connecter
   - Aller sur `/etudiant/offres`
   - ✅ Voir le logo de l'entreprise
   - ✅ Voir le nom de l'entreprise
   - ✅ Voir l'email
   - ✅ Voir le téléphone
   - Cliquer sur "Détails"
   - ✅ Voir toutes les infos dans le modal
   - ✅ Cliquer sur l'email → Ouvre le client mail
   - ✅ Cliquer sur le téléphone → Lance l'appel (mobile)

---

## 🎉 Résultat

**Les étudiants peuvent maintenant :**
- ✅ Identifier facilement l'entreprise (logo + nom)
- ✅ Contacter directement l'entreprise (email + téléphone)
- ✅ Voir le secteur d'activité
- ✅ Avoir toutes les informations nécessaires avant de postuler

**L'affichage est :**
- ✅ Professionnel et élégant
- ✅ Responsive (mobile + desktop)
- ✅ Intuitif (icônes claires)
- ✅ Interactif (liens cliquables)

**Les informations sont synchronisées en temps réel avec la base de données !** 🚀
