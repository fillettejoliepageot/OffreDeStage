"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, MapPin, Building2, Clock, Filter, Bookmark, BookmarkCheck, Calendar, Euro, Loader2, Briefcase, Users, Phone, Mail, Send } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import { useRouter } from "next/navigation"

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
  company_name?: string;
  logo_url?: string;
  sector?: string;
  address?: string;
  company_description?: string;
  telephone?: string;
  company_email?: string;
}

export default function OffresPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [offers, setOffers] = useState<Offre[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [domainFilter, setDomainFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [savedOffers, setSavedOffers] = useState<string[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [appliedOffers, setAppliedOffers] = useState<string[]>([])
  const [applyingOfferId, setApplyingOfferId] = useState<string | null>(null)
  const [applicationMessage, setApplicationMessage] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null)
  const [studentProfile, setStudentProfile] = useState<any>(null)
  const [profileChecked, setProfileChecked] = useState(false)

  const toggleSaveOffer = (offerId: string) => {
    setSavedOffers((prev) => (prev.includes(offerId) ? prev.filter((id) => id !== offerId) : [...prev, offerId]))
  }

  // Charger les offres au montage
  useEffect(() => {
    loadOffers()
    checkAppliedOffers()
    checkStudentProfile()
    
    // Recharger automatiquement toutes les 10 secondes pour voir les changements en temps réel
    const interval = setInterval(() => {
      loadOffers(true) // true = rechargement silencieux (sans loader)
    }, 10000) // 10 secondes
    
    // Nettoyer l'interval quand le composant est démonté
    return () => clearInterval(interval)
  }, [])

  const loadOffers = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true)
      }
      const response = await api.get('/offres')
      
      if (response.data.success) {
        setOffers(response.data.data)
        setLastUpdate(new Date())
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      if (!silent) {
        toast({
          title: "❌ Erreur",
          description: "Erreur lors du chargement des offres",
          variant: "destructive",
        })
      }
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }

  // Vérifier le profil de l'étudiant
  const checkStudentProfile = async () => {
    try {
      const response = await api.get('/student/profile')
      if (response.data.success) {
        setStudentProfile(response.data.data)
      }
      setProfileChecked(true)
    } catch (error: any) {
      console.error('Erreur lors de la vérification du profil:', error)
      setProfileChecked(true)
    }
  }

  // Vérifier les offres auxquelles l'étudiant a déjà postulé
  const checkAppliedOffers = async () => {
    try {
      const response = await api.get('/candidatures/student')
      if (response.data.success) {
        const appliedIds = response.data.data.map((candidature: any) => candidature.offre_id.toString())
        setAppliedOffers(appliedIds)
      }
    } catch (error: any) {
      console.error('Erreur lors de la vérification des candidatures:', error)
    }
  }

  // Vérifier si l'étudiant a déjà postulé à une offre spécifique
  const hasApplied = (offerId: string) => {
    return appliedOffers.includes(offerId)
  }

  // Vérifier si le profil est complet
  const isProfileComplete = () => {
    if (!studentProfile) return false
    return !!(studentProfile.first_name && studentProfile.last_name && studentProfile.cv_url)
  }

  // Ouvrir le dialogue de candidature
  const openApplicationDialog = (offerId: string) => {
    // Vérifier si le CV est présent
    if (!studentProfile?.cv_url) {
      toast({
        title: "⚠️ CV obligatoire",
        description: "Vous devez télécharger votre CV avant de postuler à une offre de stage.",
        variant: "destructive",
        duration: 5000,
      })
      
      // Rediriger vers la page de profil après 2 secondes
      setTimeout(() => {
        router.push('/etudiant/profil')
      }, 2000)
      
      return
    }

    setSelectedOfferId(offerId)
    setApplicationMessage("")
    setDialogOpen(true)
  }

  // Soumettre une candidature
  const handleApply = async () => {
    if (!selectedOfferId) return

    setApplyingOfferId(selectedOfferId)
    try {
      const response = await api.post('/candidatures', {
        offre_id: selectedOfferId,
        message: applicationMessage || null,
      })

      if (response.data.success) {
        toast({
          title: "✅ Candidature envoyée",
          description: "Votre candidature a été envoyée avec succès à l'entreprise",
          variant: "default",
        })
        
        // Ajouter l'offre à la liste des candidatures
        setAppliedOffers((prev) => [...prev, selectedOfferId])
        
        // Fermer le dialogue
        setDialogOpen(false)
        setApplicationMessage("")
        setSelectedOfferId(null)
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      
      // Gérer les erreurs spécifiques de CV manquant
      if (error.response?.data?.missingCV) {
        toast({
          title: "⚠️ CV obligatoire",
          description: "Vous devez télécharger votre CV avant de postuler à une offre de stage.",
          variant: "destructive",
          duration: 5000,
        })
        
        // Fermer le dialogue et rediriger
        setDialogOpen(false)
        setTimeout(() => {
          router.push('/etudiant/profil')
        }, 2000)
      } else {
        toast({
          title: "❌ Erreur",
          description: error.response?.data?.message || "Erreur lors de l'envoi de la candidature",
          variant: "destructive",
        })
      }
    } finally {
      setApplyingOfferId(null)
    }
  }

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

  // Filtrer les offres
  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (offer.company_name && offer.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesDomain = domainFilter === "all" || offer.domaine.toLowerCase() === domainFilter.toLowerCase()
    
    const matchesLocation = locationFilter === "all" || 
      (offer.localisation && offer.localisation.toLowerCase().includes(locationFilter.toLowerCase()))
    
    return matchesSearch && matchesDomain && matchesLocation
  })

  // Calculer la durée du stage
  const getStageDuration = (dateDebut?: string, dateFin?: string) => {
    if (!dateDebut || !dateFin) return "Durée non spécifiée"
    const debut = new Date(dateDebut)
    const fin = new Date(dateFin)
    const months = Math.round((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24 * 30))
    return `${months} mois`
  }

  // Calculer le temps écoulé depuis la publication
  const getTimeAgo = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffMs = now.getTime() - created.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return "Il y a 1 jour"
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`
    return `Il y a ${Math.floor(diffDays / 30)} mois`
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-balance">Offres de stage</h1>
          <p className="text-muted-foreground mt-2">Découvrez les opportunités qui correspondent à votre profil</p>
        </div>
        <div className="flex items-center gap-2">
          {savedOffers.length > 0 && (
            <Badge variant="secondary" className="gap-2">
              <BookmarkCheck className="h-4 w-4" />
              {savedOffers.length} offre{savedOffers.length > 1 ? "s" : ""} sauvegardée{savedOffers.length > 1 ? "s" : ""}
            </Badge>
          )}
          <Badge variant="outline" className="gap-2 text-xs">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Mise à jour automatique
          </Badge>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre, entreprise, compétences..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Filtres :</span>
              </div>

              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Domaine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les domaines</SelectItem>
                  {domains.map((domain) => (
                    <SelectItem key={domain} value={domain.toLowerCase()}>
                      {domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Localisation..."
                className="w-48"
                value={locationFilter === "all" ? "" : locationFilter}
                onChange={(e) => setLocationFilter(e.target.value || "all")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredOffers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Aucune offre trouvée</p>
            <p className="text-sm text-muted-foreground mt-1">
              Essayez de modifier vos filtres de recherche
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 place-items-center">
          {filteredOffers.map((offer, index) => (
          <Card 
            key={offer.id} 
            className="group relative overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{
              animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
            }}
          >
            {/* Gradient d'arrière-plan animé au hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Badge "Nouveau" pour les offres récentes */}
            {getTimeAgo(offer.created_at) === "Aujourd'hui" && (
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg animate-pulse">
                  ✨ Nouveau
                </Badge>
              </div>
            )}

            <CardContent className="pt-6 relative z-10">
              <div className="space-y-4">
                {/* En-tête avec titre et bouton favori */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground text-balance group-hover:text-primary transition-colors duration-300">
                      {offer.title}
                    </h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => toggleSaveOffer(offer.id)} 
                    className="shrink-0 hover:scale-110 transition-transform duration-200"
                  >
                    {savedOffers.includes(offer.id) ? (
                      <BookmarkCheck className="h-5 w-5 text-primary fill-primary animate-in zoom-in duration-200" />
                    ) : (
                      <Bookmark className="h-5 w-5 hover:text-primary transition-colors" />
                    )}
                  </Button>
                </div>

                {/* Carte entreprise avec effet glassmorphism */}
                <div className="relative flex items-start gap-3 p-4 bg-gradient-to-br from-muted/80 to-muted/40 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm group-hover:shadow-md transition-all duration-300">
                  {/* Effet de brillance au hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  {offer.logo_url ? (
                    <div className="relative">
                      <img 
                        src={offer.logo_url} 
                        alt={offer.company_name || "Logo"} 
                        className="w-14 h-14 rounded-xl object-cover ring-2 ring-background shadow-md group-hover:ring-primary/50 transition-all duration-300"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                      <Building2 className="h-7 w-7 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 relative z-10">
                    <p className="font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      {offer.company_name || "Entreprise"}
                    </p>
                    <div className="flex flex-col gap-1.5 mt-1.5">
                      {offer.company_email && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group/email">
                          <Mail className="h-3.5 w-3.5 shrink-0 group-hover/email:scale-110 transition-transform" />
                          <span className="truncate">{offer.company_email}</span>
                        </div>
                      )}
                      {offer.telephone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group/phone">
                          <Phone className="h-3.5 w-3.5 shrink-0 group-hover/phone:scale-110 transition-transform" />
                          <span>{offer.telephone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badges avec animations au hover */}
                <div className="flex flex-wrap gap-2">
                  {offer.localisation && (
                    <Badge variant="outline" className="gap-1.5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 hover:scale-105">
                      <MapPin className="h-3.5 w-3.5" />
                      {offer.localisation}
                    </Badge>
                  )}
                  {offer.type_stage && (
                    <Badge variant="outline" className="gap-1.5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 hover:scale-105">
                      <Briefcase className="h-3.5 w-3.5" />
                      {offer.type_stage}
                    </Badge>
                  )}
                  {offer.remuneration && (
                    <Badge variant="outline" className="gap-1.5 text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 hover:scale-105">
                      <Euro className="h-3.5 w-3.5" />
                      {offer.montant_remuneration ? `${offer.montant_remuneration}Ar/mois` : 'Rémunéré'}
                    </Badge>
                  )}
                  {offer.date_debut && (
                    <Badge variant="outline" className="gap-1.5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 hover:scale-105">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(offer.date_debut).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </Badge>
                  )}
                </div>

                {/* Description avec effet de fade */}
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 group-hover:text-foreground/80 transition-colors duration-300">
                  {offer.description}
                </p>

                {/* Badge domaine avec gradient */}
                <Badge 
                  variant="secondary" 
                  className="bg-gradient-to-r from-secondary to-secondary/80 hover:from-primary/20 hover:to-primary/10 transition-all duration-300"
                >
                  {offer.domaine}
                </Badge>

                {/* Footer avec boutons d'action */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">{getTimeAgo(offer.created_at)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
                        >
                          Détails
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <DialogHeader>
                          <DialogTitle className="text-2xl text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                            {offer.title}
                          </DialogTitle>
                          <DialogDescription className="flex items-center gap-2 text-base">
                            <Building2 className="h-4 w-4" />
                            {offer.company_name || "Entreprise"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Informations de l'entreprise */}
                          <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-muted/80 to-muted/40 rounded-xl border border-border/50 shadow-sm">
                            {offer.logo_url ? (
                              <img 
                                src={offer.logo_url} 
                                alt={offer.company_name || "Logo"} 
                                className="w-16 h-16 rounded-xl object-cover ring-2 ring-background shadow-md"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner">
                                <Building2 className="h-8 w-8 text-primary" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground mb-2">{offer.company_name || "Entreprise"}</h4>
                              <div className="space-y-1.5">
                                {offer.company_email && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                                    <Mail className="h-4 w-4 shrink-0" />
                                    <a href={`mailto:${offer.company_email}`} className="hover:underline">
                                      {offer.company_email}
                                    </a>
                                  </div>
                                )}
                                {offer.telephone && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                                    <Phone className="h-4 w-4 shrink-0" />
                                    <a href={`tel:${offer.telephone}`} className="hover:underline">
                                      {offer.telephone}
                                    </a>
                                  </div>
                                )}
                                {offer.sector && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Briefcase className="h-4 w-4 shrink-0" />
                                    <span>{offer.sector}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {offer.localisation && (
                              <Badge variant="outline" className="gap-1">
                                <MapPin className="h-3 w-3" />
                                {offer.localisation}
                              </Badge>
                            )}
                            {offer.type_stage && (
                              <Badge variant="outline" className="gap-1">
                                <Briefcase className="h-3 w-3" />
                                {offer.type_stage}
                              </Badge>
                            )}
                            {offer.remuneration && (
                              <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-200">
                                <Euro className="h-3 w-3" />
                                {offer.montant_remuneration ? `${offer.montant_remuneration}Ar/mois` : 'Rémunéré'}
                              </Badge>
                            )}
                            {offer.date_debut && offer.date_fin && (
                              <Badge variant="outline" className="gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(offer.date_debut).toLocaleDateString('fr-FR')} - {new Date(offer.date_fin).toLocaleDateString('fr-FR')}
                              </Badge>
                            )}
                            {offer.nombre_places && (
                              <Badge variant="outline" className="gap-1">
                                <Users className="h-3 w-3" />
                                {offer.nombre_places} place{offer.nombre_places > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>

                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{offer.description}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Domaine</h4>
                            <Badge variant="secondary">{offer.domaine}</Badge>
                          </div>

                          {offer.company_description && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">À propos de l'entreprise</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">{offer.company_description}</p>
                            </div>
                          )}

                          {offer.address && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Adresse de l'entreprise</h4>
                              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                                <p>{offer.address}</p>
                              </div>
                            </div>
                          )}

                          <Button 
                            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300" 
                            onClick={() => openApplicationDialog(offer.id)}
                            disabled={hasApplied(offer.id)}
                          >
                            {hasApplied(offer.id) ? "Déjà postulé" : "Postuler à cette offre"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      size="sm"
                      onClick={() => openApplicationDialog(offer.id)}
                      disabled={hasApplied(offer.id)}
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      {hasApplied(offer.id) ? "Déjà postulé" : "Postuler"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Dialogue de candidature */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Postuler à cette offre</DialogTitle>
            <DialogDescription>
              Ajoutez un message personnalisé pour accompagner votre candidature (optionnel)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message de motivation</Label>
              <Textarea
                id="message"
                placeholder="Expliquez pourquoi vous êtes intéressé par cette offre..."
                className="min-h-32 leading-relaxed"
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Ce message sera envoyé à l'entreprise avec votre profil et votre CV
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                className="flex-1"
                disabled={applyingOfferId !== null}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleApply}
                className="flex-1 gap-2"
                disabled={applyingOfferId !== null}
              >
                {applyingOfferId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
