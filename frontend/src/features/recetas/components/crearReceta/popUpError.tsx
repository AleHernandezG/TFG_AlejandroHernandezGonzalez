'use client'

import { AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type Props = {
  abierto: boolean
  errores: string[]
  onCorregir: () => void
}

export function PopUpError({ abierto, errores, onCorregir }: Props) {
  return (
    <Dialog open={abierto} onOpenChange={(open) => { if (!open) onCorregir() }}>
      <DialogContent className="max-w-sm rounded-2xl bg-card p-6">
        <DialogHeader className="items-center text-center mb-2">
          <div className="h-14 w-14 flex items-center justify-center rounded-full bg-destructive/10 mb-3">
            <AlertCircle size={28} className="text-destructive" />
          </div>
          <DialogTitle className="text-xl font-extrabold text-foreground">
            Revisa estos campos
          </DialogTitle>
        </DialogHeader>

        <ul className="space-y-2 mb-6">
          {errores.map((msg, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0 mt-1.5" />
              <span className="text-sm text-foreground/80">{msg}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={onCorregir}
          className="w-full bg-brand text-brand-foreground font-bold rounded-xl h-12"
        >
          Corregir
        </Button>
      </DialogContent>
    </Dialog>
  )
}
