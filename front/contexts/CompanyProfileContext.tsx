"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

interface CompanyProfile {
  id: string;
  user_id: string;
  company_name: string;
  sector: string;
  address: string;
  telephone: string;
  description: string;
  nombre_employes: number;
  logo_url: string;
  email?: string;
}

interface CompanyProfileContextType {
  profile: CompanyProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<CompanyProfile>) => void;
}

const CompanyProfileContext = createContext<CompanyProfileContextType | undefined>(undefined);

export const CompanyProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const response = await api.get('/company/profile');
      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (error: any) {
      // Si 404, c'est normal (profil pas encore créé)
      if (error.response?.status !== 404) {
        console.error('Erreur lors du chargement du profil:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const refreshProfile = async () => {
    setLoading(true);
    await loadProfile();
  };

  const updateProfile = (data: Partial<CompanyProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  const value = {
    profile,
    loading,
    refreshProfile,
    updateProfile,
  };

  return <CompanyProfileContext.Provider value={value}>{children}</CompanyProfileContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte
export const useCompanyProfile = () => {
  const context = useContext(CompanyProfileContext);
  if (context === undefined) {
    throw new Error('useCompanyProfile doit être utilisé à l\'intérieur d\'un CompanyProfileProvider');
  }
  return context;
};
