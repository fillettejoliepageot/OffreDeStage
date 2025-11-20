"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { GraduationCap, ArrowLeft, Loader2, Eye, EyeOff, Check, X } from "lucide-react"
import WelcomeAnimation from "@/components/WelcomeAnimation"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<string>("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const [shake, setShake] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [registeredUser, setRegisteredUser] = useState<{ name: string, role: "student" | "company" } | null>(null)

  // Rotation des images (entreprise / etudiant)
  const [currentImage, setCurrentImage] = useState<"entreprise" | "etudiant">("entreprise")

  // États de validation
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null)
  const [emailValid, setEmailValid] = useState<boolean | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev === "entreprise" ? "etudiant" : "entreprise"))
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  // Validation de l'email en temps réel
  useEffect(() => {
    if (email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      setEmailValid(emailRegex.test(email))
    } else {
      setEmailValid(null)
    }
  }, [email])

  // Validation du mot de passe en temps réel
  useEffect(() => {
    if (password.length > 0) {
      setPasswordValidation({
        minLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      })
    } else {
      setPasswordValidation({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
      })
    }
  }, [password])

  // Vérification de la correspondance des mots de passe
  useEffect(() => {
    if (confirmPassword.length > 0) {
      setPasswordsMatch(password === confirmPassword)
    } else {
      setPasswordsMatch(null)
    }
  }, [password, confirmPassword])

  // Vérifier si le mot de passe est valide
  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(Boolean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation de l'email
    if (!emailValid) {
      setError("Veuillez entrer une adresse email valide")
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    // Validation du mot de passe
    if (!isPasswordValid()) {
      setError("Le mot de passe ne respecte pas tous les critères de sécurité")
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    // Vérification de la correspondance des mots de passe
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    // Vérification des conditions d'utilisation
    if (!acceptTerms) {
      setError("Veuillez accepter les conditions d'utilisation")
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    setIsLoading(true)

    try {
      // Mapper les rôles du frontend vers le backend
      const roleMap: { [key: string]: string } = {
        etudiant: "student",
        entreprise: "company",
      }

      const backendRole = roleMap[role] || role

      // Appeler l'API d'inscription
      await register({
        email,
        password,
        role: backendRole,
      })

      // Afficher l'animation de bienvenue
      setRegisteredUser({
        name: email.split('@')[0],
        role: backendRole as "student" | "company"
      })
      setShowWelcome(true)
    } catch (err: any) {
      setIsLoading(false)
      setError(err.message || "Erreur lors de l'inscription")
      
      // Animation shake sur erreur
      setShake(true)
      setTimeout(() => setShake(false), 500)
      
      // Notification d'erreur
      toast({
        title: "❌ Erreur d'inscription",
        description: err.message || "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      })
    }
  }

  const handleWelcomeComplete = () => {
    // Redirection selon le rôle
    const redirectMap: { [key: string]: string } = {
      student: "/etudiant/dashboard",
      company: "/entreprise/dashboard",
    }
    
    if (registeredUser) {
      router.push(redirectMap[registeredUser.role] || "/")
    }
  }

  // Afficher l'animation de bienvenue
  if (showWelcome && registeredUser) {
    return (
      <WelcomeAnimation
        userName={registeredUser.name}
        userRole={registeredUser.role}
        onComplete={handleWelcomeComplete}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div
        className="w-full max-w-5xl max-h-[600px] bg-background/80 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden flex flex-col md:flex-row"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {/* Colonne image gauche */}
        <div className="relative hidden md:block md:w-1/2 bg-muted">
          {/* Bouton retour en haut à gauche de la photo */}
          <div className="absolute top-4 left-4 z-20">
            <Button variant="ghost" asChild className="group bg-background/70 hover:bg-background">
              <Link href="/" className="gap-2">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Retour à l'accueil
              </Link>
            </Button>
          </div>

          <div className="absolute inset-0">
            <Image
              src={currentImage === "entreprise" ? "/entreprise.png" : "/etudiant.png"}
              alt={currentImage === "entreprise" ? "Espace entreprise" : "Espace étudiant"}
              fill
              sizes="50vw"
              priority
              className="object-cover transition-opacity duration-700 ease-in-out" 
            />
          </div>
          <div className="relative z-10 h-full w-full bg-gradient-to-t from-background/40 via-background/10 to-transparent" />
        </div>

        {/* Colonne formulaire droite */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
          <div 
            className="w-full max-w-md space-y-6"
          >
            <div 
              className="text-center space-y-2"
              style={{
                animation: mounted ? 'fadeInUp 0.6s ease-out 0.2s both' : 'none'
              }}
            >
              <Link href="/" className="inline-flex items-center gap-2 font-semibold text-xl mb-4 group">
                <GraduationCap className="h-6 w-6 text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                <span>EspaceStage</span>
              </Link>
            </div>

            <Card 
              ref={cardRef}
              className={`border-2 transition-all duration-300 ${shake ? 'animate-shake' : ''}`}
              style={{
                animation: mounted ? 'fadeInUp 0.6s ease-out 0.4s both' : 'none'
              }}
            >
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">Créer un compte</CardTitle>
            <CardDescription>Rejoignez notre communauté dès aujourd'hui</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2 group">
                <Label htmlFor="register-email" className="group-focus-within:text-primary transition-colors">Email</Label>
                <div className="relative">
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`transition-all duration-300 focus:scale-[1.02] focus:shadow-md pr-10 ${
                      emailValid === true ? 'border-green-500 focus:ring-green-500' : 
                      emailValid === false ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {emailValid !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailValid ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {emailValid === false && (
                  <p className="text-xs text-red-500">Veuillez entrer une adresse email valide</p>
                )}
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="register-password" className="group-focus-within:text-primary transition-colors">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="transition-all duration-300 focus:scale-[1.02] focus:shadow-md pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                
                {/* Indicateurs de validation du mot de passe */}
                {password.length > 0 && (
                  <div className="space-y-2 p-3 bg-muted/50 rounded-lg border">
                    <p className="text-xs font-semibold text-foreground mb-2">Votre mot de passe doit contenir :</p>
                    <div className="space-y-1">
                      <div className={`flex items-center gap-2 text-xs transition-colors ${
                        passwordValidation.minLength ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        {passwordValidation.minLength ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        <span>Au moins 8 caractères</span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs transition-colors ${
                        passwordValidation.hasUpperCase ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        {passwordValidation.hasUpperCase ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        <span>Une lettre majuscule (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs transition-colors ${
                        passwordValidation.hasLowerCase ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        {passwordValidation.hasLowerCase ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        <span>Une lettre minuscule (a-z)</span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs transition-colors ${
                        passwordValidation.hasNumber ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        {passwordValidation.hasNumber ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        <span>Un chiffre (0-9)</span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs transition-colors ${
                        passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        {passwordValidation.hasSpecialChar ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        <span>Un caractère spécial (!@#$%...)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="confirm-password" className="group-focus-within:text-primary transition-colors">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`transition-all duration-300 focus:scale-[1.02] focus:shadow-md pr-20 ${
                      passwordsMatch === true ? 'border-green-500 focus:ring-green-500' : 
                      passwordsMatch === false ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {passwordsMatch !== null && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2">
                      {passwordsMatch ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {passwordsMatch === false && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    Les mots de passe ne correspondent pas
                  </p>
                )}
                {passwordsMatch === true && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Les mots de passe correspondent
                  </p>
                )}
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="register-role" className="group-focus-within:text-primary transition-colors">Je suis</Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger id="register-role" className="transition-all duration-300 focus:scale-[1.02] focus:shadow-md">
                    <SelectValue placeholder="Sélectionnez votre rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="etudiant">Étudiant</SelectItem>
                    <SelectItem value="entreprise">Entreprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  J'accepte les{" "}
                  <Link href="#" className="text-primary hover:underline">
                    conditions d'utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link href="#" className="text-primary hover:underline">
                    politique de confidentialité
                  </Link>
                </label>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full group relative overflow-hidden" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création du compte...
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Créer mon compte</span>
                    <span className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  </>
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Vous avez déjà un compte ?{" "}
                <Link href="/auth/login" className="text-primary font-medium hover:underline">
                  Se connecter
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

          </div>
        </div>
      </div>

      {/* Styles d'animation */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
