"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Building2, LayoutDashboard, Briefcase, Users, UserCircle, LogOut, Menu, X, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AnimatedLogo } from "@/components/AnimatedLogo"
import { AnimatedAvatar } from "@/components/AnimatedAvatar"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useCompanyProfile } from "@/contexts/CompanyProfileContext"
import api from "@/lib/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const navItems = [
  { href: "/entreprise/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/entreprise/offres", label: "Offres", icon: Briefcase },
  { href: "/entreprise/candidatures", label: "Candidatures", icon: Users },
  { href: "/entreprise/profil", label: "Profil", icon: UserCircle },
]

export function CompanyNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuth()
  const { profile: companyProfile } = useCompanyProfile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Charger le nombre de candidatures en attente
  useEffect(() => {
    if (mounted && user?.role === 'company') {
      loadPendingCount()
      
      // Rafraîchir toutes les 10 secondes
      const interval = setInterval(() => {
        loadPendingCount()
      }, 10000)
      
      return () => clearInterval(interval)
    }
  }, [mounted, user])

  const loadPendingCount = async () => {
    try {
      const response = await api.get('/candidatures/company/pending-count')
      if (response.data.success) {
        setPendingCount(response.data.pendingCount)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du compteur:', error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
    setShowLogoutDialog(false)
  }

  // Ne rien rendre avant le montage pour éviter l'erreur d'hydratation
  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/entreprise/dashboard" className="flex items-center gap-2">
              <AnimatedLogo variant="building" size="md" />
              <span className="font-semibold text-lg">EspaceStage</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="relative rounded-full p-0">
              <AnimatedAvatar
                src={undefined}
                alt="Entreprise"
                fallback="E"
                size="md"
              />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/entreprise/dashboard" className="flex items-center gap-2">
            <AnimatedLogo variant="building" size="md" />
            <span className="font-semibold text-lg">EspaceStage</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const showBadge = item.href === "/entreprise/candidatures" && pendingCount > 0
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {showBadge && (
                    <Badge 
                      variant="destructive" 
                      className="ml-1 h-5 min-w-5 px-1.5 flex items-center justify-center text-xs font-semibold"
                    >
                      {pendingCount > 99 ? '99+' : pendingCount}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Desktop User Menu */}
        <div className="hidden md:flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative rounded-full p-0">
                <AnimatedAvatar
                  src={companyProfile?.logo_url}
                  alt={companyProfile?.company_name || "Entreprise"}
                  fallback={companyProfile?.company_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "E"}
                  size="md"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {companyProfile?.company_name || user?.email || "Entreprise"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || ""}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/entreprise/profil" className="cursor-pointer">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/entreprise/parametres" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const showBadge = item.href === "/entreprise/candidatures" && pendingCount > 0
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                  {showBadge && (
                    <Badge 
                      variant="destructive" 
                      className="ml-auto h-5 min-w-5 px-1.5 flex items-center justify-center text-xs font-semibold"
                    >
                      {pendingCount > 99 ? '99+' : pendingCount}
                    </Badge>
                  )}
                </Link>
              )
            })}
            <div className="pt-4 border-t space-y-2">
              <Link
                href="/entreprise/parametres"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent w-full"
              >
                <Settings className="h-5 w-5" />
                Paramètres
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setShowLogoutDialog(true)
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400 w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir vous déconnecter ? Vous serez redirigé vers la page d'accueil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Non</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Oui</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  )
}
