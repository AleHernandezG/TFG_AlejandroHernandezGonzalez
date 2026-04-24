'use client'

import { Camera, Eye, ListOrdered } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type Props = {
  abierto: boolean
  onAceptar: () => void
  onSaltar: () => void
}

const PASOS_TUTORIAL = [
  {
    icono: Camera,
    texto: 'Añade una foto apetecible',
  },
  {
    icono: ListOrdered,
    texto: 'Detalla bien los ingredientes y pasos',
  },
  {
    icono: Eye,
    texto: 'Revisa antes de publicar',
  },
]

export function PopUpTutorial({ abierto, onAceptar, onSaltar }: Props) {
  return (
    <Dialog open={abierto} onOpenChange={(open) => { if (!open) onSaltar() }}>
      <DialogContent className="max-w-sm rounded-2xl bg-card p-6">
        <DialogHeader className="text-center mb-4">
          <DialogTitle className="text-xl font-extrabold text-foreground">
            ¿Es tu primera receta?
          </DialogTitle>
        </DialogHeader>

        <ul className="space-y-4 mb-6">
          {PASOS_TUTORIAL.map(({ icono: Icono, texto }, i) => (
            <li key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-brand/10">
                <Icono size={20} className="text-brand" />
              </div>
              <span className="text-sm font-medium text-foreground">{texto}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2">
          <Button
            onClick={onAceptar}
            className="w-full bg-brand text-brand-foreground font-bold rounded-xl h-12"
          >
            ¡Vamos a ello!
          </Button>
          <Button
            variant="ghost"
            onClick={onSaltar}
            className="w-full text-muted-foreground font-medium"
          >
            Saltar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
