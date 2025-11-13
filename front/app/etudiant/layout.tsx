"use client"

import type React from "react"
import { StudentNav } from "@/components/student-nav"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { StudentProfileProvider } from "@/contexts/StudentProfileContext"

export default function EtudiantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentProfileProvider>
        <div className="min-h-screen bg-background">
          <StudentNav />
          <main className="container py-8">{children}</main>
        </div>
      </StudentProfileProvider>
    </ProtectedRoute>
  )
}
