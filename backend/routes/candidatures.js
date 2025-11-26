const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { candidatureLimiter } = require('../middleware/rateLimiter');
const { sendCandidatureStatusEmail, sendNewCandidatureEmail } = require('../services/emailService');

// ==========================================
// ROUTE : POST /api/candidatures
// Description : Postuler à une offre de stage
// Access : Private (Student only)
// Protection : Rate limiting (10 candidatures par heure)
// ==========================================
router.post('/', candidatureLimiter, authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un étudiant
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux étudiants.',
      });
    }

    const { offre_id, message } = req.body;

    // Validation
    if (!offre_id) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID de l\'offre est obligatoire',
      });
    }

    // Récupérer l'ID de l'étudiant depuis la table students et vérifier son profil
    const studentResult = await pool.query(
      'SELECT id, first_name, last_name, cv_url FROM students WHERE user_id = $1',
      [req.user.id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profil étudiant non trouvé. Veuillez d\'abord créer votre profil.',
      });
    }

    const student = studentResult.rows[0];
    const student_id = student.id;

    // Vérifier que le profil est complet (CV obligatoire)
    if (!student.cv_url) {
      return res.status(400).json({
        success: false,
        message: 'Vous devez télécharger votre CV avant de postuler à une offre de stage.',
        missingCV: true,
      });
    }

    // Vérifier que le nom et prénom sont remplis
    if (!student.first_name || !student.last_name) {
      return res.status(400).json({
        success: false,
        message: 'Vous devez compléter votre profil (nom et prénom) avant de postuler.',
        incompleteProfile: true,
      });
    }

    // Vérifier si l'offre existe et récupérer les informations de l'entreprise
    const offreResult = await pool.query(
      `SELECT o.id, o.title, o.company_id, c.company_name, u.email as company_email
       FROM offres o
       JOIN companies c ON o.company_id = c.id
       JOIN users u ON c.user_id = u.id
       WHERE o.id = $1`,
      [offre_id]
    );

    if (offreResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée',
      });
    }

    const offre = offreResult.rows[0];

    // Vérifier si l'étudiant a déjà postulé à cette offre
    const existingCandidature = await pool.query(
      'SELECT id FROM candidatures WHERE student_id = $1 AND offre_id = $2',
      [student_id, offre_id]
    );

    if (existingCandidature.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Vous avez déjà postulé à cette offre',
      });
    }

    // Créer la candidature
    const result = await pool.query(
      `INSERT INTO candidatures (student_id, offre_id, message, statut)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [student_id, offre_id, message || null]
    );

    const candidature = result.rows[0];

    // Récupérer l'email de l'étudiant
    const userResult = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [req.user.id]
    );
    const studentEmail = userResult.rows[0]?.email;

    // Envoyer un email à l'entreprise pour notifier de la nouvelle candidature
    try {
      await sendNewCandidatureEmail({
        companyEmail: offre.company_email,
        companyName: offre.company_name,
        studentName: `${student.first_name} ${student.last_name}`,
        studentEmail: studentEmail,
        offreTitle: offre.title,
        offreId: offre_id,
        candidatureId: candidature.id,
        message: message || '',
      });
      console.log(`✅ Email de nouvelle candidature envoyé à ${offre.company_email}`);
    } catch (emailError) {
      console.error('⚠️  Erreur lors de l\'envoi de l\'email à l\'entreprise:', emailError);
      // On ne bloque pas la candidature si l'email échoue
    }

    res.status(201).json({
      success: true,
      message: 'Candidature envoyée avec succès',
      data: candidature,
    });
  } catch (error) {
    console.error('Erreur lors de la création de la candidature:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : GET /api/candidatures/student
// Description : Récupérer les candidatures de l'étudiant connecté
// Access : Private (Student only)
// ==========================================
router.get('/student', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un étudiant
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux étudiants.',
      });
    }

    // Récupérer l'ID de l'étudiant
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user.id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profil étudiant non trouvé',
      });
    }

    const student_id = studentResult.rows[0].id;

    // Récupérer les candidatures avec les détails de l'offre et de l'entreprise
    const result = await pool.query(
      `SELECT 
        c.id,
        c.date_candidature,
        c.statut,
        c.message,
        o.id as offre_id,
        o.title as offre_title,
        o.description as offre_description,
        o.domaine,
        o.localisation,
        o.type_stage,
        o.remuneration,
        o.montant_remuneration,
        o.date_debut,
        o.date_fin,
        comp.id as company_id,
        comp.company_name,
        comp.logo_url,
        comp.sector,
        comp.telephone as company_telephone,
        u.email as company_email
      FROM candidatures c
      JOIN offres o ON c.offre_id = o.id
      JOIN companies comp ON o.company_id = comp.id
      JOIN users u ON comp.user_id = u.id
      WHERE c.student_id = $1
      ORDER BY c.date_candidature DESC`,
      [student_id]
    );

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
// ROUTE : GET /api/candidatures/company
// Description : Récupérer les candidatures reçues par l'entreprise
// Access : Private (Company only)
// ==========================================
router.get('/company', authenticateToken, async (req, res) => {
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

    // Récupérer les candidatures avec les détails de l'étudiant et de l'offre
    const result = await pool.query(
      `SELECT 
        c.id,
        c.date_candidature,
        c.statut,
        c.message,
        s.id as student_id,
        s.first_name,
        s.last_name,
        s.domaine_etude,
        s.niveau_etude,
        s.specialisation,
        s.etablissement,
        s.telephone as student_telephone,
        s.photo_url,
        s.cv_url,
        s.certificat_url,
        s.bio,
        u.email as student_email,
        o.id as offre_id,
        o.title as offre_title,
        o.domaine as offre_domaine,
        o.localisation as offre_localisation
      FROM candidatures c
      JOIN students s ON c.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN offres o ON c.offre_id = o.id
      WHERE o.company_id = $1
      ORDER BY c.date_candidature DESC`,
      [company_id]
    );

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
// ROUTE : PUT /api/candidatures/:id/status
// Description : Modifier le statut d'une candidature (accepter/refuser)
// Access : Private (Company only)
// ==========================================
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est une entreprise
    if (req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux entreprises.',
      });
    }

    const { id } = req.params;
    const { statut } = req.body;

    // Validation du statut
    const statutsValides = ['pending', 'accepted', 'rejected'];
    if (!statut || !statutsValides.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide. Valeurs acceptées: pending, accepted, rejected',
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

    // Vérifier que la candidature appartient à une offre de cette entreprise
    // et récupérer les informations nécessaires pour l'email
    const candidatureCheck = await pool.query(
      `SELECT 
        c.id,
        s.first_name,
        s.last_name,
        u.email as student_email,
        o.title as offre_title,
        comp.company_name
       FROM candidatures c
       JOIN offres o ON c.offre_id = o.id
       JOIN students s ON c.student_id = s.id
       JOIN users u ON s.user_id = u.id
       JOIN companies comp ON o.company_id = comp.id
       WHERE c.id = $1 AND o.company_id = $2`,
      [id, company_id]
    );

    if (candidatureCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Candidature non trouvée ou vous n\'avez pas les droits pour la modifier',
      });
    }

    const candidatureInfo = candidatureCheck.rows[0];

    // Mettre à jour le statut
    const result = await pool.query(
      `UPDATE candidatures 
       SET statut = $1
       WHERE id = $2
       RETURNING *`,
      [statut, id]
    );

    // Envoyer un email à l'étudiant si le statut est accepté ou refusé
    if (statut === 'accepted' || statut === 'rejected') {
      try {
        await sendCandidatureStatusEmail({
          studentEmail: candidatureInfo.student_email,
          studentName: `${candidatureInfo.first_name} ${candidatureInfo.last_name}`,
          offreTitle: candidatureInfo.offre_title,
          companyName: candidatureInfo.company_name,
          statut: statut,
        });
        console.log(`Email de notification envoyé à ${candidatureInfo.student_email}`);
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email:', emailError);
        // On continue même si l'email échoue
      }
    }

    res.status(200).json({
      success: true,
      message: `Candidature ${statut === 'accepted' ? 'acceptée' : statut === 'rejected' ? 'refusée' : 'mise à jour'} avec succès`,
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
// ROUTE : DELETE /api/candidatures/:id
// Description : Annuler une candidature
// Access : Private (Student only)
// ==========================================
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un étudiant
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux étudiants.',
      });
    }

    const { id } = req.params;

    // Récupérer l'ID de l'étudiant
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user.id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profil étudiant non trouvé',
      });
    }

    const student_id = studentResult.rows[0].id;

    // Vérifier que la candidature appartient à cet étudiant
    const candidatureCheck = await pool.query(
      'SELECT id, statut FROM candidatures WHERE id = $1 AND student_id = $2',
      [id, student_id]
    );

    if (candidatureCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Candidature non trouvée ou vous n\'avez pas les droits pour la supprimer',
      });
    }

    // Empêcher la suppression si la candidature a été acceptée
    if (candidatureCheck.rows[0].statut === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une candidature acceptée',
      });
    }

    // Supprimer la candidature
    await pool.query('DELETE FROM candidatures WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: 'Candidature annulée avec succès',
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
// ROUTE : GET /api/candidatures/offre/:offre_id
// Description : Vérifier si l'étudiant a déjà postulé à une offre
// Access : Private (Student only)
// ==========================================
router.get('/offre/:offre_id', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un étudiant
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux étudiants.',
      });
    }

    const { offre_id } = req.params;

    // Récupérer l'ID de l'étudiant
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user.id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profil étudiant non trouvé',
      });
    }

    const student_id = studentResult.rows[0].id;

    // Vérifier si une candidature existe
    const result = await pool.query(
      'SELECT id, statut, date_candidature FROM candidatures WHERE student_id = $1 AND offre_id = $2',
      [student_id, offre_id]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        hasApplied: false,
      });
    }

    res.status(200).json({
      success: true,
      hasApplied: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de la candidature:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : GET /api/candidatures/student/new-responses
// Description : Compter les nouvelles réponses (accepted/rejected) de l'étudiant
// Access : Private (Student only)
// ==========================================
router.get('/student/new-responses', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un étudiant
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux étudiants.',
      });
    }

    // Récupérer l'ID de l'étudiant
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user.id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profil étudiant non trouvé',
      });
    }

    const student_id = studentResult.rows[0].id;

    // Compter les candidatures acceptées ou refusées (nouvelles réponses)
    const result = await pool.query(
      `SELECT COUNT(*) as new_responses_count
       FROM candidatures
       WHERE student_id = $1 AND statut IN ('accepted', 'rejected')`,
      [student_id]
    );

    res.status(200).json({
      success: true,
      newResponsesCount: parseInt(result.rows[0].new_responses_count),
    });
  } catch (error) {
    console.error('Erreur lors du comptage des nouvelles réponses:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

// ==========================================
// ROUTE : GET /api/candidatures/company/pending-count
// Description : Compter les candidatures en attente de l'entreprise
// Access : Private (Company only)
// ==========================================
router.get('/company/pending-count', authenticateToken, async (req, res) => {
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

    // Compter les candidatures en attente
    const result = await pool.query(
      `SELECT COUNT(*) as pending_count
       FROM candidatures c
       JOIN offres o ON c.offre_id = o.id
       WHERE o.company_id = $1 AND c.statut = 'pending'`,
      [company_id]
    );

    res.status(200).json({
      success: true,
      pendingCount: parseInt(result.rows[0].pending_count),
    });
  } catch (error) {
    console.error('Erreur lors du comptage des candidatures en attente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
});

module.exports = router;
