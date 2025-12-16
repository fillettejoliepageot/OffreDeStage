"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Trash2, CheckCircle, Loader2, Ban, CheckCircle2, Eye } from "lucide-react"
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
import { CompanyDetailsModal } from "@/components/admin/CompanyDetailsModal"
import { TableActions } from "@/components/admin/TableActions"

interface Company {
  id: string
  email: string
  statut: 'actif' | 'bloqué'
  company_name: string | null
  sector: string | null
  address: string | null
  telephone: string | null
  offres_count: number
}

export default function AdminEntreprises() {
  const { toast } = useToast()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [actionDialog, setActionDialog] = useState<"delete" | "block" | "unblock" | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getCompanies()
      
      if (response.success) {
        setCompanies(response.data)
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.message || "Erreur lors du chargement des entreprises",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(
    (company) =>
      (company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (company.sector?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (companyId: string) => {
    setActionInProgress('delete')
    try {
      const response = await adminAPI.deleteUser(companyId)
      
      if (response.success) {
        toast({
          title: "✅ Succès",
          description: "Entreprise supprimée avec succès",
          variant: "default",
        })
        
        // Recharger la liste
        await loadCompanies()
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        title: " Erreur",
        description: error.response?.data?.message || "Erreur lors de la suppression",
        variant: "destructive",
      })
    } finally {
      setActionInProgress(null)
    }
  }

  const handleUpdateStatus = async (companyId: string, statut: 'actif' | 'bloqué') => {
    const action = statut === 'bloqué' ? 'block' : 'unblock'
    setActionInProgress(action)
    try {
      const response = await adminAPI.updateUserStatus(companyId, statut)
      
      if (response.success) {
        toast({
          title: "✅ Succès",
          description: statut === 'bloqué' ? "Entreprise bloquée avec succès" : "Entreprise débloquée avec succès",
          variant: "default",
        })
        
        // Recharger la liste
        await loadCompanies()
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        title: "❌ Erreur",
        description: error.response?.data?.message || "Erreur lors de la mise à jour du statut",
        variant: "destructive",
      })
    } finally {
      setActionInProgress(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement des entreprises...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestion des entreprises</h1>
        <p className="text-muted-foreground mt-2">Gérer les comptes entreprises de la plateforme</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total entreprises</p>
                <p className="text-2xl font-bold text-foreground">{companies.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Comptes actifs</p>
                <p className="text-2xl font-bold text-foreground">
                  {companies.filter((c) => c.statut === 'actif').length}
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
                <p className="text-sm font-medium text-muted-foreground">Comptes bloqués</p>
                <p className="text-2xl font-bold text-foreground">
                  {companies.filter((c) => c.statut === 'bloqué').length}
                </p>
              </div>
              <Ban className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profils complets</p>
                <p className="text-2xl font-bold text-foreground">
                  {companies.filter((c) => c.company_name && c.sector).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Liste des entreprises ({filteredCompanies.length})</CardTitle>
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
        </CardHeader>
        <CardContent>
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucune entreprise trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Secteur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Offres</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        {company.company_name || <span className="text-muted-foreground italic">Non renseigné</span>}
                      </TableCell>
                      <TableCell>{company.sector || <span className="text-muted-foreground italic">-</span>}</TableCell>
                      <TableCell>{company.email}</TableCell>
                      <TableCell>{company.telephone || <span className="text-muted-foreground italic">-</span>}</TableCell>
                      <TableCell>
                        {company.statut === 'bloqué' ? (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="w-3 h-3" />
                            Bloqué
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-emerald-600 gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Actif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{company.offres_count}</TableCell>
                      <TableActions
                        item={company}
                        onView={(id) => {
                          setSelectedCompanyId(id)
                          setDetailsModalOpen(true)
                        }}
                        onBlock={(id) => handleUpdateStatus(id, 'bloqué')}
                        onUnblock={(id) => handleUpdateStatus(id, 'actif')}
                        onDelete={handleDelete}
                        isBlocking={actionInProgress === 'block' || actionInProgress === 'unblock'}
                        isDeleting={actionInProgress === 'delete'}
                        type="company"
                      />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Actions */}
      <Dialog open={!!actionDialog} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog === "delete" 
                ? "Supprimer l'entreprise" 
                : actionDialog === "block" 
                  ? "Bloquer l'entreprise" 
                  : "Débloquer l'entreprise"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog === "delete" ? (
                <>
                  Êtes-vous sûr de vouloir supprimer définitivement le compte de{" "}
                  <strong>
                    {selectedCompany?.company_name || selectedCompany?.email}
                  </strong>{" "}
                  ? Cette action est irréversible et supprimera également toutes ses offres.
                </>
              ) : actionDialog === "block" ? (
                <>
                  Êtes-vous sûr de vouloir bloquer le compte de{" "}
                  <strong>
                    {selectedCompany?.company_name || selectedCompany?.email}
                  </strong>{" "}
                  ? L'entreprise ne pourra plus se connecter ni publier d'offres.
                </>
              ) : (
                <>
                  Êtes-vous sûr de vouloir débloquer le compte de{" "}
                  <strong>
                    {selectedCompany?.company_name || selectedCompany?.email}
                  </strong>{" "}
                  ? L'entreprise pourra à nouveau se connecter et publier des offres.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setActionDialog(null)} 
              disabled={!!actionInProgress}
            >
              Annuler
            </Button>
            <Button 
              variant={actionDialog === 'unblock' ? 'default' : 'destructive'} 
              onClick={() => {
                if (!selectedCompany) return
                if (actionDialog === 'delete') {
                  handleDelete(selectedCompany.id)
                } else if (actionDialog === 'block') {
                  handleUpdateStatus(selectedCompany.id, 'bloqué')
                } else if (actionDialog === 'unblock') {
                  handleUpdateStatus(selectedCompany.id, 'actif')
                }
                setActionDialog(null)
              }}
              disabled={!!actionInProgress}
            >
              {actionInProgress ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  {actionInProgress === 'delete' 
                    ? 'Suppression...' 
                    : actionInProgress === 'block' 
                      ? 'Blocage...' 
                      : 'Déblocage...'}
                </>
              ) : actionDialog === 'delete' ? (
                'Supprimer'
              ) : actionDialog === 'block' ? (
                'Bloquer'
              ) : (
                'Débloquer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Company Details Modal */}
      <CompanyDetailsModal
        userId={selectedCompanyId}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
    </div>
  )
}
