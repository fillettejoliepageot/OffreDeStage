"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Mail, Phone, GraduationCap, BookOpen, Building2, MapPin, Calendar, FileText, CheckCircle2, Clock, XCircle } from "lucide-react"
import { adminAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface StudentDetailsModalProps {
  userId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StudentDetailsModal({ userId, open, onOpenChange }: StudentDetailsModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [student, setStudent] = useState<any>(null)

  useEffect(() => {
    if (open && userId) {
      loadStudentDetails()
    }
  }, [open, userId])

  const loadStudentDetails = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const response = await adminAPI.getStudentDetails(userId)
      
      if (response.success) {
        setStudent(response.data)
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
          <DialogTitle className="text-2xl">Détails de l'étudiant</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : student ? (
          <div className="space-y-6">
            {/* Header avec statut */}
            <div className="flex items-start justify-between pb-4 border-b">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">
                  {student.first_name && student.last_name 
                    ? `${student.first_name} ${student.last_name}`
                    : "Profil incomplet"
                  }
                </h3>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{student.email}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {student.statut === 'bloqué' ? (
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
                  Inscrit {formatDate(student.created_at)}
                </span>
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Informations académiques
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Domaine d'étude</p>
                  <p className="font-medium">{student.domaine_etude || <span className="text-muted-foreground italic">Non renseigné</span>}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Niveau d'étude</p>
                  <p className="font-medium">{student.niveau_etude || <span className="text-muted-foreground italic">Non renseigné</span>}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Spécialisation</p>
                  <p className="font-medium">{student.specialisation || <span className="text-muted-foreground italic">Non renseigné</span>}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Établissement</p>
                  <p className="font-medium">{student.etablissement || <span className="text-muted-foreground italic">Non renseigné</span>}</p>
                </div>
              </div>
            </div>

            {/* Coordonnées */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Coordonnées
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{student.telephone || <span className="text-muted-foreground italic">Non renseigné</span>}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-medium">{student.address || <span className="text-muted-foreground italic">Non renseigné</span>}</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            {student.bio && (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  À propos
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{student.bio}</p>
              </div>
            )}

            {/* Compétences */}
            {student.competences && student.competences.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Compétences
                </h4>
                <div className="flex flex-wrap gap-2">
                  {student.competences.map((comp: string, index: number) => (
                    <Badge key={index} variant="secondary">{comp}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Statistiques des candidatures */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Statistiques des candidatures
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total</p>
                  <p className="text-2xl font-bold text-blue-600">{student.candidatures_count || 0}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Acceptées</p>
                  <p className="text-2xl font-bold text-blue-600">{student.candidatures_acceptees || 0}</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">En attente</p>
                  <p className="text-2xl font-bold text-orange-600">{student.candidatures_en_attente || 0}</p>
                </div>
              </div>
            </div>

            {/* CV et Photo */}
            <div className="grid grid-cols-2 gap-4">
              {student.cv_url && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">CV</p>
                  <a 
                    href={student.cv_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-4 h-4" />
                    Voir le CV
                  </a>
                </div>
              )}
              {student.photo_url && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Photo de profil</p>
                  <img 
                    src={student.photo_url} 
                    alt="Photo de profil" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-border"
                  />
                </div>
              )}
            </div>
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
