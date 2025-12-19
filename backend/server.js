// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg'); // Postgres
const { apiLimiter, speedLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/company');
const studentRoutes = require('./routes/student');
const offresRoutes = require('./routes/offres');
const candidaturesRoutes = require('./routes/candidatures');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// CONFIGURATION CORS POUR VERCEL + LOCAL
// ==========================================

// Liste des origines autorisées
const allowedOrigins = [
  // Développement local
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  
  // Votre domaine principal Vercel (si configuré)
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  
  // Vos domaines Vercel spécifiques
  'https://offre-de-stage2026-git-vercel-rea-5a9819-mjt2606-9585s-projects.vercel.app',
  'https://offre-de-stage2026-dts659nw7-mjt2606-9585s-projects.vercel.app',
  
  // Pattern pour tous les sous-domaines Vercel
  /\.vercel\.app$/,
  
  // Pour un éventuel domaine personnalisé
  process.env.FRONTEND_URL,
].filter(Boolean); // Filtrer les valeurs null/undefined

console.log('🌐 Origines autorisées:', allowedOrigins);

// Configuration CORS
const corsOptions = {
  origin: function (origin, callback) {
    // En développement, tout autoriser (pour Postman, curl, etc.)
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // En production, vérifier l'origine
    if (!origin) {
      // Requête sans origine (server-side, curl, etc.)
      return callback(null, true);
    }
    
    // Vérifier si l'origine est autorisée
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`🚫 Origine bloquée par CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Important pour les cookies/sessions
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Length', 'Authorization'],
  maxAge: 86400 // 24 heures
};

app.use(cors(corsOptions));

// ==========================================
// CONFIGURATION BASE DE DONNÉES
// ==========================================
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false, // obligatoire pour Render PostgreSQL
  },
});

// Fonction pour tester la connexion
const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Connexion réussie à PostgreSQL Render');
    console.log('🕐 Heure du serveur PostgreSQL:', res.rows[0].now);
    return true;
  } catch (err) {
    console.error('❌ Erreur de connexion PostgreSQL:', err.message);
    return false;
  }
};

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware pour logger les requêtes CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${origin || 'none'}`);
  next();
});

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

app.use('/api', speedLimiter);
app.use('/api', apiLimiter);

// ==========================================
// ROUTES
// ==========================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API StageConnect - Serveur en ligne',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    allowedOrigins: allowedOrigins,
    frontendUrl: process.env.FRONTEND_URL
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/offres', offresRoutes);
app.use('/api/candidatures', candidaturesRoutes);
app.use('/api/admin', adminRoutes);

// Route de test de la base de données améliorée
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      success: true,
      message: 'Serveur opérationnel',
      database: dbConnected ? 'Connectée' : 'Déconnectée',
      timestamp: new Date().toISOString(),
      cors: {
        origin: req.headers.origin,
        allowed: allowedOrigins.some(allowedOrigin => {
          if (allowedOrigin instanceof RegExp) {
            return allowedOrigin.test(req.headers.origin);
          }
          return allowedOrigin === req.headers.origin;
        })
      },
      environment: process.env.NODE_ENV,
      frontendUrl: process.env.FRONTEND_URL
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de l\'état du serveur',
      error: error.message,
    });
  }
});

// Route de test CORS spécifique
app.options('/api/test-cors', cors(corsOptions)); // Pré-flight
app.get('/api/test-cors', cors(corsOptions), (req, res) => {
  res.json({
    success: true,
    message: 'CORS test réussi',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// GESTION DES ERREURS 404
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.path,
    method: req.method,
    origin: req.headers.origin
  });
});

// ==========================================
// GESTION DES ERREURS GLOBALES
// ==========================================
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  
  // Gestion spécifique des erreurs CORS
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'Accès interdit par la politique CORS',
      origin: req.headers.origin,
      allowedOrigins: allowedOrigins.filter(o => !(o instanceof RegExp))
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ==========================================
// DÉMARRAGE DU SERVEUR
// ==========================================
const startServer = async () => {
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.warn('⚠️ Impossible de se connecter à la base de données au démarrage.');
    console.warn('➡️ Le serveur démarre quand même. Render va réessayer automatiquement.');
  }

  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 Serveur EspaceStage démarré avec succès !');
    console.log('='.repeat(50));
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Origines CORS autorisées:`, allowedOrigins);
    console.log(`🔐 Auth Routes: http://localhost:${PORT}/api/auth`);
    console.log(`🏢 Company Routes: http://localhost:${PORT}/api/company`);
    console.log(`🎓 Student Routes: http://localhost:${PORT}/api/student`);
    console.log(`💼 Offres Routes: http://localhost:${PORT}/api/offres`);
    console.log(`📝 Candidatures Routes: http://localhost:${PORT}/api/candidatures`);
    console.log(`📊 Test CORS: http://localhost:${PORT}/api/test-cors`);
  });
};

process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM reçu. Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT reçu. Arrêt du serveur...');
  process.exit(0);
});

// Démarrer le serveur
startServer();

module.exports = app;