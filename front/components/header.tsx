import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"
export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
            <GraduationCap className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            <span>EspaceStage</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/#etudiants"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Étudiants
            </Link>
            <Link
              href="/#entreprises"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Entreprises
            </Link>
            <Link
              href="/#a-propos"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              À propos
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Se connecter</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">S'inscrire</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
