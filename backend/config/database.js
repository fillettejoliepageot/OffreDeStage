
const { Pool } = require('pg');
require('dotenv').config();

// Configuration optimisée pour Render avec gestion des reconnexions
const createPool = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 
      `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    
    // Configuration SSL pour Render
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false,
      sslmode: 'require'
    } : false,

    // Optimisation du pool de connexions pour Render
    max: 5,                          // Réduit pour éviter la surcharge
    min: 1,                          // Minimum de connexions maintenues
    idleTimeoutMillis: 30000,        // 30 secondes d'inactivité max
    connectionTimeoutMillis: 10000,  // 10 secondes max pour établir la connexion
    query_timeout: 30000,            // 30 secondes max par requête
    statement_timeout: 30000,        // 30 secondes max par statement
    application_name: 'stage-app',   // Identifiant pour le monitoring
    
    // Gestion des reconnexions
    allowExitOnIdle: true,
    maxUses: 1000,                   // Recyclage plus fréquent des connexions
    keepAlive: true,                 // Maintien des connexions actives
    keepAliveInitialDelayMillis: 0,  // Vérification immédiate
    
    // Délai entre les tentatives de reconnexion
    retry_strategy: (options) => {
      if (options.error && options.error.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('🔌 Connexion perdue, tentative de reconnexion...');
        return 1000; // 1 seconde avant de réessayer
      }
      if (options.error) {
        console.error('❌ Erreur de connexion:', options.error);
      }
      // Réessayer après 2 secondes par défaut
      return 2000;
    }
  });
  
  return pool;
};

// Création du pool avec gestion des erreurs
try {
  var pool = createPool();
} catch (error) {
  console.error('❌ Erreur critique lors de la création du pool de connexions:', error);
  process.exit(1);
}

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
// Gestion des erreurs améliorée avec reconnexion automatique
pool.on('error', (err, client) => {
  console.error('❌ Erreur PostgreSQL:', {
    message: err.message,
    code: err.code,
    // Reconnexion automatique pour les erreurs de connexion
    action: (err.code === 'ECONNRESET' || err.code === 'EPIPE' || err.code === 'PROTOCOL_CONNECTION_LOST') 
      ? 'Tentative de reconnexion...' 
      : 'Vérifiez la configuration de la base de données',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
  
  // Reconnexion automatique
  if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
    console.log('🔄 Tentative de reconnexion...');
  }
});

// Fonction pour tester la connexion avec reconnexion automatique
const testConnection = async (maxRetries = 3, retryDelay = 2000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      console.log(`✅ Connexion PostgreSQL réussie (tentative ${attempt}/${maxRetries})`);
      console.log('🕐 Heure du serveur PostgreSQL:', result.rows[0].now);
      client.release();
      return true;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️  Échec de la connexion (${attempt}/${maxRetries}):`, error.message);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Nouvelle tentative dans ${retryDelay/1000} secondes...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  console.error('❌ Échec de la connexion après plusieurs tentatives:', lastError.message);
  return false;
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
