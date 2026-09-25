'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PanelPreferencias } from './panelPreferencias'

interface Props {
  abierto: boolean
  onCerrar: () => void
}

export function DialogPreferenciasAlergenos({ abierto, onCerrar }: Props) {
  return (
    <Dialog
      open={abierto}
      onOpenChange={(open) => { if (!open) onCerrar() }}
    >
      <DialogContent className="max-w-sm rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">Preferencias y alérgenos</DialogTitle>
          <DialogDescription className="sr-only">
            Elige tus dietas y los alérgenos que nunca quieres ver en el feed
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2">
          {abierto && <PanelPreferencias onGuardado={onCerrar} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}
