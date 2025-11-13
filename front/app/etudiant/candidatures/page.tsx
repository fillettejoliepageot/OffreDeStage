"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, CheckCircle2, XCircle, Eye, Building2, MapPin, Calendar, MessageSquare, Filter, Loader2, Briefcase, Euro, Trash2, Mail, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"

interface Candidature {
  id: number;
  date_candidature: string;
  statut: "pending" | "accepted" | "rejected";
  message: string | null;
  offre_id: number;
  offre_title: string;
  offre_description: string;
  offre_domaine: string;
  offre_localisation: string | null;
  offre_type_stage: string | null;
  offre_remuneration: boolean;
  offre_montant_remuneration: number | null;
  offre_date_debut: string | null;
  offre_date_fin: string | null;
  company_name: string;
  company_email: string;
  company_telephone: string | null;
  logo_url: string | null;
}

export default function CandidaturesPage() {
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState("all")
  const [candidatures, setCandidatures] = useState<Candidature[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    loadCandidatures()
  }, [])

  const loadCandidatures = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/candidatures/student')
      
      if (response.data.success) {
        setCandidatures(response.data.data)
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.message || "Erreur lors du chargement des candidatures",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCandidature = async (id: number) => {
    const candidature = candidatures.find(c => c.id === id)
    const confirmMessage = candidature?.statut === "pending" 
      ? "Êtes-vous sûr de vouloir retirer cette candidature ?"
      : "Êtes-vous sûr de vouloir supprimer cette réponse de votre historique ?"
    
    if (!confirm(confirmMessage)) {
      return
    }

    setDeletingId(id)
    try {
      const response = await api.delete(`/candidatures/${id}`)
      
      if (response.data.success) {
        toast({
          title: "✅ Succès",
          description: candidature?.statut === "pending" 
            ? "Candidature retirée avec succès"
            : "Réponse supprimée de votre historique",
          variant: "default",
        })
        
        // Retirer de la liste
        setCandidatures(candidatures.filter(c => c.id !== id))
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.message || "Erreur lors de la suppression",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusBadge = (statut: "pending" | "accepted" | "rejected") => {
    switch (statut) {
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            En attente
          </Badge>
        )
      case "accepted":
        return (
          <Badge className="gap-1 bg-emerald-100 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            Accepté
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Refusé
          </Badge>
        )
      default:
        return null
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return "Il y a 1 jour"
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`
    return `Il y a ${Math.floor(diffDays / 30)} mois`
  }

  const getStageDuration = (dateDebut?: string | null, dateFin?: string | null) => {
    if (!dateDebut || !dateFin) return "Durée non spécifiée"
    const debut = new Date(dateDebut)
    const fin = new Date(dateFin)
    const months = Math.round((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24 * 30))
    return `${months} mois`
  }

  // Filtrer et trier les candidatures (réponses en premier)
  const filteredCandidatures = (statusFilter === "all" ? candidatures : candidatures.filter((c) => c.statut === statusFilter))
    .sort((a, b) => {
      // Priorité 1: Les réponses (accepted/rejected) en premier
      const aHasResponse = a.statut !== "pending"
      const bHasResponse = b.statut !== "pending"
      if (aHasResponse && !bHasResponse) return -1
      if (!aHasResponse && bHasResponse) return 1
      
      // Priorité 2: Les plus récentes en premier
      return new Date(b.date_candidature).getTime() - new Date(a.date_candidature).getTime()
    })

  const stats = {
    total: candidatures.length,
    enAttente: candidatures.filter((c) => c.statut === "pending").length,
    accepte: candidatures.filter((c) => c.statut === "accepted").length,
    refuse: candidatures.filter((c) => c.statut === "rejected").length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement de vos candidatures...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground text-balance">Mes candidatures</h1>
        <p className="text-muted-foreground mt-2">Suivez l'état de vos candidatures en temps réel</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Candidatures envoyées</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.enAttente}</div>
            <p className="text-xs text-muted-foreground mt-1">Réponses attendues</p>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Acceptées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{stats.accepte}</div>
            <p className="text-xs text-muted-foreground mt-1">Entretiens prévus</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Refusées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats.refuse}</div>
            <p className="text-xs text-muted-foreground mt-1">À améliorer</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filtrer par statut :</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="accepted">Accepté</SelectItem>
                <SelectItem value="rejected">Refusé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredCandidatures.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Aucune candidature trouvée</p>
            <p className="text-sm text-muted-foreground mt-1">
              {statusFilter !== "all" 
                ? "Essayez de modifier vos filtres de recherche"
                : "Vous n'avez pas encore postulé à des offres"}
            </p>
          </div>
        ) : (
          filteredCandidatures.map((candidature) => (
          <Card 
            key={candidature.id} 
            className={`hover:border-primary/50 transition-all hover:shadow-md ${
              candidature.statut !== "pending" ? "border-blue-200 bg-blue-50/30" : ""
            }`}
          >
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground text-balance">{candidature.offre_title}</h3>
                      {candidature.statut !== "pending" && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          Nouvelle réponse
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{candidature.company_name}</span>
                    </div>
                  </div>
                  {getStatusBadge(candidature.statut)}
                </div>

                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {candidature.offre_localisation && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{candidature.offre_localisation}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{getStageDuration(candidature.offre_date_debut, candidature.offre_date_fin)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Postulé le {new Date(candidature.date_candidature).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    <span>{getTimeAgo(candidature.date_candidature)}</span>
                  </div>
                  {candidature.statut !== "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteCandidature(candidature.id)}
                      disabled={deletingId === candidature.id}
                    >
                      {deletingId === candidature.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-3 w-3" />
                          Supprimer
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                      <Eye className="h-4 w-4" />
                      Voir les détails
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl text-balance">{candidature.offre_title}</DialogTitle>
                      <DialogDescription className="flex items-center gap-2 text-base">
                        <Building2 className="h-4 w-4" />
                        {candidature.company_name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Statut</span>
                        {getStatusBadge(candidature.statut)}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        {candidature.offre_localisation && (
                          <div>
                            <span className="text-sm text-muted-foreground">Localisation</span>
                            <p className="font-medium text-foreground mt-1">{candidature.offre_localisation}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-sm text-muted-foreground">Durée</span>
                          <p className="font-medium text-foreground mt-1">{getStageDuration(candidature.offre_date_debut, candidature.offre_date_fin)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Rémunération</span>
                          <p className="font-medium text-foreground mt-1">
                            {candidature.offre_remuneration 
                              ? (candidature.offre_montant_remuneration ? `${candidature.offre_montant_remuneration}Ar/mois` : 'Rémunéré')
                              : 'Non rémunéré'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Date de candidature</span>
                          <p className="font-medium text-foreground mt-1">
                            {new Date(candidature.date_candidature).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        {candidature.offre_type_stage && (
                          <div>
                            <span className="text-sm text-muted-foreground">Type de stage</span>
                            <p className="font-medium text-foreground mt-1">{candidature.offre_type_stage}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-sm text-muted-foreground">Domaine</span>
                          <p className="font-medium text-foreground mt-1">{candidature.offre_domaine}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Description du poste</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{candidature.offre_description}</p>
                      </div>

                      {candidature.message && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Votre message de motivation</h4>
                          <div className="p-4 bg-muted/50 rounded-lg border">
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{candidature.message}</p>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Contact entreprise</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${candidature.company_email}`} className="text-primary hover:underline">
                              {candidature.company_email}
                            </a>
                          </div>
                          {candidature.company_telephone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <a href={`tel:${candidature.company_telephone}`} className="text-primary hover:underline">
                                {candidature.company_telephone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 bg-transparent gap-2"
                          onClick={() => handleDeleteCandidature(candidature.id)}
                          disabled={deletingId === candidature.id}
                        >
                          {deletingId === candidature.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Suppression...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              {candidature.statut === "pending" ? "Retirer la candidature" : "Supprimer"}
                            </>
                          )}
                        </Button>
                        {candidature.statut === "pending" && (
                          <Button className="flex-1 gap-2" asChild>
                            <a href={`mailto:${candidature.company_email}`}>
                              <Mail className="h-4 w-4" />
                              Contacter l'entreprise
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>
    </div>
  )
}
