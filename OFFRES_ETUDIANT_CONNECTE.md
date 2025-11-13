# ✅ Page Offres Étudiant - Connectée au Backend

## 🎯 Ce qui a été fait

La page des offres pour les étudiants est maintenant **100% connectée au backend** et affiche les offres réelles publiées par les entreprises.

---

## 📁 Fichier modifié

### **`front/app/etudiant/offres/page.tsx`**

**Fonctionnalités :**
- ✅ Chargement automatique des offres depuis `/api/offres`
- ✅ Affichage dynamique des offres réelles
- ✅ Filtres de recherche (titre, description, entreprise)
- ✅ Filtre par domaine
- ✅ Filtre par localisation
- ✅ Modal de détails avec toutes les informations
- ✅ Loader pendant le chargement
- ✅ État vide élégant
- ✅ Calcul automatique de la durée du stage
- ✅ Calcul du temps écoulé depuis la publication
- ✅ Gestion des erreurs

---

## 🔄 Flux complet

### **Entreprise → Étudiant**

```
1. Entreprise crée une offre
   ↓
2. POST /api/offres (sauvegarde dans PostgreSQL)
   ↓
3. Étudiant va sur /etudiant/offres
   ↓
4. GET /api/offres (récupère toutes les offres)
   ↓
5. ✅ Offre affichée immédiatement !
```

### **Modification en temps réel**

```
1. Entreprise modifie une offre
   ↓
2. PUT /api/offres/:id (mise à jour PostgreSQL)
   ↓
3. Étudiant rafraîchit la page
   ↓
4. GET /api/offres (récupère les données à jour)
   ↓
5. ✅ Modifications visibles !
```

### **Suppression en temps réel**

```
1. Entreprise supprime une offre
   ↓
2. DELETE /api/offres/:id (suppression PostgreSQL)
   ↓
3. Étudiant rafraîchit la page
   ↓
4. GET /api/offres (offre n'existe plus)
   ↓
5. ✅ Offre disparaît de la liste !
```

---

## 🎨 Interface

### **Page principale**

