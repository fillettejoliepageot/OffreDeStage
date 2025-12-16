"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Ban, CheckCircle2, Eye, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TableCell } from "@/components/ui/table"

interface TableActionsProps {
  item: {
    id: string
    statut: 'actif' | 'bloqué'
    first_name?: string | null
    last_name?: string | null
    email: string
  }
  onView: (id: string) => void
  onBlock: (id: string) => void
  onUnblock: (id: string) => void
  onDelete: (id: string) => void
  isBlocking: boolean
  isDeleting: boolean
  viewLabel?: string
  type?: 'student' | 'company' | 'offer' | 'application'
}

export function TableActions({
  item,
  onView,
  onBlock,
  onUnblock,
  onDelete,
  isBlocking,
  isDeleting,
  viewLabel = "Détails",
  type = 'student'
}: TableActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Texte personnalisé en fonction du type d'élément
  const getActionLabels = () => {
    switch (type) {
      case 'company':
        return {
          block: 'Bloquer l\'entreprise',
          unblock: 'Débloquer l\'entreprise',
          delete: 'Supprimer l\'entreprise'
        }
      case 'offer':
        return {
          block: 'Désactiver l\'offre',
          unblock: 'Activer l\'offre',
          delete: 'Supprimer l\'offre'
        }
      case 'application':
        return {
          block: 'Refuser la candidature',
          unblock: 'Accepter la candidature',
          delete: 'Supprimer la candidature'
        }
      default: // student
        return {
          block: 'Bloquer l\'étudiant',
          unblock: 'Débloquer l\'étudiant',
          delete: 'Supprimer l\'étudiant'
        }
    }
  }
  
  const labels = getActionLabels()
  const isBlocked = item.statut === 'bloqué'
  
  return (
    <TableCell className="text-right">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(true)
            }}
          >
            <span className="sr-only">Ouvrir le menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation()
              onView(item.id)
              setIsOpen(false)
            }}
            className="cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4 text-blue-600" />
            <span>{viewLabel}</span>
          </DropdownMenuItem>
          
          {isBlocked ? (
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation()
                onUnblock(item.id)
                setIsOpen(false)
              }}
              disabled={isBlocking}
              className="cursor-pointer"
            >
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
              <span>{labels.unblock}</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation()
                onBlock(item.id)
                setIsOpen(false)
              }}
              disabled={isBlocking}
              className="cursor-pointer"
            >
              <Ban className="mr-2 h-4 w-4 text-orange-600" />
              <span>{labels.block}</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item.id)
              setIsOpen(false)
            }}
            disabled={isDeleting}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>{labels.delete}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  )
}
