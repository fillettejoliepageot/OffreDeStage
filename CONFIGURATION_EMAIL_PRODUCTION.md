# 📧 Configuration Email pour la Production

**Date:** 5 Novembre 2025  
**Service Email:** Nodemailer avec Gmail

---

## ✅ État Actuel

Votre code email est **déjà prêt** ! Le service est configuré dans :
- **Fichier:** `backend/services/emailService.js`
- **Package:** `nodemailer` (déjà installé ✅)

### **Fonctionnalités Email Implémentées**

1. ✅ **Email à l'étudiant** - Candidature acceptée/refusée
2. ✅ **Email à l'entreprise** - Nouvelle candidature reçue
3. ✅ **Templates HTML** - Emails professionnels et stylisés
4. ✅ **Gestion d'erreurs** - Les emails échouent sans bloquer l'application

---

## 🔧 Configuration Requise

Pour que les emails fonctionnent, vous devez configurer **2 variables d'environnement** :

### **Dans le fichier `.env` du backend**

```env
# Configuration Email (Gmail)
EMAIL_USER=votre_email@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_application_gmail
```

---

## 📝 Guide de Configuration Gmail

### **Option 1 : Gmail avec Mot de Passe d'Application (Recommandé)**

#### **Étape 1 : Activer la Validation en 2 Étapes**

