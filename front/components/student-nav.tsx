"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
import { Briefcase, FileText, User, LogOut, Menu, Settings } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/AuthContext"
import { useStudentProfile } from "@/contexts/StudentProfileContext"
import { AnimatedLogo } from "@/components/AnimatedLogo"
import { AnimatedAvatar } from "@/components/AnimatedAvatar"
import api from "@/lib/api"
import { useState, useEffect } from "react"
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

export function StudentNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuth()
  const { profile: studentProfile } = useStudentProfile()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [newResponsesCount, setNewResponsesCount] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Charger le nombre de nouvelles réponses
  useEffect(() => {
    if (mounted && user?.role === 'student') {
      loadNewResponsesCount()
      
      // Rafraîchir toutes les 10 secondes
      const interval = setInterval(() => {
        loadNewResponsesCount()
      }, 10000)
      
      return () => clearInterval(interval)
    }
  }, [mounted, user])

  const loadNewResponsesCount = async () => {
    try {
      const response = await api.get('/candidatures/student/new-responses')
      if (response.data.success) {
        setNewResponsesCount(response.data.newResponsesCount)
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

  const navItems = [
    { href: "/etudiant/dashboard", label: "Tableau de bord", icon: Briefcase },
    { href: "/etudiant/offres", label: "Offres", icon: Briefcase },
    { href: "/etudiant/candidatures", label: "Candidatures", icon: FileText },
    { href: "/etudiant/profil", label: "Profil", icon: User },
  ]

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        const showBadge = item.href === "/etudiant/candidatures" && newResponsesCount > 0
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isActive 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="font-medium">{item.label}</span>
            {mounted && showBadge && (
              <Badge 
                variant="destructive" 
                className="ml-1 h-5 min-w-5 px-1.5 flex items-center justify-center text-xs font-semibold animate-pulse"
              >
                {newResponsesCount > 99 ? '99+' : newResponsesCount}
              </Badge>
            )}
          </Link>
        )
      })}
    </>
  )

  // Toujours rendre la même structure pour éviter l'erreur d'hydratation
  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/etudiant/dashboard" className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80">
              <AnimatedLogo variant="briefcase" size="md" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">StageHub</span>
            </Link>
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="relative rounded-full p-0 transition-transform duration-200 hover:scale-105">
              <AnimatedAvatar
                src={undefined}
                alt="Étudiant"
                fallback="ET"
                size="md"
              />
            </Button>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/etudiant/dashboard" className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80">
            <AnimatedLogo variant="briefcase" size="md" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">CentreStage</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <NavLinks />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative rounded-full p-0 transition-transform duration-200 hover:scale-105">
                <AnimatedAvatar
                  src={studentProfile?.photo_url}
                  alt={studentProfile?.first_name ? `${studentProfile.first_name} ${studentProfile.last_name}` : "Étudiant"}
                  fallback={`${studentProfile?.first_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "E"}${studentProfile?.last_name?.charAt(0)?.toUpperCase() || "T"}`}
                  size="md"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {mounted && studentProfile?.first_name && studentProfile?.last_name
                      ? `${studentProfile.first_name} ${studentProfile.last_name}`
                      : user?.email || "Étudiant"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {mounted && user?.email ? user.email : ""}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/etudiant/profil" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/etudiant/parametres" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="cursor-pointer text-destructive hover:bg-destructive/10 transition-colors duration-200">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="transition-colors duration-200">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
              <div className="flex flex-col gap-4 mt-8">
                <NavLinks />
                <Link href="/etudiant/parametres">
                  <Button variant="outline" className="w-full justify-start gap-2 bg-transparent hover:bg-primary/10 transition-all duration-200">
                    <Settings className="h-4 w-4" />
                    <span>Paramètres</span>
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent text-destructive hover:bg-destructive/10 transition-all duration-200" onClick={() => setShowLogoutDialog(true)}>
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

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
