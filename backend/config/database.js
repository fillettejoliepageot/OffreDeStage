const { Pool } = require('pg');
require('dotenv').config();

// Configuration de base pour le pool de connexions
const pool = new Pool({
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
  application_name: 'stage-app'    // Nom de l'application pour le monitoring
});

// Gestion des événements du pool
pool.on('connect', () => {
  console.log('✅ Nouvelle connexion établie avec la base de données');
});

pool.on('acquire', () => {
  console.log(`🔹 Client récupéré du pool - Actifs: ${pool.totalCount - pool.idleCount}, En attente: ${pool.waitingCount}`);
});

pool.on('remove', () => {
  console.log('🔌 Connexion au pool supprimée');
});

pool.on('error', (err) => {
  console.error('❌ Erreur inattendue du pool de connexions:', {
    message: err.message,
    code: err.code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Fonction pour tester la connexion
const testConnection = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW()');
    console.log('✅ Test de connexion réussi');
    console.log('🕐 Heure du serveur:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    return false;
  } finally {
    client.release();
  }
};

// Vérification de l'état de la base de données
const checkHealth = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW() as time, pg_database_size(current_database()) as db_size, version() as version');
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
  } finally {
    client.release();
  }
};

// Vérification périodique de la connexion
const startHealthCheck = (interval = 30000) => {
  const check = async () => {
    try {
      const health = await checkHealth();
      if (health.status !== 'healthy') {
        console.warn('⚠️  Problème de connexion à la base de données:', health.error);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de santé:', error);
    }
  };
  
  // Exécuter immédiatement une première vérification
  check().catch(console.error);
  
  // Puis à intervalle régulier
  return setInterval(check, interval);
};

// Démarrer la vérification de santé
const healthCheckInterval = startHealthCheck();

// Nettoyage à l'arrêt du processus
const cleanup = () => {
  console.log('🧹 Nettoyage des connexions à la base de données...');
  clearInterval(healthCheckInterval);
  return pool.end().then(() => {
    console.log('✅ Connexions à la base de données fermées avec succès');
  }).catch(err => {
    console.error('❌ Erreur lors de la fermeture des connexions:', err);
  });
};

// Gestion des signaux d'arrêt
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

module.exports = {
  pool,
  testConnection,
  checkHealth,
  cleanup,
  query: (text, params) => pool.query(text, params)
};
// };
