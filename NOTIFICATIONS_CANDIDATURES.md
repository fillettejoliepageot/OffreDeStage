# 🔔 Système de Notifications - Candidatures en Attente

## ✅ Implémentation Complète

### 🎯 Fonctionnalité

L'entreprise reçoit une **notification visuelle** dans la navigation pour savoir quand elle a reçu de nouvelles candidatures :
- **Badge rouge** sur le lien "Candidatures" 
- **Compteur en temps réel** du nombre de candidatures en attente
- **Rafraîchissement automatique** toutes les 10 secondes
- **Style Facebook** - Badge rouge avec nombre

---

## 🗄️ Backend - Nouvelle Route API

### **GET /api/candidatures/company/pending-count**

**Description** : Compte les candidatures en attente (statut = 'pending') de l'entreprise

**Accès** : Entreprise uniquement (authentification requise)

**Réponse** :
```json
{
  "success": true,
  "pendingCount": 5
}
```

**Code** : `/backend/routes/candidatures.js`

```javascript
router.get('/company/pending-count', authenticateToken, async (req, res) => {
  // Compte les candidatures avec statut = 'pending'
  // Pour les offres de l'entreprise connectée
});
```

---

## 🎨 Frontend - Navigation Entreprise

### **Fichier** : `/components/company-nav.tsx`

### **Modifications**

#### 1. **État et chargement du compteur**
```typescript
const [pendingCount, setPendingCount] = useState(0)

useEffect(() => {
  if (mounted && user?.role === 'company') {
    loadPendingCount()
    
    // Rafraîchir toutes les 10 secondes
    const interval = setInterval(() => {
      loadPendingCount()
    }, 10000)
    
    return () => clearInterval(interval)
  }
}, [mounted, user])

const loadPendingCount = async () => {
  const response = await api.get('/candidatures/company/pending-count')
  setPendingCount(response.data.pendingCount)
}
```

#### 2. **Badge de notification**
```tsx
{showBadge && (
  <Badge variant="destructive" className="ml-1 h-5 min-w-5">
    {pendingCount > 99 ? '99+' : pendingCount}
  </Badge>
)}
```

---

## 🔄 Flux Complet

### **1. Étudiant postule à une offre**
```
Étudiant clique "Envoyer"
    ↓
POST /api/candidatures
    ↓
Candidature créée avec statut = 'pending'
```

### **2. Badge de notification apparaît**
```
Navigation entreprise (auto-refresh 10s)
    ↓
GET /api/candidatures/company/pending-count
    ↓
Retourne : { pendingCount: 1 }
    ↓
Badge rouge "1" apparaît sur "Candidatures"
```

### **3. Entreprise consulte et traite**
```
Entreprise clique sur "Candidatures"
    ↓
Voit la liste des candidatures en attente
    ↓
Accepte ou Refuse la candidature
    ↓
PUT /api/candidatures/:id/status
    ↓
Statut change de 'pending' à 'accepted' ou 'rejected'
    ↓
Badge se met à jour automatiquement (compteur diminue)
```

---

## 🎨 Design du Badge

### **Apparence**
- **Couleur** : Rouge vif (`variant="destructive"`)
- **Position** : À droite du texte "Candidatures"
- **Taille** : Petite et compacte (h-5)
- **Contenu** : Nombre de candidatures en attente
- **Limite** : Affiche "99+" si plus de 99 candidatures

### **Comportement**
- ✅ Apparaît uniquement si `pendingCount > 0`
- ✅ Disparaît automatiquement quand `pendingCount = 0`
- ✅ Se met à jour toutes les 10 secondes
- ✅ Visible sur desktop et mobile

---

## ⚡ Rafraîchissement Automatique

### **Fréquence** : Toutes les 10 secondes

### **Avantages**
- L'entreprise voit les nouvelles candidatures **en temps réel**
- Pas besoin de recharger la page manuellement
- Compteur toujours à jour

### **Performance**
- Requête légère (COUNT uniquement)
- Pas de rechargement de page
- Pas de loader visible

---

## 🧪 Comment Tester

### **1. Démarrer le backend**
```bash
cd backend
npm start
```

### **2. Démarrer le frontend**
```bash
cd front
npm run dev
```

### **3. Scénario de test**

#### **Étape 1 : Connexion entreprise**
1. Connectez-vous comme entreprise
2. Vérifiez que le badge n'apparaît PAS (si aucune candidature en attente)

#### **Étape 2 : Créer une candidature**
1. Ouvrez un autre navigateur (ou mode incognito)
2. Connectez-vous comme étudiant
3. Postulez à une offre de l'entreprise

#### **Étape 3 : Vérifier la notification**
1. Retournez sur le navigateur de l'entreprise
2. **Attendez maximum 10 secondes**
3. ✅ Le badge rouge "1" doit apparaître sur "Candidatures"

#### **Étape 4 : Traiter la candidature**
1. Cliquez sur "Candidatures"
2. Acceptez ou refusez la candidature
3. ✅ Le badge doit disparaître automatiquement

---

## 📊 Résumé des Changements

### **Backend**
- ✅ Route `/api/candidatures/company/pending-count` créée
- ✅ Compte les candidatures avec `statut = 'pending'`
- ✅ Retourne le nombre en temps réel

### **Frontend**
- ✅ Badge rouge dans la navigation (`company-nav.tsx`)
- ✅ Rafraîchissement automatique toutes les 10 secondes
- ✅ Affichage conditionnel (seulement si > 0)
- ✅ Support desktop et mobile
- ✅ Limite à "99+" pour les grands nombres

---

## 🎉 Résultat Final

**L'entreprise est maintenant notifiée en temps réel des nouvelles candidatures !**

### **Expérience utilisateur**
- 🔴 Badge rouge visible et attractif
- 🔢 Nombre exact de candidatures en attente
- ⚡ Mise à jour automatique sans action requise
- ✅ Design professionnel style Facebook/LinkedIn

### **Avantages**
- ✅ **Simple** : Pas de base de données supplémentaire
- ✅ **Performant** : Requête COUNT rapide
- ✅ **En temps réel** : Rafraîchissement automatique
- ✅ **Intuitif** : Badge disparaît quand tout est traité

**Le système est opérationnel et prêt à l'emploi !** 🚀
