const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const uploadToCloudinary = require('../config/cloudinary');

// ==========================================
// ROUTE : GET /api/student/profile
// Description : Récupérer le profil de l'étudiant connecté
// Access : Private (Student only)
// ==========================================
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un étudiant
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux étudiants.',
      });
    }

    // Récupérer le profil de l'étudiant
    const result = await pool.query(
      `SELECT s.*, u.email 
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE s.user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profil étudiant non trouvé',
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
// ROUTE : POST /api/student/profile
// Description : Créer ou mettre à jour le profil de l'étudiant
// Access : Private (Student only)
// ==========================================
router.post('/profile', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un étudiant
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux étudiants.',
      });
    }

    const {
      first_name,
      last_name,
      domaine_etude,
      adresse,
      telephone,
      photo_url,
      cv_url,
      certificat_url,
      niveau_etude,
      specialisation,
      etablissement,
      bio
    } = req.body;

    let finalPhotoUrl = photo_url;
    let finalCvUrl = cv_url;
    let finalCertificatUrl = certificat_url;

    try {
      if (photo_url && typeof photo_url === 'string' && photo_url.startsWith('data:')) {
        const uploadedPhoto = await uploadToCloudinary(photo_url, 'students/photos', 'image');
        if (uploadedPhoto) {
          finalPhotoUrl = uploadedPhoto;
        }
      }

      if (cv_url && typeof cv_url === 'string' && cv_url.startsWith('data:')) {
        const uploadedCv = await uploadToCloudinary(cv_url, 'students/cv');
        if (uploadedCv) {
          finalCvUrl = uploadedCv;
        }
      }

      if (certificat_url && typeof certificat_url === 'string' && certificat_url.startsWith('data:')) {
        const uploadedCert = await uploadToCloudinary(certificat_url, 'students/certificats');
        if (uploadedCert) {
          finalCertificatUrl = uploadedCert;
        }
      }
    } catch (cloudinaryError) {
      console.error('Erreur lors de l\'upload Cloudinary (profil étudiant):', cloudinaryError);
    }

    // Validation des champs obligatoires
    if (!first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'Le prénom et le nom sont obligatoires',
      });
    }

    // Validation du niveau d'étude si fourni
    const niveauxValides = ['L1', 'L2', 'L3', 'M1', 'M2'];
    if (niveau_etude && !niveauxValides.includes(niveau_etude)) {
      return res.status(400).json({
        success: false,
        message: 'Niveau d\'étude invalide. Valeurs acceptées: L1, L2, L3, M1, M2',
      });
    }

    // Vérifier si le profil existe déjà
    const checkProfile = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user.id]
    );

    let result;

    if (checkProfile.rows.length > 0) {
      // Mise à jour du profil existant
      result = await pool.query(
        `UPDATE students 
         SET first_name = $1, 
             last_name = $2, 
             domaine_etude = $3, 
             adresse = $4, 
             telephone = $5,
             photo_url = $6,
             cv_url = $7,
             certificat_url = $8,
             niveau_etude = $9,
             specialisation = $10,
             etablissement = $11,
             bio = $12
         WHERE user_id = $13
         RETURNING *`,
        [
          first_name,
          last_name,
          domaine_etude,
          adresse,
          telephone,
          finalPhotoUrl,
          finalCvUrl,
          finalCertificatUrl,
          niveau_etude,
          specialisation,
          etablissement,
          bio,
          req.user.id
        ]
      );

      res.status(200).json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: result.rows[0],
      });
    } else {
      // Création d'un nouveau profil
      result = await pool.query(
        `INSERT INTO students (
          user_id, 
          first_name, 
          last_name, 
          domaine_etude, 
          adresse, 
          telephone,
          photo_url,
          cv_url,
          certificat_url,
          niveau_etude,
          specialisation,
          etablissement,
          bio
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          req.user.id,
          first_name,
          last_name,
          domaine_etude,
          adresse,
          telephone,
          finalPhotoUrl,
          finalCvUrl,
          finalCertificatUrl,
          niveau_etude,
          specialisation,
          etablissement,
          bio
        ]
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
// ROUTE : PUT /api/student/profile
// Description : Mise à jour partielle du profil de l'étudiant
// Access : Private (Student only)
// ==========================================
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un étudiant
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux étudiants.',
      });
    }

    // Vérifier si le profil existe
    const checkProfile = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
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

    const allowedFields = [
      'first_name',
      'last_name',
      'domaine_etude',
      'adresse',
      'telephone',
      'photo_url',
      'cv_url',
      'certificat_url',
      'niveau_etude',
      'specialisation',
      'etablissement',
      'bio'
    ];

    try {
      if (req.body.photo_url && typeof req.body.photo_url === 'string' && req.body.photo_url.startsWith('data:')) {
        const uploadedPhoto = await uploadToCloudinary(req.body.photo_url, 'students/photos', 'image');
        if (uploadedPhoto) {
          req.body.photo_url = uploadedPhoto;
        }
      }

      if (req.body.cv_url && typeof req.body.cv_url === 'string' && req.body.cv_url.startsWith('data:')) {
        const uploadedCv = await uploadToCloudinary(req.body.cv_url, 'students/cv');
        if (uploadedCv) {
          req.body.cv_url = uploadedCv;
        }
      }

      if (req.body.certificat_url && typeof req.body.certificat_url === 'string' && req.body.certificat_url.startsWith('data:')) {
        const uploadedCert = await uploadToCloudinary(req.body.certificat_url, 'students/certificats');
        if (uploadedCert) {
          req.body.certificat_url = uploadedCert;
        }
      }
    } catch (cloudinaryError) {
      console.error('Erreur lors de l\'upload Cloudinary (mise à jour partielle étudiant):', cloudinaryError);
    }

    // Validation du niveau d'étude si fourni
    if (req.body.niveau_etude) {
      const niveauxValides = ['L1', 'L2', 'L3', 'M1', 'M2'];
      if (!niveauxValides.includes(req.body.niveau_etude)) {
        return res.status(400).json({
          success: false,
          message: 'Niveau d\'étude invalide. Valeurs acceptées: L1, L2, L3, M1, M2',
        });
      }
    }

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${paramCount}`);
        values.push(req.body[field]);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun champ à mettre à jour',
      });
    }

    values.push(req.user.id);

    const query = `
      UPDATE students 
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
// ROUTE : GET /api/student/check-profile
// Description : Vérifier si l'étudiant a un profil complet
// Access : Private (Student only)
// ==========================================
router.get('/check-profile', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un étudiant
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux étudiants.',
      });
    }

    const result = await pool.query(
      'SELECT id, first_name, last_name FROM students WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        hasProfile: false,
        message: 'Aucun profil trouvé',
      });
    }

    const profile = result.rows[0];
    const isComplete = profile.first_name && profile.last_name;

    res.status(200).json({
      success: true,
      hasProfile: true,
      isComplete,
      data: profile,
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
// ROUTE : PUT /api/student/change-password
// Description : Changer le mot de passe de l'étudiant
// Access : Private (Student only)
// ==========================================
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un étudiant
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux étudiants.',
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
