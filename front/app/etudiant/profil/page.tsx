"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Save, Upload, User, Loader2, FileText, Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import { useStudentProfile } from "@/contexts/StudentProfileContext"

export default function ProfilPage() {
  const { toast } = useToast()
  const { refreshProfile } = useStudentProfile()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    domaine_etude: "",
    adresse: "",
    telephone: "",
    photo_url: "",
    cv_url: "",
    certificat_url: "",
    niveau_etude: "",
    specialisation: "",
    etablissement: "",
    bio: "",
  })

  const niveaux = ["L1", "L2", "L3", "M1", "M2"]

  // Charger le profil au montage du composant
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await api.get('/student/profile')
      
      if (response.data.success) {
        const data = response.data.data
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          domaine_etude: data.domaine_etude || "",
          adresse: data.adresse || "",
          telephone: data.telephone || "",
          photo_url: data.photo_url || "",
          cv_url: data.cv_url || "",
          certificat_url: data.certificat_url || "",
          niveau_etude: data.niveau_etude || "",
          specialisation: data.specialisation || "",
          etablissement: data.etablissement || "",
          bio: data.bio || "",
        })
      }
    } catch (error: any) {
      // Si 404, c'est normal (profil pas encore créé)
      if (error.response?.status !== 404) {
        console.error('Erreur:', error)
        toast({
          title: "⚠️ Information",
          description: "Veuillez compléter votre profil",
          variant: "default",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Validation
      if (!formData.first_name || !formData.last_name) {
        toast({
          title: "❌ Erreur de validation",
          description: "Le prénom et le nom sont obligatoires",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      const response = await api.post('/student/profile', formData)

      if (response.data.success) {
        // Rafraîchir le profil dans le contexte
        await refreshProfile()
        
        toast({
          title: "✅ Succès",
          description: response.data.message || "Profil enregistré avec succès",
          variant: "default",
        })
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.message || "Erreur lors de l'enregistrement du profil",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))        
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo_url: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, cv_url: reader.result as string }))
        toast({
          title: "✅ CV chargé",
          description: "Votre CV a été chargé avec succès",
          variant: "default",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCertificatUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, certificat_url: reader.result as string }))
        toast({
          title: "✅ Certificat chargé",
          description: "Votre certificat a été chargé avec succès",
          variant: "default",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground text-balance">Mon profil</h1>
        <p className="text-muted-foreground mt-2">Gérez vos informations pour maximiser vos chances</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Section */}
        <Card>
          <CardHeader>
            <CardTitle>Photo de profil</CardTitle>
            <CardDescription>Ajoutez ou modifiez votre photo de profil</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={formData.photo_url || "/placeholder.svg?height=96&width=96"} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Label htmlFor="photo" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors w-fit">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm font-medium">Télécharger une photo</span>
                </div>
                <Input id="photo" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </Label>
              <p className="text-xs text-muted-foreground">Format recommandé: PNG ou JPG, taille maximale 2MB</p>
            </div>
          </CardContent>
        </Card>

        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Vos informations de base</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  required
                  placeholder="Ex: Jean"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  required
                  placeholder="Ex: Dupont"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => handleChange("telephone", e.target.value)}
                  placeholder="Ex: +261 34 12 345 67"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  value={formData.adresse}
                  onChange={(e) => handleChange("adresse", e.target.value)}
                  placeholder="Ex: 123 Rue de Paris, 75001 Paris"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formation */}
        <Card>
          <CardHeader>
            <CardTitle>Formation</CardTitle>
            <CardDescription>Votre parcours académique</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="etablissement">Établissement</Label>
              <Input
                id="etablissement"
                value={formData.etablissement}
                onChange={(e) => handleChange("etablissement", e.target.value)}
                placeholder="Ex: Université de Paris"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="niveau_etude">Niveau d'études</Label>
                <Select value={formData.niveau_etude} onValueChange={(value) => handleChange("niveau_etude", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {niveaux.map((niveau) => (
                      <SelectItem key={niveau} value={niveau}>
                        {niveau}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="domaine_etude">Domaine d'étude</Label>
                <Input
                  id="domaine_etude"
                  value={formData.domaine_etude}
                  onChange={(e) => handleChange("domaine_etude", e.target.value)}
                  placeholder="Ex: Informatique"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialisation">Spécialisation</Label>
              <Input
                id="specialisation"
                value={formData.specialisation}
                onChange={(e) => handleChange("specialisation", e.target.value)}
                placeholder="Ex: Développement Web"
              />
            </div>
          </CardContent>
        </Card>

        {/* À propos */}
        <Card>
          <CardHeader>
            <CardTitle>À propos</CardTitle>
            <CardDescription>Présentez-vous en quelques mots</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Décrivez votre parcours, vos objectifs professionnels et ce qui vous motive..."
              className="min-h-32 leading-relaxed"
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
            />
          </CardContent>
        </Card>

        {/* CV */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              CV
            </CardTitle>
            <CardDescription>Téléchargez votre CV (PDF, Image)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.cv_url && (
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">CV téléchargé</p>
                    <p className="text-xs text-muted-foreground">Cliquez sur "Remplacer" pour changer</p>
                  </div>
                </div>
              </div>
            )}

            <Label htmlFor="cv" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors w-fit">
                <Upload className="h-4 w-4" />
                <span className="text-sm font-medium">{formData.cv_url ? "Remplacer le CV" : "Télécharger un CV"}</span>
              </div>
              <Input id="cv" type="file" accept=".pdf,image/*" className="hidden" onChange={handleCVUpload} />
            </Label>
          </CardContent>
        </Card>

        {/* Certificat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Certificat
            </CardTitle>
            <CardDescription>Téléchargez votre certificat de scolarité (PDF, Image)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.certificat_url && (
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Certificat téléchargé</p>
                    <p className="text-xs text-muted-foreground">Cliquez sur "Remplacer" pour changer</p>
                  </div>
                </div>
              </div>
            )}

            <Label htmlFor="certificat" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors w-fit">
                <Upload className="h-4 w-4" />
                <span className="text-sm font-medium">{formData.certificat_url ? "Remplacer le certificat" : "Télécharger un certificat"}</span>
              </div>
              <Input id="certificat" type="file" accept=".pdf,image/*" className="hidden" onChange={handleCertificatUpload} />
            </Label>
          </CardContent>
        </Card>

        {/* Boutons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => loadProfile()} disabled={isSaving}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Enregistrer les modifications
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
