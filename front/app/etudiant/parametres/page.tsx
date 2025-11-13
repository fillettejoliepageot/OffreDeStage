"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Eye, EyeOff, Shield, Loader2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"

export default function ParametresPage() {
  const { toast } = useToast()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentPasswordError, setCurrentPasswordError] = useState("")
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Réinitialiser l'erreur
    setCurrentPasswordError("")
    
    // Validation côté client
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "❌ Champs requis",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      })
      return false
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "❌ Mot de passe trop court",
        description: "Le nouveau mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      })
      return false
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "❌ Mots de passe différents",
        description: "Le nouveau mot de passe et la confirmation ne correspondent pas",
        variant: "destructive",
      })
      return false
    }

    setIsChangingPassword(true)

    try {
      // Appel API backend
      const response = await api.put('/student/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      if (response.data.success) {
        // Notification professionnelle de succès
        toast({
          title: "🎉 Mot de passe modifié avec succès",
          description: "Votre mot de passe a été changé avec succès. Vous pouvez maintenant utiliser votre nouveau mot de passe pour vous connecter. Votre compte est maintenant plus sécurisé.",
          duration: 5000,
          className: "border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20",
        })
        
        // Réinitialiser le formulaire
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        setShowCurrentPassword(false)
        setShowNewPassword(false)
        setShowConfirmPassword(false)
        setCurrentPasswordError("")
      }
    } catch (error: any) {
      // Empêcher tout rechargement
      e.preventDefault()
      
      // Vérifier si c'est une erreur de mot de passe incorrect
      if (error.response?.status === 401) {
        setCurrentPasswordError("❌ Vous avez fait une erreur à votre mot de passe actuel. Essayez à nouveau.")
      }
      
      // Afficher le message d'erreur du backend
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.message || "Erreur lors du changement de mot de passe",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
    
    return false
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" }
    if (password.length < 6) return { strength: 25, label: "Faible", color: "bg-red-500" }
    if (password.length < 8) return { strength: 50, label: "Moyen", color: "bg-orange-500" }
    if (password.length < 12) return { strength: 75, label: "Bon", color: "bg-yellow-500" }
    return { strength: 100, label: "Excellent", color: "bg-green-500" }
  }

  const passwordStrength = getPasswordStrength(passwordData.newPassword)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paramètres du compte</h1>
        <p className="text-muted-foreground mt-2">Gérez la sécurité de votre compte</p>
      </div>

      {/* Section Changement de mot de passe */}
      <Card className="shadow-lg border-2 border-orange-100 dark:border-orange-900/30">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/20 border-b">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Changer le mot de passe</CardTitle>
              <CardDescription className="mt-1">
                Modifiez votre mot de passe pour sécuriser votre compte
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form 
            onSubmit={(e) => {
              handlePasswordChange(e)
              return false
            }} 
            className="space-y-6"
          >
            {/* Mot de passe actuel */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="flex items-center gap-2 text-sm font-medium">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Mot de passe actuel *
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => {
                    setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))
                    setCurrentPasswordError("") // Réinitialiser l'erreur lors de la saisie
                  }}
                  placeholder="Entrez votre mot de passe actuel"
                  className={`pr-10 ${currentPasswordError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {currentPasswordError && (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium animate-in slide-in-from-top-1 duration-200">
                  {currentPasswordError}
                </p>
              )}
            </div>

            {/* Nouveau mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="flex items-center gap-2 text-sm font-medium">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Nouveau mot de passe *
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Minimum 6 caractères"
                  className="pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Indicateur de force du mot de passe */}
              {passwordData.newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Force du mot de passe</span>
                    <span className={`font-medium ${
                      passwordStrength.strength === 100 ? 'text-green-600' :
                      passwordStrength.strength === 75 ? 'text-yellow-600' :
                      passwordStrength.strength === 50 ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirmation du nouveau mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Confirmer le nouveau mot de passe *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirmez votre nouveau mot de passe"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span>❌</span>
                  Les mots de passe ne correspondent pas
                </p>
              )}
              {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Les mots de passe correspondent
                </p>
              )}
            </div>

            {/* Conseils de sécurité */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Conseils pour un mot de passe sécurisé
              </h4>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>Utilisez au moins 8 caractères pour une meilleure sécurité</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>Combinez lettres majuscules et minuscules</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>Ajoutez des chiffres et des caractères spéciaux (@, #, $, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>Évitez les informations personnelles évidentes (nom, date de naissance)</span>
                </li>
              </ul>
            </div>

            {/* Bouton de soumission */}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={
                  isChangingPassword || 
                  !passwordData.currentPassword || 
                  !passwordData.newPassword || 
                  !passwordData.confirmPassword || 
                  passwordData.newPassword !== passwordData.confirmPassword ||
                  passwordData.newPassword.length < 6
                }
                className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Modification en cours...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Changer le mot de passe
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
