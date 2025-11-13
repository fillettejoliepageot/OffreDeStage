"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Plus, Search, Pencil, Trash2, Calendar, Users, Briefcase, Loader2, MapPin, Euro } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"

interface Offre {
  id: string;
  title: string;
  description: string;
  domaine: string;
  nombre_places: number;
  localisation?: string;
  type_stage?: string;
  remuneration?: boolean;
  montant_remuneration?: number;
  date_debut?: string;
  date_fin?: string;
  created_at: string;
  nombre_candidatures?: number;
}

export default function EntrepriseOffres() {
  const { toast } = useToast()
  const [offers, setOffers] = useState<Offre[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [domainFilter, setDomainFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // États pour le modal de modification
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [offerToEdit, setOfferToEdit] = useState<Offre | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editFormData, setEditFormData] = useState({
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

  // Charger les offres au montage
  useEffect(() => {
    loadOffers()
  }, [])

  const loadOffers = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/offres/company/mes-offres')
      
      if (response.data.success) {
        setOffers(response.data.data)
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.message || "Erreur lors du chargement des offres",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDomain = domainFilter === "all" || offer.domaine === domainFilter
    return matchesSearch && matchesDomain
  })

  const handleEdit = (offer: Offre) => {
    setOfferToEdit(offer)
    setEditFormData({
      title: offer.title,
      description: offer.description,
      domaine: offer.domaine,
      nombre_places: offer.nombre_places,
      localisation: offer.localisation || "",
      type_stage: offer.type_stage || "",
      remuneration: offer.remuneration || false,
      montant_remuneration: offer.montant_remuneration || 0,
      date_debut: offer.date_debut || "",
      date_fin: offer.date_fin || "",
    })
    setEditDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setOfferToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleEditChange = (field: string, value: string | number | boolean) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleUpdateSubmit = async () => {
    if (!offerToEdit) return

    try {
      setIsUpdating(true)

      // Validation
      if (!editFormData.title || !editFormData.description || !editFormData.domaine) {
        toast({
          title: "❌ Erreur de validation",
          description: "Le titre, la description et le domaine sont obligatoires",
          variant: "destructive",
        })
        setIsUpdating(false)
        return
      }

      const response = await api.put(`/offres/${offerToEdit.id}`, editFormData)

      if (response.data.success) {
        toast({
          title: "✅ Succès",
          description: "Offre modifiée avec succès",
          variant: "default",
        })
        
        // Recharger les offres
        await loadOffers()
        setEditDialogOpen(false)
        setOfferToEdit(null)
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.message || "Erreur lors de la modification de l'offre",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const confirmDelete = async () => {
    if (!offerToDelete) return

    try {
      setIsDeleting(true)
      const response = await api.delete(`/offres/${offerToDelete}`)

      if (response.data.success) {
        toast({
          title: "✅ Succès",
          description: "Offre supprimée avec succès",
          variant: "default",
        })
        
        // Recharger les offres
        await loadOffers()
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.message || "Erreur lors de la suppression de l'offre",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setOfferToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement des offres...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des offres</h1>
          <p className="text-muted-foreground mt-2">
            {offers.length} offre{offers.length > 1 ? "s" : ""} publiée{offers.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/entreprise/offres/nouvelle">
            <Plus className="mr-2 h-4 w-4" />
            Créer une offre
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une offre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={domainFilter} onValueChange={setDomainFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Domaine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les domaines</SelectItem>
                {domains.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Offers Grid */}
      {filteredOffers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Aucune offre trouvée</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchTerm || domainFilter !== "all"
                ? "Essayez de modifier vos filtres"
                : "Commencez par créer votre première offre"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredOffers.map((offer) => (
            <Card key={offer.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{offer.title}</CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">{offer.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{offer.domaine}</span>
                </div>
                
                {offer.localisation && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{offer.localisation}</span>
                  </div>
                )}

                {offer.type_stage && (
                  <Badge variant="secondary">{offer.type_stage}</Badge>
                )}

                {offer.remuneration && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <Euro className="h-4 w-4" />
                    <span>Rémunéré{offer.montant_remuneration ? ` - ${offer.montant_remuneration}Ar/mois` : ''}</span>
                  </div>
                )}
                
                {offer.date_debut && offer.date_fin && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Début</p>
                        <p className="font-medium">{new Date(offer.date_debut).toLocaleDateString("fr-FR")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Fin</p>
                        <p className="font-medium">{new Date(offer.date_fin).toLocaleDateString("fr-FR")}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {offer.nombre_places} place{offer.nombre_places > 1 ? "s" : ""}
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {offer.nombre_candidatures || 0} candidature{(offer.nombre_candidatures || 0) > 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 bg-transparent"
                  onClick={() => handleEdit(offer)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                  onClick={() => handleDelete(offer.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible et toutes les candidatures
              associées seront également supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'offre</DialogTitle>
            <DialogDescription>
              Modifiez les informations de votre offre de stage
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titre de l'offre *</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => handleEditChange("title", e.target.value)}
                placeholder="Ex: Développeur Full Stack"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => handleEditChange("description", e.target.value)}
                placeholder="Décrivez les missions..."
                rows={4}
              />
            </div>

            {/* Domain */}
            <div className="space-y-2">
              <Label htmlFor="edit-domaine">Domaine *</Label>
              <Select 
                value={editFormData.domaine} 
                onValueChange={(value) => handleEditChange("domaine", value)}
              >
                <SelectTrigger id="edit-domaine">
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-localisation">Localisation</Label>
                <Input
                  id="edit-localisation"
                  value={editFormData.localisation}
                  onChange={(e) => handleEditChange("localisation", e.target.value)}
                  placeholder="Ex: Paris, Lyon..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type_stage">Type de stage</Label>
                <Select 
                  value={editFormData.type_stage} 
                  onValueChange={(value) => handleEditChange("type_stage", value)}
                >
                  <SelectTrigger id="edit-type_stage">
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-date_debut">Date de début</Label>
                <Input
                  id="edit-date_debut"
                  type="date"
                  value={editFormData.date_debut}
                  onChange={(e) => handleEditChange("date_debut", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date_fin">Date de fin</Label>
                <Input
                  id="edit-date_fin"
                  type="date"
                  value={editFormData.date_fin}
                  onChange={(e) => handleEditChange("date_fin", e.target.value)}
                />
              </div>
            </div>

            {/* Places */}
            <div className="space-y-2">
              <Label htmlFor="edit-nombre_places">Nombre de places *</Label>
              <Input
                id="edit-nombre_places"
                type="number"
                min={1}
                max={10}
                value={editFormData.nombre_places}
                onChange={(e) => handleEditChange("nombre_places", Number.parseInt(e.target.value))}
              />
            </div>

            {/* Rémunération */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-remuneration"
                  checked={editFormData.remuneration}
                  onCheckedChange={(checked) => handleEditChange("remuneration", checked as boolean)}
                />
                <Label htmlFor="edit-remuneration" className="cursor-pointer">
                  Stage rémunéré
                </Label>
              </div>
              
              {editFormData.remuneration && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="edit-montant_remuneration">Montant (€/mois)</Label>
                  <Input
                    id="edit-montant_remuneration"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="Ex: 600"
                    value={editFormData.montant_remuneration || ""}
                    onChange={(e) => handleEditChange("montant_remuneration", parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleUpdateSubmit}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                "Modifier"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
