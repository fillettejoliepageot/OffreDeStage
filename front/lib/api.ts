import axios from 'axios';

// Configuration de l'URL de base de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Supprimer TOUTES les erreurs Axios de la console
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    // Convertir tous les arguments en string pour la vérification
    const errorText = args.join(' ').toLowerCase();
    
    // Bloquer les erreurs Axios et les erreurs de notre intercepteur
    const isAxiosInternalError = (
      (errorText.includes('settle') && errorText.includes('webpack-internal')) ||
      (errorText.includes('onloadend') && errorText.includes('webpack-internal')) ||
      (errorText.includes('xhr.js') && errorText.includes('webpack-internal')) ||
      (errorText.includes('api.ts') && errorText.includes('webpack-internal'))
    );
    
    // Ne pas logger les erreurs Axios et intercepteur
    if (isAxiosInternalError) {
      return;
    }
    
    // Logger toutes les autres erreurs normalement
    originalConsoleError.apply(console, args);
  };
}

// Créer une instance axios avec configuration par défaut
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  // Supprimer les logs Axios par défaut
  validateStatus: function (status) {
    return status >= 200 && status < 600; // Accepter tous les status pour gérer nous-mêmes
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    // Vérifier si c'est une erreur (status >= 400)
    if (response.status >= 400) {
      const isPasswordChangeError = response.config?.url?.includes('/change-password');
      const isLoginError = response.config?.url?.includes('/auth/login');
      
      // Token expiré ou invalide - Rediriger vers login
      if (response.status === 401 && typeof window !== 'undefined' && !isPasswordChangeError && !isLoginError) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
      
      // Créer une erreur pour les status >= 400
      const error: any = new Error(response.data?.message || 'Erreur');
      error.response = response;
      error.config = response.config;
      return Promise.reject(error);
    }
    
    return response;
  },
  (error) => {
    // Erreur de connexion au serveur (pas de réponse)
    if (!error.response) {
      const isPasswordChangeError = error.config?.url?.includes('/change-password');
      const isLoginError = error.config?.url?.includes('/auth/login');
      
      if (typeof window !== 'undefined' && !isPasswordChangeError && !isLoginError) {
        console.error('❌ Erreur de connexion au backend:', error.message);
        console.error('🔍 Vérifiez que le backend tourne sur http://localhost:5000');
      }
    }
    
    return Promise.reject(error);
  }
);

// ==========================================
// AUTHENTIFICATION
// ==========================================

