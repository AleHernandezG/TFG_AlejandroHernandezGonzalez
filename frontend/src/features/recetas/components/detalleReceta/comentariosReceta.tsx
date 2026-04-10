'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Comentario } from '../../types/receta.types'

function tiempoRelativo(fechaIso: string): string {
  const diff = Date.now() - new Date(fechaIso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins} min`
  const horas = Math.floor(mins / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.floor(horas / 24)
  return `hace ${dias} d`
}

type Props = {
  comentarios: Comentario[]
  total: number
}

export function ComentariosReceta({ comentarios, total }: Props) {
  const preview = comentarios.slice(0, 3)

  return (
    <section className="px-5 pt-6 pb-4">
      {/* Header con "Ver todos" a la derecha */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-foreground">Comentarios</h2>
        {total > 3 && (
          <button className="text-sm font-bold text-brand hover:opacity-80 transition-opacity">
            Ver todos
          </button>
        )}
      </div>

      {/* Previews con estilo burbuja */}
      <ul className="space-y-3">
        {preview.map((c, i) => (
          <li key={i} className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0 mt-0.5">
              <AvatarImage src={c.avatarUrl ?? undefined} alt={c.autorNombre} />
              <AvatarFallback className="text-xs bg-[var(--warm-bg)] text-foreground">
                {c.autorNombre.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Burbuja de comentario */}
            <div className="flex-1 bg-[var(--warm-bg)] rounded-2xl rounded-tl-sm px-3.5 py-3">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-bold text-foreground">{c.autorNombre}</span>
                <span className="text-[10px] text-muted-foreground" suppressHydrationWarning>{tiempoRelativo(c.fecha)}</span>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">{c.texto}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
