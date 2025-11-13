"use client"

import { useEffect, useRef, useState, ReactNode } from "react"
import { Card } from "@/components/ui/card"

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
  hover?: boolean
}

export function AnimatedCard({ children, className = "", delay = 0, hover = true }: AnimatedCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    // Observer pour détecter quand la carte entre dans le viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true)
            }, delay)
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(card)

    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? isHovered 
            ? "translateY(-8px) scale(1.02)" 
            : "translateY(0) scale(1)"
          : "translateY(30px) scale(0.95)",
        transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transitionDelay: isVisible ? "0s" : `${delay}ms`
      }}
    >
      <Card 
        className={`${className} relative overflow-hidden`}
        style={{
          boxShadow: isHovered
            ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          transition: "box-shadow 0.3s ease"
        }}
      >
        {/* Effet de brillance au survol */}
        {hover && isHovered && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
            style={{
              animation: "shine 1s ease-in-out"
            }}
          />
        )}
        
        {children}
      </Card>

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}
