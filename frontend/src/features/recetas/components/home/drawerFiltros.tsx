'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from '@/components/ui/drawer'
import { ALERGENOS_OPCIONES, DIETAS_OPCIONES } from '@/config/opcionesUsuario'
import type { FiltrosAvanzados } from '../../types/receta.types'

const DIFICULTADES = ['Fácil', 'Media', 'Difícil'] as const

interface Props {
  filtros: FiltrosAvanzados
  onChange: (filtros: FiltrosAvanzados) => void
  children: React.ReactNode
}

export function DrawerFiltros({ filtros, onChange, children }: Props) {
  const [open, setOpen] = useState(false)
  const [local, setLocal] = useState<FiltrosAvanzados>(filtros)

  function handleOpen(v: boolean) {
    if (v) setLocal(filtros)
    setOpen(v)
  }

  function toggleDieta(id: string) {
    setLocal((prev) => ({
      ...prev,
      dietas: prev.dietas.includes(id)
        ? prev.dietas.filter((x) => x !== id)
        : [...prev.dietas, id],
    }))
  }

  function toggleDificultad(d: string) {
    setLocal((prev) => ({
      ...prev,
      dificultad: prev.dificultad.includes(d)
        ? prev.dificultad.filter((x) => x !== d)
        : [...prev.dificultad, d],
    }))
  }

  function toggleAlergeno(id: string) {
    setLocal((prev) => ({
      ...prev,
      alergenos: prev.alergenos.includes(id)
        ? prev.alergenos.filter((x) => x !== id)
        : [...prev.alergenos, id],
    }))
  }

  function limpiar() {
    setLocal({ dietas: [], alergenos: [], dificultad: [] })
  }

  function aplicar() {
    onChange(local)
    setOpen(false)
  }

  return (
    <Drawer open={open} onOpenChange={handleOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>

      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Filtros</DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-2 flex flex-col gap-6">
          {/* Dietas */}
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Tipo de dieta
            </p>
            <p className="mb-3 text-[11px] text-muted-foreground/70">Muestra recetas que incluyan esta dieta</p>
            <div className="flex flex-wrap gap-2">
              {DIETAS_OPCIONES.map((d) => {
                const activo = local.dietas.includes(d.id)
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDieta(d.id)}
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                      activo
                        ? 'border-brand bg-brand text-brand-foreground'
                        : 'border-border bg-muted text-muted-foreground hover:bg-muted/70',
                    )}
                  >
                    {d.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dificultad */}
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Dificultad
            </p>
            <p className="mb-3 text-[11px] text-muted-foreground/70">Muestra recetas de este nivel de dificultad</p>
            <div className="flex flex-wrap gap-2">
              {DIFICULTADES.map((d) => {
                const activo = local.dificultad.includes(d)
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDificultad(d)}
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                      activo
                        ? 'border-brand bg-brand text-brand-foreground'
                        : 'border-border bg-muted text-muted-foreground hover:bg-muted/70',
                    )}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Excluir alérgenos */}
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Alérgenos
            </p>
            <p className="mb-3 text-[11px] text-muted-foreground/70">Oculta recetas que contengan estos alérgenos</p>
            <div className="flex flex-wrap gap-2">
              {ALERGENOS_OPCIONES.map((a) => {
                const activo = local.alergenos.includes(a.id)
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAlergeno(a.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                      activo
                        ? 'border-destructive bg-destructive/10 text-destructive'
                        : 'border-border bg-muted text-muted-foreground hover:bg-muted/70',
                    )}
                  >
                    <Image
                      src={a.icono}
                      alt={a.label}
                      width={16}
                      height={16}
                      className="h-4 w-4 object-contain"
                    />
                    {a.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <DrawerFooter className="flex-row gap-3">
          <button
            type="button"
            onClick={limpiar}
            className="flex-1 rounded-full border border-border py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={aplicar}
            className="flex-1 rounded-full bg-brand py-2.5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
          >
            Aplicar
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
