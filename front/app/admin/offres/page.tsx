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
import { TableActions } from "@/components/admin/TableActions"

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
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

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
    setActionInProgress('delete')
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
        description: error.response?.data?.message || "Erreur lors de la suppression de l'offre",
        variant: "destructive",
      })
    } finally {
      setActionInProgress(null)
      setActionDialog(null)
    }
  }

  const handleUpdateStatus = async (offerId: string, statut: 'active' | 'désactivée') => {
    const action = statut === 'active' ? 'unblock' : 'block'
    setActionInProgress(action)
    try {
      const response = await adminAPI.updateOffreStatus(offerId, statut)
      
      if (response.success) {
        toast({
          title: "✅ Succès",
          description: statut === 'active' ? "Offre activée avec succès" : "Offre désactivée avec succès",
          variant: "default",
        })
        
        // Recharger la liste
        await loadOffers()
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.message || "Erreur lors de la mise à jour du statut de l'offre",
        variant: "destructive",
      })
    } finally {
      setActionInProgress(null)
      setActionDialog(null)
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
                      <TableActions
                        item={{
                          ...offer,
                          statut: offer.statut === 'active' ? 'actif' : 'bloqué' as 'actif' | 'bloqué'
                        }}
                        onView={() => {
                          // TODO: Implémenter la vue des détails de l'offre
                          toast({
                            title: "Détails de l'offre",
                            description: `Affichage des détails de l'offre ${offer.title}`,
                          })
                        }}
                        onBlock={() => handleUpdateStatus(offer.id, 'désactivée')}
                        onUnblock={() => handleUpdateStatus(offer.id, 'active')}
                        onDelete={() => handleDelete(offer.id)}
                        isBlocking={actionInProgress === 'block' || actionInProgress === 'unblock'}
                        isDeleting={actionInProgress === 'delete'}
                        type="offer"
                        viewLabel="Voir détails"
                      />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Actions */}
      <Dialog open={!!actionDialog} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog === "delete" 
                ? "Supprimer l'offre" 
                : actionDialog === "deactivate"
                  ? "Désactiver l'offre"
                  : "Activer l'offre"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog === "delete" ? (
                <>
                  Êtes-vous sûr de vouloir supprimer définitivement l'offre{" "}
                  <strong>{selectedOffer?.title}</strong> de l'entreprise{" "}
                  <strong>{selectedOffer?.company_name}</strong> ?
                  <br />
                  Cette action est irréversible et supprimera également toutes les candidatures associées.
                </>
              ) : actionDialog === "deactivate" ? (
                <>
                  Êtes-vous sûr de vouloir désactiver l'offre{" "}
                  <strong>{selectedOffer?.title}</strong> de l'entreprise{" "}
                  <strong>{selectedOffer?.company_name}</strong> ?
                  <br />
                  L'offre ne sera plus visible par les étudiants et ne pourra plus recevoir de candidatures.
                </>
              ) : (
                <>
                  Êtes-vous sûr de vouloir activer l'offre{" "}
                  <strong>{selectedOffer?.title}</strong> de l'entreprise{" "}
                  <strong>{selectedOffer?.company_name}</strong> ?
                  <br />
                  L'offre sera à nouveau visible par les étudiants et pourra recevoir des candidatures.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setActionDialog(null)} 
              disabled={!!actionInProgress}
            >
              Annuler
            </Button>
            <Button 
              variant={actionDialog === 'activate' ? 'default' : 'destructive'} 
              onClick={() => {
                if (!selectedOffer) return
                if (actionDialog === 'delete') {
                  handleDelete(selectedOffer.id)
                } else if (actionDialog === 'deactivate') {
                  handleUpdateStatus(selectedOffer.id, 'désactivée')
                } else if (actionDialog === 'activate') {
                  handleUpdateStatus(selectedOffer.id, 'active')
                }
                setActionDialog(null)
              }}
              disabled={!!actionInProgress}
            >
              {actionInProgress ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  {actionInProgress === 'delete' 
                    ? 'Suppression...' 
                    : actionInProgress === 'block'
                      ? 'Désactivation...'
                      : 'Activation...'}
                </>
              ) : actionDialog === 'delete' ? (
                'Supprimer'
              ) : actionDialog === 'deactivate' ? (
                'Désactiver'
              ) : (
                'Activer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
