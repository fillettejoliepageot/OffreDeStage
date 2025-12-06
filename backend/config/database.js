
const { Pool } = require('pg');
require('dotenv').config();

// Configuration optimisée pour Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  
  // SSL obligatoire pour Render
  ssl: {
    rejectUnauthorized: false,
    // Amélioration des paramètres SSL
    sslmode: 'require',
    ssl: true
  },

  // Optimisation du pool de connexions
  max: 10,                          // Réduit pour éviter la surcharge
  min: 2,                           // Minimum de connexions maintenues
  idleTimeoutMillis: 10000,         // 10 secondes d'inactivité max
  connectionTimeoutMillis: 5000,    // 5 secondes max pour établir la connexion
  query_timeout: 10000,             // 10 secondes max par requête
  statement_timeout: 10000,         // 10 secondes max par statement
  application_name: 'stage-app',    // Identifiant pour le monitoring
  
  // Meilleure gestion des erreurs de connexion
  allowExitOnIdle: false,
  maxUses: 7500,                    // Recyclage périodique des connexions
  keepAlive: true,                  // Maintien des connexions actives
  keepAliveInitialDelayMillis: 1000 // Délai avant la première vérification
});

// Logs améliorés pour le suivi des connexions
pool.on('connect', (client) => {
  console.log('✅ Connexion PostgreSQL établie - Client ID:', process.pid);
});

pool.on('acquire', (client) => {
  console.log('🔹 Client récupéré du pool - Total:', pool.totalCount, 'Idle:', pool.idleCount, 'Waiting:', pool.waitingCount);
});

pool.on('remove', () => {
  console.log('🔌 Client retiré du pool');});

// Gestion des erreurs améliorée
pool.on('error', (err, client) => {
  console.error('❌ Erreur PostgreSQL:', {
    message: err.message,
    code: err.code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
  
  // Reconnexion automatique
  if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
    console.log('🔄 Tentative de reconnexion...');
  }
});

// Fonction pour tester la connexion
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('🕐 Heure du serveur PostgreSQL:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion PostgreSQL:', error.message);
    return false;
  }
};

// Fonction pour vérifier la santé de la base de données
const checkHealth = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time, pg_database_size(current_database()) as db_size, version() as version');
    client.release();
    return {
      status: 'healthy',
      timestamp: new Date(),
      database: {
        time: result.rows[0].time,
        version: result.rows[0].version,
        size: Math.round(result.rows[0].db_size / 1024 / 1024) + ' MB'
      },
      pool: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date()
    };
  }
};

module.exports = {
  pool,
  testConnection,
  checkHealth,
  query: (text, params) => pool.query(text, params),
};

// module.exports = {
//   pool,
//   testConnection,
//   query: (text, params) => pool.query(text, params),
// };
