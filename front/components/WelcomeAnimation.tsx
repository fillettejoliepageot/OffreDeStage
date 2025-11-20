/**
 * ============================================================================
 * WELCOME ANIMATION COMPONENT
 * ============================================================================
 * 
 * Animation de bienvenue professionnelle affichée après l'inscription
 * 
 * @features
 * - Design responsive (mobile, tablet, desktop)
 * - Animations CSS fluides et élégantes
 * - Couleurs cohérentes avec le thème du site
 * - Personnalisation selon le rôle (étudiant/entreprise)
 * - Auto-redirection après 9 secondes
 * 
 * @responsive
 * - Mobile: < 640px (sm)
 * - Tablet: 640px - 1024px (sm - lg)
 * - Desktop: > 1024px (lg+)
 * 
 * ============================================================================
 */

"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Sparkles, ArrowRight, Briefcase, GraduationCap, TrendingUp, Users, Award, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

// ============================================================================
// TYPES
// ============================================================================

interface WelcomeAnimationProps {
  userName: string
  userRole: "student" | "company"
  onComplete: () => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function WelcomeAnimation({ userName, userRole, onComplete }: WelcomeAnimationProps) {
  
  // --------------------------------------------------------------------------
  // STATE
  // --------------------------------------------------------------------------
  
  const [step, setStep] = useState(0)
  const [showButton, setShowButton] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number }>>([])

  // --------------------------------------------------------------------------
  // EFFECTS
  // --------------------------------------------------------------------------
  
  useEffect(() => {
    setMounted(true)
    
    // Générer des particules élégantes
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
    }))
    setParticles(newParticles)
    
    // Animation des étapes
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 1600),
      setTimeout(() => setStep(3), 2400),
      setTimeout(() => setShowButton(true), 3200),
      // Auto-redirect après 9 secondes
      setTimeout(() => onComplete(), 9000),
    ]

    return () => timers.forEach(timer => clearTimeout(timer))
  }, [onComplete])

  // --------------------------------------------------------------------------
  // CONFIGURATION PAR RÔLE
  // --------------------------------------------------------------------------
  
  const roleConfig = {
    student: {
      icon: GraduationCap,
      title: "Étudiant",
      subtitle: "Votre parcours vers le stage idéal commence ici",
      features: [
        { icon: Briefcase, text: "Accès aux offres de stage" },
        { icon: TrendingUp, text: "Suivi de vos candidatures" },
        { icon: Award, text: "Profil professionnel optimisé" },
      ]
    },
    company: {
      icon: Briefcase,
      title: "Entreprise",
      subtitle: "Trouvez les talents de demain dès aujourd'hui",
      features: [
        { icon: Users, text: "Publiez vos offres de stage" },
        { icon: TrendingUp, text: "Gérez vos candidatures" },
        { icon: Award, text: "Accédez aux meilleurs profils" },
      ]
    }
  }

  // --------------------------------------------------------------------------
  // COMPUTED VALUES
  // --------------------------------------------------------------------------
  
  const config = roleConfig[userRole]
  const RoleIcon = config.icon

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  
  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background">
      
      {/* ====================================================================
          STYLES CSS
          ==================================================================== */}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          0% { 
            opacity: 0; 
            transform: scale(0.5); 
          }
          50% {
            transform: scale(1.05);
          }
          100% { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes slideRight {
          from { 
            opacity: 0; 
            transform: translateX(-30px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.05);
            opacity: 0.9;
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes particleFloat {
          0% { 
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% { 
            transform: translate(var(--tx), var(--ty)) scale(1);
            opacity: 0;
          }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes checkmark {
          0% { 
            stroke-dashoffset: 100;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% { 
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .scale-in {
          animation: scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
        
        .slide-right {
          animation: slideRight 0.5s ease-out forwards;
        }
        
        .pulse-animation {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        
        .particle {
          animation: particleFloat var(--duration) ease-out var(--delay) infinite;
        }
        
        .shimmer-effect {
          background: linear-gradient(
            90deg,
            transparent 0%,
            hsl(var(--primary) / 0.1) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }
        
        .gradient-border {
          position: relative;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
          padding: 2px;
          border-radius: 1rem;
        }
        
        .gradient-border-content {
          background: hsl(var(--background));
          border-radius: calc(1rem - 2px);
        }
      `}</style>
      
      {/* ====================================================================
          FOND & DÉCORATIONS
          ==================================================================== */}
      
      {/* Fond avec dégradé subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Particules flottantes élégantes (30 particules) */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle absolute w-1 h-1 rounded-full bg-primary/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            '--duration': `${particle.duration}s`,
            '--delay': `${particle.delay}s`,
            '--tx': `${(Math.random() - 0.5) * 100}px`,
            '--ty': `${(Math.random() - 0.5) * 100}px`,
          } as React.CSSProperties}
        />
      ))}
      
      {/* Cercles décoratifs en arrière-plan (effet de profondeur) */}
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl hidden sm:block" />
      <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-accent/5 blur-3xl hidden sm:block" />
      
      {/* Contenu principal simplifié */}
      <div className="relative w-full max-w-md sm:max-w-lg px-4 sm:px-6 z-10">
        <div className="relative bg-card/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-border p-5 sm:p-7 md:p-8">
          
          {/* ========== EN-TÊTE ========== */}
          <div className="flex flex-col items-center mb-5 sm:mb-6">
            
            {/* Icône principale */}
            <div className="relative mb-4 sm:mb-6">
              {/* Halo lumineux */}
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-in" />
              
              {/* Icône avec animation */}
              <div className="relative scale-in">
                <div className="bg-gradient-to-br from-primary to-accent p-3 sm:p-4 md:p-5 rounded-full shadow-lg float-animation">
                  <RoleIcon className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-primary-foreground" />
                </div>
              </div>
              
              {/* Badge de succès */}
              <div 
                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-green-500 rounded-full p-1.5 sm:p-2 shadow-lg scale-in"
                style={{ animationDelay: '0.3s', opacity: 0 }}
              >
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
            
            {/* Titre */}
            <div className="text-center space-y-2 sm:space-y-3 slide-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground px-4">
                Bienvenue, {userName} !
              </h1>
            </div>
          </div>

          {/* ========== BOUTON D'ACTION ========== */}
          {showButton && (
            <div 
              className="space-y-3 sm:space-y-4 slide-up"
              style={{ animationDelay: '0.2s', opacity: 0 }}
            >
              {/* Bouton principal */}
              <Button
                onClick={onComplete}
                size="lg"
                className="w-full group relative overflow-hidden bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-3 sm:py-3 text-sm sm:text-base shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Accéder à mon espace</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="shimmer-effect absolute inset-0" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
