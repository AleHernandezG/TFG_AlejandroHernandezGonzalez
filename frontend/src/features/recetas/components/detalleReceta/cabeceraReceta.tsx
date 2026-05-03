'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Share2, UserCheck, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChipAlergeno } from '@/components/common/chipAlergeno'
import { useToggleLike } from '@/features/recetas/hooks/useToggleLike'
import { useToggleSeguir } from '@/features/recetas/hooks/useToggleSeguir'
import { useSession } from 'next-auth/react'
import type { RecetaDetalle } from '@/features/recetas/types/receta.types'

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
  receta: RecetaDetalle
}

export function CabeceraReceta({ receta }: Props) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(receta.liked)
  const [likes, setLikes] = useState(receta.likes)
  const [siguiendo, setSiguiendo] = useState(receta.sigueAlAutor)
  const { mutate: mutarLike } = useToggleLike(receta.id)
  const { mutate: mutarSeguir, isPending: siguiendoPending } = useToggleSeguir(receta.autor.id, receta.id)

  const esPropiaReceta = session?.user?.id === receta.autor.id || !receta.autor.id

  function toggleLike() {
    const siguiente = !liked
    setLiked(siguiente)
    setLikes((l) => (siguiente ? l + 1 : l - 1))
    mutarLike(undefined, {
      onError: () => {
        setLiked((prev) => !prev)
        setLikes((l) => (siguiente ? l - 1 : l + 1))
      },
    })
  }

  function toggleSeguir() {
    const siguiente = !siguiendo
    setSiguiendo(siguiente)
    mutarSeguir(undefined, {
      onError: () => setSiguiendo((prev) => !prev),
    })
  }

  return (
    <div className="px-5 pt-8 pb-5">
      {/* Fila 1: Categorías (izquierda) + Alérgenos (derecha) */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-1.5">
          {receta.categorias.map((cat) => (
            <Badge
              key={cat}
              variant="secondary"
              className="bg-[var(--warm-bg)] text-foreground/70 border-0 text-[10px] font-bold tracking-wider uppercase rounded-full px-2.5 py-1"
            >
              {cat}
            </Badge>
          ))}
          <Badge
            variant="secondary"
            className="bg-brand/15 text-brand border-0 text-[10px] font-bold tracking-wider uppercase rounded-full px-2.5 py-1"
          >
            {receta.receta.dificultad}
          </Badge>
        </div>
        {receta.alergenos.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-end shrink-0 max-w-[45%]">
            {receta.alergenos.map((id) => (
              <ChipAlergeno key={id} alergenoId={id} size="sm" />
            ))}
          </div>
        )}
      </div>

      {/* Título */}
      <h1 className="text-[1.75rem] font-extrabold text-foreground leading-tight tracking-tight mb-5">
        {receta.receta.titulo}
      </h1>

      {/* Fila 2: Autor (izquierda) + Acciones sociales en columna (derecha) */}
      <div className="flex items-center justify-between">
        {/* Autor + botón seguir */}
        <div className="flex items-center gap-2.5">
          <Avatar className="h-10 w-10 ring-2 ring-[var(--warm-bg)]">
            <AvatarImage src={receta.autor.avatarUrl} alt={receta.autor.nombre} />
            <AvatarFallback className="text-xs bg-[var(--warm-bg)] text-foreground">
              {receta.autor.nombre.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-none gap-0.5">
            <span className="text-sm font-bold text-foreground">{receta.autor.nombre}</span>
            <span className="text-xs text-muted-foreground" suppressHydrationWarning>
              {tiempoRelativo(receta.fechaPublicacion)}
            </span>
          </div>
          {session && !esPropiaReceta && (
            <Button
              variant={siguiendo ? 'secondary' : 'default'}
              size="sm"
              className="ml-1 h-7 rounded-full px-3 text-xs font-bold gap-1"
              onClick={toggleSeguir}
              disabled={siguiendoPending}
            >
              {siguiendo ? (
                <><UserCheck size={13} /> Siguiendo</>
              ) : (
                <><UserPlus size={13} /> Seguir</>
              )}
            </Button>
          )}
        </div>

        {/* Acciones sociales — icono encima, número/label debajo */}
        <div className="flex items-center gap-5">
          {/* Like */}
          <button onClick={toggleLike} className="flex flex-col items-center gap-0.5">
            <motion.div
              animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <Heart
                size={22}
                className={liked ? 'fill-destructive text-destructive' : 'text-muted-foreground'}
              />
            </motion.div>
            <span className={`text-[10px] font-bold ${liked ? 'text-destructive' : 'text-muted-foreground'}`}>
              {likes >= 1000 ? `${(likes / 1000).toFixed(1)}k` : likes}
            </span>
          </button>

          {/* Comentarios */}
          <button className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <MessageCircle size={22} />
            <span className="text-[10px] font-bold">{receta.comentarios}</span>
          </button>

          {/* Compartir */}
          <button className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <Share2 size={22} />
            <span className="text-[10px] font-bold">Compartir</span>
          </button>
        </div>
      </div>
    </div>
  )
}
