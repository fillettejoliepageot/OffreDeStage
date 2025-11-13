# 🔐 Plan de Renforcement de l'Authentification - StageConnect

**Date:** 30 Octobre 2025  
**Priorité:** Haute - Sécurité

---

## 🎯 Objectifs

Renforcer la sécurité de l'authentification pour protéger les comptes utilisateurs contre :
- ✅ Les attaques par force brute
- ✅ Les tentatives de connexion multiples
- ✅ Le vol de session
- ✅ Les comptes compromis
- ✅ Les bots et scripts automatisés

---

## 📊 État Actuel de la Sécurité

### ✅ Déjà Implémenté

- [x] Hashage des mots de passe avec bcrypt (10 rounds)
- [x] Tokens JWT avec expiration (7 jours)
- [x] Validation des données d'entrée
- [x] Protection CORS
- [x] Gestion des comptes bloqués
- [x] Rôles utilisateurs (student, company, admin)

### ❌ Manquant (À Implémenter)

- [ ] Rate limiting (limitation des tentatives)
- [ ] Authentification à deux facteurs (2FA)
- [ ] Détection des connexions suspectes
- [ ] Historique des connexions
- [ ] Tokens de refresh
- [ ] Captcha sur login/register
- [ ] Politique de mot de passe fort
- [ ] Verrouillage temporaire après échecs
- [ ] Notifications de connexion
- [ ] Session management avancé

---

## 🚀 Améliorations Proposées (Par Priorité)

### 🔴 **Priorité 1 - CRITIQUE (À faire immédiatement)**

#### 1. Rate Limiting (Anti Brute Force)

**Impact:** ⭐⭐⭐⭐⭐  
**Effort:** 1 heure  
**Description:** Limiter le nombre de tentatives de connexion par IP

**Fonctionnalités:**
- Maximum 5 tentatives de connexion par 15 minutes
- Maximum 3 demandes de réinitialisation par heure
- Maximum 10 inscriptions par IP par jour
- Réponse 429 "Too Many Requests"

**Technologies:**
- `express-rate-limit`
- `express-slow-down`

---

#### 2. Verrouillage de Compte Automatique

**Impact:** ⭐⭐⭐⭐⭐  
**Effort:** 2 heures  
**Description:** Bloquer temporairement un compte après échecs répétés

**Fonctionnalités:**
- Verrouillage après 5 échecs de connexion
- Durée: 30 minutes
- Email de notification envoyé
- Possibilité de débloquer par email

**Base de données:**
```sql
ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN last_failed_login TIMESTAMP WITH TIME ZONE;
```

---

#### 3. Politique de Mot de Passe Fort

**Impact:** ⭐⭐⭐⭐  
**Effort:** 1 heure  
**Description:** Imposer des mots de passe sécurisés

