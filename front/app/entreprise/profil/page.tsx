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
import { Save, Upload, Building2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import { useCompanyProfile } from "@/contexts/CompanyProfileContext"

export default function EntrepriseProfil() {
  const { toast } = useToast()
  const { refreshProfile } = useCompanyProfile()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    company_name: "",
    sector: "",
    address: "",
    telephone: "",
    description: "",
    nombre_employes: 0,
    logo_url: "",
  })

  const sectors = [
    "Technologies de l'information",
    "Finance",
    "Santé",
    "Éducation",
    "Commerce",
    "Industrie",
    "Services",
    "Autre",
  ]

  // Charger le profil au montage du composant
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await api.get('/company/profile')
      
      if (response.data.success) {
        const data = response.data.data
        setFormData({
          company_name: data.company_name || "",
          sector: data.sector || "",
          address: data.address || "",
          telephone: data.telephone || "",
          description: data.description || "",
          nombre_employes: data.nombre_employes || 0,
          logo_url: data.logo_url || "",
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
      if (!formData.company_name || !formData.sector) {
        toast({
          title: "❌ Erreur de validation",
          description: "Le nom de l'entreprise et le secteur sont obligatoires",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      const response = await api.post('/company/profile', formData)

      if (response.data.success) {
        // Rafraîchir le profil dans le contexte (met à jour la navigation)
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

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logo_url: reader.result as string }))
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil de l'entreprise</h1>
        <p className="text-muted-foreground mt-2">Gérez les informations de votre entreprise</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Section */}
        <Card>
          <CardHeader>
            <CardTitle>Logo de l'entreprise</CardTitle>
            <CardDescription>Ajoutez ou modifiez le logo de votre entreprise</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={formData.logo_url || "/placeholder.svg?height=96&width=96"} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                <Building2 className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Label htmlFor="logo" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors w-fit">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm font-medium">Télécharger un logo</span>
                </div>
                <Input id="logo" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </Label>
              <p className="text-xs text-muted-foreground">Format recommandé: PNG ou JPG, taille maximale 2MB</p>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>Informations de base sur votre entreprise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nom de l'entreprise *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleChange("company_name", e.target.value)}
                  required
                  placeholder="Ex: Tech Solutions SA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector">Secteur d'activité *</Label>
                <Select value={formData.sector} onValueChange={(value) => handleChange("sector", value)}>
                  <SelectTrigger id="sector">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Ex: 123 Rue de la Tech, 75001 Paris"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => handleChange("telephone", e.target.value)}
                  placeholder="Ex: +33 1 23 45 67 89"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre_employes">Nombre d'employés</Label>
                <Input
                  id="nombre_employes"
                  type="number"
                  value={formData.nombre_employes || ""}
                  onChange={(e) => handleChange("nombre_employes", parseInt(e.target.value) || 0)}
                  placeholder="Ex: 50"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description de l'entreprise *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">Décrivez votre entreprise, vos activités et votre culture</p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les modifications
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
