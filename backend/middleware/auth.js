const jwt = require('jsonwebtoken');

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant',
      });
    }

    // Vérifier et décoder le token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Token invalide ou expiré',
        });
      }

      // Ajouter les informations de l'utilisateur à la requête
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du token',
      error: error.message,
    });
  }
};

// Middleware pour vérifier le rôle de l'utilisateur
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.',
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
};