```
┌─────────────────────────────────────────────────────┐
│ Offres de stage                    [3 offres sauvegardées] │
│ Découvrez les opportunités...                       │
├─────────────────────────────────────────────────────┤
│ [🔍 Rechercher par titre, entreprise...]           │
│                                                      │
│ Filtres: [Domaine ▼] [Localisation...]            │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ Stage Développeur Full Stack        [🔖]       │ │
│ │ 🏢 Tech Solutions SA                            │ │
│ │                                                  │ │
│ │ [📍 Paris] [💼 Hybride] [💶 600Ar/mois]        │ │
│ │ [📅 juin 2025]                                  │ │
│ │                                                  │ │
│ │ Nous recherchons un stagiaire motivé...        │ │
│ │                                                  │ │
│ │ [Technologies de l'information]                 │ │
│ │                                                  │ │
│ │ Il y a 2 jours        [Détails] [Postuler]     │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Stage Data Analyst                  [🔖]       │ │
│ │ ...                                              │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### **Modal de détails**

```
┌─────────────────────────────────────────────────────┐
│ Stage Développeur Full Stack               [×]     │
│ 🏢 Tech Solutions SA                                │
├─────────────────────────────────────────────────────┤
│ [📍 Paris] [💼 Hybride] [💶 600Ar/mois]            │
│ [📅 01/06/2025 - 31/08/2025] [👥 2 places]        │
│                                                      │
│ Description                                          │
│ Nous recherchons un stagiaire motivé pour          │
│ rejoindre notre équipe...                           │
│                                                      │
│ Domaine                                              │
│ [Technologies de l'information]                     │
│                                                      │
│ À propos de l'entreprise                            │
│ Entreprise spécialisée dans le développement...    │
│                                                      │
│ Secteur                                              │
│ Technologies de l'information                       │
│                                                      │
│ Adresse de l'entreprise                             │
│ 123 Rue de la Tech, 75001 Paris                    │
│                                                      │
│ [Postuler à cette offre]                            │
└─────────────────────────────────────────────────────┘
```

---

## 💻 Code clé

### **Chargement des offres**

```typescript
const loadOffers = async () => {
  try {
    setIsLoading(true)
    const response = await api.get('/offres')
    
    if (response.data.success) {
      setOffers(response.data.data)
    }
  } catch (error: any) {
    toast({
      title: "❌ Erreur",
      description: "Erreur lors du chargement des offres",
      variant: "destructive",
    })
  } finally {
    setIsLoading(false)
  }
}
```

### **Filtrage des offres**

```typescript
const filteredOffers = offers.filter((offer) => {
  const matchesSearch =
    offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (offer.company_name && offer.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
  
  const matchesDomain = domainFilter === "all" || 
    offer.domaine.toLowerCase() === domainFilter.toLowerCase()
  
  const matchesLocation = locationFilter === "all" || 
    (offer.localisation && offer.localisation.toLowerCase().includes(locationFilter.toLowerCase()))
  
  return matchesSearch && matchesDomain && matchesLocation
})
```

### **Calcul du temps écoulé**

```typescript
const getTimeAgo = (createdAt: string) => {
  const now = new Date()
  const created = new Date(createdAt)
  const diffMs = now.getTime() - created.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return "Il y a 1 jour"
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine(s)`
  return `Il y a ${Math.floor(diffDays / 30)} mois`
}
```

---

## 🔌 Intégration avec le backend

### **Requête GET**

```typescript
GET http://localhost:5000/api/offres
```

**Réponse :**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": "uuid",
      "title": "Stage Développeur Full Stack",
      "description": "Nous recherchons...",
      "domaine": "Technologies de l'information",
      "nombre_places": 2,
      "localisation": "Paris",
      "type_stage": "Hybride",
      "remuneration": true,
      "montant_remuneration": "600.00",
      "date_debut": "2025-06-01",
      "date_fin": "2025-08-31",
      "created_at": "2025-10-13T10:00:00Z",
      "company_name": "Tech Solutions SA",
      "logo_url": "data:image/png;base64,...",
      "sector": "Technologies de l'information",
      "address": "123 Rue de la Tech, Paris",
      "company_description": "Entreprise spécialisée..."
    }
  ]
}
```

---

## ✅ Fonctionnalités

### **Affichage des offres**
- ✅ Titre de l'offre
- ✅ Nom de l'entreprise
- ✅ Localisation (si présente)
- ✅ Type de stage (Présentiel, Distanciel, Hybride)
- ✅ Rémunération (montant si présent)
- ✅ Date de début (formatée)
- ✅ Description (tronquée à 2 lignes)
- ✅ Domaine
- ✅ Temps écoulé depuis la publication

### **Filtres**
- ✅ Recherche par titre
- ✅ Recherche par description
- ✅ Recherche par nom d'entreprise
- ✅ Filtre par domaine (select)
- ✅ Filtre par localisation (input)

### **Modal de détails**
- ✅ Toutes les informations de l'offre
- ✅ Informations sur l'entreprise
- ✅ Nombre de places
- ✅ Dates complètes
- ✅ Description complète
- ✅ Secteur de l'entreprise
- ✅ Adresse de l'entreprise
- ✅ Bouton "Postuler"

### **Autres**
- ✅ Loader pendant le chargement
- ✅ État vide élégant
- ✅ Sauvegarde d'offres (local)
- ✅ Responsive
- ✅ Gestion des erreurs

---

## 🧪 Pour tester

### **Test complet : Entreprise → Étudiant**

1. **Se connecter en tant qu'entreprise**
2. Aller sur `/entreprise/offres`
3. Créer une offre :
   - Titre: "Stage Développeur Full Stack"
   - Description: "Nous recherchons un stagiaire motivé..."
   - Domaine: "Technologies de l'information"
   - Localisation: "Paris"
   - Type: "Hybride"
   - Rémunération: 600Ar
   - Dates: 01/06/2025 → 31/08/2025
4. Publier l'offre
5. **Se déconnecter**
6. **Se connecter en tant qu'étudiant**
7. Aller sur `/etudiant/offres`
8. ✅ **L'offre est visible immédiatement !**

### **Test : Modification**

1. **Entreprise** modifie l'offre (change le titre)
2. **Étudiant** rafraîchit la page
3. ✅ **Modifications visibles !**

### **Test : Suppression**

1. **Entreprise** supprime l'offre
2. **Étudiant** rafraîchit la page
3. ✅ **Offre disparaît !**

### **Test : Filtres**

1. Taper "développeur" dans la recherche
2. ✅ Filtrage en temps réel
3. Sélectionner un domaine
4. ✅ Filtrage par domaine
5. Taper une localisation
6. ✅ Filtrage par localisation

---

## 📊 Résumé

### **Avant**
- ❌ Données statiques en dur
- ❌ Pas de connexion au backend
- ❌ Offres fictives

### **Maintenant**
- ✅ Données dynamiques depuis PostgreSQL
- ✅ Connexion complète au backend
- ✅ Offres réelles publiées par les entreprises
- ✅ Mise à jour en temps réel
- ✅ Filtres fonctionnels
- ✅ Modal de détails complet
- ✅ Toutes les informations affichées

---

## 🎉 Résultat final

**Le système complet fonctionne !**

```
Entreprise crée offre → PostgreSQL → Étudiant voit l'offre
Entreprise modifie → PostgreSQL → Étudiant voit les changements
Entreprise supprime → PostgreSQL → Offre disparaît
```

**Cycle complet :**
1. ✅ **Création** - Entreprise crée une offre
2. ✅ **Lecture** - Étudiant voit l'offre
3. ✅ **Modification** - Entreprise modifie, étudiant voit les changements
4. ✅ **Suppression** - Entreprise supprime, offre disparaît

**Toutes les opérations sont synchronisées avec PostgreSQL !** 🎉

**Testez maintenant : créez une offre en tant qu'entreprise et voyez-la apparaître côté étudiant !** 🚀
