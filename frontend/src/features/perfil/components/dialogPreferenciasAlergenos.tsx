'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ALERGENOS_OPCIONES, DIETAS_OPCIONES } from '@/config/opcionesUsuario'
import { useActualizarPreferencias, useMiPerfil, extraerMensajeError } from '@/features/perfil/hooks/usePerfil'
import Image from 'next/image'

interface Props {
  abierto: boolean
  onCerrar: () => void
}

export function DialogPreferenciasAlergenos({ abierto, onCerrar }: Props) {
  const { data: perfil } = useMiPerfil()
  const { mutate: guardar, isPending } = useActualizarPreferencias()
  const [dietasDraft, setDietasDraft] = useState<string[]>([])
  const [alergenosDraft, setAlergenosDraft] = useState<string[]>([])
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  useEffect(() => {
    if (abierto) {
      setDietasDraft(perfil?.preferencias ?? [])
      setAlergenosDraft(perfil?.alergias ?? [])
      setErrorServidor(null)
    }
  }, [abierto, perfil])

  function toggleDieta(id: string) {
    setDietasDraft((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )
  }

  function toggleAlergeno(id: string) {
    setAlergenosDraft((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  function handleGuardar() {
    setErrorServidor(null)
    guardar(
      { dietas: dietasDraft, alergenos: alergenosDraft },
      {
        onSuccess: () => onCerrar(),
        onError: (err) => setErrorServidor(extraerMensajeError(err)),
      },
    )
  }

  return (
    <Dialog
      open={abierto}
      onOpenChange={(open) => { if (!open) onCerrar() }}
    >
      <DialogContent className="max-w-sm rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">Preferencias y alérgenos</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Dietas */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground mb-3">
              Tipo de dieta
            </p>
            <div className="flex flex-wrap gap-2">
              {DIETAS_OPCIONES.map((dieta) => {
                const activo = dietasDraft.includes(dieta.id)
                return (
                  <button
                    key={dieta.id}
                    type="button"
                    onClick={() => toggleDieta(dieta.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      activo
                        ? 'bg-brand text-brand-foreground'
                        : 'bg-[var(--warm-bg)] text-foreground/80 hover:bg-[var(--warm-bg-accent)]'
                    }`}
                  >
                    {dieta.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Alérgenos */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground mb-3">
              Alérgenos a evitar
            </p>
            <div className="flex flex-wrap gap-2">
              {ALERGENOS_OPCIONES.map((alergeno) => {
                const activo = alergenosDraft.includes(alergeno.id)
                return (
                  <button
                    key={alergeno.id}
                    type="button"
                    onClick={() => toggleAlergeno(alergeno.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      activo
                        ? 'bg-destructive/10 text-destructive border border-destructive/20'
                        : 'bg-[var(--warm-bg)] text-foreground/80 hover:bg-[var(--warm-bg-accent)]'
                    }`}
                  >
                    <Image
                      src={alergeno.icono}
                      alt={alergeno.label}
                      width={14}
                      height={14}
                      className="flex-shrink-0"
                    />
                    {alergeno.label}
                  </button>
                )
              })}
            </div>
          </div>

          {errorServidor && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {errorServidor}
            </p>
          )}

          <Button
            onClick={handleGuardar}
            disabled={isPending}
            className="w-full h-11 rounded-xl bg-brand text-brand-foreground font-bold"
          >
            {isPending ? 'Guardando…' : 'Guardar preferencias'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
