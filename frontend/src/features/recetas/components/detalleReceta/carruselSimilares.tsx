'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { PostFeed } from '../../types/receta.types'

type Props = {
  recetas: PostFeed[]
}

export function CarruselSimilares({ recetas }: Props) {
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  })

  return (
    <section className="pb-8 pt-6">
      {/* Header */}
      <h2 className="mb-4 px-5 text-xl font-extrabold text-foreground">Te puede gustar</h2>

      {/* Carrusel Embla — sangra hasta los bordes */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex items-center justify-center gap-4 pl-6 pr-5">
          {recetas.map((post) => (
            <Link
              key={post.id}
              href={`/recetas/${post.id}`}
              className="group w-[180px] min-w-[180px] flex-none"
            >
              {/* Imagen con overlay */}
              <div className="relative mb-2.5 h-44 w-full overflow-hidden rounded-2xl">
                <Image
                  src={post.receta.imagenUrl}
                  alt={post.receta.titulo}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="180px"
                />
                {/* Heart overlay — top-right */}
                <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/40 backdrop-blur-md">
                  <Heart size={14} className="text-white" />
                </div>
              </div>

              {/* Info debajo de la imagen */}
              <h4 className="mb-1 line-clamp-1 text-sm font-bold leading-snug text-foreground">
                {post.receta.titulo}
              </h4>
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5 shrink-0">
                  <AvatarImage src={post.autor.avatarUrl} alt={post.autor.nombre} />
                  <AvatarFallback className="bg-[var(--warm-bg)] text-[8px]">
                    {post.autor.nombre.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-[10px] text-muted-foreground">
                  {post.autor.nombre}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
