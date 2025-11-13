"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Trash2, Briefcase, Loader2, CheckCircle2, XCircle, Power, PowerOff } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { adminAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Offre {
  id: string
  title: string
  domaine: string
  statut: 'active' | 'désactivée'
  company_name: string
  sector: string
  candidatures_count: number
  created_at: string
}

export default function AdminOffres() {
  const { toast } = useToast()
  const [offers, setOffers] = useState<Offre[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOffer, setSelectedOffer] = useState<Offre | null>(null)
  const [actionDialog, setActionDialog] = useState<"delete" | "activate" | "deactivate" | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    loadOffers()
  }, [])

  const loadOffers = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getOffres()
      
      if (response.success) {
        setOffers(response.data)
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.message || "Erreur lors du chargement des offres",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredOffers = offers.filter(
    (offer) =>
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (offer.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (offer.domaine?.toLowerCase().includes(searchTerm.toLowerCase()) || false),
  )

  const handleDelete = async (offerId: string) => {
    setIsDeleting(true)
    try {
      const response = await adminAPI.deleteOffre(offerId)
      
      if (response.success) {
        toast({
          title: "✅ Succès",
          description: "Offre supprimée avec succès",
          variant: "default",
        })
        
        // Recharger la liste
        await loadOffers()
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.message || "Erreur lors de la suppression",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setActionDialog(null)
      setSelectedOffer(null)
    }
  }

  const handleUpdateStatus = async (offreId: string, statut: 'active' | 'désactivée') => {
    setIsUpdatingStatus(true)
    try {
      const response = await adminAPI.updateOffreStatus(offreId, statut)
      
      if (response.success) {
        toast({
          title: "✅ Succès",
          description: statut === 'désactivée' ? "Offre désactivée avec succès" : "Offre activée avec succès",
          variant: "default",
        })
        
        // Recharger la liste
        await loadOffers()
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.message || "Erreur lors de la mise à jour du statut",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
      setActionDialog(null)
      setSelectedOffer(null)
    }
  }

  if (loading) {
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Supervision des offres</h1>
        <p className="text-muted-foreground mt-2">Gérer toutes les offres de stage de la plateforme</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total offres</p>
                <p className="text-2xl font-bold text-foreground">{offers.length}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Offres actives</p>
                <p className="text-2xl font-bold text-foreground">
                  {offers.filter((o) => o.statut === 'active').length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Offres désactivées</p>
                <p className="text-2xl font-bold text-foreground">
                  {offers.filter((o) => o.statut === 'désactivée').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total candidatures</p>
                <p className="text-2xl font-bold text-foreground">
                  {offers.reduce((sum, o) => sum + (Number(o.candidatures_count) || 0), 0)}
                </p>
              </div>
              <Briefcase className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Liste des offres ({filteredOffers.length})</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOffers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucune offre trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Domaine</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Candidatures</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOffers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.title}</TableCell>
                      <TableCell>{offer.company_name || <span className="text-muted-foreground italic">-</span>}</TableCell>
                      <TableCell>{offer.domaine}</TableCell>
                      <TableCell>
                        {offer.statut === 'désactivée' ? (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="w-3 h-3" />
                            Désactivée
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-emerald-600 gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{Number(offer.candidatures_count) || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {offer.statut === 'désactivée' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOffer(offer)
                                setActionDialog("activate")
                              }}
                              disabled={isUpdatingStatus || isDeleting}
                              className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              <Power className="w-4 h-4 mr-1" />
                              Activer
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOffer(offer)
                                setActionDialog("deactivate")
                              }}
                              disabled={isUpdatingStatus || isDeleting}
                              className="border-orange-600 text-orange-600 hover:bg-orange-50"
                            >
                              <PowerOff className="w-4 h-4 mr-1" />
                              Désactiver
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedOffer(offer)
                              setActionDialog("delete")
                            }}
                            disabled={isDeleting || isUpdatingStatus}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={actionDialog === "delete"} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'offre</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement l'offre{" "}
              <strong>{selectedOffer?.title}</strong> ? Cette action est irréversible et supprimera également toutes les candidatures associées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)} disabled={isDeleting}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedOffer && handleDelete(selectedOffer.id)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={actionDialog === "deactivate"} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Désactiver l'offre</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir désactiver l'offre{" "}
              <strong>{selectedOffer?.title}</strong> ? L'offre ne sera plus visible par les étudiants.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)} disabled={isUpdatingStatus}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedOffer && handleUpdateStatus(selectedOffer.id, 'désactivée')}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Désactivation...
                </>
              ) : (
                <>
                  <PowerOff className="w-4 h-4 mr-1" />
                  Désactiver
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Dialog */}
      <Dialog open={actionDialog === "activate"} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activer l'offre</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir activer l'offre{" "}
              <strong>{selectedOffer?.title}</strong> ? L'offre sera à nouveau visible par les étudiants.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)} disabled={isUpdatingStatus}>
              Annuler
            </Button>
            <Button 
              onClick={() => selectedOffer && handleUpdateStatus(selectedOffer.id, 'active')}
              disabled={isUpdatingStatus}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Activation...
                </>
              ) : (
                <>
                  <Power className="w-4 h-4 mr-1" />
                  Activer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
