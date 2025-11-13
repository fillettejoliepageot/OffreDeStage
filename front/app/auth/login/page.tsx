"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, ArrowLeft, Loader2, Ban, AlertTriangle, XCircle, Eye, EyeOff, Check, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isBlocked, setIsBlocked] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [shake, setShake] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorModalMessage, setErrorModalMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // États de validation
  const [emailValid, setEmailValid] = useState<boolean | null>(null)
  const [passwordTouched, setPasswordTouched] = useState(false)

  useEffect(() => {
    setMounted(true)
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

  const handleSubmit = async (e: React.FormEvent) => {
    setError("")
    setIsBlocked(false)

    // Validation avant soumission
    if (!emailValid) {
      setError("Veuillez entrer une adresse email valide")
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      setPasswordTouched(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    setIsLoading(true)

    try {
      // Appeler l'API de connexion sans rôle (détection automatique)
      await login(email, password)

      // Récupérer l'utilisateur depuis localStorage pour la redirection
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null

      // Notification de succès
      toast({
        title: "✅ Connexion réussie",
        description: "Vous allez être redirigé vers votre tableau de bord...",
        variant: "default",
      })

      // Redirection selon le rôle détecté
      const redirectMap: { [key: string]: string } = {
        student: "/etudiant/dashboard",
        company: "/entreprise/dashboard",
        admin: "/admin/dashboard",
      }

      // Petit délai pour voir la notification
      setTimeout(() => {
        router.push(redirectMap[user?.role] || "/")
      }, 500)
    } catch (err: any) {
      setIsLoading(false)
      
      // Vérifier si c'est une erreur de compte bloqué
      const errorMessage = err.message || "Email ou mot de passe incorrect"
      const isAccountBlocked = errorMessage.includes("bloqué") || err.response?.status === 403
      
      setIsBlocked(isAccountBlocked)
      setError(errorMessage)
      
      // Animation shake sur erreur
      setShake(true)
      setTimeout(() => setShake(false), 500)
      
      // Afficher la modal d'erreur
      setErrorModalMessage(errorMessage)
      setShowErrorModal(true)
      
      // Notification d'erreur
      toast({
        title: isAccountBlocked ? "🚫 Compte bloqué" : "❌ Erreur de connexion",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md space-y-6"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
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
          <h1 className="text-3xl font-bold tracking-tight">Bon retour !</h1>
          <p className="text-muted-foreground">Connectez-vous à votre compte</p>
        </div>

        <Card 
          ref={cardRef}
          className={`border-2 transition-all duration-300 ${shake ? 'animate-shake' : ''}`}
          style={{
            animation: mounted ? 'fadeInUp 0.6s ease-out 0.4s both' : 'none'
          }}
        >
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Entrez vos identifiants pour accéder à votre espace</CardDescription>
          </CardHeader>
          <div>
            <CardContent className="space-y-4">
              {error && isBlocked && (
                <Alert variant="destructive" className="border-2">
                  <Ban className="h-5 w-5" />
                  <AlertTitle className="font-bold text-lg">Compte bloqué</AlertTitle>
                  <AlertDescription className="mt-2 space-y-2">
                    <p className="font-medium">{error}</p>
                    <p className="text-sm">
                      Votre compte a été suspendu par un administrateur. 
                      Pour plus d'informations ou pour contester cette décision, 
                      veuillez contacter le support à{" "}
                      <a href="mailto:support@stageconnect.com" className="underline font-medium">
                        support@stageconnect.com
                      </a>
                    </p>
                  </AlertDescription>
                </Alert>
              )}
              
              {error && !isBlocked && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2 group">
                <Label htmlFor="email" className="group-focus-within:text-primary transition-colors">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
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
                <Label htmlFor="password" className="group-focus-within:text-primary transition-colors">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSubmit(e)
                      }
                    }}
                    required
                    className={`transition-all duration-300 focus:scale-[1.02] focus:shadow-md pr-10 ${
                      passwordTouched && password.length > 0 && password.length < 6 ? 'border-amber-500 focus:ring-amber-500' : ''
                    }`}
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
                {passwordTouched && password.length > 0 && password.length < 6 && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Le mot de passe doit contenir au moins 6 caractères
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link href="#" className="text-primary hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="button"
                onClick={(e) => handleSubmit(e)}
                className="w-full group relative overflow-hidden" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Se connecter</span>
                    <span className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  </>
                )}
              </Button>

              <div className="text-sm text-center text-muted-foreground">
                Pas encore de compte ?{" "}
                <Link href="/auth/register" className="text-primary font-medium hover:underline">
                  S'inscrire
                </Link>
              </div>
            </CardFooter>
          </div>
        </Card>

        <div 
          className="text-center"
          style={{
            animation: mounted ? 'fadeInUp 0.6s ease-out 0.6s both' : 'none'
          }}
        >
          <Button variant="ghost" asChild className="group">
            <Link href="/" className="gap-2">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </div>

      {/* Modal d'erreur de connexion */}
      <AlertDialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl">
                {isBlocked ? "Compte bloqué" : "Erreur de connexion"}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="text-base space-y-3">
                {isBlocked ? (
                  <>
                    <div className="font-medium text-foreground">{errorModalMessage}</div>
                    <div className="text-sm text-muted-foreground">
                      Votre compte a été suspendu par un administrateur. 
                      Pour plus d'informations ou pour contester cette décision, 
                      veuillez contacter le support à{" "}
                      <a 
                        href="mailto:support@stageconnect.com" 
                        className="text-primary underline font-medium hover:text-primary/80"
                      >
                        support@stageconnect.com
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-medium text-foreground">
                      Les identifiants que vous avez saisis sont incorrects.
                    </div>
                    <div className="bg-muted/50 p-3 rounded-md space-y-2 text-sm">
                      <div className="font-medium text-foreground">Vérifiez que :</div>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Votre adresse email est correcte</li>
                        <li>Votre mot de passe est correct (attention aux majuscules)</li>
                        <li>Vous avez bien créé un compte</li>
                      </ul>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Mot de passe oublié ?{" "}
                      <Link href="#" className="text-primary underline font-medium hover:text-primary/80">
                        Réinitialisez-le ici
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowErrorModal(false)}
              className="w-full sm:w-auto"
            >
              Réessayer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
