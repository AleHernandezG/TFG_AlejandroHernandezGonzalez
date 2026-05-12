'use client'

import { Camera, ChefHat, Eye, ListOrdered } from 'lucide-react'
import {
  Dialog,
  DialogContent,
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
      <DialogContent className="max-w-sm rounded-2xl bg-[var(--warm-bg-accent)] p-0 overflow-hidden shadow-[0px_8px_32px_oklch(0.1_0.02_50_/_0.5)]">

        {/* Cabecera con fondo de marca */}
        <div className="bg-brand/10 px-6 pt-7 pb-5 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand/20">
            <ChefHat size={26} className="text-brand" />
          </div>
          <DialogTitle className="text-xl font-extrabold text-foreground">
            ¿Es tu primera receta?
          </DialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Sigue estos pasos y deja a todos con ganas
          </p>
        </div>

        {/* Pasos */}
        <div className="px-6 py-5">
          <ul className="space-y-3 mb-6">
            {PASOS_TUTORIAL.map(({ icono: Icono, texto }, i) => (
              <li
                key={i}
                className="flex items-center gap-4 rounded-xl bg-background px-4 py-3 shadow-sm"
              >
                <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full bg-brand/10">
                  <Icono size={18} className="text-brand" />
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
              Saltar tutorial
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}
