"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, Briefcase, FileCheck, Loader2 } from "lucide-react"
import { adminAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

export default function AdminDashboard() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getStats()
      
      if (response.success) {
        setStats(response.data)
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.message || "Erreur lors du chargement des statistiques",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: fr 
      })
    } catch {
      return 'Récemment'
    }
  }

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'student': return 'Nouvel étudiant'
      case 'company': return 'Nouvelle entreprise'
      case 'offre': return 'Nouvelle offre'
      case 'candidature': return 'Candidature'
      default: return type
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'student': return 'bg-blue-100 text-blue-700'
      case 'company': return 'bg-emerald-100 text-emerald-700'
      case 'offre': return 'bg-orange-100 text-orange-700'
      case 'candidature': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </div>
    )
  }

  const statsData = [
    {
      title: "Étudiants inscrits",
      value: stats.totals.students.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Entreprises",
      value: stats.totals.companies.toString(),
      icon: Building2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Offres actives",
      value: stats.totals.offres.toString(),
      icon: Briefcase,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Candidatures totales",
      value: stats.totals.candidatures.toString(),
      icon: FileCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Tableau de bord administrateur</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">Vue d'ensemble de la plateforme de gestion des stages</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsData.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 sm:space-y-2">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-2 sm:p-3 rounded-lg`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Activité récente</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {stats.recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.type)} whitespace-nowrap`}>
                      {getActivityTypeLabel(activity.type)}
                    </span>
                    <span className="text-sm sm:text-base font-medium text-foreground break-words">
                      {activity.details || activity.name}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{formatTime(activity.time)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm sm:text-base">Aucune activité récente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
