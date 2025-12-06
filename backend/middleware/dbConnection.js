const { Pool } = require('pg');
require('dotenv').config();

// Configuration de base pour le pool de connexions
const createPool = () => {
  return new Pool({
    connectionString: process.env.DATABASE_URL || 
      `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    
    // Configuration SSL pour la production
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false,
      sslmode: 'require'
    } : false,

    // Paramètres du pool
    max: 5,                          // Nombre maximum de clients dans le pool
    min: 1,                          // Nombre minimum de clients dans le pool
    idleTimeoutMillis: 30000,        // Temps d'inactivité avant libération
    connectionTimeoutMillis: 2000,   // Délai de connexion
    query_timeout: 30000,            // Timeout des requêtes
    statement_timeout: 30000,        // Timeout des statements
    application_name: 'stage-app',   // Nom de l'application pour le monitoring
  });
};

// Création du pool
const pool = createPool();

// Middleware de gestion des connexions
const withConnection = (handler) => {
  return async (req, res, next) => {
    const client = await pool.connect();
    
    // Ajouter le client à la requête pour utilisation ultérieure
    req.dbClient = client;
    
    try {
      // Exécuter le handler avec le client
      await handler(req, res, next);
    } catch (error) {
      console.error('Erreur de base de données:', error);
      
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Erreur de base de données',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    } finally {
      // Toujours libérer le client, même en cas d'erreur
      try {
        // Vérifier si la connexion est toujours valide avant de la libérer
        if (client && typeof client.release === 'function') {
          await client.query('SELECT 1');
          client.release();
        }
      } catch (releaseError) {
        console.error('Erreur lors de la libération de la connexion:', releaseError);
        // Forcer la fermeture de la connexion
        if (client && typeof client.end === 'function') {
          client.end().catch(console.error);
        }
      }
    }
  };
};

// Middleware pour les requêtes de lecture
const withReadOnlyConnection = withConnection;

// Middleware pour les requêtes d'écriture
const withWriteConnection = withConnection;

// Vérification de la connexion
const checkConnection = async () => {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    return false;
  } finally {
    client.release();
  }
};

// Gestionnaire d'erreurs pour le pool
pool.on('error', (err) => {
  console.error('Erreur inattendue du pool de connexions:', err);
  // Ne pas quitter le processus, laisser le pool gérer la reconnexion
});

// Vérification périodique de la connexion
const checkConnectionInterval = setInterval(async () => {
  const isConnected = await checkConnection();
  if (!isConnected) {
    console.warn('⚠️  Perte de connexion à la base de données. Tentative de reconnexion...');
  }
}, 30000); // Vérifier toutes les 30 secondes

// Nettoyage à l'arrêt du processus
process.on('SIGTERM', () => {
  clearInterval(checkConnectionInterval);
  pool.end();
});

module.exports = {
  pool,
  withConnection,
  withReadOnlyConnection,
  withWriteConnection,
  checkConnection
};
