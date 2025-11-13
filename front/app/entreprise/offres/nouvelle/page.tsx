"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"

export default function NouvelleOffre() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    domaine: "",
    nombre_places: 1,
    localisation: "",
    type_stage: "",
    remuneration: false,
    montant_remuneration: 0,
    date_debut: "",
    date_fin: "",
  })

  const domains = [
    "Technologies de l'information",
    "Finance",
    "Santé",
    "Éducation",
    "Commerce",
    "Industrie",
    "Services",
    "Autre"
  ]

  const typeStages = ["Présentiel", "Distanciel", "Hybride"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Validation
      if (!formData.title || !formData.description || !formData.domaine) {
        toast({
          title: "❌ Erreur de validation",
          description: "Le titre, la description et le domaine sont obligatoires",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      const response = await api.post('/offres', formData)

      if (response.data.success) {
        toast({
          title: "✅ Succès",
          description: "Offre créée avec succès",
          variant: "default",
        })
        
        // Redirection vers la liste des offres
        router.push("/entreprise/offres")
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.message || "Erreur lors de la création de l'offre",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/entreprise/offres">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créer une offre de stage</h1>
          <p className="text-muted-foreground mt-2">Remplissez les informations pour publier votre offre</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'offre</CardTitle>
            <CardDescription>Tous les champs sont obligatoires</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Titre de l'offre *</Label>
              <Input
                id="title"
                placeholder="Ex: Développeur Full Stack"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Décrivez les missions, compétences requises et ce que vous offrez..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">Minimum 100 caractères</p>
            </div>

            {/* Domain */}
            <div className="space-y-2">
              <Label htmlFor="domaine">Domaine *</Label>
              <Select value={formData.domaine} onValueChange={(value) => handleChange("domaine", value)} required>
                <SelectTrigger id="domaine">
                  <SelectValue placeholder="Sélectionnez un domaine" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Localisation et Type */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="localisation">Localisation</Label>
                <Input
                  id="localisation"
                  placeholder="Ex: Paris, Lyon, Distanciel..."
                  value={formData.localisation}
                  onChange={(e) => handleChange("localisation", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type_stage">Type de stage</Label>
                <Select value={formData.type_stage} onValueChange={(value) => handleChange("type_stage", value)}>
                  <SelectTrigger id="type_stage">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeStages.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date_debut">Date de début</Label>
                <Input
                  id="date_debut"
                  type="date"
                  value={formData.date_debut}
                  onChange={(e) => handleChange("date_debut", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_fin">Date de fin</Label>
                <Input
                  id="date_fin"
                  type="date"
                  value={formData.date_fin}
                  onChange={(e) => handleChange("date_fin", e.target.value)}
                />
              </div>
            </div>

            {/* Places */}
            <div className="space-y-2">
              <Label htmlFor="nombre_places">Nombre de places *</Label>
              <Input
                id="nombre_places"
                type="number"
                min="1"
                max="10"
                value={formData.nombre_places}
                onChange={(e) => handleChange("nombre_places", Number.parseInt(e.target.value))}
                required
              />
              <p className="text-xs text-muted-foreground">Nombre de stagiaires que vous souhaitez recruter</p>
            </div>

            {/* Rémunération */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remuneration"
                  checked={formData.remuneration}
                  onCheckedChange={(checked) => handleChange("remuneration", checked as boolean)}
                />
                <Label htmlFor="remuneration" className="cursor-pointer">
                  Stage rémunéré
                </Label>
              </div>
              
              {formData.remuneration && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="montant_remuneration">Montant de la rémunération (€/mois)</Label>
                  <Input
                    id="montant_remuneration"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 600"
                    value={formData.montant_remuneration || ""}
                    onChange={(e) => handleChange("montant_remuneration", parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
              <Button asChild variant="outline" className="flex-1 bg-transparent" type="button" disabled={isSaving}>
                <Link href="/entreprise/offres">Annuler</Link>
              </Button>
              <Button type="submit" className="flex-1" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Publier l'offre
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
