# 🔒 Configuration du Rate Limiting

## 📅 Date : 01/11/2025

---

## ✅ Problème Résolu !

Le rate limiting est maintenant **automatiquement désactivé en développement** et **activé en production**.

---

## 🎯 Comment Ça Marche Maintenant

### **Mode Automatique (Recommandé)**

Le système détecte automatiquement l'environnement :

```javascript
// middleware/rateLimiter.js
const isDevelopment = process.env.NODE_ENV === 'development';
const isRateLimitingEnabled = process.env.RATE_LIMITING_ENABLED === 'true' || !isDevelopment;
```

**Résultat :**
- ✅ **Développement** (`NODE_ENV=development`) → Rate limiting **DÉSACTIVÉ**
- ✅ **Production** (`NODE_ENV=production`) → Rate limiting **ACTIVÉ**

---

## 🔧 Configuration dans `.env`

### **Option 1 : Mode Automatique (Actuel)**

```env
# .env
NODE_ENV=development
# RATE_LIMITING_ENABLED n'est pas défini → Désactivé automatiquement
```

**Console au démarrage :**
```
🔓 Rate limiting DÉSACTIVÉ (mode développement)
```

---

### **Option 2 : Forcer l'Activation en Dev**

Si vous voulez tester le rate limiting en développement :

```env
# .env
NODE_ENV=development
RATE_LIMITING_ENABLED=true
```

**Console au démarrage :**
```
🔓 Rate limiting en mode DÉVELOPPEMENT (limites souples)
```

---

### **Option 3 : Production**

```env
# .env
NODE_ENV=production
# RATE_LIMITING_ENABLED n'est pas nécessaire → Activé automatiquement
```

**Console au démarrage :**
```
🔒 Rate limiting en mode PRODUCTION (limites strictes)
```

---

## 📊 Limites par Environnement

### **Développement (Désactivé par défaut)**

Quand `NODE_ENV=development` et `RATE_LIMITING_ENABLED` n'est pas défini :

| Route | Limite | Statut |
|-------|--------|--------|
| **Toutes les routes** | ∞ Illimité | ✅ Bypass complet |
| Login | ∞ Illimité | ✅ Bypass complet |
| Register | ∞ Illimité | ✅ Bypass complet |
| Candidatures | ∞ Illimité | ✅ Bypass complet |
| Offres | ∞ Illimité | ✅ Bypass complet |
| Admin | ∞ Illimité | ✅ Bypass complet |

**Avantages :**
- ✅ Pas de blocage pendant les tests
- ✅ Rechargements illimités
- ✅ Tests de charge possibles
- ✅ Aucune erreur 429

---

### **Développement (Activé manuellement)**

Quand `NODE_ENV=development` et `RATE_LIMITING_ENABLED=true` :

| Route | Limite | Fenêtre |
|-------|--------|---------|
| API Global | 1000 requêtes | 15 min |
| Login | 50 tentatives | 15 min |
| Register | 30 inscriptions | 1 heure |
| Candidatures | 10 candidatures | 1 heure |
| Offres | 20 offres | 1 heure |
| Admin | 50 requêtes | 15 min |

**Utilité :**
- ✅ Tester le comportement du rate limiting
- ✅ Vérifier les messages d'erreur
- ✅ Simuler la production

---

### **Production**

Quand `NODE_ENV=production` :

| Route | Limite | Fenêtre |
|-------|--------|---------|
| API Global | 100 requêtes | 15 min |
| Login | 5 tentatives | 15 min |
| Register | 3 inscriptions | 1 heure |
| Candidatures | 10 candidatures | 1 heure |
| Offres | 20 offres | 1 heure |
| Admin | 50 requêtes | 15 min |

**Sécurité :**
- ✅ Protection contre les attaques par force brute
- ✅ Prévention du spam
- ✅ Protection des ressources serveur

---

## 🚀 Démarrage

### **Développement (Recommandé)**

```bash
# 1. Vérifier votre .env
NODE_ENV=development

# 2. Démarrer le serveur
cd backend
npm run dev

# 3. Vérifier la console
# Vous devriez voir :
# 🔓 Rate limiting DÉSACTIVÉ (mode développement)
```

**Résultat :** Aucune limite, vous pouvez travailler librement ! 🎉

---

### **Production**

```bash
# 1. Configurer .env
NODE_ENV=production

# 2. Démarrer le serveur
cd backend
npm start

# 3. Vérifier la console
# Vous devriez voir :
# 🔒 Rate limiting en mode PRODUCTION (limites strictes)
```

**Résultat :** Toutes les protections sont actives ! 🔒

---

## 🔍 Comment Savoir si C'est Actif ?

