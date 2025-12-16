"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Trash2, Loader2, Clock, CheckCircle2, XCircle, FileText } from "lucide-react"
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
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { TableActions } from "@/components/admin/TableActions"

interface Candidature {
  id: string
  statut: 'pending' | 'accepted' | 'rejected'
  message: string
  date_candidature: string
  student_first_name: string
  student_last_name: string
  student_email: string
  domaine_etude: string
  offre_title: string
  offre_domaine: string
  company_name: string
  company_email: string
}

export default function AdminCandidatures() {
  const { toast } = useToast()
  const [candidatures, setCandidatures] = useState<Candidature[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statutFilter, setStatutFilter] = useState<string>("tous")
  const [selectedCandidature, setSelectedCandidature] = useState<Candidature | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  useEffect(() => {
    loadCandidatures()
  }, [statutFilter])

  const loadCandidatures = async () => {
    try {
      setLoading(true)
      const filters = statutFilter !== "tous" ? { statut: statutFilter } : undefined
      const response = await adminAPI.getCandidatures(filters)
      
      if (response.success) {
        setCandidatures(response.data)
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.message || "Erreur lors du chargement des candidatures",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredCandidatures = candidatures.filter(
    (candidature) =>
      (candidature.student_first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (candidature.student_last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (candidature.offre_title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (candidature.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (candidature.student_email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (candidature.offre_domaine?.toLowerCase() || '').includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (candidatureId: string) => {
    setActionInProgress('delete')
    try {
      const response = await adminAPI.deleteCandidature(candidatureId)
      
      if (response.success) {
        toast({
          title: "✅ Succès",
          description: "Candidature supprimée avec succès",
          variant: "default",
        })
        
        // Recharger la liste
        await loadCandidatures()
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.message || "Erreur lors de la suppression de la candidature",
        variant: "destructive",
      })
    } finally {
      setActionInProgress(null)
      setDeleteDialogOpen(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: fr 
      })
    } catch {
      return 'Date inconnue'
    }
  }

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'pending':
        return (
          <Badge variant="default" className="bg-orange-600 gap-1">
            <Clock className="w-3 h-3" />
            En attente
          </Badge>
        )
      case 'accepted':
        return (
          <Badge variant="default" className="bg-emerald-600 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Acceptée
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Refusée
          </Badge>
        )
      default:
        return <Badge>{statut}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement des candidatures...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestion des candidatures</h1>
        <p className="text-muted-foreground mt-2">Superviser toutes les candidatures de la plateforme</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total candidatures</p>
                <p className="text-2xl font-bold text-foreground">{candidatures.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-foreground">
                  {candidatures.filter((c) => c.statut === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Acceptées</p>
                <p className="text-2xl font-bold text-foreground">
                  {candidatures.filter((c) => c.statut === 'accepted').length}
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
                <p className="text-sm font-medium text-muted-foreground">Refusées</p>
                <p className="text-2xl font-bold text-foreground">
                  {candidatures.filter((c) => c.statut === 'rejected').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Liste des candidatures ({filteredCandidatures.length})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select value={statutFilter} onValueChange={setStatutFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="accepted">Acceptées</SelectItem>
                  <SelectItem value="rejected">Refusées</SelectItem>
                </SelectContent>
              </Select>
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
          </div>
        </CardHeader>
        <CardContent>
          {filteredCandidatures.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucune candidature trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Offre</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Domaine</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidatures.map((candidature) => (
                    <TableRow key={candidature.id}>
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <p>{candidature.student_first_name} {candidature.student_last_name}</p>
                          <p className="text-xs text-muted-foreground">{candidature.student_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={candidature.offre_title}>
                          {candidature.offre_title}
                        </div>
                      </TableCell>
                      <TableCell>{candidature.company_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{candidature.offre_domaine}</Badge>
                      </TableCell>
                      <TableCell>{getStatutBadge(candidature.statut)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(candidature.date_candidature)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCandidature(candidature)
                              setDetailsDialogOpen(true)
                            }}
                          >
                            Voir détails
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedCandidature(candidature)
                              setDeleteDialogOpen(true)
                            }}
                            disabled={!!actionInProgress}
                          >
                            {actionInProgress === 'delete' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
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
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la candidature</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement la candidature de{" "}
              <strong>
                {selectedCandidature?.student_first_name} {selectedCandidature?.student_last_name}
              </strong>{" "}
              pour l'offre <strong>{selectedCandidature?.offre_title}</strong> ?
              <br />
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)} 
              disabled={!!actionInProgress}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedCandidature) {
                  handleDelete(selectedCandidature.id)
                }
              }}
              disabled={!!actionInProgress}
            >
              {actionInProgress === 'delete' ? (
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

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la candidature</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4">
                {selectedCandidature && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium">Étudiant</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedCandidature.student_first_name} {selectedCandidature.student_last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedCandidature.student_email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedCandidature.domaine_etude}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Offre</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedCandidature.offre_title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedCandidature.company_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedCandidature.offre_domaine}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Message de candidature</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {selectedCandidature.message || "Aucun message"}
                      </p>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>
                        Candidature envoyée{" "}
                        {formatDistanceToNow(new Date(selectedCandidature.date_candidature), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </p>
                      <div className="flex items-center mt-1">
                        Statut :{" "}
                        {selectedCandidature.statut === 'pending' ? (
                          <Badge variant="outline" className="ml-2">
                            <Clock className="w-3 h-3 mr-1" />
                            En attente
                          </Badge>
                        ) : selectedCandidature.statut === 'accepted' ? (
                          <Badge className="bg-green-600 ml-2">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Acceptée
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="ml-2">
                            <XCircle className="w-3 h-3 mr-1" />
                            Refusée
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={() => setDetailsDialogOpen(false)}
              disabled={!!actionInProgress}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
