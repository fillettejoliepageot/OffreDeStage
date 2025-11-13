const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rateLimiter');

// Appliquer le rate limiting à toutes les routes admin (auto-désactivé en dev)
router.use(adminLimiter);

// ==========================================
// ROUTE : GET /api/admin/stats
// Description : Statistiques globales de la plateforme
// Access : Private (Admin only)
// ==========================================
router.get('/stats', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    // Compter les étudiants
    const studentsCount = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role = $1',
      ['student']
    );

    // Compter les entreprises
    const companiesCount = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role = $1',
      ['company']
    );

    // Compter les offres actives
    const offresCount = await pool.query('SELECT COUNT(*) as count FROM offres');

    // Compter les candidatures totales
    const candidaturesCount = await pool.query('SELECT COUNT(*) as count FROM candidatures');

    // Statistiques des candidatures par statut
    const candidaturesStats = await pool.query(`
      SELECT 
        statut,
        COUNT(*) as count
      FROM candidatures
      GROUP BY statut
    `);

    // Croissance mensuelle (6 derniers mois)
    const monthlyGrowth = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month,
        COUNT(*) FILTER (WHERE role = 'student') as students,
        COUNT(*) FILTER (WHERE role = 'company') as companies
      FROM users
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `);

    // Offres créées par mois
    const monthlyOffres = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month,
        COUNT(*) as count
      FROM offres
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `);

    // Candidatures par mois
    const monthlyCandidatures = await pool.query(`
      SELECT 
        TO_CHAR(date_candidature, 'Mon') as month,
        COUNT(*) as count
      FROM candidatures
      WHERE date_candidature >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(date_candidature, 'Mon'), DATE_TRUNC('month', date_candidature)
      ORDER BY DATE_TRUNC('month', date_candidature)
    `);

    // Activité récente (dernières inscriptions et candidatures)
    const recentActivity = await pool.query(`
      (
        SELECT 
          'student' as type,
          u.email as name,
          u.created_at as time,
          CONCAT(s.first_name, ' ', s.last_name) as details
        FROM users u
        LEFT JOIN students s ON u.id = s.user_id
        WHERE u.role = 'student'
        ORDER BY u.created_at DESC
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 
          'company' as type,
          u.email as name,
          u.created_at as time,
          c.company_name as details
        FROM users u
        LEFT JOIN companies c ON u.id = c.user_id
        WHERE u.role = 'company'
        ORDER BY u.created_at DESC
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 
          'offre' as type,
          o.title as name,
          o.created_at as time,
          c.company_name as details
        FROM offres o
        LEFT JOIN companies c ON o.company_id = c.id
        ORDER BY o.created_at DESC
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 
          'candidature' as type,
          o.title as name,
          ca.date_candidature as time,
          CONCAT(s.first_name, ' ', s.last_name) as details
        FROM candidatures ca
        JOIN offres o ON ca.offre_id = o.id
        JOIN students s ON ca.student_id = s.id
        ORDER BY ca.date_candidature DESC
        LIMIT 5
      )
      ORDER BY time DESC
      LIMIT 10
    `);

    res.status(200).json({
      success: true,
      data: {
        totals: {
          students: parseInt(studentsCount.rows[0].count),
          companies: parseInt(companiesCount.rows[0].count),
          offres: parseInt(offresCount.rows[0].count),
          candidatures: parseInt(candidaturesCount.rows[0].count),
        },
        candidaturesStats: candidaturesStats.rows,
        monthlyGrowth: monthlyGrowth.rows,
        monthlyOffres: monthlyOffres.rows,
        monthlyCandidatures: monthlyCandidatures.rows,
        recentActivity: recentActivity.rows,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : GET /api/admin/students
// Description : Liste tous les étudiants
// Access : Private (Admin only)
// ==========================================
router.get('/students', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.statut,
        u.created_at,
        s.first_name,
        s.last_name,
        s.domaine_etude,
        s.niveau_etude,
        s.specialisation,
        s.etablissement,
        s.telephone,
        (SELECT COUNT(*) FROM candidatures c WHERE c.student_id = s.id) as candidatures_count
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      WHERE u.role = 'student'
      ORDER BY u.created_at DESC
    `);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : GET /api/admin/companies
// Description : Liste toutes les entreprises
// Access : Private (Admin only)
// ==========================================
router.get('/companies', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.statut,
        u.created_at,
        c.company_name,
        c.sector,
        c.address,
        c.telephone,
        c.description,
        c.logo_url,
        (SELECT COUNT(*) FROM offres o WHERE o.company_id = c.id) as offres_count
      FROM users u
      LEFT JOIN companies c ON u.id = c.user_id
      WHERE u.role = 'company'
      ORDER BY u.created_at DESC
    `);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des entreprises:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : GET /api/admin/offres
// Description : Liste toutes les offres avec détails
// Access : Private (Admin only)
// ==========================================
router.get('/offres', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.*,
        c.company_name,
        c.sector,
        (SELECT COUNT(*) FROM candidatures ca WHERE ca.offre_id = o.id) as candidatures_count
      FROM offres o
      LEFT JOIN companies c ON o.company_id = c.id
      ORDER BY o.created_at DESC
    `);

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
// ROUTE : DELETE /api/admin/users/:id
// Description : Supprimer un utilisateur (étudiant ou entreprise)
// Access : Private (Admin only)
// ==========================================
router.delete('/users/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur existe
    const userCheck = await client.query(
      'SELECT id, role FROM users WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    const user = userCheck.rows[0];

    // Empêcher la suppression d'un admin
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Impossible de supprimer un compte administrateur',
      });
    }

    await client.query('BEGIN');

    // Supprimer selon le rôle
    if (user.role === 'student') {
      // Supprimer les candidatures de l'étudiant
      await client.query(
        'DELETE FROM candidatures WHERE student_id IN (SELECT id FROM students WHERE user_id = $1)',
        [id]
      );
      // Supprimer le profil étudiant
      await client.query('DELETE FROM students WHERE user_id = $1', [id]);
    } else if (user.role === 'company') {
      // Supprimer les candidatures liées aux offres de l'entreprise
      await client.query(
        'DELETE FROM candidatures WHERE offre_id IN (SELECT id FROM offres WHERE company_id IN (SELECT id FROM companies WHERE user_id = $1))',
        [id]
      );
      // Supprimer les offres de l'entreprise
      await client.query(
        'DELETE FROM offres WHERE company_id IN (SELECT id FROM companies WHERE user_id = $1)',
        [id]
      );
      // Supprimer le profil entreprise
      await client.query('DELETE FROM companies WHERE user_id = $1', [id]);
    }

    // Supprimer l'utilisateur
    await client.query('DELETE FROM users WHERE id = $1', [id]);

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// ==========================================
// ROUTE : PUT /api/admin/users/:id/status
// Description : Bloquer/Débloquer un utilisateur
// Access : Private (Admin only)
// ==========================================
router.put('/users/:id/status', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    // Validation du statut
    if (!statut || !['actif', 'bloqué'].includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide. Valeurs acceptées: actif, bloqué',
      });
    }

    // Vérifier que l'utilisateur existe
    const userCheck = await pool.query(
      'SELECT id, role FROM users WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    const user = userCheck.rows[0];

    // Empêcher le blocage d'un admin
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Impossible de bloquer un compte administrateur',
      });
    }

    // Mettre à jour le statut
    const result = await pool.query(
      'UPDATE users SET statut = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, statut',
      [statut, id]
    );

    res.status(200).json({
      success: true,
      message: statut === 'bloqué' ? 'Utilisateur bloqué avec succès' : 'Utilisateur débloqué avec succès',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : PUT /api/admin/offres/:id/status
// Description : Activer/Désactiver une offre
// Access : Private (Admin only)
// ==========================================
router.put('/offres/:id/status', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    // Validation du statut
    if (!statut || !['active', 'désactivée'].includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide. Valeurs acceptées: active, désactivée',
      });
    }

    // Vérifier que l'offre existe
    const offreCheck = await pool.query(
      'SELECT id FROM offres WHERE id = $1',
      [id]
    );

    if (offreCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée',
      });
    }

    // Mettre à jour le statut
    const result = await pool.query(
      'UPDATE offres SET statut = $1 WHERE id = $2 RETURNING id, title, statut',
      [statut, id]
    );

    res.status(200).json({
      success: true,
      message: statut === 'désactivée' ? 'Offre désactivée avec succès' : 'Offre activée avec succès',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : DELETE /api/admin/offres/:id
// Description : Supprimer une offre
// Access : Private (Admin only)
// ==========================================
router.delete('/offres/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Supprimer les candidatures liées à l'offre
    await client.query('DELETE FROM candidatures WHERE offre_id = $1', [id]);

    // Supprimer l'offre
    const result = await client.query('DELETE FROM offres WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée',
      });
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Offre supprimée avec succès',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de la suppression de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// ==========================================
// ROUTE : GET /api/admin/rapports
// Description : Données pour les rapports (évolution mensuelle, domaines, etc.)
// Access : Private (Admin only)
// ==========================================
router.get('/rapports', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { periode = '6mois' } = req.query;

    // Déterminer l'intervalle selon la période
    let interval = '6 months';
    let dateFormat = 'Mon';
    
    switch (periode) {
      case '1mois':
        interval = '1 month';
        dateFormat = 'DD Mon';
        break;
      case '3mois':
        interval = '3 months';
        dateFormat = 'Mon';
        break;
      case '6mois':
        interval = '6 months';
        dateFormat = 'Mon';
        break;
      case '1an':
        interval = '12 months';
        dateFormat = 'Mon YYYY';
        break;
    }

    // 1. Statistiques globales
    const statsGlobales = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'student') as total_etudiants,
        (SELECT COUNT(*) FROM users WHERE role = 'company') as total_entreprises,
        (SELECT COUNT(*) FROM offres) as total_offres,
        (SELECT COUNT(*) FROM candidatures) as total_candidatures
    `);

    // 2. Évolution mensuelle
    const evolutionMensuelle = await pool.query(`
      WITH dates AS (
        SELECT generate_series(
          DATE_TRUNC('month', NOW() - INTERVAL '${interval}'),
          DATE_TRUNC('month', NOW()),
          '1 month'::interval
        ) AS mois
      )
      SELECT 
        TO_CHAR(d.mois, 'Mon') as mois,
        COALESCE(COUNT(DISTINCT u1.id) FILTER (WHERE u1.role = 'student'), 0) as etudiants,
        COALESCE(COUNT(DISTINCT u2.id) FILTER (WHERE u2.role = 'company'), 0) as entreprises,
        COALESCE(COUNT(DISTINCT o.id), 0) as offres,
        COALESCE(COUNT(DISTINCT ca.id), 0) as candidatures
      FROM dates d
      LEFT JOIN users u1 ON DATE_TRUNC('month', u1.created_at) = d.mois AND u1.role = 'student'
      LEFT JOIN users u2 ON DATE_TRUNC('month', u2.created_at) = d.mois AND u2.role = 'company'
      LEFT JOIN offres o ON DATE_TRUNC('month', o.created_at) = d.mois
      LEFT JOIN candidatures ca ON DATE_TRUNC('month', ca.date_candidature) = d.mois
      GROUP BY d.mois
      ORDER BY d.mois
    `);

    // 3. Répartition par domaine
    const repartitionDomaine = await pool.query(`
      SELECT 
        o.domaine,
        COUNT(DISTINCT s.id) as etudiants,
        COUNT(DISTINCT o.id) as offres
      FROM offres o
      LEFT JOIN candidatures c ON o.id = c.offre_id
      LEFT JOIN students s ON c.student_id = s.id
      WHERE o.domaine IS NOT NULL
      GROUP BY o.domaine
      ORDER BY offres DESC
      LIMIT 10
    `);

    // 4. Statistiques par statut de candidature
    const candidaturesParStatut = await pool.query(`
      SELECT 
        statut,
        COUNT(*) as count
      FROM candidatures
      GROUP BY statut
    `);

    // 5. Top entreprises (par nombre d'offres)
    const topEntreprises = await pool.query(`
      SELECT 
        c.company_name,
        COUNT(o.id) as nombre_offres,
        COUNT(DISTINCT ca.id) as nombre_candidatures
      FROM companies c
      LEFT JOIN offres o ON c.id = o.company_id
      LEFT JOIN candidatures ca ON o.id = ca.offre_id
      GROUP BY c.id, c.company_name
      ORDER BY nombre_offres DESC
      LIMIT 10
    `);

    // 6. Taux de conversion (candidatures -> acceptées)
    const tauxConversion = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE statut = 'accepted') * 100.0 / NULLIF(COUNT(*), 0) as taux
      FROM candidatures
    `);

    res.status(200).json({
      success: true,
      data: {
        statistiques_globales: statsGlobales.rows[0],
        evolution_mensuelle: evolutionMensuelle.rows,
        repartition_domaine: repartitionDomaine.rows,
        candidatures_par_statut: candidaturesParStatut.rows,
        top_entreprises: topEntreprises.rows,
        taux_conversion: tauxConversion.rows[0]?.taux || 0
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des rapports:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : GET /api/admin/students/:id
// Description : Détails complets d'un étudiant
// Access : Private (Admin only)
// ==========================================
router.get('/students/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.statut,
        u.created_at,
        s.*,
        (SELECT COUNT(*) FROM candidatures c WHERE c.student_id = s.id) as candidatures_count,
        (SELECT COUNT(*) FROM candidatures c WHERE c.student_id = s.id AND c.statut = 'accepted') as candidatures_acceptees,
        (SELECT COUNT(*) FROM candidatures c WHERE c.student_id = s.id AND c.statut = 'pending') as candidatures_en_attente
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      WHERE u.id = $1 AND u.role = 'student'
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de l\'étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : GET /api/admin/companies/:id
// Description : Détails complets d'une entreprise
// Access : Private (Admin only)
// ==========================================
router.get('/companies/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.statut,
        u.created_at,
        c.*,
        (SELECT COUNT(*) FROM offres o WHERE o.company_id = c.id) as offres_count,
        (SELECT COUNT(*) FROM offres o WHERE o.company_id = c.id AND o.statut = 'active') as offres_actives,
        (SELECT COUNT(*) FROM candidatures ca 
         WHERE ca.offre_id IN (SELECT id FROM offres WHERE company_id = c.id)) as candidatures_recues
      FROM users u
      LEFT JOIN companies c ON u.id = c.user_id
      WHERE u.id = $1 AND u.role = 'company'
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de l\'entreprise:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : GET /api/admin/candidatures
// Description : Liste toutes les candidatures avec filtres
// Access : Private (Admin only)
// ==========================================
router.get('/candidatures', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { statut, student_id, company_id, offre_id } = req.query;

    let query = `
      SELECT 
        ca.id,
        ca.statut,
        ca.message,
        ca.date_candidature,
        s.first_name as student_first_name,
        s.last_name as student_last_name,
        s.domaine_etude,
        u1.email as student_email,
        o.title as offre_title,
        o.domaine as offre_domaine,
        c.company_name,
        u2.email as company_email
      FROM candidatures ca
      JOIN students s ON ca.student_id = s.id
      JOIN users u1 ON s.user_id = u1.id
      JOIN offres o ON ca.offre_id = o.id
      JOIN companies c ON o.company_id = c.id
      JOIN users u2 ON c.user_id = u2.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (statut) {
      query += ` AND ca.statut = $${paramIndex}`;
      params.push(statut);
      paramIndex++;
    }

    if (student_id) {
      query += ` AND s.user_id = $${paramIndex}`;
      params.push(student_id);
      paramIndex++;
    }

    if (company_id) {
      query += ` AND c.user_id = $${paramIndex}`;
      params.push(company_id);
      paramIndex++;
    }

    if (offre_id) {
      query += ` AND ca.offre_id = $${paramIndex}`;
      params.push(offre_id);
      paramIndex++;
    }

    query += ` ORDER BY ca.date_candidature DESC`;

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des candidatures:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : DELETE /api/admin/candidatures/:id
// Description : Supprimer une candidature
// Access : Private (Admin only)
// ==========================================
router.delete('/candidatures/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM candidatures WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Candidature non trouvée',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Candidature supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la candidature:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : GET /api/admin/tableau-croise
// Description : Tableau croisé - Étudiants par niveau et entreprise (annuel)
// Access : Private (Admin only)
// ==========================================
router.get('/tableau-croise', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    // Récupérer les données brutes
    const result = await pool.query(`
      SELECT 
        c.company_name,
        s.niveau_etude,
        COUNT(DISTINCT s.id) as nombre_etudiants
      FROM candidatures ca
      JOIN students s ON ca.student_id = s.id
      JOIN offres o ON ca.offre_id = o.id
      JOIN companies c ON o.company_id = c.id
      WHERE ca.date_candidature >= NOW() - INTERVAL '12 months'
        AND s.niveau_etude IS NOT NULL
        AND s.niveau_etude IN ('L1', 'L2', 'L3', 'M1', 'M2')
      GROUP BY c.company_name, s.niveau_etude
      ORDER BY c.company_name, s.niveau_etude
    `);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur tableau croisé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

module.exports = router;
