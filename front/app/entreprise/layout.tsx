"use client"

import type React from "react"
import { CompanyNav } from "@/components/company-nav"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { CompanyProfileProvider } from "@/contexts/CompanyProfileContext"

export default function EntrepriseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={["company"]}>
      <CompanyProfileProvider>
        <div className="min-h-screen bg-background">
          <CompanyNav />
          <main className="container py-8">{children}</main>
        </div>
      </CompanyProfileProvider>
    </ProtectedRoute>
  )
}
