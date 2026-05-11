'use client'

import type { LucideIcon } from 'lucide-react'

interface Props {
  icono: LucideIcon
  label: string
  activo: boolean
  onToggle: () => void
  separador?: boolean
}

export function FilaTogglePermiso({ icono: Icono, label, activo, onToggle, separador = true }: Props) {
  return (
    <div className={`flex items-center justify-between px-4 py-4${separador ? ' border-b border-border/20' : ''}`}>
      <div className="flex items-center gap-4">
        <Icono size={20} className="text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <button
        role="switch"
        aria-checked={activo}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${activo ? 'bg-brand' : 'bg-muted'}`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${activo ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}
        />
        <span className="sr-only">{activo ? 'Activado' : 'Desactivado'}</span>
      </button>
    </div>
  )
}
