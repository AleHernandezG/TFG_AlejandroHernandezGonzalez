'use client'

import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '@/stores/chatStore'
import { HeaderChat } from './headerChat'
import { EstadoVacioChat } from './estadoVacioChat'
import { BurbujaUsuario } from './burbujaUsuario'
import { BurbujaIA } from './burbujaIA'
import { IndicadorPensando } from './indicadorPensando'
import { BarraInputChat } from './barraInputChat'
import { SheetHistorialChat } from './sheetHistorialChat'

export function ContenidoChat() {
  const { mensajes, cargando, enviarMensaje, recetaConDespensa } = useChatStore()
  const [historialAbierto, setHistorialAbierto] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, cargando])

  const handleChip = (chip: { id: string; texto: string }) => {
    if (chip.id === 'receta-ingredientes') {
      recetaConDespensa()
    } else {
      enviarMensaje(chip.texto)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background">
      <HeaderChat onVerHistorial={() => setHistorialAbierto(true)} />

      <div className="flex-1 overflow-y-auto">
        {mensajes.length === 0 ? (
          <EstadoVacioChat onChipClick={handleChip} />
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
            {mensajes.map((m) =>
              m.rol === 'usuario' ? (
                <BurbujaUsuario key={m.id} contenido={m.contenido} timestamp={m.timestamp} imagen={m.imagen} />
              ) : (
                <BurbujaIA key={m.id} contenido={m.contenido} timestamp={m.timestamp} />
              )
            )}
            {cargando && <IndicadorPensando />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <BarraInputChat onEnviar={enviarMensaje} deshabilitado={cargando} />

      <SheetHistorialChat
        abierto={historialAbierto}
        onCerrar={() => setHistorialAbierto(false)}
      />
    </div>
  )
}
