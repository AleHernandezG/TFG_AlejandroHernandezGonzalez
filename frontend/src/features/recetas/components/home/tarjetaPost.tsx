'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToggleGuardado } from '@/features/recetas/hooks/useToggleGuardado'
import { motion } from 'framer-motion'
import { Bookmark, Heart, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import type { PostFeed } from '../../types/receta.types'

function tiempoRelativo(fechaISO: string): string {
  const diffMs = Date.now() - new Date(fechaISO).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 60) return `Hace ${diffMin}m`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `Hace ${diffH}h`
  return `Hace ${Math.floor(diffH / 24)}d`
}

interface TarjetaPostProps {
  post: PostFeed
}

export function TarjetaPost({ post }: TarjetaPostProps) {
  const [guardado, setGuardado] = useState(post.guardado)
  const { mutate: mutarGuardado } = useToggleGuardado(post.id)

  useEffect(() => {
    setGuardado(post.guardado)
  }, [post.guardado])

  const toggleGuardado = () => {
    const siguiente = !guardado
    setGuardado(siguiente)
    mutarGuardado(undefined, {
      onError: () => setGuardado((prev) => !prev),
    })
  }

  return (
    <article className="border-b border-border bg-background px-4 py-4">
      {/* Cabecera: avatar + autor + tiempo */}
      <div className="mb-3 flex items-center gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={post.autor.avatarUrl} alt={post.autor.nombre} />
          <AvatarFallback className="bg-brand/10 text-xs font-semibold text-brand">
            {post.autor.nombre.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-foreground">
            {post.autor.nombre}
          </p>
          <p className="text-xs leading-tight text-muted-foreground" suppressHydrationWarning>
            @{post.autor.username} · {tiempoRelativo(post.fechaPublicacion)}
          </p>
        </div>
      </div>

      {/* Imagen + contenido clickable → DetalleReceta */}
      <Link href={`/recetas/${post.id}`} className="block">
        <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[var(--warm-bg-accent)]">
          <Image
            src={post.receta.imagenUrl}
            alt={post.receta.titulo}
            fill
            className="object-cover transition-transform duration-300 hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 640px"
          />
        </div>

        <h2 className="mb-1 text-xl font-bold leading-snug text-foreground">
          {post.receta.titulo}
        </h2>

        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {post.receta.descripcion}
        </p>

        <div className="mb-3 flex gap-2 text-xs text-muted-foreground">
          <span>{post.receta.tiempo}</span>
          <span>·</span>
          <span>{post.receta.dificultad}</span>
        </div>
      </Link>

      {/* Acciones */}
      <div className="flex items-center gap-5">
        {/* Likes — solo informativo */}
        <div className="flex items-center gap-1.5">
          <Heart className="h-5 w-5 text-muted-foreground" strokeWidth={1.8} />
          <span className="text-sm text-muted-foreground">{post.likes}</span>
        </div>

        {/* Comentarios — solo informativo */}
        <div className="flex items-center gap-1.5">
          <MessageCircle className="h-5 w-5 text-muted-foreground" strokeWidth={1.8} />
          <span className="text-sm text-muted-foreground">{post.comentarios}</span>
        </div>

        {/* Bookmark — funcional */}
        <button
          onClick={toggleGuardado}
          className="ml-auto"
          aria-label={guardado ? 'Quitar de guardados' : 'Guardar receta'}
        >
          <motion.div
            animate={{ scale: guardado ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Bookmark
              className={`h-5 w-5 transition-colors ${
                guardado ? 'fill-brand text-brand' : 'text-muted-foreground'
              }`}
              strokeWidth={guardado ? 0 : 1.8}
            />
          </motion.div>
        </button>
      </div>
    </article>
  )
}
