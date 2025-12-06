const { Resend } = require('resend');
require('dotenv').config();

// ======================================================
// 🔧 SERVICE EMAIL VIA RESEND (HTTP, COMPATIBLE RENDER)
// ======================================================
if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  Avertissement: Aucune clé API Resend trouvée. Les emails ne seront pas envoyés.');
  console.warn('   Pour activer l\'envoi d\'emails, définissez la variable d\'environnement RESEND_API_KEY');
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : {
  emails: {
    send: async () => {
      console.warn('⚠️  Avertissement: Tentative d\'envoi d\'email sans clé API Resend');
      return { data: { id: 'mock-email-id' }, error: null };
    }
  }
};

/**
 * Envoyer un email de notification de candidature acceptée
 * @param {Object} options - Options de l'email
 * @param {string} options.studentEmail - Email de l'étudiant
 * @param {string} options.studentName - Nom de l'étudiant
 * @param {string} options.offreTitle - Titre de l'offre
 * @param {string} options.companyName - Nom de l'entreprise
 * @param {string} options.statut - Statut de la candidature (accepted/rejected)
 */
const sendCandidatureStatusEmail = async ({
  studentEmail,
  studentName,
  offreTitle,
  companyName,
  statut,
}) => {
  try {
    const isAccepted = statut === 'accepted';
    const subject = isAccepted
      ? '🎉 Votre candidature a été acceptée !'
      : 'Réponse à votre candidature';

    const htmlContent = isAccepted
      ? `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .success-badge {
              background: #10b981;
              color: white;
              padding: 10px 20px;
              border-radius: 20px;
              display: inline-block;
              margin: 20px 0;
              font-weight: bold;
            }
            .info-box {
              background: white;
              padding: 20px;
              border-left: 4px solid #667eea;
              margin: 20px 0;
              border-radius: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Félicitations !</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${studentName}</strong>,</p>
            
            <div class="success-badge">
              ✓ CANDIDATURE ACCEPTÉE
            </div>
            
            <p>Nous avons le plaisir de vous informer que votre candidature a été <strong>acceptée</strong> !</p>
            
            <div class="info-box">
              <h3>📋 Détails de l'offre</h3>
              <p><strong>Offre :</strong> ${offreTitle}</p>
              <p><strong>Entreprise :</strong> ${companyName}</p>
            </div>
            
            <p>L'entreprise <strong>${companyName}</strong> a examiné votre profil et souhaite poursuivre avec vous.</p>
            
            <p><strong>Prochaines étapes :</strong></p>
            <ul>
              <li>Consultez votre espace candidatures pour plus de détails</li>
              <li>L'entreprise vous contactera prochainement pour les prochaines étapes</li>
              <li>Préparez vos documents si nécessaire</li>
            </ul>
            
            <p>Bonne chance pour la suite ! 🚀</p>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement par EspaceStage</p>
              <p>© ${new Date().getFullYear()} EspaceStage - Plateforme de gestion des stages</p>
            </div>
          </div>
        </body>
        </html>
      `
      : `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .info-box {
              background: white;
              padding: 20px;
              border-left: 4px solid #667eea;
              margin: 20px 0;
              border-radius: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Réponse à votre candidature</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${studentName}</strong>,</p>
            
            <p>Nous vous remercions pour l'intérêt que vous avez porté à notre offre de stage.</p>
            
            <div class="info-box">
              <h3>📋 Détails de l'offre</h3>
              <p><strong>Offre :</strong> ${offreTitle}</p>
              <p><strong>Entreprise :</strong> ${companyName}</p>
            </div>
            
            <p>Après examen de votre candidature, nous avons le regret de vous informer que nous ne pourrons pas donner suite à votre demande pour cette offre.</p>
            
            <p>Nous vous encourageons à continuer vos recherches et à postuler à d'autres offres qui correspondent à votre profil.</p>
            
            <p>Nous vous souhaitons bonne chance dans vos recherches ! 💪</p>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement par EspaceStage</p>
              <p>© ${new Date().getFullYear()} EspaceStage - Plateforme de gestion des stages</p>
            </div>
          </div>
        </body>
        </html>
      `;

    const emailResponse = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'EspaceStage <onboarding@resend.dev>',
      to: studentEmail,
      subject: subject,
      html: htmlContent,
    });

   const messageId = emailResponse?.id;
    console.log('Email envoyé avec succès via Resend:', messageId);
    return { success: true, messageId };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Envoyer un email à l'entreprise lors d'une nouvelle candidature
 */
const sendNewCandidatureEmail = async ({
  companyEmail,
  companyName,
  studentName,
  studentEmail,
  offreTitle,
  offreId,
  candidatureId,
  message,
}) => {
  try {
    const subject = `Nouvelle candidature pour "${offreTitle}"`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .info-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
          }
          .message-box {
            background: #e0e7ff;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-style: italic;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
          }
          strong {
            color: #667eea;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">Nouvelle Candidature</h1>
        </div>
        <div class="content">
          <p>Bonjour <strong>${companyName}</strong>,</p>
          
          <p>Vous avez reçu une nouvelle candidature pour votre offre de stage !</p>
          
          <div class="info-box">
            <p><strong> Offre de stage :</strong> ${offreTitle}</p>
            <p><strong> Candidat :</strong> ${studentName}</p>
            <p><strong> Email :</strong> ${studentEmail}</p>
            <p><strong> Date de candidature :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          
          ${message ? `
          <div class="message-box">
            <p><strong> Message de motivation :</strong></p>
            <p>${message}</p>
          </div>
          ` : ''}
          
          <p><strong>Prochaines étapes :</strong></p>
          <ul>
            <li>Consultez le profil complet du candidat sur votre tableau de bord</li>
            <li>Examinez son CV et ses documents</li>
            <li>Acceptez ou refusez la candidature</li>
            <li>Le candidat sera notifié automatiquement de votre décision</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/entreprise/candidatures" class="button">
              Voir la candidature
            </a>
          </div>
          
          <p>Bonne chance dans votre recherche du candidat idéal ! </p>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement par EspaceStage</p>
            <p> ${new Date().getFullYear()} EspaceStage - Plateforme de gestion des stages</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'EspaceStage <onboarding@resend.dev>',
      to: companyEmail,
      subject: subject,
      html: htmlContent,
    });

    const messageId = emailResponse?.data?.id || emailResponse?.id;
    console.log('Email de nouvelle candidature envoyé via Resend:', messageId);
    return { success: true, messageId };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de nouvelle candidature:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendCandidatureStatusEmail,
  sendNewCandidatureEmail,
};
