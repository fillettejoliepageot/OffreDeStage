"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Check, X, Eye, Mail, Phone, FileText, Calendar, Briefcase, Loader2, User, GraduationCap, MapPin, Award } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"

interface Candidature {
  id: number;
  date_candidature: string;
  statut: "pending" | "accepted" | "rejected";
  message: string | null;
  student_id: number;
  first_name: string;
  last_name: string;
  domaine_etude: string | null;
  niveau_etude: string | null;
  specialisation: string | null;
  etablissement: string | null;
  student_telephone: string | null;
  photo_url: string | null;
  cv_url: string | null;
  certificat_url: string | null;
  bio: string | null;
  student_email: string;
  offre_id: number;
  offre_title: string;
  offre_domaine: string;
  offre_localisation: string | null;
}

const statusConfig = {
  pending: { label: "En attente", color: "bg-orange-100 text-orange-700 border-orange-200" },
  accepted: { label: "Accepté", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  rejected: { label: "Refusé", color: "bg-red-100 text-red-700 border-red-200" },
}

export default function EntrepriseCandidatures() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<Candidature[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<Candidature | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)

  // Charger les candidatures au montage et rafraîchir automatiquement
  useEffect(() => {
    loadCandidatures()
    
    // Rafraîchir automatiquement toutes les 10 secondes pour voir les nouvelles candidatures
    const interval = setInterval(() => {
      loadCandidatures(true) // true = rechargement silencieux (sans loader)
    }, 10000) // 10 secondes
    
    // Nettoyer l'interval quand le composant est démonté
    return () => clearInterval(interval)
  }, [])

  const loadCandidatures = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true)
      }
      const response = await api.get('/candidatures/company')
      
      if (response.data.success) {
        setApplications(response.data.data)
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      if (!silent) {
        toast({
          title: "❌ Erreur",
          description: error.response?.data?.message || "Erreur lors du chargement des candidatures",
          variant: "destructive",
        })
      }
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }

  const filteredApplications = applications.filter((app) => {
    const studentName = `${app.first_name} ${app.last_name}`.toLowerCase()
    const matchesSearch =
      studentName.includes(searchTerm.toLowerCase()) ||
      app.offre_title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.statut === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (id: number, newStatus: "accepted" | "rejected") => {
    setUpdatingStatus(id)
    try {
      const response = await api.put(`/candidatures/${id}/status`, {
        statut: newStatus,
      })

      if (response.data.success) {
        // Mettre à jour l'état local
        setApplications(applications.map((app) => 
          app.id === id ? { ...app, statut: newStatus } : app
        ))
        
        // Mettre à jour la candidature sélectionnée si c'est celle-ci
        if (selectedApplication?.id === id) {
          setSelectedApplication({ ...selectedApplication, statut: newStatus })
        }

        toast({
          title: "✅ Succès",
          description: `Candidature ${newStatus === 'accepted' ? 'acceptée' : 'refusée'} avec succès`,
          variant: "default",
        })
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.message || "Erreur lors de la mise à jour du statut",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const viewProfile = (application: Candidature) => {
    setSelectedApplication(application)
    setDialogOpen(true)
  }

  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.statut === "pending").length,
    accepted: applications.filter((app) => app.statut === "accepted").length,
    rejected: applications.filter((app) => app.statut === "rejected").length,
  }

  if (isLoading) {
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidatures reçues</h1>
          <p className="text-muted-foreground mt-2">Gérez les candidatures pour vos offres de stage</p>
        </div>
        <Badge variant="outline" className="gap-2 text-xs">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Mise à jour automatique
        </Badge>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Acceptées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.accepted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Refusées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou offre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Statut" />
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

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des candidatures</CardTitle>
          <CardDescription>
            {filteredApplications.length} candidature{filteredApplications.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Aucune candidature trouvée</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || statusFilter !== "all" 
                  ? "Essayez de modifier vos filtres de recherche"
                  : "Les candidatures apparaîtront ici lorsque des étudiants postuleront à vos offres"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div
                  key={application.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={application.photo_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {application.first_name?.[0]}{application.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{application.first_name} {application.last_name}</p>
                        <Badge
                          variant="outline"
                          className={statusConfig[application.statut].color}
                        >
                          {statusConfig[application.statut].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{application.offre_title}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(application.date_candidature).toLocaleDateString("fr-FR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {application.offre_domaine}
                        </span>
                        {application.niveau_etude && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {application.niveau_etude}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewProfile(application)}
                      className="flex-1 sm:flex-none"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Voir profil
                    </Button>
                    {application.statut === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(application.id, "accepted")}
                          disabled={updatingStatus === application.id}
                          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          {updatingStatus === application.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(application.id, "rejected")}
                          disabled={updatingStatus === application.id}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          {updatingStatus === application.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profil du candidat</DialogTitle>
            <DialogDescription>Informations détaillées sur le candidat</DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedApplication.photo_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {selectedApplication.first_name?.[0]}{selectedApplication.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedApplication.first_name} {selectedApplication.last_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedApplication.domaine_etude || "Domaine non spécifié"}</p>
                  <Badge
                    variant="outline"
                    className={`mt-2 ${statusConfig[selectedApplication.statut].color}`}
                  >
                    {statusConfig[selectedApplication.statut].label}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${selectedApplication.student_email}`} className="text-sm hover:text-primary hover:underline">
                    {selectedApplication.student_email}
                  </a>
                </div>
                {selectedApplication.student_telephone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${selectedApplication.student_telephone}`} className="text-sm hover:text-primary hover:underline">
                      {selectedApplication.student_telephone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedApplication.offre_title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Candidature envoyée le {new Date(selectedApplication.date_candidature).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>

              {/* Formation */}
              {(selectedApplication.niveau_etude || selectedApplication.specialisation || selectedApplication.etablissement) && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Formation
                  </h4>
                  <div className="grid gap-2 pl-6">
                    {selectedApplication.niveau_etude && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Niveau : </span>
                        <span className="font-medium">{selectedApplication.niveau_etude}</span>
                      </div>
                    )}
                    {selectedApplication.specialisation && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Spécialisation : </span>
                        <span className="font-medium">{selectedApplication.specialisation}</span>
                      </div>
                    )}
                    {selectedApplication.etablissement && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Établissement : </span>
                        <span className="font-medium">{selectedApplication.etablissement}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message de motivation */}
              {selectedApplication.message && (
                <div>
                  <h4 className="font-medium mb-2">Message de motivation</h4>
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {selectedApplication.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Bio */}
              {selectedApplication.bio && (
                <div>
                  <h4 className="font-medium mb-2">À propos</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedApplication.bio}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {selectedApplication.cv_url && (
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-transparent"
                    onClick={() => window.open(selectedApplication.cv_url || '', '_blank')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Voir le CV
                  </Button>
                )}
                {selectedApplication.certificat_url && (
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-transparent"
                    onClick={() => window.open(selectedApplication.certificat_url || '', '_blank')}
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Voir le certificat
                  </Button>
                )}
              </div>

              {selectedApplication.statut === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => {
                      handleStatusChange(selectedApplication.id, "accepted")
                      setDialogOpen(false)
                    }}
                    disabled={updatingStatus === selectedApplication.id}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {updatingStatus === selectedApplication.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Accepter
                  </Button>
                  <Button
                    onClick={() => {
                      handleStatusChange(selectedApplication.id, "rejected")
                      setDialogOpen(false)
                    }}
                    disabled={updatingStatus === selectedApplication.id}
                    variant="destructive"
                    className="flex-1"
                  >
                    {updatingStatus === selectedApplication.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <X className="mr-2 h-4 w-4" />
                    )}
                    Refuser
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
