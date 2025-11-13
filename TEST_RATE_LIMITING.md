# 🧪 Test du Rate Limiting - Guide Rapide

**Date:** 30 Octobre 2025  
**Durée:** 5 minutes

---

## 🚀 Démarrage Rapide

### 1. Démarrer le Backend

```bash
cd backend
npm run dev
```

Vous devriez voir :
```
🚀 Serveur StageConnect démarré avec succès !
📡 Port: 5000
```

### 2. Lancer les Tests Automatiques

```bash
cd backend
node tests/test-rate-limiting.js
```

---

## 🧪 Tests Manuels

### Test 1: Limite de Connexion (5 tentatives)

**PowerShell:**
```powershell
# Tester 6 fois de suite
for ($i=1; $i -le 6; $i++) {
    Write-Host "Tentative $i"
    try {
        Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
            -Method Post `
            -ContentType "application/json" `
            -Body '{"email":"test@test.com","password":"wrong"}'
    } catch {
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
        Write-Host "Message: $($_.ErrorDetails.Message)"
    }
    Start-Sleep -Milliseconds 200
}
```

**Résultat attendu:**
```
Tentative 1: 401 (mauvais mot de passe)
Tentative 2: 401
Tentative 3: 401
Tentative 4: 401
Tentative 5: 401
Tentative 6: 429 (rate limit dépassé) ✅
```

---

### Test 2: Vérifier les Headers

**PowerShell:**
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"email":"test@test.com","password":"test"}' `
    -SkipHttpErrorCheck

# Afficher les headers
$response.Headers['RateLimit-Limit']
$response.Headers['RateLimit-Remaining']
$response.Headers['RateLimit-Reset']
```

**Résultat attendu:**
```
RateLimit-Limit: 5
RateLimit-Remaining: 4
RateLimit-Reset: 1698667200
```

---

### Test 3: Limite d'Inscription (3 tentatives)

**PowerShell:**
```powershell
for ($i=1; $i -le 4; $i++) {
    Write-Host "Inscription $i"
    $timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
    try {
        Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
            -Method Post `
            -ContentType "application/json" `
            -Body "{`"email`":`"test$timestamp$i@test.com`",`"password`":`"Test1234`",`"role`":`"student`",`"first_name`":`"Test`",`"last_name`":`"User`"}"
    } catch {
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    }
    Start-Sleep -Milliseconds 200
}
```

**Résultat attendu:**
```
Inscription 1: 201 (créé)
Inscription 2: 201
Inscription 3: 201
Inscription 4: 429 (rate limit dépassé) ✅
```

---

### Test 4: Test avec Postman/Insomnia

#### Configuration:

**URL:** `POST http://localhost:5000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "test@test.com",
  "password": "wrongpassword"
}
```

#### Procédure:

1. Envoyez la requête 5 fois rapidement
2. À la 6ème tentative, vous devriez recevoir:

```json
{
  "success": false,
  "message": "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.",
  "retryAfter": "15 minutes"
}
```

#### Vérifier les Headers:

Dans Postman, allez dans l'onglet "Headers" de la réponse :

```
RateLimit-Limit: 5
RateLimit-Remaining: 0
RateLimit-Reset: 1698667200
```

---

## 📊 Résumé des Limites

| Route | Limite | Fenêtre | Test |
|-------|--------|---------|------|
| `/api/auth/login` | 5 | 15 min | ✅ Testé |
| `/api/auth/register` | 3 | 1 heure | ✅ Testé |
| `/api/auth/forgot-password` | 3 | 1 heure | ⏳ À tester |
| `/api/auth/reset-password` | 5 | 1 heure | ⏳ À tester |
| `/api/candidatures` (POST) | 10 | 1 heure | ⏳ À tester |
| `/api/offres` (POST) | 20 | 1 heure | ⏳ À tester |
| `/api/admin/*` | 50 | 15 min | ⏳ À tester |
| `/api/*` (global) | 100 | 15 min | ✅ Testé |

---

## 🔍 Vérification des Logs

Regardez la console du backend pendant les tests :

**Logs attendus:**
```
2025-10-30T08:00:00.000Z - POST /api/auth/login
2025-10-30T08:00:01.000Z - POST /api/auth/login
2025-10-30T08:00:02.000Z - POST /api/auth/login
2025-10-30T08:00:03.000Z - POST /api/auth/login
2025-10-30T08:00:04.000Z - POST /api/auth/login
⚠️  Rate limit dépassé pour IP: ::1 sur /login
```

---

## ✅ Checklist de Validation

- [ ] Backend démarré sans erreur
- [ ] Test login: 6ème tentative bloquée (429)
- [ ] Test register: 4ème tentative bloquée (429)
- [ ] Headers `RateLimit-*` présents
- [ ] Logs affichent les dépassements
- [ ] Message d'erreur correct dans la réponse
- [ ] Compteur se réinitialise après 15 minutes

---

## 🐛 Dépannage

### Problème: Rate limiting ne fonctionne pas

**Solutions:**
1. Vérifiez que le middleware est importé dans `server.js`
2. Vérifiez que les routes utilisent le middleware
3. Redémarrez le backend
4. Videz le cache du navigateur

### Problème: Toutes les requêtes sont bloquées immédiatement

**Solutions:**
1. Vérifiez la limite configurée (peut-être trop basse)
2. Attendez 15 minutes pour la réinitialisation
3. Redémarrez le backend pour reset les compteurs

### Problème: Headers manquants

**Solutions:**
1. Vérifiez `standardHeaders: true` dans la config
2. Vérifiez avec `curl -v` ou Postman
3. Problème de CORS ? Vérifiez la config CORS

---

## 🎯 Test de Production

Avant de déployer en production, testez avec plusieurs IPs :

```bash
# Utiliser un VPN ou proxy pour changer d'IP
# Ou tester depuis plusieurs machines
```

---

## 📈 Résultats Attendus

**✅ Succès:**
- Rate limiting actif sur toutes les routes
- Headers présents
- Messages d'erreur clairs
- Logs corrects
- Protection efficace contre brute force

**❌ Échec:**
- Requêtes non limitées
- Pas de headers
- Pas de logs
- Serveur plante

---

## 🚀 Prochaines Étapes

Après validation du rate limiting :

1. ✅ Rate Limiting → **FAIT**
2. ⏳ Verrouillage de compte (2h)
3. ⏳ Politique de mot de passe fort (1h)
4. ⏳ Authentification 2FA (8h)

---

**Temps de test:** 5 minutes  
**Difficulté:** Facile  
**Statut:** ✅ Prêt à tester
