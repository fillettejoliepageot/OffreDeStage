# 📊 Rapports Dynamiques - Admin Panel

**Date:** 27 Octobre 2025  
**Fonctionnalité:** Rapports avec données réelles depuis la base de données  
**Page:** `/admin/rapports`

---

## ✅ Fonctionnalités Implémentées

### **1. Backend - Route API**
- ✅ **Route:** `GET /api/admin/rapports`
- ✅ **Paramètre:** `periode` (1mois, 3mois, 6mois, 1an)
- ✅ **Authentification:** Admin uniquement

### **2. Données Retournées**
- ✅ **Statistiques globales** (étudiants, entreprises, offres, candidatures)
- ✅ **Évolution mensuelle** (par mois sur la période sélectionnée)
- ✅ **Répartition par domaine** (top 10 domaines)
- ✅ **Candidatures par statut** (en attente, acceptée, refusée)
- ✅ **Top entreprises** (par nombre d'offres)
- ✅ **Taux de conversion** (candidatures acceptées / total)

### **3. Frontend - Page Dynamique**
- ✅ **Chargement des données réelles**
- ✅ **Filtres fonctionnels** (période)
- ✅ **Graphiques CSS** (barres animées)
- ✅ **Tableau détaillé**
- ✅ **Loading state**

---

## 🔧 Backend - Route API

### **Fichier Modifié**
`backend/routes/admin.js`

### **Route Créée**
```javascript
router.get('/rapports', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const { periode = '6mois' } = req.query;
  
  // Déterminer l'intervalle
  let interval = '6 months';
  switch (periode) {
    case '1mois': interval = '1 month'; break;
    case '3mois': interval = '3 months'; break;
    case '6mois': interval = '6 months'; break;
    case '1an': interval = '12 months'; break;
  }
  
  // 1. Statistiques globales
  const statsGlobales = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM users WHERE role = 'student') as total_etudiants,
      (SELECT COUNT(*) FROM users WHERE role = 'company') as total_entreprises,
      (SELECT COUNT(*) FROM offres) as total_offres,
      (SELECT COUNT(*) FROM candidatures) as total_candidatures
  `);
  
  // 2. Évolution mensuelle
  const evolutionMensuelle = await pool.query(`
    WITH dates AS (
      SELECT generate_series(
        DATE_TRUNC('month', NOW() - INTERVAL '${interval}'),
        DATE_TRUNC('month', NOW()),
        '1 month'::interval
      ) AS mois
    )
    SELECT 
      TO_CHAR(d.mois, 'Mon') as mois,
      COALESCE(COUNT(DISTINCT u1.id) FILTER (WHERE u1.role = 'student'), 0) as etudiants,
      COALESCE(COUNT(DISTINCT u2.id) FILTER (WHERE u2.role = 'company'), 0) as entreprises,
      COALESCE(COUNT(DISTINCT o.id), 0) as offres,
      COALESCE(COUNT(DISTINCT c.id), 0) as candidatures
    FROM dates d
    LEFT JOIN users u1 ON DATE_TRUNC('month', u1.created_at) = d.mois AND u1.role = 'student'
    LEFT JOIN users u2 ON DATE_TRUNC('month', u2.created_at) = d.mois AND u2.role = 'company'
    LEFT JOIN offres o ON DATE_TRUNC('month', o.created_at) = d.mois
    LEFT JOIN candidatures c ON DATE_TRUNC('month', c.created_at) = d.mois
    GROUP BY d.mois
    ORDER BY d.mois
  `);
  
  // 3. Répartition par domaine
  const repartitionDomaine = await pool.query(`
    SELECT 
      o.domaine,
      COUNT(DISTINCT s.id) as etudiants,
      COUNT(DISTINCT o.id) as offres
    FROM offres o
    LEFT JOIN candidatures c ON o.id = c.offre_id
    LEFT JOIN students s ON c.student_id = s.id
    WHERE o.domaine IS NOT NULL
    GROUP BY o.domaine
    ORDER BY offres DESC
    LIMIT 10
  `);
  
  // Retourner toutes les données
  res.json({
    success: true,
    data: {
      statistiques_globales: statsGlobales.rows[0],
      evolution_mensuelle: evolutionMensuelle.rows,
      repartition_domaine: repartitionDomaine.rows,
      // ...
    }
  });
});
```

---

## 🎨 Frontend - API Client

### **Fichier Modifié**
`front/lib/api.ts`

### **Fonction Ajoutée**
```typescript
// Récupérer les données de rapports
getRapports: async (periode?: string) => {
  const params = periode ? `?periode=${periode}` : '';
  const response = await api.get(`/admin/rapports${params}`);
  return response.data;
}
```

---

## 📊 Frontend - Page Rapports

### **Fichier Modifié**
`front/app/admin/rapports/page.tsx`

### **Interface TypeScript**
```typescript
interface RapportData {
  statistiques_globales: {
    total_etudiants: string
    total_entreprises: string
    total_offres: string
    total_candidatures: string
  }
  evolution_mensuelle: Array<{
    mois: string
    etudiants: string
    entreprises: string
    offres: string
    candidatures: string
  }>
  repartition_domaine: Array<{
    domaine: string
    etudiants: string
    offres: string
  }>
  // ...
}
```

### **Chargement des Données**
```typescript
const [rapportData, setRapportData] = useState<RapportData | null>(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  loadRapports()
}, [periode])