**Règles:**
- Minimum 12 caractères (au lieu de 8)
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial (!@#$%^&*)
- Pas de mots du dictionnaire
- Pas d'informations personnelles (nom, email)

**Librairie:**
- `zxcvbn` (estimation de la force du mot de passe)

---

### 🟠 **Priorité 2 - HAUTE (Semaine 1)**

#### 4. Authentification à Deux Facteurs (2FA)

**Impact:** ⭐⭐⭐⭐⭐  
**Effort:** 8 heures  
**Description:** Ajouter une couche de sécurité supplémentaire

**Options:**
- **TOTP** (Time-based One-Time Password) - Google Authenticator, Authy
- **SMS** (code à 6 chiffres)
- **Email** (code à 6 chiffres)

**Fonctionnalités:**
- Activation optionnelle par l'utilisateur
- QR Code pour configuration
- Codes de secours (10 codes)
- Option "Se souvenir de cet appareil" (30 jours)

**Technologies:**
- `speakeasy` (génération TOTP)
- `qrcode` (génération QR code)

**Base de données:**
```sql
CREATE TABLE two_factor_auth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  secret VARCHAR(255) NOT NULL,
  enabled BOOLEAN DEFAULT false,
  backup_codes TEXT[], -- Array de codes de secours
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE trusted_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device_fingerprint VARCHAR(255) NOT NULL,
  device_name VARCHAR(255),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

#### 5. Historique des Connexions

**Impact:** ⭐⭐⭐⭐  
**Effort:** 3 heures  
**Description:** Tracer toutes les connexions pour détecter les activités suspectes

**Informations enregistrées:**
- Date et heure
- Adresse IP
- User-Agent (navigateur, OS)
- Localisation (pays, ville)
- Succès/Échec
- Appareil (desktop, mobile, tablet)

**Technologies:**
- `geoip-lite` (géolocalisation IP)
- `ua-parser-js` (parsing User-Agent)

**Base de données:**
```sql
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  country VARCHAR(100),
  city VARCHAR(100),
  success BOOLEAN NOT NULL,
  failure_reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_login_history_user ON login_history(user_id);
CREATE INDEX idx_login_history_date ON login_history(created_at);
CREATE INDEX idx_login_history_ip ON login_history(ip_address);
```

---

#### 6. Détection de Connexions Suspectes

**Impact:** ⭐⭐⭐⭐  
**Effort:** 4 heures  
**Description:** Alerter l'utilisateur en cas d'activité inhabituelle

**Critères de détection:**
- Connexion depuis un nouveau pays
- Connexion depuis un nouvel appareil
- Connexion après plusieurs échecs
- Connexion à des heures inhabituelles
- Plusieurs connexions simultanées

**Actions:**
- Email d'alerte immédiat
- Notification dans l'application
- Option de bloquer la session
- Demande de vérification 2FA

---

#### 7. Refresh Tokens

**Impact:** ⭐⭐⭐⭐  
**Effort:** 3 heures  
**Description:** Améliorer la gestion des sessions

**Fonctionnalités:**
- Access Token (courte durée: 15 minutes)
- Refresh Token (longue durée: 7 jours)
- Rotation automatique des tokens
- Révocation possible
- Stockage sécurisé (httpOnly cookies)

**Base de données:**
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
```

---

### 🟡 **Priorité 3 - MOYENNE (Semaine 2)**

#### 8. Google reCAPTCHA v3

**Impact:** ⭐⭐⭐  
**Effort:** 2 heures  
**Description:** Protéger contre les bots

**Où l'appliquer:**
- Page de connexion
- Page d'inscription
- Formulaire de mot de passe oublié

**Technologies:**
- Google reCAPTCHA v3 (invisible)
- Score de confiance (0.0 à 1.0)

---

#### 9. Notifications de Sécurité

**Impact:** ⭐⭐⭐  
**Effort:** 2 heures  
**Description:** Informer l'utilisateur des événements de sécurité

**Événements notifiés:**
- Nouvelle connexion
- Changement de mot de passe
- Changement d'email
- Activation/Désactivation 2FA
- Connexion depuis un nouvel appareil
- Tentatives de connexion échouées

**Canaux:**
- Email
- Notification in-app
- SMS (optionnel)

---

#### 10. Session Management Avancé

**Impact:** ⭐⭐⭐  
**Effort:** 3 heures  
**Description:** Gérer les sessions actives

**Fonctionnalités:**
- Voir toutes les sessions actives
- Localisation de chaque session
- Déconnecter une session spécifique
- Déconnecter toutes les autres sessions
- Expiration automatique après inactivité

**Interface utilisateur:**
```
Mes Sessions Actives
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖥️  Windows - Chrome
    Paris, France
    Actif maintenant
    [C'est cet appareil]

📱  iPhone - Safari
    Lyon, France  
    Actif il y a 2 heures
    [Déconnecter]

💻  MacBook - Firefox
    Marseille, France
    Actif il y a 3 jours
    [Déconnecter]

[Déconnecter toutes les autres sessions]
```

---

### 🟢 **Priorité 4 - BASSE (Nice to Have)**

#### 11. Connexion Sociale (OAuth)

**Impact:** ⭐⭐  
**Effort:** 6 heures  
**Description:** Permettre la connexion via Google, LinkedIn

**Avantages:**
- Expérience utilisateur simplifiée
- Pas de mot de passe à retenir
- Authentification déléguée à des services sûrs

**Providers:**
- Google OAuth 2.0
- LinkedIn OAuth 2.0
- Microsoft Azure AD (pour les entreprises)

---

#### 12. Biométrie (WebAuthn)

**Impact:** ⭐⭐  
**Effort:** 8 heures  
**Description:** Authentification par empreinte digitale, Face ID

**Technologies:**
- WebAuthn API
- FIDO2
- Passkeys

---

#### 13. Analyse de Risque en Temps Réel

**Impact:** ⭐⭐  
**Effort:** 10 heures  
**Description:** Scoring de risque pour chaque connexion

**Facteurs analysés:**
- Vitesse de frappe
- Mouvements de souris
- Heure de connexion
- Localisation
- Appareil
- Comportement historique

---

## 📋 Plan d'Implémentation Recommandé

### **Semaine 1 - Fondations (15 heures)**

**Jour 1-2:**
1. ✅ Rate Limiting (1h)
2. ✅ Verrouillage de compte (2h)
3. ✅ Politique de mot de passe fort (1h)

**Jour 3-4:**
4. ✅ Historique des connexions (3h)
5. ✅ Détection de connexions suspectes (4h)

**Jour 5:**
6. ✅ Refresh Tokens (3h)
7. ✅ Tests et documentation (1h)

### **Semaine 2 - Fonctionnalités Avancées (20 heures)**

**Jour 1-3:**
8. ✅ Authentification à deux facteurs (8h)

**Jour 4:**
9. ✅ Google reCAPTCHA (2h)
10. ✅ Notifications de sécurité (2h)

**Jour 5:**
11. ✅ Session Management (3h)
12. ✅ Interface utilisateur (3h)
13. ✅ Tests complets (2h)

---

## 🛠️ Technologies et Packages Nécessaires

### Backend (Node.js)

```bash
npm install express-rate-limit express-slow-down
npm install speakeasy qrcode
npm install geoip-lite ua-parser-js
npm install zxcvbn
npm install helmet
npm install express-validator
```

### Frontend (React/Next.js)

```bash
npm install react-google-recaptcha
npm install qrcode.react
npm install @fingerprintjs/fingerprintjs
```

---

## 📊 Tableau Comparatif des Solutions

| Fonctionnalité | Impact | Effort | Coût | Priorité |
|----------------|--------|--------|------|----------|
| Rate Limiting | ⭐⭐⭐⭐⭐ | 1h | Gratuit | 🔴 Critique |
| Verrouillage compte | ⭐⭐⭐⭐⭐ | 2h | Gratuit | 🔴 Critique |
| Mot de passe fort | ⭐⭐⭐⭐ | 1h | Gratuit | 🔴 Critique |
| 2FA (TOTP) | ⭐⭐⭐⭐⭐ | 8h | Gratuit | 🟠 Haute |
| Historique connexions | ⭐⭐⭐⭐ | 3h | Gratuit | 🟠 Haute |
| Détection suspecte | ⭐⭐⭐⭐ | 4h | Gratuit | 🟠 Haute |
| Refresh Tokens | ⭐⭐⭐⭐ | 3h | Gratuit | 🟠 Haute |
| reCAPTCHA | ⭐⭐⭐ | 2h | Gratuit | 🟡 Moyenne |
| Notifications | ⭐⭐⭐ | 2h | Gratuit | 🟡 Moyenne |
| Session Management | ⭐⭐⭐ | 3h | Gratuit | 🟡 Moyenne |
| OAuth Social | ⭐⭐ | 6h | Gratuit | 🟢 Basse |
| WebAuthn | ⭐⭐ | 8h | Gratuit | 🟢 Basse |

---

## 🎯 Recommandation Finale

### **Pour un MVP Sécurisé (Semaine 1):**

Implémentez au minimum :
1. ✅ Rate Limiting
2. ✅ Verrouillage de compte
3. ✅ Politique de mot de passe fort
4. ✅ Historique des connexions

**Temps total:** ~10 heures  
**Résultat:** Protection contre 80% des attaques courantes

### **Pour une Plateforme Production-Ready (Semaine 1-2):**

Ajoutez :
5. ✅ Authentification à deux facteurs
6. ✅ Détection de connexions suspectes
7. ✅ Refresh Tokens
8. ✅ reCAPTCHA

**Temps total:** ~25 heures  
**Résultat:** Sécurité de niveau entreprise

---

## 📝 Prochaines Étapes

**Voulez-vous que je commence par implémenter :**

### Option A: Quick Wins (4 heures)
- Rate Limiting
- Verrouillage de compte
- Politique de mot de passe fort

### Option B: Fonctionnalité Majeure (8 heures)
- Authentification à deux facteurs (2FA) complète

### Option C: Package Complet (25 heures)
- Toutes les fonctionnalités priorité 1 et 2

**Quelle option préférez-vous ? 🚀**

---

**Dernière mise à jour:** 30 Octobre 2025  
**Statut:** Prêt à implémenter
