'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Lightbulb, Sparkles, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { SeccionIngredientes } from '../seccionIngredientes'
import { SeccionPasos } from '../seccionPasos'
import { PasoAlergenos } from './pasoAlergenos'
import { PasoDatos } from './pasoDatos'
import { PasoFoto, type PropsPasoFoto } from './pasoFoto'
import { VistaGenerarIa, type PropsGeneracionIa } from './vistaGenerarIa'
import type { Asistente } from './useAsistenteCrearReceta'

type Vista = 'pasos' | 'ia' | 'salir'

interface Props {
  abierto: boolean
  vistaInicial?: 'pasos' | 'ia'
  onCerrar: () => void
  asistente: Asistente
  enviando: boolean
  onEnviar: () => void
  borradorRecuperado: boolean
  onEmpezarDeCero: () => void
  onBorrarYSalir: () => void
  foto: PropsPasoFoto
  ia: PropsGeneracionIa
}

const CABECERAS: Record<Exclude<Vista, 'pasos'>, { titulo: string; descripcion: string }> = {
  ia: {
    titulo: 'Crear desde descripción',
    descripcion: 'Cuéntale la receta a la IA y te rellena el formulario.',
  },
  salir: {
    titulo: '¿Borrar la receta?',
    descripcion: 'Se perderá todo lo que has escrito. Esto no se puede deshacer.',
  },
}

export function AsistenteCrearReceta({
  abierto,
  vistaInicial = 'pasos',
  onCerrar,
  asistente,
  enviando,
  onEnviar,
  borradorRecuperado,
  onEmpezarDeCero,
  onBorrarYSalir,
  foto,
  ia,
}: Props) {
  const { paso, indice, total, esPrimero, esUltimo, siguiente, atras } = asistente
  const [vista, setVista] = useState<Vista>('pasos')
  const tituloRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    setVista(abierto ? vistaInicial : 'pasos')
  }, [abierto, vistaInicial])

  useEffect(() => {
    if (abierto) tituloRef.current?.focus()
  }, [abierto, indice, vista])

  const cabecera = vista === 'pasos' ? { titulo: paso.titulo, descripcion: paso.descripcion } : CABECERAS[vista]

  return (
    <Dialog open={abierto} onOpenChange={(v) => { if (!v) onCerrar() }}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[92dvh] max-w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:h-[88dvh] sm:max-w-xl"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          if (vista !== 'pasos') {
            e.preventDefault()
            setVista('pasos')
          }
        }}
      >
        <header className="flex items-start gap-3 border-b border-border/60 bg-[var(--warm-bg-accent)] px-5 py-4">
          {vista !== 'pasos' && (
            <button
              type="button"
              onClick={() => setVista('pasos')}
              aria-label="Volver a los pasos"
              className="-ml-1 mt-0.5 shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div className="min-w-0 flex-1">
            {vista === 'pasos' && (
              <p aria-hidden className="mb-1 text-[11px] font-bold uppercase tracking-wider text-brand">
                Paso {indice + 1} de {total}
              </p>
            )}
            <DialogTitle asChild>
              <h2 ref={tituloRef} tabIndex={-1} className="truncate text-lg font-extrabold text-foreground outline-none">
                {vista === 'pasos' && <span className="sr-only">Paso {indice + 1} de {total}. </span>}
                {cabecera.titulo}
              </h2>
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
              {cabecera.descripcion}
            </DialogDescription>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {vista === 'pasos' && (
              <button
                type="button"
                onClick={() => setVista('ia')}
                className="flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-2 text-xs font-bold text-brand transition-colors hover:bg-brand/20"
              >
                <Sparkles size={14} />
                <span className="hidden sm:inline">Crear con IA</span>
              </button>
            )}
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Cerrar el asistente"
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </DialogClose>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[var(--warm-bg)] px-4 py-4">
          {vista === 'pasos' && (
            <div className="flex flex-col gap-4">
              {borradorRecuperado && esPrimero && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-brand/30 bg-brand/5 px-4 py-3">
                  <p className="text-xs font-semibold text-foreground">
                    Hemos recuperado lo que dejaste a medias.
                  </p>
                  <button
                    type="button"
                    onClick={onEmpezarDeCero}
                    className="text-xs font-bold text-brand underline underline-offset-2"
                  >
                    Empezar de cero
                  </button>
                </div>
              )}

              {paso.id === 'foto' && <PasoFoto {...foto} />}
              {paso.id === 'datos' && <PasoDatos />}
              {paso.id === 'ingredientes' && <SeccionIngredientes />}
              {paso.id === 'pasos' && <SeccionPasos />}
              {paso.id === 'alergenos' && <PasoAlergenos />}

              {paso.ayuda && (
                <p className="flex items-start gap-2 px-1 text-xs text-muted-foreground">
                  <Lightbulb size={14} className="mt-0.5 shrink-0 text-brand" />
                  {paso.ayuda}
                </p>
              )}
            </div>
          )}

          {vista === 'ia' && <VistaGenerarIa {...ia} onVolver={() => setVista('pasos')} />}

          {vista === 'salir' && (
            <div className="flex flex-col gap-3 rounded-2xl bg-[var(--warm-bg-accent)] p-5 shadow-[0px_4px_20px_oklch(0.1_0.02_50_/_0.4)]">
              <p className="text-sm text-muted-foreground">
                Borrarás la foto, los ingredientes y los pasos que llevas escritos.
              </p>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl font-bold"
                  onClick={() => setVista('pasos')}
                >
                  Seguir editando
                </Button>
                <Button
                  type="button"
                  className="h-11 rounded-xl bg-destructive font-bold text-destructive-foreground hover:bg-destructive/90"
                  onClick={onBorrarYSalir}
                >
                  <Trash2 size={16} />
                  Borrar y salir
                </Button>
              </div>
            </div>
          )}
        </div>

        {vista === 'pasos' && (
          <footer className="flex items-center justify-between gap-3 border-t border-border/60 bg-[var(--warm-bg-accent)] px-4 py-3">
            <button
              type="button"
              onClick={() => setVista('salir')}
              className="text-xs font-bold text-muted-foreground transition-colors hover:text-destructive"
            >
              Borrar y salir
            </button>
            <div className="flex items-center gap-2">
              {!esPrimero && (
                <Button type="button" variant="outline" className="h-11 rounded-xl px-5 font-bold" onClick={atras}>
                  Atrás
                </Button>
              )}
              <Button
                type="button"
                disabled={enviando}
                onClick={() => (esUltimo ? onEnviar() : siguiente())}
                className="h-11 rounded-xl bg-brand px-6 font-bold text-brand-foreground hover:bg-brand/90"
              >
                {esUltimo ? (enviando ? 'Subiendo foto…' : 'Revisar receta') : 'Siguiente'}
              </Button>
            </div>
          </footer>
        )}
      </DialogContent>
    </Dialog>
  )
}
