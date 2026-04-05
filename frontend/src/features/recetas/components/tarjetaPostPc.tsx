'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import { Bookmark, Heart, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import type { PostFeed } from '../types/receta.types'

export type VarianteTarjeta = 'hero' | 'small' | 'wide'

interface TarjetaPostPcProps {
  post: PostFeed
  variante?: VarianteTarjeta
}

export function TarjetaPostPc({ post, variante = 'small' }: TarjetaPostPcProps) {
  const [liked, setLiked] = useState(post.liked)
  const [likes, setLikes] = useState(post.likes)
  const [guardado, setGuardado] = useState(post.guardado)

  const toggleLike = () => {
    setLikes((prev) => (liked ? prev - 1 : prev + 1))
    setLiked((prev) => !prev)
  }

  const toggleGuardado = () => setGuardado((prev) => !prev)

  const AccionesBar = ({ compact = false }: { compact?: boolean }) => (
    <div className={`flex items-center gap-4 ${compact ? '' : 'mt-auto'}`}>
      <button
        onClick={toggleLike}
        className="flex items-center gap-1"
        aria-label={liked ? 'Quitar like' : 'Dar like'}
      >
        <motion.div
          animate={{ scale: liked ? [1, 1.3, 1] : 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <Heart
            className={`transition-colors ${compact ? 'h-[18px] w-[18px]' : 'h-5 w-5'} ${
              liked ? 'fill-brand text-brand' : 'text-muted-foreground'
            }`}
            strokeWidth={liked ? 0 : 1.8}
          />
        </motion.div>
        <span
          className={`font-bold ${compact ? 'text-xs' : 'text-sm'} ${
            liked ? 'text-brand' : 'text-muted-foreground'
          }`}
        >
          {likes}
        </span>
      </button>

      <button className="flex items-center gap-1" aria-label="Ver comentarios">
        <MessageCircle
          className={`text-muted-foreground ${compact ? 'h-[18px] w-[18px]' : 'h-5 w-5'}`}
          strokeWidth={1.8}
        />
        <span className={`font-bold text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
          {post.comentarios}
        </span>
      </button>

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
            className={`transition-colors ${compact ? 'h-[18px] w-[18px]' : 'h-5 w-5'} ${
              guardado ? 'fill-brand text-brand' : 'text-muted-foreground'
            }`}
            strokeWidth={guardado ? 0 : 1.8}
          />
        </motion.div>
      </button>
    </div>
  )

  // ── Hero (col-span-2 row-span-2) ──────────────────────────────
  if (variante === 'hero') {
    return (
      <article className="group col-span-2 row-span-2 flex flex-col overflow-hidden rounded-2xl bg-card shadow-[0px_12px_32px_oklch(0.22_0.02_50_/_0.06)]">
        <div className="relative h-[400px] overflow-hidden">
          <Image
            src={post.receta.imagenUrl}
            alt={post.receta.titulo}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(min-width: 1024px) 55vw, 100vw"
          />
        </div>

        <div className="flex flex-grow flex-col justify-between p-6">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.autor.avatarUrl} alt={post.autor.nombre} />
                <AvatarFallback className="bg-brand/10 text-xs font-semibold text-brand">
                  {post.autor.nombre.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {post.autor.nombre}
              </span>
            </div>

            <h2 className="mb-2 text-3xl font-extrabold leading-tight tracking-tight text-foreground">
              {post.receta.titulo}
            </h2>
            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {post.receta.descripcion}
            </p>
          </div>

          <div className="mt-auto border-t border-border/20 pt-4">
            <div className="flex items-center justify-between">
              <AccionesBar />
              <button className="ml-4 shrink-0 text-xs font-bold uppercase tracking-widest text-brand transition-opacity hover:opacity-70">
                Ver receta →
              </button>
            </div>
          </div>
        </div>
      </article>
    )
  }

  // ── Wide (col-span-2, horizontal) ─────────────────────────────
  if (variante === 'wide') {
    return (
      <article className="group col-span-2 flex min-h-[220px] overflow-hidden rounded-2xl bg-card shadow-[0px_12px_32px_oklch(0.22_0.02_50_/_0.06)]">
        <div className="relative w-1/2 overflow-hidden">
          <Image
            src={post.receta.imagenUrl}
            alt={post.receta.titulo}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(min-width: 1024px) 30vw, 50vw"
          />
        </div>

        <div className="flex w-1/2 flex-col justify-center p-6">
          <div className="mb-3 flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.autor.avatarUrl} alt={post.autor.nombre} />
              <AvatarFallback className="bg-brand/10 text-[10px] font-semibold text-brand">
                {post.autor.nombre.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {post.autor.nombre}
            </span>
          </div>

          <h3 className="mb-2 text-2xl font-bold leading-tight text-foreground">
            {post.receta.titulo}
          </h3>
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {post.receta.descripcion}
          </p>

          <AccionesBar compact />
        </div>
      </article>
    )
  }

  // ── Small (col-span-1, default) ───────────────────────────────
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-[0px_12px_32px_oklch(0.22_0.02_50_/_0.06)]">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={post.receta.imagenUrl}
          alt={post.receta.titulo}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(min-width: 1024px) 22vw, 50vw"
        />
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={post.autor.avatarUrl} alt={post.autor.nombre} />
            <AvatarFallback className="bg-brand/10 text-[10px] font-semibold text-brand">
              {post.autor.nombre.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {post.autor.nombre}
          </span>
        </div>

        <h3 className="mb-3 text-lg font-bold leading-tight text-foreground">
          {post.receta.titulo}
        </h3>

        <AccionesBar compact />
      </div>
    </article>
  )
}
