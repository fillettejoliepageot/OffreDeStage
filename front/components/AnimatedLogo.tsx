"use client"

import { Building2, Briefcase } from "lucide-react"

interface AnimatedLogoProps {
  variant?: "building" | "briefcase"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function AnimatedLogo({ variant = "building", size = "md", className = "" }: AnimatedLogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-7 w-7"
  }

  const Icon = variant === "building" ? Building2 : Briefcase

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        flex items-center justify-center 
        rounded-lg 
        bg-gradient-to-br from-primary to-primary/80
        shadow-lg 
        relative 
        overflow-hidden 
        group
        transition-all 
        duration-300 
        hover:scale-110 
        hover:rotate-[5deg]
        hover:shadow-2xl
        ${className}
      `}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
    >
      {/* Effet de brillance au survol */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[600ms] ease-in-out"
      />
      
      {/* Icône avec rotation */}
      <Icon 
        className={`${iconSizes[size]} text-primary-foreground relative z-10 transition-all duration-300 ease-out group-hover:rotate-[360deg] group-hover:scale-110`}
      />

      {/* Particules animées - CSS pur avec positions fixes */}
      <div
        className="absolute w-1 h-1 bg-white/50 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse"
        style={{
          top: '20%',
          left: '30%',
          animation: 'float 1s ease-in-out infinite'
        }}
      />
      <div
        className="absolute w-1 h-1 bg-white/50 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse"
        style={{
          top: '60%',
          left: '70%',
          animation: 'float 1.3s ease-in-out infinite'
        }}
      />
      <div
        className="absolute w-1 h-1 bg-white/50 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse"
        style={{
          top: '40%',
          left: '50%',
          animation: 'float 1.6s ease-in-out infinite'
        }}
      />

      {/* Styles d'animation inline */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% {
              transform: translateY(0) scale(1);
              opacity: 0;
            }
            50% {
              transform: translateY(-20px) scale(1.5);
              opacity: 1;
            }
          }
        `
      }} />
    </div>
  )
}
