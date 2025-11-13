import type React from "react"
import { AdminNav } from "@/components/admin-nav"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-background">
        <AdminNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
