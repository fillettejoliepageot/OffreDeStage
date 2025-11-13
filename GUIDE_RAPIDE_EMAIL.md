# 🚀 Guide Rapide - Configuration Email

## ⚡ Configuration en 3 Étapes

### Étape 1 : Créer le fichier .env
```bash
cd backend
cp .env.example .env
```

Ou créez manuellement un fichier `.env` dans le dossier `backend/`

### Étape 2 : Obtenir un Mot de Passe d'Application Gmail

1. **Activer la validation en deux étapes** :
   - Allez sur : https://myaccount.google.com/security
   - Activez "Validation en deux étapes"

2. **Générer un mot de passe d'application** :
   - Allez sur : https://myaccount.google.com/apppasswords
   - Sélectionnez "Mail" → "Autre (nom personnalisé)"
   - Nommez-le "StageConnect"
   - Copiez le mot de passe de 16 caractères

### Étape 3 : Configurer le fichier .env

Ouvrez `backend/.env` et ajoutez :

```env
# Configuration Email (Gmail)
EMAIL_USER=votre_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

Remplacez :
- `votre_email@gmail.com` par votre email Gmail
- `xxxx xxxx xxxx xxxx` par le mot de passe d'application généré

---

## ✅ Test

1. Redémarrez le serveur backend :
```bash
cd backend
npm run dev
```

2. Testez :
   - Connectez-vous en tant qu'entreprise
   - Acceptez ou refusez une candidature
   - L'étudiant reçoit un email sur son Gmail ! 📧

---

## 📧 Ce qui se passe maintenant

Quand une entreprise accepte/refuse une candidature :

1. ✅ **Dans l'application** : Le statut est mis à jour instantanément
2. ✅ **Par email** : L'étudiant reçoit un email professionnel avec :
   - Un design moderne
   - Les détails de l'offre
   - Le nom de l'entreprise
   - Les prochaines étapes

---

## ⚠️ Important

- **N'utilisez PAS** votre mot de passe Gmail normal
- **Utilisez UNIQUEMENT** le mot de passe d'application de 16 caractères
- Ne partagez jamais votre fichier `.env`
- Ajoutez `.env` dans votre `.gitignore` (déjà fait)

---

## 🐛 Problème ?

Consultez le fichier `CONFIGURATION_EMAIL_CANDIDATURES.md` pour plus de détails et le dépannage.
