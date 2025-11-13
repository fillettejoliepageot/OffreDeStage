"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, role?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur depuis le localStorage au démarrage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Vérifier si le token est toujours valide
          try {
            const response = await authAPI.getProfile();
            setUser(response.data.user);
          } catch (error) {
            // Token invalide, nettoyer
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Connexion
  const login = async (email: string, password: string, role?: string) => {
    try {
      const response = await authAPI.login(email, password, role);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Sauvegarder dans le localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Mettre à jour l'état
        setToken(token);
        setUser(user);
      } else {
        throw new Error(response.message || 'Erreur de connexion');
      }
    } catch (error: any) {
      // Ne pas logger dans la console pour éviter les erreurs visibles
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erreur lors de la connexion'
      );
    }
  };

  // Inscription
  const register = async (data: any) => {
    try {
      const response = await authAPI.register(data);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Sauvegarder dans le localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Mettre à jour l'état
        setToken(token);
        setUser(user);
      } else {
        throw new Error(response.message || 'Erreur d\'inscription');
      }
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erreur lors de l\'inscription'
      );
    }
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    
    // Note: Les notifications de déconnexion seront gérées dans les composants de navigation
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