### **1. Console Backend**

Au démarrage du serveur, vous verrez :

```
✅ Connexion à la base de données PostgreSQL établie
🔓 Rate limiting DÉSACTIVÉ (mode développement)  ← ICI
🚀 Serveur StageConnect démarré avec succès !
```

### **2. Test Manuel**

```bash
# Faire 100 requêtes rapidement
for i in {1..100}; do curl http://localhost:5000/api/health; done

# Si désactivé : Toutes les requêtes passent ✅
# Si activé : Erreur 429 après la limite ❌
```

### **3. Headers HTTP**

Quand activé, vous verrez ces headers :

```
RateLimit-Limit: 1000
RateLimit-Remaining: 999
RateLimit-Reset: 1698840000
```

Quand désactivé : Pas de headers `RateLimit-*`

---

## ⚙️ Code Technique

### **Bypass Automatique**

Chaque limiter utilise maintenant cette logique :

```javascript
const loginLimiter = !isRateLimitingEnabled 
  ? (req, res, next) => next()  // ✅ Bypass : passe directement
  : rateLimit({                 // ❌ Active : applique les limites
      windowMs: 15 * 60 * 1000,
      max: isDevelopment ? 50 : 5,
      // ...
    });
```

**Explication :**
- Si `isRateLimitingEnabled = false` → Fonction qui appelle `next()` (bypass)
- Si `isRateLimitingEnabled = true` → Applique le rate limiter normal

---

## 🎯 Cas d'Usage

### **Cas 1 : Développement Normal**

```env
NODE_ENV=development
# Pas de RATE_LIMITING_ENABLED
```

**Résultat :** Travaillez sans limites ! ✅

---

### **Cas 2 : Tester le Rate Limiting**

```env
NODE_ENV=development
RATE_LIMITING_ENABLED=true
```

**Résultat :** Limites souples activées pour tester

---

### **Cas 3 : Production**

```env
NODE_ENV=production
```

**Résultat :** Limites strictes activées automatiquement

---

## 📋 Checklist de Vérification

Avant de déployer en production :

- [ ] `NODE_ENV=production` dans `.env`
- [ ] Tester une route : doit retourner erreur 429 après la limite
- [ ] Vérifier les logs : `🔒 Rate limiting en mode PRODUCTION`
- [ ] Tester le login : max 5 tentatives en 15 min
- [ ] Tester les candidatures : max 10 par heure

---

## ✅ Avantages de Cette Solution

### **Pour le Développement**
- ✅ Aucune interruption pendant les tests
- ✅ Rechargements illimités de la page
- ✅ Tests de charge possibles
- ✅ Pas d'erreurs 429 inattendues
- ✅ Développement plus rapide

### **Pour la Production**
- ✅ Protection automatique activée
- ✅ Sécurité contre les attaques
- ✅ Prévention du spam
- ✅ Limites strictes appliquées
- ✅ Serveur protégé

### **Pour la Maintenance**
- ✅ Configuration centralisée
- ✅ Un seul fichier à modifier
- ✅ Pas besoin de commenter/décommenter du code
- ✅ Changement d'environnement facile

---

## 🚨 Dépannage

### **Problème : Rate limiting actif en dev**

**Symptôme :**
```
🔓 Rate limiting en mode DÉVELOPPEMENT (limites souples)
```

**Solution :**
```env
# Vérifier .env
NODE_ENV=development
# Supprimer cette ligne si elle existe :
# RATE_LIMITING_ENABLED=true
```

---

### **Problème : Rate limiting désactivé en production**

**Symptôme :**
```
🔓 Rate limiting DÉSACTIVÉ (mode développement)
```

**Solution :**
```env
# Corriger .env
NODE_ENV=production  # Pas 'development'
```

---

### **Problème : Erreur 429 en dev**

**Symptôme :**
```json
{
  "success": false,
  "message": "Trop de requêtes. Veuillez ralentir."
}
```

**Solution :**
```env
# .env
NODE_ENV=development
# Supprimer RATE_LIMITING_ENABLED

# Redémarrer le serveur
npm run dev
```

---

## 📝 Résumé

**Avant :**
- ❌ Rate limiting toujours actif
- ❌ Erreurs 429 en développement
- ❌ Besoin de commenter/décommenter du code
- ❌ Configuration complexe

**Maintenant :**
- ✅ Rate limiting intelligent (auto on/off)
- ✅ Aucune erreur en développement
- ✅ Configuration simple (1 variable)
- ✅ Production sécurisée automatiquement

---

**Dernière mise à jour : 01/11/2025 08:22**
**Statut : ✅ PRODUCTION READY**
