"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Mail, Phone, Building2, MapPin, Globe, FileText, CheckCircle2, XCircle, Briefcase } from "lucide-react"
import { adminAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface CompanyDetailsModalProps {
  userId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompanyDetailsModal({ userId, open, onOpenChange }: CompanyDetailsModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [company, setCompany] = useState<any>(null)

  useEffect(() => {
    if (open && userId) {
      loadCompanyDetails()
    }
  }, [open, userId])

  const loadCompanyDetails = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const response = await adminAPI.getCompanyDetails(userId)
      
      if (response.success) {
        setCompany(response.data)
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.message || "Erreur lors du chargement des détails",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Détails de l'entreprise</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : company ? (
          <div className="space-y-6">
            {/* Header avec logo et statut */}
            <div className="flex items-start justify-between pb-4 border-b">
              <div className="flex items-start gap-4">
                {company.logo_url ? (
                  <img 
                    src={company.logo_url} 
                    alt={company.company_name || "Logo"} 
                    className="w-16 h-16 rounded-lg object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">
                    {company.company_name || "Nom non renseigné"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{company.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {company.statut === 'bloqué' ? (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="w-3 h-3" />
                    Bloqué
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-blue-600 gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Actif
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  Inscrit {formatDate(company.created_at)}
                </span>
              </div>
            </div>

            {/* Informations générales */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Informations générales
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Secteur d'activité</p>
                  <p className="font-medium">{company.sector || <span className="text-muted-foreground italic">Non renseigné</span>}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Taille de l'entreprise</p>
                  <p className="font-medium">{company.size || <span className="text-muted-foreground italic">Non renseigné</span>}</p>
                </div>
              </div>
            </div>

            {/* Coordonnées */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Coordonnées
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <p className="font-medium">{company.address || <span className="text-muted-foreground italic">Non renseigné</span>}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{company.telephone || <span className="text-muted-foreground italic">Non renseigné</span>}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Site web</p>
                    {company.website ? (
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        <Globe className="w-4 h-4" />
                        Visiter
                      </a>
                    ) : (
                      <p className="font-medium text-muted-foreground italic">Non renseigné</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {company.description && (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Description
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
              </div>
            )}

            {/* Statistiques des offres */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Statistiques des offres
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total offres</p>
                  <p className="text-2xl font-bold text-blue-600">{company.offres_count || 0}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Offres actives</p>
                  <p className="text-2xl font-bold text-blue-600">{company.offres_actives || 0}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Candidatures reçues</p>
                  <p className="text-2xl font-bold text-purple-600">{company.candidatures_recues || 0}</p>
                </div>
              </div>
            </div>

            {/* Informations supplémentaires */}
            {(company.linkedin_url || company.facebook_url || company.twitter_url) && (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Réseaux sociaux
                </h4>
                <div className="flex flex-wrap gap-3">
                  {company.linkedin_url && (
                    <a 
                      href={company.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      LinkedIn
                    </a>
                  )}
                  {company.facebook_url && (
                    <a 
                      href={company.facebook_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Facebook
                    </a>
                  )}
                  {company.twitter_url && (
                    <a 
                      href={company.twitter_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Twitter
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Aucune donnée disponible</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