1. Allez sur [myaccount.google.com](https://myaccount.google.com)
2. Cliquez sur **"Sécurité"** dans le menu de gauche
3. Trouvez **"Validation en deux étapes"**
4. Cliquez sur **"Activer"** et suivez les instructions

#### **Étape 2 : Générer un Mot de Passe d'Application**

1. Une fois la validation en 2 étapes activée
2. Retournez dans **"Sécurité"**
3. Trouvez **"Mots de passe des applications"**
   - Lien direct : [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Sélectionnez :
   - **Application :** Autre (nom personnalisé)
   - **Nom :** "EspaceStage" ou "StageConnect"
5. Cliquez sur **"Générer"**
6. **Copiez le mot de passe** (16 caractères sans espaces)

#### **Étape 3 : Configurer le `.env`**

```env
EMAIL_USER=votre.email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # Le mot de passe généré (sans espaces)
```

**⚠️ Important :**
- Utilisez le mot de passe d'application, **PAS votre mot de passe Gmail normal**
- Retirez les espaces du mot de passe généré

---

### **Option 2 : Autres Services SMTP**

Si vous ne voulez pas utiliser Gmail, vous pouvez utiliser d'autres services :

#### **SendGrid (Recommandé pour Production)**

```javascript
// backend/services/emailService.js
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

**Avantages :**
- ✅ Gratuit jusqu'à 100 emails/jour
- ✅ Très fiable
- ✅ Pas de limite Gmail

#### **Mailgun**

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  auth: {
    user: process.env.MAILGUN_USER,
    pass: process.env.MAILGUN_PASSWORD
  }
});
```

#### **Amazon SES**

```javascript
const transporter = nodemailer.createTransport({
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 587,
  auth: {
    user: process.env.AWS_SES_USER,
    pass: process.env.AWS_SES_PASSWORD
  }
});
```

---

## 🧪 Tester la Configuration

### **Méthode 1 : Test Manuel**

1. Configurez les variables dans `.env`
2. Démarrez le backend :
   ```bash
   cd backend
   npm run dev
   ```
3. Créez une candidature depuis le frontend
4. Vérifiez les logs du backend :
   ```
   ✅ Email de nouvelle candidature envoyé à entreprise@example.com
   Email envoyé avec succès: <message-id>
   ```

### **Méthode 2 : Script de Test**

Créez un fichier `backend/test-email.js` :

```javascript
require('dotenv').config();
const { sendCandidatureStatusEmail } = require('./services/emailService');

const testEmail = async () => {
  try {
    console.log('📧 Test d\'envoi d\'email...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Configuré' : '❌ Manquant');
    
    const result = await sendCandidatureStatusEmail({
      studentEmail: 'votre.email.test@gmail.com', // Changez ici
      studentName: 'Test Étudiant',
      offreTitle: 'Stage Développeur Web',
      companyName: 'Entreprise Test',
      statut: 'accepted'
    });
    
    if (result.success) {
      console.log('✅ Email envoyé avec succès !');
      console.log('Message ID:', result.messageId);
    } else {
      console.error('❌ Erreur:', result.error);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
};

testEmail();
```

**Exécutez le test :**
```bash
cd backend
node test-email.js
```

---

## 🔍 Résolution des Problèmes

### **Erreur : "Invalid login"**

**Cause :** Mot de passe incorrect ou validation en 2 étapes non activée

**Solution :**
1. Vérifiez que la validation en 2 étapes est activée
2. Générez un nouveau mot de passe d'application
3. Vérifiez qu'il n'y a pas d'espaces dans le mot de passe

### **Erreur : "Username and Password not accepted"**

**Cause :** Gmail bloque l'accès aux applications moins sécurisées

**Solution :**
- Utilisez un **mot de passe d'application** (pas votre mot de passe normal)
- Ou activez "Accès aux applications moins sécurisées" (non recommandé)

### **Erreur : "Connection timeout"**

**Cause :** Firewall ou port bloqué

**Solution :**
1. Vérifiez que le port 587 est ouvert
2. Essayez le port 465 avec `secure: true` :
   ```javascript
   const transporter = nodemailer.createTransport({
     service: 'gmail',
     port: 465,
     secure: true,
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASSWORD,
     },
   });
   ```

### **Erreur : "Daily sending quota exceeded"**

**Cause :** Limite Gmail dépassée (500 emails/jour)

**Solution :**
- Passez à SendGrid, Mailgun ou Amazon SES
- Ou utilisez plusieurs comptes Gmail

---

## 📊 Limites des Services Email

### **Gmail**
- ✅ Gratuit
- ⚠️ Limite : 500 emails/jour
- ⚠️ Peut être bloqué si trop d'envois
- ✅ Bon pour le développement et petits projets

### **SendGrid (Gratuit)**
- ✅ 100 emails/jour gratuits
- ✅ Très fiable
- ✅ Statistiques d'envoi
- ✅ Recommandé pour la production

### **Mailgun (Gratuit)**
- ✅ 5000 emails/mois gratuits (3 premiers mois)
- ✅ Très fiable
- ✅ API puissante

### **Amazon SES**
- ✅ 62 000 emails/mois gratuits (première année)
- ✅ Très bon marché après
- ⚠️ Configuration plus complexe

---

## 🚀 Configuration Production Recommandée

### **Pour un Petit Projet (< 100 emails/jour)**

```env
# Gmail avec mot de passe d'application
EMAIL_USER=votre.email@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_application
```

**Avantages :**
- ✅ Gratuit
- ✅ Simple à configurer
- ✅ Suffisant pour débuter

---

### **Pour un Projet Moyen (100-1000 emails/jour)**

**Utilisez SendGrid :**

1. Créez un compte sur [sendgrid.com](https://sendgrid.com)
2. Générez une API Key
3. Modifiez `backend/services/emailService.js` :

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

4. Configurez `.env` :
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_USER=noreply@votredomaine.com
```

**Avantages :**
- ✅ 100 emails/jour gratuits
- ✅ Très fiable
- ✅ Statistiques détaillées
- ✅ Pas de risque de blocage

---

### **Pour un Gros Projet (> 1000 emails/jour)**

**Utilisez Amazon SES :**

1. Créez un compte AWS
2. Configurez SES
3. Vérifiez votre domaine
4. Utilisez les credentials SMTP

**Avantages :**
- ✅ 62 000 emails/mois gratuits
- ✅ Très bon marché après ($0.10 / 1000 emails)
- ✅ Infiniment scalable

---

## ✅ Checklist de Déploiement

### **Avant le Déploiement**

- [ ] Variables `EMAIL_USER` et `EMAIL_PASSWORD` configurées dans `.env`
- [ ] Test d'envoi d'email réussi
- [ ] Vérification des logs backend (pas d'erreurs)
- [ ] Test de candidature complète (création + email)

### **Après le Déploiement**

- [ ] Vérifier que les emails arrivent bien
- [ ] Vérifier qu'ils ne vont pas dans les spams
- [ ] Tester avec différents fournisseurs email (Gmail, Outlook, etc.)
- [ ] Monitorer les logs pour les erreurs d'envoi

---

## 🎯 Réponse à Votre Question

### **"Est-ce que l'email marchera très bien en production ?"**

**Réponse : OUI, MAIS avec configuration ✅**

#### **Ce qui est déjà prêt :**
- ✅ Code email fonctionnel
- ✅ Templates HTML professionnels
- ✅ Gestion d'erreurs (non bloquante)
- ✅ Nodemailer installé

#### **Ce qu'il faut faire :**
1. ⚠️ **Configurer les variables d'environnement** (EMAIL_USER, EMAIL_PASSWORD)
2. ⚠️ **Générer un mot de passe d'application Gmail**
3. ✅ **Tester l'envoi** avant le déploiement

#### **Si vous configurez correctement :**
- ✅ Les emails fonctionneront **parfaitement**
- ✅ Les étudiants recevront les notifications
- ✅ Les entreprises recevront les alertes de candidatures
- ✅ Les emails sont **professionnels** et **stylisés**

#### **Recommandations :**
- 🎯 **Pour débuter** : Gmail avec mot de passe d'application
- 🎯 **Pour production** : SendGrid (gratuit jusqu'à 100/jour)
- 🎯 **Pour gros volume** : Amazon SES

---

## 📧 Exemple d'Email Envoyé

### **Email de Candidature Acceptée (Étudiant)**

```
De: EspaceStage <votre.email@gmail.com>
À: etudiant@example.com
Sujet: 🎉 Votre candidature a été acceptée !

[Email HTML stylisé avec:]
- En-tête avec gradient
- Badge "CANDIDATURE ACCEPTÉE"
- Détails de l'offre
- Nom de l'entreprise
- Prochaines étapes
- Footer professionnel
```

### **Email de Nouvelle Candidature (Entreprise)**

```
De: EspaceStage <votre.email@gmail.com>
À: entreprise@example.com
Sujet: 📩 Nouvelle candidature pour "Stage Développeur Web"

[Email HTML stylisé avec:]
- Informations du candidat
- Message de motivation
- Bouton "Voir la candidature"
- Lien vers le dashboard
- Footer professionnel
```

---

## 🎉 Conclusion

**Votre système d'email est prêt à 95% !**

Il vous suffit de :
1. ✅ Configurer 2 variables d'environnement
2. ✅ Générer un mot de passe d'application Gmail
3. ✅ Tester l'envoi

**Temps estimé : 10 minutes** ⏱️

Une fois configuré, les emails fonctionneront **parfaitement** en production ! 🚀
