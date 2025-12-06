const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Déterminer si on est en développement
const isDevelopment = process.env.NODE_ENV === 'development';

// Vérifier si le rate limiting est activé (désactivé par défaut en dev)
const isRateLimitingEnabled = process.env.RATE_LIMITING_ENABLED === 'true' || !isDevelopment;

// Log du mode de rate limiting
if (!isRateLimitingEnabled) {
  console.log('🔓 Rate limiting DÉSACTIVÉ (mode développement)');
} else if (isDevelopment) {
  console.log('🔓 Rate limiting en mode DÉVELOPPEMENT (limites souples)');
} else {
  console.log('🔒 Rate limiting en mode PRODUCTION (limites strictes)');
}

// ==========================================
// RATE LIMITER POUR LA CONNEXION
// ==========================================
// Limite stricte : 5 tentatives par 15 minutes (production)
// Limite souple : 50 tentatives par 15 minutes (développement)
// Bypass complet si désactivé
const loginLimiter = !isRateLimitingEnabled ? (req, res, next) => next() : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 50 : 5, // 50 en dev, 5 en production
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Retourne les headers `RateLimit-*`
  legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
  skipSuccessfulRequests: false, // Compte toutes les requêtes (même réussies)
  skipFailedRequests: false, // Compte aussi les requêtes échouées
  handler: (req, res) => {
    console.log(`⚠️  Rate limit dépassé pour IP: ${req.ip} sur /login`);
    res.status(429).json({
      success: false,
      message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
      retryAfter: '15 minutes',
    });
  },
});

// ==========================================
// RATE LIMITER POUR L'INSCRIPTION
// ==========================================
// Limite modérée : 3 inscriptions par heure par IP (production)
// Limite souple : 30 inscriptions par heure (développement)
const registerLimiter = !isRateLimitingEnabled ? (req, res, next) => next() : rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: isDevelopment ? 30 : 3, // 30 en dev, 3 en production
  message: {
    success: false,
    message: 'Trop de tentatives d\'inscription. Veuillez réessayer dans 1 heure.',
    retryAfter: '1 heure',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    console.log(`⚠️  Rate limit dépassé pour IP: ${req.ip} sur /register`);
    res.status(429).json({
      success: false,
      message: 'Trop de tentatives d\'inscription. Veuillez réessayer dans 1 heure.',
      retryAfter: '1 heure',
    });
  },
});

// ==========================================
// RATE LIMITER POUR MOT DE PASSE OUBLIÉ
// ==========================================
// Limite stricte : 3 demandes par heure
const forgotPasswordLimiter = !isRateLimitingEnabled ? (req, res, next) => next() : rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // Maximum 3 demandes par heure
  message: {
    success: false,
    message: 'Trop de demandes de réinitialisation. Veuillez réessayer dans 1 heure.',
    retryAfter: '1 heure',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    console.log(`⚠️  Rate limit dépassé pour IP: ${req.ip} sur /forgot-password`);
    res.status(429).json({
      success: false,
      message: 'Trop de demandes de réinitialisation. Veuillez réessayer dans 1 heure.',
      retryAfter: '1 heure',
    });
  },
});

// ==========================================
// RATE LIMITER POUR RÉINITIALISATION
// ==========================================
// Limite stricte : 5 tentatives par heure
const resetPasswordLimiter = !isRateLimitingEnabled ? (req, res, next) => next() : rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // Maximum 5 tentatives par heure
  message: {
    success: false,
    message: 'Trop de tentatives de réinitialisation. Veuillez réessayer dans 1 heure.',
    retryAfter: '1 heure',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`⚠️  Rate limit dépassé pour IP: ${req.ip} sur /reset-password`);
    res.status(429).json({
      success: false,
      message: 'Trop de tentatives de réinitialisation. Veuillez réessayer dans 1 heure.',
      retryAfter: '1 heure',
    });
  },
});

// ==========================================
// RATE LIMITER GÉNÉRAL POUR L'API
// ==========================================
// Limite générale : 100 requêtes par 15 minutes (production)
// Limite souple : 1000 requêtes par 15 minutes (développement)
const apiLimiter = !isRateLimitingEnabled ? (req, res, next) => next() : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // 1000 en dev, 100 en production
  message: {
    success: false,
    message: 'Trop de requêtes. Veuillez ralentir.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`⚠️  Rate limit général dépassé pour IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Trop de requêtes. Veuillez ralentir.',
      retryAfter: '15 minutes',
    });
  },
});

// ==========================================
// SPEED LIMITER (Ralentissement progressif)
// ==========================================
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Commence à ralentir après 50 requêtes
  delayMs: 100, // Ajoute 100ms de délai par requête après la limite
  maxDelayMs: 5000, // Délai maximum de 5 secondes
});

// ==========================================
// RATE LIMITER POUR LES ROUTES ADMIN
// ==========================================
// Limite stricte pour les opérations sensibles
const adminLimiter = !isRateLimitingEnabled ? (req, res, next) => next() : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Maximum 50 requêtes par fenêtre
  message: {
    success: false,
    message: 'Trop de requêtes administratives. Veuillez réessayer plus tard.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`⚠️  Rate limit admin dépassé pour IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Trop de requêtes administratives. Veuillez réessayer plus tard.',
      retryAfter: '15 minutes',
    });
  },
});

// ==========================================
// RATE LIMITER POUR LES CANDIDATURES
// ==========================================
// Empêche le spam de candidatures
const candidatureLimiter = !isRateLimitingEnabled ? (req, res, next) => next() : rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // Maximum 10 candidatures par heure
  message: {
    success: false,
    message: 'Trop de candidatures envoyées. Veuillez réessayer dans 1 heure.',
    retryAfter: '1 heure',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    console.log(`⚠️  Rate limit candidatures dépassé pour IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Trop de candidatures envoyées. Veuillez réessayer dans 1 heure.',
      retryAfter: '1 heure',
    });
  },
});

// ==========================================
// RATE LIMITER POUR LA CRÉATION D'OFFRES
// ==========================================
// Empêche le spam d'offres
const createOffreLimiter = !isRateLimitingEnabled ? (req, res, next) => next() : rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // Maximum 20 offres par heure
  message: {
    success: false,
    message: 'Trop d\'offres créées. Veuillez réessayer dans 1 heure.',
    retryAfter: '1 heure',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`⚠️  Rate limit création offres dépassé pour IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Trop d\'offres créées. Veuillez réessayer dans 1 heure.',
      retryAfter: '1 heure',
    });
  },
});

module.exports = {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  apiLimiter,
  speedLimiter,
  adminLimiter,
  candidatureLimiter,
  createOffreLimiter,
};
