'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useVaciarDespensa } from '../hooks/useMiDespensa'

interface Props {
  total: number
}

export function HeaderDespensa({ total }: Props) {
  const [confirmando, setConfirmando] = useState(false)
  const { mutate: vaciar, isPending } = useVaciarDespensa()

  function handleVaciar() {
    vaciar(undefined, { onSuccess: () => setConfirmando(false) })
  }

  return (
    <>
      <div className="px-5 pt-8 pb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.75rem] font-extrabold text-foreground leading-tight tracking-tight mb-1">
            ¡Bienvenido a tu{' '}
            <span className="font-black italic text-brand">Despensa</span>!
          </h1>
          <p className="text-sm text-muted-foreground">
            {total === 0
              ? 'Tu despensa está vacía'
              : `${total} ${total === 1 ? 'ingrediente guardado' : 'ingredientes guardados'}`}
          </p>
        </div>

        {total > 0 && (
          <button
            onClick={() => setConfirmando(true)}
            className="mt-1.5 shrink-0 flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive active:scale-95"
          >
            <Trash2 size={12} strokeWidth={2.5} />
            Vaciar todo
          </button>
        )}
      </div>

      <Dialog open={confirmando} onOpenChange={setConfirmando}>
        <DialogContent className="max-w-sm rounded-2xl p-6">
          <DialogHeader className="text-left">
            <DialogTitle>¿Vaciar despensa?</DialogTitle>
            <DialogDescription>
              Se eliminarán los {total} ingredientes. No se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-5">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmando(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleVaciar}
              disabled={isPending}
            >
              {isPending ? 'Vaciando…' : 'Vaciar todo'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
