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
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/offres', offresRoutes);
app.use('/api/candidatures', candidaturesRoutes);
app.use('/api/admin', adminRoutes);

// Route de test de la base de données
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      success: true,
      message: 'Serveur opérationnel',
      database: dbConnected ? 'Connectée' : 'Déconnectée',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de l\'état du serveur',
      error: error.message,
    });
  }
});

// ==========================================
// GESTION DES ERREURS 404
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.path,
  });
});

// ==========================================
// GESTION DES ERREURS GLOBALES
// ==========================================
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
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
    console.log(`🔐 Auth Routes: http://localhost:${PORT}/api/auth`);
    console.log(`🏢 Company Routes: http://localhost:${PORT}/api/company`);
    console.log(`🎓 Student Routes: http://localhost:${PORT}/api/student`);
    console.log(`💼 Offres Routes: http://localhost:${PORT}/api/offres`);
    console.log(`📝 Candidatures Routes: http://localhost:${PORT}/api/candidatures`);
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

// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const { testConnection } = require('./config/database');
// const { apiLimiter, speedLimiter } = require('./middleware/rateLimiter');
// const authRoutes = require('./routes/auth');
// const companyRoutes = require('./routes/company');
// const studentRoutes = require('./routes/student');
// const offresRoutes = require('./routes/offres');
// const candidaturesRoutes = require('./routes/candidatures');
// const adminRoutes = require('./routes/admin');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // ==========================================
// // MIDDLEWARES
//       // ==========================================

// // CORS - Autoriser les requêtes depuis le frontend
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true,
// }));

// // Parser JSON (avec limite augmentée pour les images en base64)
// app.use(express.json({ limit: '10mb' }));

// // Parser URL-encoded (avec limite augmentée)
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Logger des requêtes (développement)
// if (process.env.NODE_ENV === 'development') {
//   app.use((req, res, next) => {
//     console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//     next();
//   });
// }

// // Rate Limiting Global - Appliquer à toutes les routes API
// app.use('/api', speedLimiter); // Ralentissement progressif
// app.use('/api', apiLimiter); // Limite stricte

// // ==========================================
// // ROUTES
// // ==========================================

// // Route de test
// app.get('/', (req, res) => {
//   res.json({
//     success: true,
//     message: 'API StageConnect - Serveur en ligne',
//     version: '1.0.0',
//     timestamp: new Date().toISOString(),
//   });
// });

// // Routes d'authentification
// app.use('/api/auth', authRoutes);

// // Routes entreprise
// app.use('/api/company', companyRoutes);

// // Routes étudiant
// app.use('/api/student', studentRoutes);

// // Routes offres de stage
// app.use('/api/offres', offresRoutes);

// // Routes candidatures
// app.use('/api/candidatures', candidaturesRoutes);

// // Routes admin
// app.use('/api/admin', adminRoutes);

// // Route de test de la base de données
// app.get('/api/health', async (req, res) => {
//   try {
//     const dbConnected = await testConnection();
//     res.json({
//       success: true,
//       message: 'Serveur opérationnel',
//       database: dbConnected ? 'Connectée' : 'Déconnectée',
//       timestamp: new Date().toISOString(),
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors de la vérification de l\'état du serveur',
//       error: error.message,
//     });
//   }
// });

// // ==========================================
// // GESTION DES ERREURS 404
// // ==========================================
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route non trouvée',
//     path: req.path,
//   });
// });

// // ==========================================
// // GESTION DES ERREURS GLOBALES
// // ==========================================
// app.use((err, req, res, next) => {
//   console.error('Erreur serveur:', err.stack);
//   res.status(500).json({
//     success: false,
//     message: 'Erreur interne du serveur',
//     error: process.env.NODE_ENV === 'development' ? err.message : undefined,
//   });
// });

// // ==========================================
// // DÉMARRAGE DU SERVEUR
// // ==========================================
// const startServer = async () => {
//   try {
//     // Tester la connexion à la base de données
//     const dbConnected = await testConnection();
    
//   if (!dbConnected) {
//   console.warn('⚠️ Impossible de se connecter à la base de données au démarrage.');
//   console.warn('➡️ Le serveur démarre quand même. Render va réessayer automatiquement.');
// }


//     app.listen(PORT, () => {
//       console.log('\n' + '='.repeat(50));
//       console.log('🚀 Serveur EspaceStage démarré avec succès !');
//       console.log('='.repeat(50));
//       console.log(`📡 Port: ${PORT}`);
//       console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
//       console.log(`🔐 Auth Routes: http://localhost:${PORT}/api/auth`);
//       console.log(`🏢 Company Routes: http://localhost:${PORT}/api/company`);
//       console.log(`🎓 Student Routes: http://localhost:${PORT}/api/student`);
//       console.log(`💼 Offres Routes: http://localhost:${PORT}/api/offres`);
//       console.log(`📝 Candidatures Routes: http://localhost:${PORT}/api/candidatures`);
//     });
//   } catch (error) {
//     console.error('❌ Erreur lors du démarrage du serveur:', error);
//     process.exit(1);
//   }
// };

// // Gestion de l'arrêt gracieux
// process.on('SIGTERM', () => {
//   console.log('⚠️  SIGTERM reçu. Arrêt du serveur...');
//   process.exit(0);
// });

// process.on('SIGINT', () => {
//   console.log('\n⚠️  SIGINT reçu. Arrêt du serveur...');
//   process.exit(0);
// });

// // Démarrer le serveur
// startServer();

// module.exports = app;
