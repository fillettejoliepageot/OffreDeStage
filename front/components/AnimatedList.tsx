"use client"

import { useEffect, useRef, useState, ReactNode, Children } from "react"

interface AnimatedListProps {
  children: ReactNode
  className?: string
  stagger?: number
}

export function AnimatedList({ children, className = "", stagger = 100 }: AnimatedListProps) {
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const list = listRef.current
    if (!list) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animer les éléments un par un
            const childrenArray = Children.toArray(children)
            childrenArray.forEach((_, index) => {
              setTimeout(() => {
                setVisibleItems((prev) => [...prev, index])
              }, index * stagger)
            })
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(list)

    return () => observer.disconnect()
  }, [children, stagger])

  const childrenArray = Children.toArray(children)

  return (
    <div ref={listRef} className={className}>
      {childrenArray.map((child, index) => (
        <div
          key={index}
          style={{
            opacity: visibleItems.includes(index) ? 1 : 0,
            transform: visibleItems.includes(index) 
              ? "translateX(0) scale(1)" 
              : "translateX(-30px) scale(0.95)",
            transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transitionDelay: `${index * 0.05}s`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
