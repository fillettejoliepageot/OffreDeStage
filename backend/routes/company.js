const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// ==========================================
// ROUTE : GET /api/company/profile
// Description : Récupérer le profil de l'entreprise connectée
// Access : Private (Company only)
// ==========================================
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est une entreprise
    if (req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux entreprises.',
      });
    }

    // Récupérer le profil de l'entreprise
    const result = await pool.query(
      `SELECT c.*, u.email 
       FROM companies c
       JOIN users u ON c.user_id = u.id
       WHERE c.user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profil entreprise non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : POST /api/company/profile
// Description : Créer ou mettre à jour le profil de l'entreprise
// Access : Private (Company only)
// ==========================================
router.post('/profile', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est une entreprise
    if (req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux entreprises.',
      });
    }

    const {
      company_name,
      sector,
      address,
      logo_url,
      nombre_employes,
      telephone,
      description
    } = req.body;

    // Validation des champs obligatoires
    if (!company_name || !sector) {
      return res.status(400).json({
        success: false,
        message: 'Le nom de l\'entreprise et le secteur sont obligatoires',
      });
    }

    // Vérifier si le profil existe déjà
    const checkProfile = await pool.query(
      'SELECT id FROM companies WHERE user_id = $1',
      [req.user.id]
    );

    let result;

    if (checkProfile.rows.length > 0) {
      // Mise à jour du profil existant
      result = await pool.query(
        `UPDATE companies 
         SET company_name = $1, 
             sector = $2, 
             address = $3, 
             logo_url = $4, 
             nombre_employes = $5, 
             telephone = $6, 
             description = $7
         WHERE user_id = $8
         RETURNING *`,
        [company_name, sector, address, logo_url, nombre_employes, telephone, description, req.user.id]
      );

      res.status(200).json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: result.rows[0],
      });
    } else {
      // Création d'un nouveau profil
      result = await pool.query(
        `INSERT INTO companies 
         (user_id, company_name, sector, address, logo_url, nombre_employes, telephone, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [req.user.id, company_name, sector, address, logo_url, nombre_employes, telephone, description]
      );

      res.status(201).json({
        success: true,
        message: 'Profil créé avec succès',
        data: result.rows[0],
      });
    }
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : PUT /api/company/profile
// Description : Mettre à jour partiellement le profil
// Access : Private (Company only)
// ==========================================
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est une entreprise
    if (req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux entreprises.',
      });
    }

    const {
      company_name,
      sector,
      address,
      logo_url,
      nombre_employes,
      telephone,
      description
    } = req.body;

    // Vérifier si le profil existe
    const checkProfile = await pool.query(
      'SELECT id FROM companies WHERE user_id = $1',
      [req.user.id]
    );

    if (checkProfile.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profil non trouvé. Veuillez d\'abord créer votre profil.',
      });
    }

    // Construire la requête de mise à jour dynamiquement
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (company_name !== undefined) {
      updates.push(`company_name = $${paramCount}`);
      values.push(company_name);
      paramCount++;
    }
    if (sector !== undefined) {
      updates.push(`sector = $${paramCount}`);
      values.push(sector);
      paramCount++;
    }
    if (address !== undefined) {
      updates.push(`address = $${paramCount}`);
      values.push(address);
      paramCount++;
    }
    if (logo_url !== undefined) {
      updates.push(`logo_url = $${paramCount}`);
      values.push(logo_url);
      paramCount++;
    }
    if (nombre_employes !== undefined) {
      updates.push(`nombre_employes = $${paramCount}`);
      values.push(nombre_employes);
      paramCount++;
    }
    if (telephone !== undefined) {
      updates.push(`telephone = $${paramCount}`);
      values.push(telephone);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à mettre à jour',
      });
    }

    values.push(req.user.id);

    const query = `
      UPDATE companies 
      SET ${updates.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : GET /api/company/check-profile
// Description : Vérifier si l'entreprise a complété son profil
// Access : Private (Company only)
// ==========================================
router.get('/check-profile', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est une entreprise
    if (req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux entreprises.',
      });
    }

    const result = await pool.query(
      'SELECT id, company_name, sector FROM companies WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        hasProfile: false,
        message: 'Veuillez compléter votre profil entreprise',
      });
    }

    res.status(200).json({
      success: true,
      hasProfile: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : PUT /api/company/change-password
// Description : Changer le mot de passe de l'entreprise
// Access : Private (Company only)
// ==========================================
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est une entreprise
    if (req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux entreprises.',
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Validation des champs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe actuel et le nouveau mot de passe sont requis',
      });
    }

    // Validation de la longueur du nouveau mot de passe
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères',
      });
    }

    // Récupérer le mot de passe actuel de l'utilisateur
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    const user = userResult.rows[0];

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Le mot de passe actuel est incorrect',
      });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Mot de passe modifié avec succès',
    });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

module.exports = router;
