"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, FileDown, Users, Building2, TrendingUp, RefreshCw } from "lucide-react"
import { adminAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface RawData {
  company_name: string
  niveau_etude: string
  nombre_etudiants: string
}

export default function TableauCroisePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [rawData, setRawData] = useState<RawData[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    loadData()
    
    // Rafraîchissement automatique toutes les 30 secondes
    const interval = setInterval(() => {
      loadData(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const loadData = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      
      const response = await adminAPI.getTableauCroise()
      if (response.success) {
        setRawData(response.data)
        setLastUpdate(new Date())
        
        if (isAutoRefresh) {
          toast({
            title: "🔄 Données actualisées",
            description: "Le tableau a été mis à jour automatiquement",
          })
        }
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      if (!isAutoRefresh) {
        toast({
          title: "❌ Erreur",
          description: "Erreur lors du chargement des données",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleManualRefresh = () => {
    loadData()
    toast({
      title: "🔄 Actualisation...",
      description: "Rechargement des données en cours",
    })
  }

  // Transformer les données en tableau croisé
  const niveaux = ['L1', 'L2', 'L3', 'M1', 'M2']
  const entreprises = [...new Set(rawData.map(d => d.company_name))].sort()

  const getValeur = (entreprise: string, niveau: string) => {
    const item = rawData.find(d => d.company_name === entreprise && d.niveau_etude === niveau)
    return item ? parseInt(item.nombre_etudiants) : 0
  }

  const getTotalEntreprise = (entreprise: string) => {
    return rawData
      .filter(d => d.company_name === entreprise)
      .reduce((sum, d) => sum + parseInt(d.nombre_etudiants), 0)
  }

  const getTotalNiveau = (niveau: string) => {
    return rawData
      .filter(d => d.niveau_etude === niveau)
      .reduce((sum, d) => sum + parseInt(d.nombre_etudiants), 0)
  }

  const totalGeneral = rawData.reduce((sum, d) => sum + parseInt(d.nombre_etudiants), 0)

  const exportCSV = () => {
    // Fonction pour échapper les valeurs CSV (RFC 4180)
    const escapeCSV = (value: string | number) => {
      const str = String(value)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    // En-tête avec métadonnées
    let csv = "\uFEFF" // UTF-8 BOM pour Excel
    csv += "Tableau Croisé Dynamique - StageConnect\n"
    csv += `Date de génération:,${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}\n`
    csv += `Période:,12 derniers mois (annuel)\n`
    csv += `Total étudiants:,${totalGeneral}\n`
    csv += `Nombre d'entreprises:,${entreprises.length}\n`
    csv += "\n"
    
    // En-tête du tableau
    csv += "Entreprise,L1,L2,L3,M1,M2,Total\n"
    
    // Données par entreprise
    entreprises.forEach(ent => {
      const values = niveaux.map(n => getValeur(ent, n))
      const total = getTotalEntreprise(ent)
      csv += `${escapeCSV(ent)},${values.join(',')},${total}\n`
    })
    
    // Ligne de total
    csv += `TOTAL,${niveaux.map(n => getTotalNiveau(n)).join(',')},${totalGeneral}\n`
    csv += "\n"
    
    // Légende
    csv += "Légende\n"
    csv += "L1-L3:,Licence 1ère à 3ème année\n"
    csv += "M1-M2:,Master 1ère et 2ème année\n"
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tableau_croise_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: "✅ Export réussi",
      description: "Le fichier CSV a été téléchargé avec encodage UTF-8",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* En-tête moderne */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top duration-700">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Tableau Croisé Dynamique
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Répartition des étudiants par niveau et entreprise (12 derniers mois)
          </p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            {refreshing && <Loader2 className="h-3 w-3 animate-spin" />}
            Dernière mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleManualRefresh}
            variant="outline"
            className="gap-2 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 dark:hover:text-blue-400 transition-all duration-300"
            disabled={loading || refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button 
            onClick={exportCSV} 
            className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <FileDown className="h-4 w-4" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="group relative overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-in slide-in-from-bottom duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Total Étudiants
                </p>
                <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors mt-2">
                  {totalGeneral}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-in slide-in-from-bottom duration-500 delay-100">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Entreprises
                </p>
                <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors mt-2">
                  {entreprises.length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-in slide-in-from-bottom duration-500 delay-200">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Moyenne / Entreprise
                </p>
                <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors mt-2">
                  {entreprises.length > 0 ? Math.round(totalGeneral / entreprises.length) : 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau croisé moderne */}
      <Card className="overflow-hidden animate-in slide-in-from-bottom duration-700 delay-300">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b">
          <CardTitle className="text-2xl">Répartition Détaillée</CardTitle>
          <CardDescription className="text-base">
            Nombre d'étudiants par niveau d'études et entreprise
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
                  <th className="p-4 text-left font-bold sticky left-0 bg-primary z-10 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Entreprise
                    </div>
                  </th>
                  {niveaux.map(niveau => (
                    <th key={niveau} className="p-4 text-center font-bold min-w-[100px]">
                      <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
                        {niveau}
                      </Badge>
                    </th>
                  ))}
                  <th className="p-4 text-center font-bold bg-primary/80 min-w-[100px]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {entreprises.map((entreprise, idx) => (
                  <tr 
                    key={entreprise}
                    className={`group transition-all duration-200 hover:bg-muted/50 border-b border-border ${
                      idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                    }`}
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${idx * 0.05}s both`
                    }}
                  >
                    <td className="p-4 font-semibold sticky left-0 bg-inherit z-10 group-hover:text-primary transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        {entreprise}
                      </div>
                    </td>
                    {niveaux.map(niveau => {
                      const valeur = getValeur(entreprise, niveau)
                      return (
                        <td 
                          key={niveau} 
                          className="p-4 text-center"
                        >
                          <span className={`inline-flex items-center justify-center min-w-[50px] px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                            valeur > 0 
                              ? 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-700 dark:from-blue-900/30 dark:to-blue-900/20 dark:text-blue-400 hover:scale-110 hover:shadow-md' 
                              : 'text-muted-foreground/50'
                          }`}>
                            {valeur}
                          </span>
                        </td>
                      )
                    })}
                    <td className="p-4 text-center bg-muted/30">
                      <span className="inline-flex items-center justify-center min-w-[50px] px-4 py-2 rounded-lg font-bold bg-gradient-to-br from-primary/20 to-primary/10 text-primary hover:scale-110 transition-transform duration-200">
                        {getTotalEntreprise(entreprise)}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gradient-to-r from-primary/10 to-primary/5 font-bold border-t-2 border-primary/20">
                  <td className="p-4 text-primary sticky left-0 bg-gradient-to-r from-primary/10 to-primary/5 z-10">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      TOTAL
                    </div>
                  </td>
                  {niveaux.map(niveau => (
                    <td 
                      key={niveau} 
                      className="p-4 text-center text-primary font-bold text-lg"
                    >
                      {getTotalNiveau(niveau)}
                    </td>
                  ))}
                  <td className="p-4 text-center text-primary font-bold text-xl">
                    {totalGeneral}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {entreprises.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl scale-150" />
                <Building2 className="h-16 w-16 mx-auto opacity-50 relative z-10" />
              </div>
              <p className="text-lg font-medium">Aucune donnée disponible</p>
              <p className="text-sm mt-2">Aucune candidature trouvée pour la période annuelle</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Légende moderne */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="animate-in slide-in-from-bottom duration-700 delay-400">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                ℹ️
              </Badge>
              Niveaux d'Études
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">L1-L3</Badge>
              <span className="text-sm">Licence 1ère, 2ème et 3ème année</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">M1-M2</Badge>
              <span className="text-sm">Master 1ère et 2ème année</span>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-in slide-in-from-bottom duration-700 delay-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                📊
              </Badge>
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong className="text-foreground">Période :</strong> 12 derniers mois (annuel)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong className="text-foreground">Données :</strong> Nombre d'étudiants uniques ayant postulé</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong className="text-foreground">Mise à jour :</strong> Automatique toutes les 30 secondes</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong className="text-foreground">Dernière actualisation :</strong> {lastUpdate.toLocaleString('fr-FR')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

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
    </div>
  )
}