const loadRapports = async () => {
  try {
    setLoading(true)
    const response = await adminAPI.getRapports(periode)
    
    if (response.success) {
      setRapportData(response.data)
    }
  } catch (error: any) {
    toast({
      title: "❌ Erreur",
      description: "Erreur lors du chargement des rapports",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}
```

### **Statistiques Globales**
```typescript
<Card>
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Étudiants</p>
        <p className="text-2xl font-bold text-foreground">
          {Number(statistiques_globales.total_etudiants).toLocaleString()}
        </p>
      </div>
      <Users className="w-8 h-8 text-blue-600" />
    </div>
  </CardContent>
</Card>
```

### **Graphique Évolution Mensuelle**
```typescript
{evolution_mensuelle.map((data, index) => {
  const etudiants = Number(data.etudiants)
  const entreprises = Number(data.entreprises)
  const offres = Number(data.offres)
  const maxValue = Math.max(etudiants, entreprises, offres, 1)
  
  return (
    <div key={index} className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{data.mois}</span>
        <span className="text-muted-foreground">{etudiants} étudiants</span>
      </div>
      <div className="flex gap-1 h-8">
        <div 
          className="bg-blue-500 rounded transition-all hover:opacity-80"
          style={{ width: `${(etudiants / maxValue) * 100}%` }}
          title={`Étudiants: ${etudiants}`}
        />
        <div 
          className="bg-emerald-500 rounded transition-all hover:opacity-80"
          style={{ width: `${(entreprises / maxValue) * 100}%` }}
          title={`Entreprises: ${entreprises}`}
        />
        <div 
          className="bg-orange-500 rounded transition-all hover:opacity-80"
          style={{ width: `${(offres / maxValue) * 100}%` }}
          title={`Offres: ${offres}`}
        />
      </div>
    </div>
  )
})}
```

---

## 🔄 Flux Complet

### **1. Chargement Initial**
```
1. Admin → /admin/rapports
   ↓
2. useEffect() → loadRapports()
   ↓
3. GET /api/admin/rapports?periode=6mois
   ↓
4. Backend : Requêtes SQL pour récupérer les données
   ↓
5. Retour JSON avec toutes les statistiques
   ↓
6. Frontend : setRapportData(response.data)
   ↓
7. Affichage des graphiques et tableaux
```

### **2. Changement de Période**
```
1. Admin change le filtre "Période" → "3 derniers mois"
   ↓
2. setPeriode("3mois")
   ↓
3. useEffect() détecte le changement → loadRapports()
   ↓
4. GET /api/admin/rapports?periode=3mois
   ↓
5. Backend : Recalcule avec interval = '3 months'
   ↓
6. Retour des nouvelles données
   ↓
7. Mise à jour des graphiques
```

---

## 📊 Requêtes SQL Utilisées

### **1. Statistiques Globales**
```sql
SELECT 
  (SELECT COUNT(*) FROM users WHERE role = 'student') as total_etudiants,
  (SELECT COUNT(*) FROM users WHERE role = 'company') as total_entreprises,
  (SELECT COUNT(*) FROM offres) as total_offres,
  (SELECT COUNT(*) FROM candidatures) as total_candidatures
```

### **2. Évolution Mensuelle**
```sql
WITH dates AS (
  SELECT generate_series(
    DATE_TRUNC('month', NOW() - INTERVAL '6 months'),
    DATE_TRUNC('month', NOW()),
    '1 month'::interval
  ) AS mois
)
SELECT 
  TO_CHAR(d.mois, 'Mon') as mois,
  COALESCE(COUNT(DISTINCT u1.id) FILTER (WHERE u1.role = 'student'), 0) as etudiants,
  COALESCE(COUNT(DISTINCT u2.id) FILTER (WHERE u2.role = 'company'), 0) as entreprises,
  COALESCE(COUNT(DISTINCT o.id), 0) as offres,
  COALESCE(COUNT(DISTINCT c.id), 0) as candidatures
FROM dates d
LEFT JOIN users u1 ON DATE_TRUNC('month', u1.created_at) = d.mois AND u1.role = 'student'
LEFT JOIN users u2 ON DATE_TRUNC('month', u2.created_at) = d.mois AND u2.role = 'company'
LEFT JOIN offres o ON DATE_TRUNC('month', o.created_at) = d.mois
LEFT JOIN candidatures c ON DATE_TRUNC('month', c.created_at) = d.mois
GROUP BY d.mois
ORDER BY d.mois
```

### **3. Répartition par Domaine**
```sql
SELECT 
  o.domaine,
  COUNT(DISTINCT s.id) as etudiants,
  COUNT(DISTINCT o.id) as offres
FROM offres o
LEFT JOIN candidatures c ON o.id = c.offre_id
LEFT JOIN students s ON c.student_id = s.id
WHERE o.domaine IS NOT NULL
GROUP BY o.domaine
ORDER BY offres DESC
LIMIT 10
```

---

## 🎯 Fonctionnalités

### **Filtres**
- ✅ **Période** : 1 mois, 3 mois, 6 mois, 1 an
- ⏳ **Type d'utilisateur** : Tous, Étudiants, Entreprises (à implémenter)
- ⏳ **Domaine** : Tous, Informatique, Marketing, etc. (à implémenter)

### **Statistiques Affichées**
- ✅ Total étudiants
- ✅ Total entreprises
- ✅ Total offres
- ✅ Total candidatures

### **Graphiques**
- ✅ Évolution mensuelle (barres CSS)
- ✅ Répartition par domaine (barres CSS)

### **Tableau**
- ✅ Données détaillées par mois

### **Export**
- ⏳ Export PDF (à implémenter)
- ⏳ Export CSV (à implémenter)

---

## ✅ Résumé

### **Backend**
- ✅ Route `/api/admin/rapports` créée
- ✅ Requêtes SQL optimisées
- ✅ Filtrage par période fonctionnel
- ✅ 6 types de données retournées

### **Frontend**
- ✅ API client configuré
- ✅ Chargement dynamique des données
- ✅ Graphiques CSS animés
- ✅ Tableau détaillé
- ✅ Loading state
- ✅ Gestion des erreurs

### **Fichiers Modifiés**
- ✅ `backend/routes/admin.js`
- ✅ `front/lib/api.ts`
- ✅ `front/app/admin/rapports/page.tsx`

---

**La page des rapports est maintenant dynamique et connectée à la base de données !** 🎉

Les données affichées sont réelles et se mettent à jour automatiquement selon la période sélectionnée.
