"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Si l'utilisateur n'est pas authentifié, rediriger vers login
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      // Si l'utilisateur n'a pas le bon rôle, rediriger vers sa page
      if (user && !allowedRoles.includes(user.role)) {
        const redirectMap: { [key: string]: string } = {
          student: '/etudiant/dashboard',
          company: '/entreprise/dashboard',
          admin: '/admin/dashboard',
        };
        
        router.push(redirectMap[user.role] || '/');
      }
    }
  }, [user, loading, isAuthenticated, allowedRoles, router]);

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas authentifié ou mauvais rôle, ne rien afficher (redirection en cours)
  if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return null;
  }

  // Afficher le contenu si tout est OK
  return <>{children}</>;
}
