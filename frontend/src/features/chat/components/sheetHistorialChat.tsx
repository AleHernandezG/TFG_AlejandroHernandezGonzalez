'use client'

import { Trash2, MessageSquare, Plus } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useChatStore } from '@/stores/chatStore'

interface Props {
  abierto: boolean
  onCerrar: () => void
}

function formatearFecha(iso: string): string {
  const fecha = new Date(iso)
  const hoy = new Date()
  const ayer = new Date(hoy)
  ayer.setDate(hoy.getDate() - 1)

  if (fecha.toDateString() === hoy.toDateString()) return 'Hoy'
  if (fecha.toDateString() === ayer.toDateString()) return 'Ayer'
  return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function SheetHistorialChat({ abierto, onCerrar }: Props) {
  const { historial, nuevaConversacion, restaurarConversacion, eliminarConversacion, mensajes } =
    useChatStore()

  function handleNueva() {
    nuevaConversacion()
    onCerrar()
  }

  function handleRestaurar(id: string) {
    restaurarConversacion(id)
    onCerrar()
  }

  return (
    <Sheet open={abierto} onOpenChange={(v) => !v && onCerrar()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b border-border/20 px-5 py-4">
          <SheetTitle className="text-base font-bold">Historial de chats</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {mensajes.filter((m) => m.rol === 'usuario').length > 0 && (
            <div className="border-b border-border/10 p-4">
              <button
                onClick={handleNueva}
                className="flex w-full items-center gap-3 rounded-xl bg-brand/10 px-4 py-3 text-left text-sm font-medium text-brand transition-colors hover:bg-brand/15 active:scale-[0.98]"
              >
                <Plus className="h-4 w-4 flex-shrink-0" />
                Guardar y empezar nueva conversación
              </button>
            </div>
          )}

          {historial.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Aquí aparecerán tus conversaciones anteriores
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/10">
              {historial.map((conv) => (
                <li key={conv.id} className="group flex items-center gap-2 px-4 py-3">
                  <button
                    onClick={() => handleRestaurar(conv.id)}
                    className="flex flex-1 flex-col items-start gap-0.5 text-left"
                  >
                    <span className="line-clamp-1 text-sm font-medium text-foreground group-hover:text-brand transition-colors">
                      {conv.primerMensaje}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatearFecha(conv.fecha)} · {conv.mensajes.length} mensajes
                    </span>
                  </button>
                  <button
                    onClick={() => eliminarConversacion(conv.id)}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground/50 opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Eliminar conversación"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
