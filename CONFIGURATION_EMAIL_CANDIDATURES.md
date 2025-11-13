# Configuration des Emails pour les Candidatures

## 📧 Fonctionnalité Implémentée

Lorsqu'une entreprise accepte ou refuse une candidature, l'étudiant reçoit automatiquement :
1. **Une notification dans l'application** (page candidatures)
2. **Un email sur son adresse Gmail** avec les détails de la réponse

---

## 🔧 Configuration Requise

### 1. Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env` du backend :

```env
EMAIL_USER=votre_email@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_application_gmail
```

### 2. Configuration Gmail

Pour obtenir un **mot de passe d'application Gmail** :

#### Étape 1 : Activer la validation en deux étapes
1. Allez sur [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Cliquez sur "Validation en deux étapes"
3. Suivez les instructions pour l'activer

#### Étape 2 : Générer un mot de passe d'application
1. Allez sur [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Sélectionnez "Mail" comme application
3. Sélectionnez "Autre (nom personnalisé)" comme appareil
4. Nommez-le "StageConnect" ou "Backend Stage"
5. Cliquez sur "Générer"
6. **Copiez le mot de passe de 16 caractères** généré
7. Collez-le dans votre fichier `.env` comme valeur de `EMAIL_PASSWORD`

⚠️ **Important** : N'utilisez PAS votre mot de passe Gmail normal, utilisez uniquement le mot de passe d'application !

---

## 📁 Fichiers Modifiés/Créés

### 1. Service Email
**Fichier** : `backend/services/emailService.js`
- Service pour envoyer des emails avec nodemailer
- Templates HTML pour emails acceptés et refusés
- Gestion des erreurs d'envoi

### 2. Route Candidatures
**Fichier** : `backend/routes/candidatures.js`
- Import du service email
- Modification de la route `PUT /api/candidatures/:id/status`
- Récupération des informations de l'étudiant (email, nom)
- Envoi automatique d'email lors de l'acceptation ou du refus

### 3. Configuration
**Fichier** : `backend/.env.example`
- Ajout des variables `EMAIL_USER` et `EMAIL_PASSWORD`
- Instructions pour obtenir le mot de passe d'application

---

## 🎨 Templates d'Email

### Email d'Acceptation
- Design moderne avec dégradé violet
- Badge "CANDIDATURE ACCEPTÉE" en vert
- Détails de l'offre et de l'entreprise
- Prochaines étapes pour l'étudiant
- Footer avec copyright

### Email de Refus
- Design professionnel et respectueux
- Message de remerciement
- Encouragement à continuer les recherches
- Détails de l'offre concernée

---

## 🔄 Flux de Fonctionnement

1. **Entreprise** modifie le statut d'une candidature (accepté/refusé)
2. **Backend** met à jour le statut dans la base de données
3. **Backend** récupère les informations de l'étudiant et de l'offre
4. **Backend** envoie un email via Gmail à l'étudiant
5. **Étudiant** reçoit :
   - La mise à jour dans sa page "Mes Candidatures"
   - Un email sur sa boîte Gmail

---

## ✅ Test de la Fonctionnalité

### 1. Configurer l'environnement
```bash
cd backend
# Créer/modifier le fichier .env avec vos identifiants Gmail
```

### 2. Redémarrer le serveur backend
```bash
npm run dev
```

### 3. Tester l'envoi d'email
1. Connectez-vous en tant qu'entreprise
2. Allez dans "Candidatures reçues"
3. Acceptez ou refusez une candidature
4. Vérifiez :
   - Le statut est mis à jour dans l'application
   - L'étudiant reçoit un email sur son Gmail

---

## 🐛 Dépannage

### Erreur : "Invalid login"
- Vérifiez que vous utilisez un **mot de passe d'application**, pas votre mot de passe Gmail
- Vérifiez que la validation en deux étapes est activée

### Erreur : "Connection timeout"
- Vérifiez votre connexion internet
- Vérifiez que Gmail n'est pas bloqué par votre firewall

### L'email n'arrive pas
- Vérifiez les **spams** de l'étudiant
- Vérifiez les logs du serveur backend pour voir les erreurs
- Vérifiez que `EMAIL_USER` et `EMAIL_PASSWORD` sont correctement configurés

### Email envoyé mais candidature non mise à jour
- L'envoi d'email est non-bloquant : même si l'email échoue, le statut est mis à jour
- Vérifiez les logs pour voir les erreurs d'envoi

---

## 📊 Logs

Le backend affiche des logs pour le suivi :

```
✅ Email envoyé avec succès : <message-id>
Email de notification envoyé à etudiant@example.com
```

En cas d'erreur :
```
❌ Erreur lors de l'envoi de l'email: [détails de l'erreur]
```

---

## 🔒 Sécurité

- ✅ Utilisation de mots de passe d'application Gmail
- ✅ Variables d'environnement pour les credentials
- ✅ Pas de credentials hardcodés dans le code
- ✅ Gestion des erreurs sans exposer les détails sensibles
- ✅ L'envoi d'email n'empêche pas la mise à jour du statut

---

## 📦 Dépendances

La dépendance `nodemailer` est déjà installée dans le projet :

```json
"nodemailer": "^7.0.10"
```

Aucune installation supplémentaire n'est nécessaire.

---

## 🎯 Prochaines Améliorations Possibles

- [ ] Ajouter des emails pour d'autres événements (nouvelle candidature, etc.)
- [ ] Permettre la personnalisation des templates d'email
- [ ] Ajouter des pièces jointes (CV, etc.)
- [ ] Support d'autres services email (Outlook, etc.)
- [ ] File d'attente pour les emails (avec Redis/Bull)
- [ ] Statistiques d'envoi d'emails

---

## 📝 Notes

- Les emails sont envoyés de manière **asynchrone** pour ne pas bloquer la réponse API
- Si l'envoi d'email échoue, le statut de la candidature est quand même mis à jour
- Les emails sont au format HTML avec un design moderne et responsive
- Le service supporte Gmail uniquement pour le moment (facile à étendre)
