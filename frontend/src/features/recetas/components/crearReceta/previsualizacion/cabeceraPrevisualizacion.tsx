'use client'

import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChipAlergeno } from '@/components/common/chipAlergeno'
import { DIETAS_OPCIONES } from '@/config/opcionesUsuario'
import { ETIQUETAS_DIFICULTAD, type DificultadInterna } from '@/features/recetas/types/crearReceta.schema'

interface Props {
  titulo: string
  descripcion: string
  dietas: string[]
  dificultad?: DificultadInterna
  alergenos: string[]
  mostrarAutor?: boolean
}

export function CabeceraPrevisualizacion({
  titulo,
  descripcion,
  dietas,
  dificultad,
  alergenos,
  mostrarAutor = true,
}: Props) {
  const etiquetasDietas = dietas
    .map((id) => DIETAS_OPCIONES.find((d) => d.id === id)?.label)
    .filter(Boolean) as string[]

  return (
    <div className="px-5 pt-8 pb-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-1.5">
          {etiquetasDietas.map((label) => (
            <Badge
              key={label}
              variant="secondary"
              className="bg-(--warm-bg) text-foreground/70 border-0 text-[10px] font-bold tracking-wider uppercase rounded-full px-2.5 py-1"
            >
              {label}
            </Badge>
          ))}
          {dificultad && (
            <Badge
              variant="secondary"
              className="bg-brand/15 text-brand border-0 text-[10px] font-bold tracking-wider uppercase rounded-full px-2.5 py-1"
            >
              {ETIQUETAS_DIFICULTAD[dificultad]}
            </Badge>
          )}
        </div>
        {alergenos.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-end shrink-0 max-w-[45%]">
            {alergenos.map((id) => (
              <ChipAlergeno key={id} alergenoId={id} size="sm" />
            ))}
          </div>
        )}
      </div>

      <h1 className="text-[1.75rem] font-extrabold text-foreground leading-tight tracking-tight mb-3">
        {titulo}
      </h1>

      <p className="text-sm text-foreground/70 leading-relaxed mb-5">{descripcion}</p>

      {mostrarAutor && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-10 w-10 ring-2 ring-(--warm-bg)">
              <AvatarFallback className="text-xs bg-(--warm-bg) text-foreground font-bold">
                TÚ
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-none gap-0.5">
              <span className="text-sm font-bold text-foreground">Tú</span>
              <span className="text-xs text-muted-foreground">ahora</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
              <Heart size={22} />
              <span className="text-[10px] font-bold">0</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
              <MessageCircle size={22} />
              <span className="text-[10px] font-bold">0</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
              <Share2 size={22} />
              <span className="text-[10px] font-bold">Compartir</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
