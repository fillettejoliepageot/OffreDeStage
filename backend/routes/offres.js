const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { createOffreLimiter } = require('../middleware/rateLimiter');

// ==========================================
// ROUTE : POST /api/offres
// Description : Créer une nouvelle offre de stage
// Access : Private (Company only)
// Protection : Rate limiting (20 offres par heure)
// ==========================================
router.post('/', createOffreLimiter, authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est une entreprise
    if (req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux entreprises.',
      });
    }

    const {
      title,
      description,
      domaine,
      nombre_places,
      localisation,
      type_stage,
      remuneration,
      montant_remuneration,
      date_debut,
      date_fin
    } = req.body;

    // Validation des champs obligatoires
    if (!title || !description || !domaine) {
      return res.status(400).json({
        success: false,
        message: 'Le titre, la description et le domaine sont obligatoires',
      });
    }

    // Récupérer l'ID de l'entreprise depuis la table companies
    const companyResult = await pool.query(
      'SELECT id FROM companies WHERE user_id = $1',
      [req.user.id]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profil entreprise non trouvé. Veuillez d\'abord créer votre profil.',
      });
    }

    const company_id = companyResult.rows[0].id;

    // Créer l'offre
    const result = await pool.query(
      `INSERT INTO offres 
       (title, description, domaine, nombre_places, localisation, type_stage, 
        remuneration, montant_remuneration, date_debut, date_fin, company_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        title,
        description,
        domaine,
        nombre_places || 1,
        localisation,
        type_stage,
        remuneration || false,
        montant_remuneration,
        date_debut,
        date_fin,
        company_id
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Offre créée avec succès',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : GET /api/offres/company/mes-offres
// Description : Récupérer les offres de l'entreprise connectée
// Access : Private (Company only)
// IMPORTANT : Cette route DOIT être avant /:id
  // ==========================================
router.get('/company/mes-offres', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est une entreprise
    if (req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux entreprises.',
      });
    }

    // Récupérer l'ID de l'entreprise
    const companyResult = await pool.query(
      'SELECT id FROM companies WHERE user_id = $1',
      [req.user.id]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profil entreprise non trouvé',
      });
    }

    const company_id = companyResult.rows[0].id;

    // Récupérer les offres de l'entreprise
    const result = await pool.query(
      `SELECT o.*, 
              (SELECT COUNT(*) FROM candidatures WHERE offre_id = o.id) as nombre_candidatures
       FROM offres o
       WHERE o.company_id = $1
       ORDER BY o.created_at DESC`,
      [company_id]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des offres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : GET /api/offres
// Description : Récupérer toutes les offres (avec filtres optionnels)
// Access : Public
// ==========================================
router.get('/', async (req, res) => {
  try {
    const { domaine, type_stage, localisation, remuneration, search } = req.query;

    let query = `
      SELECT o.*, c.company_name, c.logo_url, c.sector, c.telephone, c.address, c.description as company_description,
             u.email as company_email
      FROM offres o
      LEFT JOIN companies c ON o.company_id = c.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE o.statut = 'active'
    `;
    const values = [];
    let paramCount = 1;

    // Filtres
    if (domaine) {
      query += ` AND o.domaine = $${paramCount}`;
      values.push(domaine);
      paramCount++;
    }

    if (type_stage) {
      query += ` AND o.type_stage = $${paramCount}`;
      values.push(type_stage);
      paramCount++;
    }

    if (localisation) {
      query += ` AND o.localisation ILIKE $${paramCount}`;
      values.push(`%${localisation}%`);
      paramCount++;
    }

    if (remuneration !== undefined) {
      query += ` AND o.remuneration = $${paramCount}`;
      values.push(remuneration === 'true');
      paramCount++;
    }

    if (search) {
      query += ` AND (o.title ILIKE $${paramCount} OR o.description ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY o.created_at DESC';

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des offres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : GET /api/offres/:id
// Description : Récupérer une offre spécifique
// Access : Public
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT o.*, c.company_name, c.logo_url, c.sector, c.address, c.telephone, c.description as company_description,
              u.email as company_email
       FROM offres o
       LEFT JOIN companies c ON o.company_id = c.id
       LEFT JOIN users u ON c.user_id = u.id
       WHERE o.id = $1 AND o.statut = 'active'`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : PUT /api/offres/:id
// Description : Modifier une offre
// Access : Private (Company only - own offers)
// ==========================================
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est une entreprise
    if (req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux entreprises.',
      });
    }

    const { id } = req.params;
    const {
      title,
      description,
      domaine,
      nombre_places,
      localisation,
      type_stage,
      remuneration,
      montant_remuneration,
      date_debut,
      date_fin
    } = req.body;

    // Récupérer l'ID de l'entreprise
    const companyResult = await pool.query(
      'SELECT id FROM companies WHERE user_id = $1',
      [req.user.id]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profil entreprise non trouvé',
      });
    }

    const company_id = companyResult.rows[0].id;

    // Vérifier que l'offre appartient à l'entreprise
    const offreCheck = await pool.query(
      'SELECT id FROM offres WHERE id = $1 AND company_id = $2',
      [id, company_id]
    );

    if (offreCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée ou vous n\'avez pas les droits pour la modifier',
      });
    }

    // Mettre à jour l'offre
    const result = await pool.query(
      `UPDATE offres 
       SET title = $1, 
           description = $2, 
           domaine = $3, 
           nombre_places = $4, 
           localisation = $5, 
           type_stage = $6, 
           remuneration = $7, 
           montant_remuneration = $8, 
           date_debut = $9, 
           date_fin = $10
       WHERE id = $11
       RETURNING *`,
      [
        title,
        description,
        domaine,
        nombre_places,
        localisation,
        type_stage,
        remuneration,
        montant_remuneration,
        date_debut,
        date_fin,
        id
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Offre mise à jour avec succès',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : DELETE /api/offres/:id
// Description : Supprimer une offre
// Access : Private (Company only - own offers)
// ==========================================
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est une entreprise
    if (req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux entreprises.',
      });
    }

    const { id } = req.params;

    // Récupérer l'ID de l'entreprise
    const companyResult = await pool.query(
      'SELECT id FROM companies WHERE user_id = $1',
      [req.user.id]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profil entreprise non trouvé',
      });
    }

    const company_id = companyResult.rows[0].id;

    // Vérifier que l'offre appartient à l'entreprise
    const offreCheck = await pool.query(
      'SELECT id FROM offres WHERE id = $1 AND company_id = $2',
      [id, company_id]
    );

    if (offreCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée ou vous n\'avez pas les droits pour la supprimer',
      });
    }

    // Supprimer l'offre
    await pool.query('DELETE FROM offres WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: 'Offre supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

module.exports = router;
