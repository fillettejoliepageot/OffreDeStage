"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { FileText, TrendingUp, Clock, MapPin, Building2, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { studentAPI, candidaturesAPI, offresAPI } from "@/lib/api"
import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface StudentProfile {
  first_name?: string
  last_name?: string
  domaine_etude?: string
  niveau_etude?: string
  specialisation?: string
  photo_url?: string
}

interface Candidature {
  id: string
  statut: 'pending' | 'accepted' | 'rejected'
  date_candidature: string
  offre_title: string
  company_name: string
}

interface Offre {
  id: string
  title: string
  company_name: string
  localisation?: string
  domaine?: string
  created_at: string
  type_stage?: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [candidatures, setCandidatures] = useState<Candidature[]>([])
  const [recentOffers, setRecentOffers] = useState<Offre[]>([])
  
  // Statistiques calculées
  const totalCandidatures = candidatures.length
  const pendingCandidatures = candidatures.filter(c => c.statut === 'pending').length
  const acceptedCandidatures = candidatures.filter(c => c.statut === 'accepted').length

  const stats = [
    {
      title: "Candidatures envoyées",
      value: totalCandidatures.toString(),
      icon: FileText,
      description: "Total",
      color: "text-primary",
    },
    {
      title: "En attente",
      value: pendingCandidatures.toString(),
      icon: Clock,
      description: "Réponses attendues",
      color: "text-accent",
    },
    {
      title: "Acceptées",
      value: acceptedCandidatures.toString(),
      icon: TrendingUp,
      description: "Entretiens prévus",
      color: "text-chart-1",
    },
  ]

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Charger le profil étudiant
      try {
        const profileResponse = await studentAPI.getProfile()
        if (profileResponse.success) {
          setProfile(profileResponse.data)
        }
      } catch (error) {
        console.log('Profil non trouvé')
      }

      // Charger les candidatures
      try {
        const candidaturesResponse = await candidaturesAPI.getStudentCandidatures()
        if (candidaturesResponse.success) {
          setCandidatures(candidaturesResponse.data)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des candidatures:', error)
      }

      // Charger les offres récentes (limitées à 3)
      try {
        const offresResponse = await offresAPI.getAll()
        if (offresResponse.success) {
          setRecentOffers(offresResponse.data.slice(0, 3))
        }
      } catch (error) {
        console.error('Erreur lors du chargement des offres:', error)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    return user?.email?.[0]?.toUpperCase() || 'ET'
  }

  const getFullName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return user?.email || 'Étudiant'
  }

  const getStudentInfo = () => {
    const parts = []
    if (profile?.domaine_etude) parts.push(profile.domaine_etude)
    if (profile?.niveau_etude) parts.push(profile.niveau_etude)
    return parts.length > 0 ? parts.join(' - ') : 'Complétez votre profil'
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: fr 
      })
    } catch {
      return 'Récemment'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in p-4 sm:p-0">
      {/* En-tête professionnel */}
      <div className="flex items-center justify-between animate-slide-down">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Tableau de bord
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Bienvenue sur votre espace étudiant</p>
        </div>
      </div>

      {/* Carte de profil professionnelle */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:border-primary/30 animate-scale-in">
        {/* Accent subtil en arrière-plan */}
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary/5 rounded-full blur-3xl" />
        
        <CardContent className="pt-6 pb-6 sm:pt-8 sm:pb-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
            {/* Avatar professionnel */}
            <div className="relative">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 border-2 border-primary/20 shadow-lg transition-all duration-300 hover:border-primary/40 hover:shadow-xl">
                {profile?.photo_url ? (
                  <AvatarImage src={profile.photo_url} alt="Photo de profil" />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-3xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2 w-full">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {getFullName()}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">{getStudentInfo()}</p>
              </div>
              {profile?.specialisation && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="secondary" className="transition-colors duration-200 hover:bg-primary/20 text-xs sm:text-sm">
                    {profile.specialisation}
                  </Badge>
                </div>
              )}
            </div>
            
            <Button asChild className="transition-all duration-200 hover:shadow-md w-full md:w-auto" size="sm">
              <Link href="/etudiant/profil">
                {profile ? 'Modifier le profil' : 'Compléter le profil'}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques professionnelles */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 animate-scale-in" style={{animationDelay: '0.1s'}}>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card 
              key={stat.title} 
              className="group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 transition-colors duration-200 group-hover:bg-primary/20">
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Section offres récentes */}
      <Card className="overflow-hidden animate-scale-in" style={{animationDelay: '0.2s'}}>
        <CardHeader className="border-b bg-muted/30 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold">
                Offres récentes
              </CardTitle>
              <CardDescription className="mt-1 text-xs sm:text-sm">
                {recentOffers.length > 0 
                  ? `${recentOffers.length} offre${recentOffers.length > 1 ? 's' : ''} disponible${recentOffers.length > 1 ? 's' : ''}`
                  : 'Aucune offre disponible pour le moment'
                }
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="transition-all duration-200 hover:bg-primary/10 hover:border-primary w-full sm:w-auto">
              <Link href="/etudiant/offres">Voir toutes les offres</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
          {recentOffers.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm sm:text-base font-medium">Aucune offre disponible pour le moment</p>
              <p className="text-xs sm:text-sm mt-1">Revenez plus tard pour découvrir de nouvelles opportunités</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {recentOffers.map((offer) => (
                <Card 
                  key={offer.id} 
                  className="group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30"
                >
                  
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
                          {offer.title}
                        </h3>
                        <div className="flex flex-col gap-1.5 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 shrink-0" />
                            <span className="truncate">{offer.company_name || 'Entreprise'}</span>
                          </div>
                          {offer.localisation && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 shrink-0" />
                              <span className="truncate">{offer.localisation}</span>
                            </div>
                          )}
                          {offer.type_stage && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 shrink-0" />
                              <span>{offer.type_stage}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {offer.domaine && (
                        <Badge variant="secondary" className="text-xs">
                          {offer.domaine}
                        </Badge>
                      )}
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(offer.created_at)}
                        </p>
                        <Button asChild size="sm" className="transition-all duration-200">
                          <Link href="/etudiant/offres">Voir</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
