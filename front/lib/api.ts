import axios from 'axios';

// ==========================
// URL de base de l'API
// ==========================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://offredestage-2.onrender.com/api';

// ==========================
// Supprimer les erreurs Axios internes dans la console
// ==========================
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const errorText = args.join(' ').toLowerCase();
    const isAxiosInternalError =
      (errorText.includes('settle') && errorText.includes('webpack-internal')) ||
      (errorText.includes('onloadend') && errorText.includes('webpack-internal')) ||
      (errorText.includes('xhr.js') && errorText.includes('webpack-internal')) ||
      (errorText.includes('api.ts') && errorText.includes('webpack-internal')) ||
      (errorText.includes('handletimeout') && errorText.includes('webpack-internal'));

    if (isAxiosInternalError) return;
    originalConsoleError.apply(console, args);
  };
}

// ==========================
// Instance Axios
// ==========================
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 400000,
  validateStatus: (status) => status >= 200 && status < 600,
});

// ==========================
// Intercepteur Request (JWT)
// ==========================
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================
// Intercepteur Response
// ==========================
api.interceptors.response.use(
  (response) => {
    if (response.status >= 400) {
      const isPasswordChangeError = response.config?.url?.includes('/change-password');
      const isLoginError = response.config?.url?.includes('/auth/login');

      if (response.status === 401 && typeof window !== 'undefined' && !isPasswordChangeError && !isLoginError) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }

      const error: any = new Error(response.data?.message || 'Erreur');
      error.response = response;
      error.config = response.config;
      return Promise.reject(error);
    }
    return response;
  },
  (error) => {
    // Erreur de connexion au backend (timeout ou serveur indisponible)
    if (!error.response) {
      const isPasswordChangeError = error.config?.url?.includes('/change-password');
      const isLoginError = error.config?.url?.includes('/auth/login');
      if (typeof window !== 'undefined' && !isPasswordChangeError && !isLoginError) {
        console.warn('⚠️ Impossible de contacter le backend:', error.message);
        console.warn('🔍 Vérifiez que l’API tourne sur:', API_BASE_URL);
      }
    }
    return Promise.reject(error);
  }
);

// ==========================
// EXPORTS API
// ==========================

// ----- AUTH -----
export const authAPI = {
  login: async (email: string, password: string, role?: string) => {
    const response = await api.post('/auth/login', { email, password, ...(role && { role }) });
    return response.data;
  },
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// ----- STUDENT -----
export const studentAPI = {
  getProfile: async () => (await api.get('/student/profile')).data,
  updateProfile: async (data: any) => (await api.post('/student/profile', data)).data,
  checkProfile: async () => (await api.get('/student/check-profile')).data,
};

// ----- OFFRES -----
export const offresAPI = {
  getAll: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters) Object.entries(filters).forEach(([k, v]) => v !== undefined && params.append(k, String(v)));
    return (await api.get(`/offres?${params.toString()}`)).data;
  },
  getById: async (id: string) => (await api.get(`/offres/${id}`)).data,
  create: async (data: any) => (await api.post('/offres', data)).data,
  update: async (id: string, data: any) => (await api.put(`/offres/${id}`, data)).data,
  delete: async (id: string) => (await api.delete(`/offres/${id}`)).data,
  getMyOffres: async () => (await api.get('/offres/company/mes-offres')).data,
};

// ----- CANDIDATURES -----
export const candidaturesAPI = {
  apply: async (data: any) => (await api.post('/candidatures', data)).data,
  getStudentCandidatures: async () => (await api.get('/candidatures/student')).data,
  getCompanyCandidatures: async () => (await api.get('/candidatures/company')).data,
  updateStatus: async (id: string, statut: string) => (await api.put(`/candidatures/${id}/status`, { statut })).data,
  cancel: async (id: string) => (await api.delete(`/candidatures/${id}`)).data,
  checkIfApplied: async (offre_id: string) => (await api.get(`/candidatures/offre/${offre_id}`)).data,
  getNewResponsesCount: async () => (await api.get('/candidatures/student/new-responses')).data,
  getPendingCount: async () => (await api.get('/candidatures/company/pending-count')).data,
};

// ----- COMPANY -----
export const companyAPI = {
  getProfile: async () => (await api.get('/company/profile')).data,
  updateProfile: async (data: any) => (await api.post('/company/profile', data)).data,
  patchProfile: async (data: any) => (await api.put('/company/profile', data)).data,
  checkProfile: async () => (await api.get('/company/check-profile')).data,
};

// ----- ADMIN -----
export const adminAPI = {
  getStats: async () => (await api.get('/admin/stats')).data,
  getStudents: async () => (await api.get('/admin/students')).data,
  getCompanies: async () => (await api.get('/admin/companies')).data,
  getOffres: async () => (await api.get('/admin/offres')).data,
  deleteUser: async (userId: string) => (await api.delete(`/admin/users/${userId}`)).data,
  updateUserStatus: async (userId: string, statut: string) => (await api.put(`/admin/users/${userId}/status`, { statut })).data,
  updateOffreStatus: async (offreId: string, statut: string) => (await api.put(`/admin/offres/${offreId}/status`, { statut })).data,
  deleteOffre: async (offreId: string) => (await api.delete(`/admin/offres/${offreId}`)).data,
  getRapports: async (periode?: string) => (await api.get(`/admin/rapports${periode ? `?periode=${periode}` : ''}`)).data,
  getStudentDetails: async (userId: string) => (await api.get(`/admin/students/${userId}`)).data,
  getCompanyDetails: async (userId: string) => (await api.get(`/admin/companies/${userId}`)).data,
  getCandidatures: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.statut) params.append('statut', filters.statut);
    if (filters?.student_id) params.append('student_id', filters.student_id);
    if (filters?.company_id) params.append('company_id', filters.company_id);
    if (filters?.offre_id) params.append('offre_id', filters.offre_id);
    return (await api.get(`/admin/candidatures${params.toString() ? `?${params.toString()}` : ''}`)).data;
  },
  deleteCandidature: async (candidatureId: string) => (await api.delete(`/admin/candidatures/${candidatureId}`)).data,
  getTableauCroise: async () => (await api.get('/admin/tableau-croise')).data,
};

export default api;
