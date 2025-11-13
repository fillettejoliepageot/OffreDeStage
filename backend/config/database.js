const { Pool } = require('pg');
require('dotenv').config();

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Options supplémentaires pour la production
  max: 20, // Nombre maximum de clients dans le pool
  idleTimeoutMillis: 30000, // Temps avant qu'un client inactif soit fermé
  connectionTimeoutMillis: 10000, // 10 secondes pour établir la connexion
  query_timeout: 30000, // 30 secondes pour exécuter une requête
});

// Test de connexion
pool.on('connect', () => {
  console.log('✅ Connexion à la base de données PostgreSQL établie');
});

pool.on('error', (err) => {
  console.error('❌ Erreur inattendue avec le client PostgreSQL:', err);
  process.exit(-1);
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
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
  query: (text, params) => pool.query(text, params),
};