export const authAPI = {
  // Connexion
  login: async (email: string, password: string, role?: string) => {
    const response = await api.post('/auth/login', { email, password, ...(role && { role }) });
    return response.data;
  },

  // Inscription
  register: async (data: {
    email: string;
    password: string;
    role: string;
    first_name?: string;
    last_name?: string;
    domaine_etude?: string;
    company_name?: string;
    sector?: string;
    address?: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Récupérer le profil de l'utilisateur connecté
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// ==========================================
// PROFIL ÉTUDIANT
// ==========================================

export const studentAPI = {
  // Récupérer le profil de l'étudiant
  getProfile: async () => {
    const response = await api.get('/student/profile');
    return response.data;
  },

  // Créer ou mettre à jour le profil
  updateProfile: async (data: any) => {
    const response = await api.post('/student/profile', data);
    return response.data;
  },

  // Vérifier si le profil existe
  checkProfile: async () => {
    const response = await api.get('/student/check-profile');
    return response.data;
  },
};

// ==========================================
// OFFRES DE STAGE
// ==========================================

export const offresAPI = {
  // Récupérer toutes les offres (avec filtres optionnels)
  getAll: async (filters?: {
    domaine?: string;
    type_stage?: string;
    localisation?: string;
    remuneration?: boolean;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get(`/offres?${params.toString()}`);
    return response.data;
  },

  // Récupérer une offre spécifique
  getById: async (id: string) => {
    const response = await api.get(`/offres/${id}`);
    return response.data;
  },

  // Créer une offre (entreprise)
  create: async (data: any) => {
    const response = await api.post('/offres', data);
    return response.data;
  },

  // Modifier une offre (entreprise)
  update: async (id: string, data: any) => {
    const response = await api.put(`/offres/${id}`, data);
    return response.data;
  },

  // Supprimer une offre (entreprise)
  delete: async (id: string) => {
    const response = await api.delete(`/offres/${id}`);
    return response.data;
  },

  // Récupérer les offres de l'entreprise connectée
  getMyOffres: async () => {
    const response = await api.get('/offres/company/mes-offres');
    return response.data;
  },
};

// ==========================================
// CANDIDATURES
// ==========================================

export const candidaturesAPI = {
  // Postuler à une offre (étudiant)
  apply: async (data: { offre_id: string; message?: string }) => {
    const response = await api.post('/candidatures', data);
    return response.data;
  },

  // Récupérer les candidatures de l'étudiant
  getStudentCandidatures: async () => {
    const response = await api.get('/candidatures/student');
    return response.data;
  },

  // Récupérer les candidatures reçues par l'entreprise
  getCompanyCandidatures: async () => {
    const response = await api.get('/candidatures/company');
    return response.data;
  },

  // Modifier le statut d'une candidature (entreprise)
  updateStatus: async (id: string, statut: 'pending' | 'accepted' | 'rejected') => {
    const response = await api.put(`/candidatures/${id}/status`, { statut });
    return response.data;
  },

  // Annuler une candidature (étudiant)
  cancel: async (id: string) => {
    const response = await api.delete(`/candidatures/${id}`);
    return response.data;
  },

  // Vérifier si l'étudiant a déjà postulé à une offre
  checkIfApplied: async (offre_id: string) => {
    const response = await api.get(`/candidatures/offre/${offre_id}`);
    return response.data;
  },

  // Compter les nouvelles réponses (étudiant)
  getNewResponsesCount: async () => {
    const response = await api.get('/candidatures/student/new-responses');
    return response.data;
  },

  // Compter les candidatures en attente (entreprise)
  getPendingCount: async () => {
    const response = await api.get('/candidatures/company/pending-count');
    return response.data;
  },
};

// ==========================================
// PROFIL ENTREPRISE
// ==========================================

export const companyAPI = {
  // Récupérer le profil de l'entreprise
  getProfile: async () => {
    const response = await api.get('/company/profile');
    return response.data;
  },

  // Créer ou mettre à jour le profil
  updateProfile: async (data: any) => {
    const response = await api.post('/company/profile', data);
    return response.data;
  },

  // Mise à jour partielle
  patchProfile: async (data: any) => {
    const response = await api.put('/company/profile', data);
    return response.data;
  },

  // Vérifier si le profil existe
  checkProfile: async () => {
    const response = await api.get('/company/check-profile');
    return response.data;
  },
};

// ==========================================
// ADMIN
// ==========================================

export const adminAPI = {
  // Récupérer les statistiques globales
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Récupérer tous les étudiants
  getStudents: async () => {
    const response = await api.get('/admin/students');
    return response.data;
  },

  // Récupérer toutes les entreprises
  getCompanies: async () => {
    const response = await api.get('/admin/companies');
    return response.data;
  },

  // Récupérer toutes les offres
  getOffres: async () => {
    const response = await api.get('/admin/offres');
    return response.data;
  },

  // Supprimer un utilisateur (étudiant ou entreprise)
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Bloquer/Débloquer un utilisateur
  updateUserStatus: async (userId: string, statut: 'actif' | 'bloqué') => {
    const response = await api.put(`/admin/users/${userId}/status`, { statut });
    return response.data;
  },

  // Activer/Désactiver une offre
  updateOffreStatus: async (offreId: string, statut: 'active' | 'désactivée') => {
    const response = await api.put(`/admin/offres/${offreId}/status`, { statut });
    return response.data;
  },

  // Supprimer une offre
  deleteOffre: async (offreId: string) => {
    const response = await api.delete(`/admin/offres/${offreId}`);
    return response.data;
  },

  // Récupérer les données de rapports
  getRapports: async (periode?: string) => {
    const params = periode ? `?periode=${periode}` : '';
    const response = await api.get(`/admin/rapports${params}`);
    return response.data;
  },

  // Récupérer les détails complets d'un étudiant
  getStudentDetails: async (userId: string) => {
    const response = await api.get(`/admin/students/${userId}`);
    return response.data;
  },

  // Récupérer les détails complets d'une entreprise
  getCompanyDetails: async (userId: string) => {
    const response = await api.get(`/admin/companies/${userId}`);
    return response.data;
  },

  // Récupérer toutes les candidatures avec filtres
  getCandidatures: async (filters?: { statut?: string; student_id?: string; company_id?: string; offre_id?: string }) => {
    const params = new URLSearchParams();
    if (filters?.statut) params.append('statut', filters.statut);
    if (filters?.student_id) params.append('student_id', filters.student_id);
    if (filters?.company_id) params.append('company_id', filters.company_id);
    if (filters?.offre_id) params.append('offre_id', filters.offre_id);
    
    const queryString = params.toString();
    const response = await api.get(`/admin/candidatures${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // Supprimer une candidature
  deleteCandidature: async (candidatureId: string) => {
    const response = await api.delete(`/admin/candidatures/${candidatureId}`);
    return response.data;
  },

  // Tableau croisé dynamique
  getTableauCroise: async () => {
    const response = await api.get('/admin/tableau-croise');
    return response.data;
  },
};

export default api;
