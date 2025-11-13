/**
 * Script de Test - Rate Limiting
 * 
 * Ce script teste les limites de rate limiting sur les routes d'authentification
 * 
 * Usage: node tests/test-rate-limiting.js
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
};

// Fonction pour attendre
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// TEST 1: Rate Limiting sur Login (5 tentatives)
// ==========================================
async function testLoginRateLimit() {
  log.test('TEST 1: Rate Limiting sur /api/auth/login (5 tentatives max)');
  console.log('─'.repeat(60));

  const testEmail = 'test@test.com';
  const testPassword = 'wrongpassword';

  let successCount = 0;
  let rateLimitedCount = 0;

  for (let i = 1; i <= 7; i++) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: testEmail,
        password: testPassword,
      });

      console.log(`Tentative ${i}: ${colors.green}200 OK${colors.reset}`);
      successCount++;
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`Tentative ${i}: ${colors.red}429 Too Many Requests${colors.reset}`);
        console.log(`  Message: ${error.response.data.message}`);
        rateLimitedCount++;
      } else if (error.response?.status === 401) {
        console.log(`Tentative ${i}: ${colors.yellow}401 Unauthorized (normal)${colors.reset}`);
        successCount++;
      } else {
        console.log(`Tentative ${i}: ${colors.red}${error.response?.status || 'ERROR'}${colors.reset}`);
      }
    }

    // Petite pause entre les requêtes
    await sleep(100);
  }

  console.log('─'.repeat(60));
  if (rateLimitedCount >= 2) {
    log.success(`TEST 1 RÉUSSI: ${rateLimitedCount} requêtes bloquées après la limite`);
  } else {
    log.error(`TEST 1 ÉCHOUÉ: Rate limiting non appliqué correctement`);
  }
  console.log('\n');
}

// ==========================================
// TEST 2: Rate Limiting sur Register (3 tentatives)
// ==========================================
async function testRegisterRateLimit() {
  log.test('TEST 2: Rate Limiting sur /api/auth/register (3 tentatives max)');
  console.log('─'.repeat(60));

  let successCount = 0;
  let rateLimitedCount = 0;

  for (let i = 1; i <= 5; i++) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email: `test${Date.now()}${i}@test.com`,
        password: 'Test1234',
        role: 'student',
        first_name: 'Test',
        last_name: 'User',
      });

      console.log(`Tentative ${i}: ${colors.green}201 Created${colors.reset}`);
      successCount++;
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`Tentative ${i}: ${colors.red}429 Too Many Requests${colors.reset}`);
        console.log(`  Message: ${error.response.data.message}`);
        rateLimitedCount++;
      } else if (error.response?.status === 409) {
        console.log(`Tentative ${i}: ${colors.yellow}409 Conflict (normal)${colors.reset}`);
        successCount++;
      } else {
        console.log(`Tentative ${i}: ${colors.red}${error.response?.status || 'ERROR'}${colors.reset}`);
      }
    }

    await sleep(100);
  }

  console.log('─'.repeat(60));
  if (rateLimitedCount >= 2) {
    log.success(`TEST 2 RÉUSSI: ${rateLimitedCount} requêtes bloquées après la limite`);
  } else {
    log.error(`TEST 2 ÉCHOUÉ: Rate limiting non appliqué correctement`);
  }
  console.log('\n');
}

// ==========================================
// TEST 3: Vérifier les Headers HTTP
// ==========================================
async function testRateLimitHeaders() {
  log.test('TEST 3: Vérification des Headers HTTP');
  console.log('─'.repeat(60));

  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@test.com',
      password: 'test',
    }, {
      validateStatus: () => true, // Accepter tous les status codes
    });

    const headers = response.headers;

    console.log('Headers reçus:');
    if (headers['ratelimit-limit']) {
      log.success(`RateLimit-Limit: ${headers['ratelimit-limit']}`);
    } else {
      log.warning('RateLimit-Limit: Non trouvé');
    }

    if (headers['ratelimit-remaining']) {
      log.success(`RateLimit-Remaining: ${headers['ratelimit-remaining']}`);
    } else {
      log.warning('RateLimit-Remaining: Non trouvé');
    }

    if (headers['ratelimit-reset']) {
      const resetTime = new Date(parseInt(headers['ratelimit-reset']) * 1000);
      log.success(`RateLimit-Reset: ${resetTime.toLocaleString()}`);
    } else {
      log.warning('RateLimit-Reset: Non trouvé');
    }

    console.log('─'.repeat(60));
    if (headers['ratelimit-limit'] && headers['ratelimit-remaining']) {
      log.success('TEST 3 RÉUSSI: Headers présents');
    } else {
      log.error('TEST 3 ÉCHOUÉ: Headers manquants');
    }
  } catch (error) {
    log.error(`Erreur lors du test: ${error.message}`);
  }
  console.log('\n');
}

// ==========================================
// TEST 4: Speed Limiting (Ralentissement)
// ==========================================
async function testSpeedLimiting() {
  log.test('TEST 4: Speed Limiting (Ralentissement progressif)');
  console.log('─'.repeat(60));
  log.info('Envoi de 10 requêtes rapides pour tester le ralentissement...');

  const times = [];

  for (let i = 1; i <= 10; i++) {
    const start = Date.now();
    
    try {
      await axios.get(`${API_URL}/../`); // Route de test
      const duration = Date.now() - start;
      times.push(duration);
      console.log(`Requête ${i}: ${duration}ms`);
    } catch (error) {
      console.log(`Requête ${i}: Erreur`);
    }
  }

  console.log('─'.repeat(60));
  
  // Vérifier si les temps augmentent (ralentissement)
  const firstThree = times.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const lastThree = times.slice(-3).reduce((a, b) => a + b, 0) / 3;

  console.log(`Temps moyen (3 premières): ${firstThree.toFixed(0)}ms`);
  console.log(`Temps moyen (3 dernières): ${lastThree.toFixed(0)}ms`);

  if (lastThree > firstThree) {
    log.success('TEST 4 RÉUSSI: Ralentissement détecté');
  } else {
    log.info('TEST 4: Pas de ralentissement détecté (normal si peu de requêtes)');
  }
  console.log('\n');
}

// ==========================================
// TEST 5: Réinitialisation après expiration
// ==========================================
async function testRateLimitReset() {
  log.test('TEST 5: Réinitialisation du compteur');
  console.log('─'.repeat(60));
  log.info('Ce test nécessite d\'attendre 15 minutes pour la réinitialisation...');
  log.warning('Test ignoré (trop long pour un test automatique)');
  console.log('─'.repeat(60));
  log.info('Pour tester manuellement: Attendez 15 minutes et réessayez');
  console.log('\n');
}

// ==========================================
// EXÉCUTION DES TESTS
// ==========================================
async function runAllTests() {
  console.log('\n');
  console.log('═'.repeat(60));
  console.log(`${colors.cyan}🧪 TESTS DE RATE LIMITING - StageConnect${colors.reset}`);
  console.log('═'.repeat(60));
  console.log(`API: ${API_URL}`);
  console.log(`Date: ${new Date().toLocaleString()}`);
  console.log('═'.repeat(60));
  console.log('\n');

  try {
    // Vérifier que le serveur est accessible
    log.info('Vérification de la connexion au serveur...');
    await axios.get(`${API_URL}/../`);
    log.success('Serveur accessible\n');

    // Exécuter les tests
    await testLoginRateLimit();
    await sleep(1000); // Pause entre les tests

    await testRegisterRateLimit();
    await sleep(1000);

    await testRateLimitHeaders();
    await sleep(1000);

    await testSpeedLimiting();
    await sleep(1000);

    await testRateLimitReset();

    // Résumé
    console.log('═'.repeat(60));
    log.success('TOUS LES TESTS TERMINÉS');
    console.log('═'.repeat(60));
    console.log('\n');
    log.info('Note: Si des tests échouent, vérifiez que:');
    console.log('  1. Le serveur backend est démarré (npm run dev)');
    console.log('  2. Le port 5000 est accessible');
    console.log('  3. Les middlewares sont correctement appliqués');
    console.log('\n');

  } catch (error) {
    log.error(`Erreur de connexion au serveur: ${error.message}`);
    log.warning('Assurez-vous que le backend est démarré sur http://localhost:5000');
    process.exit(1);
  }
}

// Lancer les tests
runAllTests();
