"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileDown, FileSpreadsheet, Calendar, Users, Building2, Briefcase, Loader2, BarChart3, TrendingUp, RefreshCw } from "lucide-react"
import { adminAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

// Enregistrer les composants Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement)

interface RapportData {
  statistiques_globales: {
    total_etudiants: string
    total_entreprises: string
    total_offres: string
    total_candidatures: string
  }
  evolution_mensuelle: Array<{
    mois: string
    etudiants: string
    entreprises: string
    offres: string
    candidatures: string
  }>
  repartition_domaine: Array<{
    domaine: string
    etudiants: string
    offres: string
  }>
  candidatures_par_statut: Array<{
    statut: string
    count: string
  }>
  top_entreprises: Array<{
    company_name: string
    nombre_offres: string
    nombre_candidatures: string
  }>
  taux_conversion: number
}

export default function AdminRapports() {
  const { toast } = useToast()
  const [periode, setPeriode] = useState("6mois")
  const [typeUtilisateur, setTypeUtilisateur] = useState("tous")
  const [domaine, setDomaine] = useState("tous")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [rapportData, setRapportData] = useState<RapportData | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    loadRapports()
    
    // Rafraîchissement automatique toutes les 30 secondes
    const interval = setInterval(() => {
      loadRapports(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [periode])

  const loadRapports = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      
      const response = await adminAPI.getRapports(periode)
      
      if (response.success) {
        setRapportData(response.data)
        setLastUpdate(new Date())
        
        if (isAutoRefresh) {
          toast({
            title: "🔄 Données actualisées",
            description: "Les graphiques ont été mis à jour automatiquement",
            duration: 2000,
          })
        }
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      if (!isAutoRefresh) {
        toast({
          title: "❌ Erreur",
          description: error.response?.data?.message || "Erreur lors du chargement des rapports",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleManualRefresh = () => {
    loadRapports()
    toast({
      title: "🔄 Actualisation...",
      description: "Rechargement des données en cours",
    })
  }

  const handleExportCSV = () => {
    if (!rapportData) return

    try {
      // Fonction pour échapper les valeurs CSV (RFC 4180)
      const escapeCSV = (value: string | number) => {
        const str = String(value)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }

      // Filtrer les données selon les critères sélectionnés
      let filteredEvolution = [...evolution_mensuelle]
      let filteredDomaines = [...repartition_domaine]
      
      // Filtrer par domaine si nécessaire
      if (domaine !== 'tous') {
        filteredDomaines = filteredDomaines.filter(d => 
          d.domaine?.toLowerCase() === domaine.toLowerCase()
        )
      }

      // Créer le contenu CSV avec BOM UTF-8
      let csvContent = "\uFEFF" // UTF-8 BOM pour Excel
      
      // En-tête du rapport avec filtres
      csvContent += "Rapport d'Activité - StageConnect\n"
      csvContent += `Date de génération:,${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}\n`
      csvContent += `Période:,${periode === '1mois' ? 'Dernier mois' : periode === '3mois' ? '3 derniers mois' : periode === '6mois' ? '6 derniers mois' : 'Dernière année'}\n`
      csvContent += `Type d'utilisateur:,${typeUtilisateur === 'tous' ? 'Tous' : typeUtilisateur === 'etudiants' ? 'Étudiants' : 'Entreprises'}\n`
      csvContent += `Domaine:,${domaine === 'tous' ? 'Tous les domaines' : domaine.charAt(0).toUpperCase() + domaine.slice(1)}\n`
      csvContent += "\n"
      
      // Statistiques globales
      csvContent += "Statistiques Globales\n"
      csvContent += "Étudiants,Entreprises,Offres,Candidatures\n"
      csvContent += `${Number(statistiques_globales.total_etudiants).toLocaleString('fr-FR')},${Number(statistiques_globales.total_entreprises).toLocaleString('fr-FR')},${Number(statistiques_globales.total_offres).toLocaleString('fr-FR')},${Number(statistiques_globales.total_candidatures).toLocaleString('fr-FR')}\n`
      csvContent += "\n"
      
      // Évolution mensuelle (données filtrées)
      csvContent += "Évolution Mensuelle\n"
      csvContent += "Mois,Étudiants,Entreprises,Offres,Candidatures\n"
      filteredEvolution.forEach(row => {
        csvContent += `${escapeCSV(row.mois)},${Number(row.etudiants).toLocaleString('fr-FR')},${Number(row.entreprises).toLocaleString('fr-FR')},${Number(row.offres).toLocaleString('fr-FR')},${Number(row.candidatures).toLocaleString('fr-FR')}\n`
      })
      csvContent += "\n"
      
      // Ajouter section domaines (données filtrées)
      csvContent += "Répartition par Domaine\n"
      csvContent += "Domaine,Étudiants,Offres\n"
      if (filteredDomaines.length > 0) {
        filteredDomaines.forEach(row => {
          csvContent += `${escapeCSV(row.domaine || 'Non spécifié')},${Number(row.etudiants).toLocaleString('fr-FR')},${Number(row.offres).toLocaleString('fr-FR')}\n`
        })
      } else {
        csvContent += "Aucune donnée disponible pour ce filtre\n"
      }
      csvContent += "\n"
      
      // Footer
      csvContent += `Généré par StageConnect - ${new Date().getFullYear()}\n`
      csvContent += "Plateforme de Gestion des Stages\n"
      
      // Créer le blob avec le bon type MIME
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      const domaineStr = domaine !== 'tous' ? `_${domaine}` : ''
      const typeStr = typeUtilisateur !== 'tous' ? `_${typeUtilisateur}` : ''
      const fileName = `rapport_${periode}${typeStr}${domaineStr}_${new Date().toISOString().split('T')[0]}.csv`
      link.setAttribute("href", url)
      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast({
        title: "✅ Export réussi",
        description: `Le rapport CSV avec filtres appliqués a été téléchargé (encodage UTF-8)`,
      })
    } catch (error) {
      console.error('Erreur export CSV:', error)
      toast({
        title: "❌ Erreur",
        description: "Erreur lors de l'export CSV",
        variant: "destructive",
      })
    }
  }

  const handleExportPDF = async () => {
    if (!rapportData) return

    try {
      toast({
        title: "⏳ Génération du PDF",
        description: "Veuillez patienter...",
      })

      // Filtrer les données selon les critères sélectionnés
      let filteredEvolution = [...evolution_mensuelle]
      let filteredDomaines = [...repartition_domaine]
      
      // Filtrer par domaine si nécessaire
      if (domaine !== 'tous') {
        filteredDomaines = filteredDomaines.filter(d => 
          d.domaine?.toLowerCase() === domaine.toLowerCase()
        )
      }

      // Créer le PDF directement avec jsPDF (sans html2canvas)
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yPos = 20

      // Titre
      pdf.setFontSize(20)
      pdf.setTextColor(37, 99, 235)
      pdf.text('Rapport d\'Activite - StageConnect', 20, yPos)
      yPos += 10

      // Date
      pdf.setFontSize(10)
      pdf.setTextColor(51, 51, 51)
      pdf.text(`Date de generation : ${new Date().toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 20, yPos)
      yPos += 15

      // Filtres appliqués
      pdf.setFillColor(224, 242, 254)
      pdf.rect(20, yPos, pageWidth - 40, 25, 'F')
      pdf.setFontSize(12)
      pdf.setTextColor(30, 64, 175)
      pdf.text('Filtres Appliques', 25, yPos + 7)
      pdf.setFontSize(10)
      pdf.setTextColor(51, 51, 51)
      pdf.text(`Periode : ${periode === '1mois' ? 'Dernier mois' : periode === '3mois' ? '3 derniers mois' : periode === '6mois' ? '6 derniers mois' : 'Derniere annee'}`, 25, yPos + 13)
      pdf.text(`Type : ${typeUtilisateur === 'tous' ? 'Tous' : typeUtilisateur === 'etudiants' ? 'Etudiants' : 'Entreprises'}`, 25, yPos + 18)
      pdf.text(`Domaine : ${domaine === 'tous' ? 'Tous les domaines' : domaine.charAt(0).toUpperCase() + domaine.slice(1)}`, 25, yPos + 23)
      yPos += 35

      // Statistiques Globales
      pdf.setFontSize(14)
      pdf.setTextColor(30, 64, 175)
      pdf.text('Statistiques Globales', 20, yPos)
      yPos += 10

      const stats = [
        { label: 'Etudiants', value: Number(statistiques_globales.total_etudiants).toLocaleString() },
        { label: 'Entreprises', value: Number(statistiques_globales.total_entreprises).toLocaleString() },
        { label: 'Offres', value: Number(statistiques_globales.total_offres).toLocaleString() },
        { label: 'Candidatures', value: Number(statistiques_globales.total_candidatures).toLocaleString() }
      ]

      const boxWidth = (pageWidth - 60) / 4
      stats.forEach((stat, idx) => {
        const xPos = 20 + (idx * (boxWidth + 5))
        pdf.setFillColor(249, 250, 251)
        pdf.rect(xPos, yPos, boxWidth, 20, 'F')
        pdf.setDrawColor(221, 221, 221)
        pdf.rect(xPos, yPos, boxWidth, 20, 'S')
        pdf.setFontSize(8)
        pdf.setTextColor(107, 114, 128)
        pdf.text(stat.label, xPos + 3, yPos + 6)
        pdf.setFontSize(14)
        pdf.setTextColor(31, 41, 55)
        pdf.text(stat.value, xPos + 3, yPos + 14)
      })
      yPos += 30

      // Evolution Mensuelle
      pdf.setFontSize(14)
      pdf.setTextColor(30, 64, 175)
      pdf.text('Evolution Mensuelle', 20, yPos)
      yPos += 10

      // En-têtes du tableau
      pdf.setFillColor(37, 99, 235)
      pdf.rect(20, yPos, pageWidth - 40, 8, 'F')
      pdf.setFontSize(9)
      pdf.setTextColor(255, 255, 255)
      const colWidth = (pageWidth - 40) / 5
      pdf.text('Mois', 22, yPos + 5)
      pdf.text('Etudiants', 22 + colWidth, yPos + 5)
      pdf.text('Entreprises', 22 + colWidth * 2, yPos + 5)
      pdf.text('Offres', 22 + colWidth * 3, yPos + 5)
      pdf.text('Candidatures', 22 + colWidth * 4, yPos + 5)
      yPos += 8

      // Lignes du tableau (données filtrées)
      pdf.setTextColor(51, 51, 51)
      filteredEvolution.forEach((row, idx) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage()
          yPos = 20
        }
        
        if (idx % 2 === 1) {
          pdf.setFillColor(249, 250, 251)
          pdf.rect(20, yPos, pageWidth - 40, 7, 'F')
        }
        
        pdf.text(row.mois, 22, yPos + 5)
        pdf.text(String(Number(row.etudiants)), 22 + colWidth, yPos + 5)
        pdf.text(String(Number(row.entreprises)), 22 + colWidth * 2, yPos + 5)
        pdf.text(String(Number(row.offres)), 22 + colWidth * 3, yPos + 5)
        pdf.text(String(Number(row.candidatures)), 22 + colWidth * 4, yPos + 5)
        yPos += 7
      })
      yPos += 10

      // Répartition par Domaine
      if (yPos > pageHeight - 60) {
        pdf.addPage()
        yPos = 20
      }

      pdf.setFontSize(14)
      pdf.setTextColor(30, 64, 175)
      pdf.text('Repartition par Domaine', 20, yPos)
      yPos += 10

      // En-têtes
      pdf.setFillColor(37, 99, 235)
      pdf.rect(20, yPos, pageWidth - 40, 8, 'F')
      pdf.setFontSize(9)
      pdf.setTextColor(255, 255, 255)
      const colWidth2 = (pageWidth - 40) / 3
      pdf.text('Domaine', 22, yPos + 5)
      pdf.text('Etudiants', 22 + colWidth2, yPos + 5)
      pdf.text('Offres', 22 + colWidth2 * 2, yPos + 5)
      yPos += 8

      // Lignes (données filtrées par domaine)
      pdf.setTextColor(51, 51, 51)
      if (filteredDomaines.length > 0) {
        filteredDomaines.forEach((row, idx) => {
          if (yPos > pageHeight - 30) {
            pdf.addPage()
            yPos = 20
          }
          
          if (idx % 2 === 1) {
            pdf.setFillColor(249, 250, 251)
            pdf.rect(20, yPos, pageWidth - 40, 7, 'F')
          }
          
          pdf.text(row.domaine || 'Non specifie', 22, yPos + 5)
          pdf.text(String(Number(row.etudiants)), 22 + colWidth2, yPos + 5)
          pdf.text(String(Number(row.offres)), 22 + colWidth2 * 2, yPos + 5)
          yPos += 7
        })
      } else {
        // Message si aucune donnée après filtrage
        pdf.setTextColor(107, 114, 128)
        pdf.text('Aucune donnee disponible pour ce filtre', 22, yPos + 5)
        yPos += 10
      }

      // Footer
      pdf.setFontSize(8)
      pdf.setTextColor(107, 114, 128)
      pdf.text(`© ${new Date().getFullYear()} StageConnect - Plateforme de Gestion des Stages`, pageWidth / 2, pageHeight - 10, { align: 'center' })

      // Générer le nom du fichier avec les filtres
      const domaineStr = domaine !== 'tous' ? `_${domaine}` : ''
      const typeStr = typeUtilisateur !== 'tous' ? `_${typeUtilisateur}` : ''
      const fileName = `rapport_${periode}${typeStr}${domaineStr}_${new Date().toISOString().split('T')[0]}.pdf`
      
      // 1. Ouvrir le PDF dans un nouvel onglet pour prévisualisation
      const pdfBlob = pdf.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)
      window.open(pdfUrl, '_blank')
      
      // 2. Télécharger automatiquement le PDF
      pdf.save(fileName)

      toast({
        title: "✅ PDF Généré",
        description: `Prévisualisation ouverte et fichier ${fileName} téléchargé`,
        duration: 5000,
      })
    } catch (error) {
      console.error('Erreur export PDF:', error)
      toast({
        title: "❌ Erreur",
        description: "Erreur lors de la génération du PDF",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement des rapports...</p>
        </div>
      </div>
    )
  }

  if (!rapportData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </div>
    )
  }

  const { statistiques_globales, evolution_mensuelle, repartition_domaine } = rapportData

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Génération de rapports</h1>
          <p className="text-muted-foreground mt-2">Analysez les données et exportez des rapports personnalisés</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            {refreshing && <Loader2 className="h-3 w-3 animate-spin" />}
            Dernière mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
            <span className="text-green-600">• Actualisation auto (30s)</span>
          </p>
        </div>
        <Button 
          onClick={handleManualRefresh}
          variant="outline"
          className="gap-2 hover:border-primary hover:text-primary transition-all"
          disabled={loading || refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres de rapport</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periode">Période</Label>
              <Select value={periode} onValueChange={setPeriode}>
                <SelectTrigger id="periode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1mois">Dernier mois</SelectItem>
                  <SelectItem value="3mois">3 derniers mois</SelectItem>
                  <SelectItem value="6mois">6 derniers mois</SelectItem>
                  <SelectItem value="1an">Dernière année</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type d'utilisateur</Label>
              <Select value={typeUtilisateur} onValueChange={setTypeUtilisateur}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous</SelectItem>
                  <SelectItem value="etudiants">Étudiants</SelectItem>
                  <SelectItem value="entreprises">Entreprises</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="domaine">Domaine</Label>
              <Select value={domaine} onValueChange={setDomaine}>
                <SelectTrigger id="domaine">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les domaines</SelectItem>
                  <SelectItem value="informatique">Informatique</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="commerce">Commerce</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleExportPDF} className="flex items-center gap-2">
              <FileDown className="w-4 h-4" />
              Exporter en PDF
            </Button>
            <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2 bg-transparent">
              <FileSpreadsheet className="w-4 h-4" />
              Exporter en CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Étudiants</p>
                <p className="text-2xl font-bold text-foreground">
                  {Number(statistiques_globales.total_etudiants).toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entreprises</p>
                <p className="text-2xl font-bold text-foreground">
                  {Number(statistiques_globales.total_entreprises).toLocaleString()}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Offres</p>
                <p className="text-2xl font-bold text-foreground">
                  {Number(statistiques_globales.total_offres).toLocaleString()}
                </p>
              </div>
              <Briefcase className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Candidatures</p>
                <p className="text-2xl font-bold text-foreground">
                  {Number(statistiques_globales.total_candidatures).toLocaleString()}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histogrammes Professionnels avec Chart.js */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Histogramme - Évolution Mensuelle */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Évolution Mensuelle
                </CardTitle>
                <CardDescription className="mt-1">
                  Croissance des inscriptions et offres
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[350px]">
              <Bar
                data={{
                  labels: evolution_mensuelle.map(d => d.mois),
                  datasets: [
                    {
                      label: 'Étudiants',
                      data: evolution_mensuelle.map(d => Number(d.etudiants)),
                      backgroundColor: 'rgba(59, 130, 246, 0.8)',
                      borderColor: 'rgba(59, 130, 246, 1)',
                      borderWidth: 2,
                      borderRadius: 6,
                      hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
                    },
                    {
                      label: 'Entreprises',
                      data: evolution_mensuelle.map(d => Number(d.entreprises)),
                      backgroundColor: 'rgba(16, 185, 129, 0.8)',
                      borderColor: 'rgba(16, 185, 129, 1)',
                      borderWidth: 2,
                      borderRadius: 6,
                      hoverBackgroundColor: 'rgba(16, 185, 129, 1)',
                    },
                    {
                      label: 'Offres',
                      data: evolution_mensuelle.map(d => Number(d.offres)),
                      backgroundColor: 'rgba(249, 115, 22, 0.8)',
                      borderColor: 'rgba(249, 115, 22, 1)',
                      borderWidth: 2,
                      borderRadius: 6,
                      hoverBackgroundColor: 'rgba(249, 115, 22, 1)',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                      labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                          size: 12,
                          weight: 500,
                        },
                      },
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      titleFont: {
                        size: 14,
                        weight: 'bold',
                      },
                      bodyFont: {
                        size: 13,
                      },
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderWidth: 1,
                      callbacks: {
                        label: function(context) {
                          return `${context.dataset.label}: ${(context.parsed.y ?? 0).toLocaleString('fr-FR')}`
                        }
                      }
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        font: {
                          size: 11,
                        },
                      },
                    },
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                      ticks: {
                        font: {
                          size: 11,
                        },
                        callback: function(value) {
                          return value.toLocaleString('fr-FR')
                        }
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Histogramme - Répartition par Domaine */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-950/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Répartition par Domaine
                </CardTitle>
                <CardDescription className="mt-1">
                  Étudiants et offres par secteur
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[350px]">
              {repartition_domaine.length > 0 ? (
                <Bar
                  data={{
                    labels: repartition_domaine.map(d => d.domaine || 'Non spécifié'),
                    datasets: [
                      {
                        label: 'Étudiants',
                        data: repartition_domaine.map(d => Number(d.etudiants)),
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 2,
                        borderRadius: 6,
                        hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
                      },
                      {
                        label: 'Offres',
                        data: repartition_domaine.map(d => Number(d.offres)),
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 2,
                        borderRadius: 6,
                        hoverBackgroundColor: 'rgba(16, 185, 129, 1)',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y' as const,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                        labels: {
                          usePointStyle: true,
                          padding: 15,
                          font: {
                            size: 12,
                            weight: 500,
                          },
                        },
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                          size: 14,
                          weight: 'bold',
                        },
                        bodyFont: {
                          size: 13,
                        },
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        callbacks: {
                          label: function(context) {
                            return `${context.dataset.label}: ${(context.parsed.x ?? 0).toLocaleString('fr-FR')}`
                          }
                        }
                      },
                    },
                    scales: {
                      x: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)',
                        },
                        ticks: {
                          font: {
                            size: 11,
                          },
                          callback: function(value) {
                            return value.toLocaleString('fr-FR')
                          }
                        },
                      },
                      y: {
                        grid: {
                          display: false,
                        },
                        ticks: {
                          font: {
                            size: 11,
                          },
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique en Ligne - Tendance des Candidatures */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Tendance des Candidatures
              </CardTitle>
              <CardDescription className="mt-1">
                Évolution du nombre de candidatures dans le temps
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px]">
            <Line
              data={{
                labels: evolution_mensuelle.map(d => d.mois),
                datasets: [
                  {
                    label: 'Candidatures',
                    data: evolution_mensuelle.map(d => Number(d.candidatures)),
                    borderColor: 'rgba(147, 51, 234, 1)',
                    backgroundColor: 'rgba(147, 51, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: 'rgba(147, 51, 234, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(147, 51, 234, 1)',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                      size: 14,
                      weight: 'bold',
                    },
                    bodyFont: {
                      size: 13,
                    },
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                      label: function(context) {
                        return `Candidatures: ${(context.parsed.y ?? 0).toLocaleString('fr-FR')}`
                      }
                    }
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      font: {
                        size: 11,
                      },
                    },
                  },
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    },
                    ticks: {
                      font: {
                        size: 11,
                      },
                      callback: function(value) {
                        return value.toLocaleString('fr-FR')
                      }
                    },
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Données détaillées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Mois</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Étudiants</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Entreprises</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Offres</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Candidatures</th>
                </tr>
              </thead>
              <tbody>
                {evolution_mensuelle.map((row: any, index: number) => (
                  <tr key={index} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 font-medium">{row.mois}</td>
                    <td className="text-right py-3 px-4">{Number(row.etudiants)}</td>
                    <td className="text-right py-3 px-4">{Number(row.entreprises)}</td>
                    <td className="text-right py-3 px-4">{Number(row.offres)}</td>
                    <td className="text-right py-3 px-4">{Number(row.candidatures)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
