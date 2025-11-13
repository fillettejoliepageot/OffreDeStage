const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { loginLimiter, registerLimiter, forgotPasswordLimiter, resetPasswordLimiter } = require('../middleware/rateLimiter');

// ==========================================
// ROUTE : POST /api/auth/register
// Description : Inscription d'un nouvel utilisateur (student ou company)
// Protection : Rate limiting (3 inscriptions par heure)
// ==========================================
router.post('/register', registerLimiter, validateRegister, async (req, res) => {
  const client = await pool.connect();

  try {
    const { email, password, role, ...additionalData } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Un compte avec cet email existe déjà',
      });
    }

    // Démarrer une transaction
    await client.query('BEGIN');

    // Hasher le mot de passe avec bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insérer l'utilisateur dans la table users
    const userResult = await client.query(
      'INSERT INTO users (role, email, password_hash) VALUES ($1, $2, $3) RETURNING id, role, email, created_at',
      [role, email, passwordHash]
    );

    const user = userResult.rows[0];

    // Créer l'entrée correspondante selon le rôle
    if (role === 'student') {
      await client.query(
        'INSERT INTO students (user_id, first_name, last_name, domaine_etude) VALUES ($1, $2, $3, $4)',
        [
          user.id,
          additionalData.first_name || null,
          additionalData.last_name || null,
          additionalData.domaine_etude || null,
        ]
      );
    } else if (role === 'company') {
      await client.query(
        'INSERT INTO companies (user_id, company_name, sector, address) VALUES ($1, $2, $3, $4)',
        [
          user.id,
          additionalData.company_name || null,
          additionalData.sector || null,
          additionalData.address || null,
        ]
      );
    }

    // Valider la transaction
    await client.query('COMMIT');

    // Générer le token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
        },
        token,
      },
    });
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    await client.query('ROLLBACK');
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// ==========================================
// ROUTE : POST /api/auth/login
// Description : Connexion d'un utilisateur (student, company ou admin)
// Protection : Rate limiting (5 tentatives par 15 minutes)
// ==========================================
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Si le rôle est fourni, utiliser l'ancienne logique
    if (role) {
      // Récupérer l'utilisateur depuis la base de données avec le rôle
      const result = await pool.query(
        'SELECT id, role, email, password_hash, statut, created_at FROM users WHERE email = $1 AND role = $2',
        [email, role]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Email, mot de passe ou rôle incorrect',
        });
      }

      const user = result.rows[0];

      // Vérifier si le compte est bloqué
      if (user.statut === 'bloqué') {
        return res.status(403).json({
          success: false,
          message: 'Votre compte a été bloqué par un administrateur. Veuillez contacter le support.',
        });
      }

      // Vérifier le mot de passe
      let isPasswordValid;
      
      // Pour l'admin, utiliser la fonction crypt de PostgreSQL
      if (role === 'admin') {
        const cryptResult = await pool.query(
          'SELECT (password_hash = crypt($1, password_hash)) as is_valid FROM users WHERE id = $2',
          [password, user.id]
        );
        isPasswordValid = cryptResult.rows[0].is_valid;
      } else {
        // Pour student et company, utiliser bcrypt
        isPasswordValid = await bcrypt.compare(password, user.password_hash);
      }

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email, mot de passe ou rôle incorrect',
        });
      }
    } else {
      // Nouvelle logique : connexion sans rôle (détection automatique)
      // Récupérer l'utilisateur uniquement par email
      const result = await pool.query(
        'SELECT id, role, email, password_hash, statut, created_at FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect',
        });
      }

      const user = result.rows[0];

      // Vérifier si le compte est bloqué
      if (user.statut === 'bloqué') {
        return res.status(403).json({
          success: false,
          message: 'Votre compte a été bloqué par un administrateur. Veuillez contacter le support.',
        });
      }

      // Vérifier le mot de passe
      let isPasswordValid;
      
      // Pour l'admin, utiliser la fonction crypt de PostgreSQL
      if (user.role === 'admin') {
        const cryptResult = await pool.query(
          'SELECT (password_hash = crypt($1, password_hash)) as is_valid FROM users WHERE id = $2',
          [password, user.id]
        );
        isPasswordValid = cryptResult.rows[0].is_valid;
      } else {
        // Pour student et company, utiliser bcrypt
        isPasswordValid = await bcrypt.compare(password, user.password_hash);
      }

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect',
        });
      }
    }

    // Récupérer l'utilisateur final (soit de la première requête avec rôle, soit de la seconde sans rôle)
    const finalResult = role 
      ? await pool.query('SELECT id, role, email, created_at FROM users WHERE email = $1 AND role = $2', [email, role])
      : await pool.query('SELECT id, role, email, created_at FROM users WHERE email = $1', [email]);
    
    const user = finalResult.rows[0];

    // Récupérer les informations supplémentaires selon le rôle
    let additionalInfo = {};
    
    if (user.role === 'student') {
      const studentInfo = await pool.query(
        'SELECT id, first_name, last_name, domaine_etude, niveau_etude, specialisation, etablissement FROM students WHERE user_id = $1',
        [user.id]
      );
      if (studentInfo.rows.length > 0) {
        additionalInfo = studentInfo.rows[0];
      }
    } else if (user.role === 'company') {
      const companyInfo = await pool.query(
        'SELECT id, company_name, sector, address, description, logo_url FROM companies WHERE user_id = $1',
        [user.id]
      );
      if (companyInfo.rows.length > 0) {
        additionalInfo = companyInfo.rows[0];
      }
    }

    // Générer le token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          ...additionalInfo,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : GET /api/auth/me
// Description : Récupérer les informations de l'utilisateur connecté
// ==========================================
router.get('/me', async (req, res) => {
  try {
    // Récupérer le token depuis le header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant',
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer les informations de l'utilisateur
    const result = await pool.query(
      'SELECT id, role, email, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    const user = result.rows[0];

    // Récupérer les informations supplémentaires selon le rôle
    let additionalInfo = {};
    
    if (user.role === 'student') {
      const studentInfo = await pool.query(
        'SELECT id, first_name, last_name, domaine_etude, niveau_etude, specialisation, etablissement, cv_url FROM students WHERE user_id = $1',
        [user.id]
      );
      if (studentInfo.rows.length > 0) {
        additionalInfo = studentInfo.rows[0];
      }
    } else if (user.role === 'company') {
      const companyInfo = await pool.query(
        'SELECT id, company_name, sector, address, description, logo_url FROM companies WHERE user_id = $1',
        [user.id]
      );
      if (companyInfo.rows.length > 0) {
        additionalInfo = companyInfo.rows[0];
      }
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          ...user,
          ...additionalInfo,
        },
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Token invalide',
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Token expiré',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message,
    });
  }
});

module.exports = router;
