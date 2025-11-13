// Middleware de validation des données
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Au moins 8 caractères
  return password && password.length >= 8;
};

// Validation pour l'inscription
const validateRegister = (req, res, next) => {
  const { email, password, role } = req.body;

  // Vérifier les champs requis
  if (!email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: 'Email, mot de passe et rôle sont requis',
    });
  }

  // Valider l'email
  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Format d\'email invalide',
    });
  }

  // Valider le mot de passe
  if (!validatePassword(password)) {
    return res.status(400).json({
      success: false,
      message: 'Le mot de passe doit contenir au moins 8 caractères',
    });
  }

  // Valider le rôle
  const validRoles = ['student', 'company'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Rôle invalide. Doit être "student" ou "company"',
    });
  }

  next();
};

// Validation pour la connexion
const validateLogin = (req, res, next) => {
  const { email, password, role } = req.body;

  // Vérifier les champs requis (rôle optionnel maintenant)
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email et mot de passe sont requis',
    });
  }

  // Valider l'email
  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Format d\'email invalide',
    });
  }

  // Valider le rôle seulement s'il est fourni
  if (role) {
    const validRoles = ['student', 'company', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide',
      });
    }
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};
