"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

interface StudentProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  domaine_etude: string;
  adresse: string;
  telephone: string;
  photo_url: string;
  cv_url: string;
  certificat_url: string;
  niveau_etude: string;
  specialisation: string;
  etablissement: string;
  bio: string;
  email?: string;
}

interface StudentProfileContextType {
  profile: StudentProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<StudentProfile>) => void;
}

const StudentProfileContext = createContext<StudentProfileContextType | undefined>(undefined);

export const StudentProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const response = await api.get('/student/profile');
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

  const updateProfile = (data: Partial<StudentProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  const value = {
    profile,
    loading,
    refreshProfile,
    updateProfile,
  };

  return <StudentProfileContext.Provider value={value}>{children}</StudentProfileContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte
export const useStudentProfile = () => {
  const context = useContext(StudentProfileContext);
  if (context === undefined) {
    throw new Error('useStudentProfile doit être utilisé à l\'intérieur d\'un StudentProfileProvider');
  }
  return context;
};
