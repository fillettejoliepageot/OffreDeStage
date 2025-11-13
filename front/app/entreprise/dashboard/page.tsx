"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Users, TrendingUp, Clock, Calendar, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { offresAPI, candidaturesAPI } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface Offre {
  id: string
  title: string
  domaine: string
  nombre_candidatures?: number
}

interface Candidature {
  id: string
  first_name: string
  last_name: string
  offre_title: string
  offre_domaine: string
  date_candidature: string
  statut: 'pending' | 'accepted' | 'rejected'
}

const statusConfig = {
  pending: { label: "En attente", color: "bg-orange-100 text-orange-700 border-orange-200" },
  accepted: { label: "Accepté", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  rejected: { label: "Refusé", color: "bg-red-100 text-red-700 border-red-200" },
}

export default function EntrepriseDashboard() {
  const [loading, setLoading] = useState(true)
  const [offres, setOffres] = useState<Offre[]>([])
  const [candidatures, setCandidatures] = useState<Candidature[]>([])
  
  // Statistiques calculées
  const totalOffres = offres.length
  const totalCandidatures = candidatures.length
  const pendingCandidatures = candidatures.filter(c => c.statut === 'pending').length
  const acceptedCandidatures = candidatures.filter(c => c.statut === 'accepted').length
  const acceptanceRate = totalCandidatures > 0 
    ? Math.round((acceptedCandidatures / totalCandidatures) * 100) 
    : 0

  const stats = [
    { label: "Offres actives", value: totalOffres.toString(), icon: Briefcase, color: "text-primary" },
    { label: "Candidatures reçues", value: totalCandidatures.toString(), icon: Users, color: "text-emerald-600" },
    { label: "Candidatures en attente", value: pendingCandidatures.toString(), icon: Clock, color: "text-orange-600" },
    { label: "Taux d'acceptation", value: `${acceptanceRate}%`, icon: TrendingUp, color: "text-indigo-600" },
  ]

  // Calculer la répartition des offres par domaine
  const offersByDomain = offres.reduce((acc, offre) => {
    const domain = offre.domaine || 'Autre'
    const existing = acc.find(item => item.domain === domain)
    if (existing) {
      existing.count++
    } else {
      acc.push({ domain, count: 1, percentage: 0 })
    }
    return acc
  }, [] as { domain: string; count: number; percentage: number }[])

  // Calculer les pourcentages
  offersByDomain.forEach(item => {
    item.percentage = totalOffres > 0 ? Math.round((item.count / totalOffres) * 100) : 0
  })

  // Trier par nombre d'offres décroissant
  offersByDomain.sort((a, b) => b.count - a.count)

  // Prendre les 4 dernières candidatures
  const recentApplications = candidatures.slice(0, 4)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Charger les offres de l'entreprise
      try {
        const offresResponse = await offresAPI.getMyOffres()
        if (offresResponse.success) {
          setOffres(offresResponse.data)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des offres:', error)
      }

      // Charger les candidatures reçues
      try {
        const candidaturesResponse = await candidaturesAPI.getCompanyCandidatures()
        if (candidaturesResponse.success) {
          setCandidatures(candidaturesResponse.data)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des candidatures:', error)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error)
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
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">Vue d'ensemble de vos offres et candidatures</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">{stat.label}</CardTitle>
                <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Offers by Domain Chart */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Offres par domaine</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {offersByDomain.length > 0 
                ? `Répartition de vos ${totalOffres} offre${totalOffres > 1 ? 's' : ''} active${totalOffres > 1 ? 's' : ''}`
                : 'Aucune offre publiée'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            {offersByDomain.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">Aucune offre publiée</p>
                <p className="text-xs sm:text-sm mt-2">Créez votre première offre pour commencer</p>
                <Button asChild className="mt-3 sm:mt-4" size="sm">
                  <Link href="/entreprise/offres/nouvelle">
                    Créer une offre
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                {offersByDomain.map((item) => (
                  <div key={item.domain} className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-medium truncate mr-2">{item.domain}</span>
                      <span className="text-muted-foreground whitespace-nowrap">
                        {item.count} offre{item.count > 1 ? 's' : ''} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
            <div>
              <CardTitle className="text-lg sm:text-xl">Dernières candidatures</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {recentApplications.length > 0 
                  ? `${recentApplications.length} candidature${recentApplications.length > 1 ? 's' : ''} récente${recentApplications.length > 1 ? 's' : ''}`
                  : 'Aucune candidature reçue'
                }
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/entreprise/candidatures">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {recentApplications.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">Aucune candidature reçue pour le moment</p>
                <p className="text-xs sm:text-sm mt-2">Les candidatures apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {recentApplications.map((application) => (
                  <div
                    key={application.id}
                    className="flex flex-col sm:flex-row items-start justify-between p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors gap-3"
                  >
                    <div className="space-y-1 flex-1 w-full">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm sm:text-base font-medium">
                          {application.first_name} {application.last_name}
                        </p>
                        <Badge
                          variant="outline"
                          className={`${statusConfig[application.statut].color} text-xs`}
                        >
                          {statusConfig[application.statut].label}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{application.offre_title}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(application.date_candidature)}
                        </span>
                        {application.offre_domaine && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            <span className="truncate">{application.offre_domaine}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto">
                      <Link href={`/entreprise/candidatures`}>
                        <Eye className="h-4 w-4 mr-2 sm:mr-0" />
                        <span className="sm:hidden">Voir</span>
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Actions rapides</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Gérez vos offres et candidatures</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 p-4 sm:p-6 pt-0">
          <Button asChild>
            <Link href="/entreprise/offres/nouvelle">
              <Briefcase className="mr-2 h-4 w-4" />
              Créer une offre
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/entreprise/offres">
              <Eye className="mr-2 h-4 w-4" />
              Voir mes offres
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/entreprise/candidatures">
              <Users className="mr-2 h-4 w-4" />
              Gérer les candidatures
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
