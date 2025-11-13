"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AnimatedAvatarProps {
  src?: string
  alt?: string
  fallback: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function AnimatedAvatar({ src, alt, fallback, size = "md", className = "" }: AnimatedAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  }

  return (
    <div className="relative group">
      {/* Cercles de pulsation au survol - CSS pur */}
      <div
        className="
          absolute 
          inset-0 
          rounded-full 
          bg-primary/20
          scale-100
          opacity-0
          group-hover:scale-150
          group-hover:opacity-100
          transition-all 
          duration-1000 
          ease-out
        "
      />
      <div
        className="
          absolute 
          inset-0 
          rounded-full 
          bg-primary/10
          scale-100
          opacity-0
          group-hover:scale-150
          group-hover:opacity-100
          transition-all 
          duration-1000 
          ease-out
          delay-300
        "
      />

      <Avatar 
        className={`
          ${sizeClasses[size]} 
          ${className} 
          relative 
          z-10 
          border-2 
          border-transparent
          group-hover:border-primary
          transition-all 
          duration-300 
          ease-out
          group-hover:scale-110 
          group-hover:rotate-3
          shadow-md
          group-hover:shadow-2xl
        `}
      >
        {src && (
          <AvatarImage 
            src={src} 
            alt={alt}
            className="
              transition-all 
              duration-300 
              group-hover:brightness-110 
              group-hover:contrast-110
            "
          />
        )}
        <AvatarFallback 
          className="
            bg-primary 
            text-primary-foreground 
            font-semibold
            transition-transform 
            duration-300
            group-hover:scale-110
          "
        >
          {fallback}
        </AvatarFallback>
      </Avatar>

      {/* Effet de brillance au survol - CSS pur */}
      <div
        className="
          absolute 
          inset-0 
          rounded-full 
          overflow-hidden 
          pointer-events-none 
          z-20
        "
      >
        <div
          className="
            absolute 
            inset-0 
            bg-gradient-to-r 
            from-transparent 
            via-white/40 
            to-transparent
            -translate-x-full
            group-hover:translate-x-full
            transition-transform 
            duration-700 
            ease-in-out
          "
        />
      </div>
    </div>
  )
}
