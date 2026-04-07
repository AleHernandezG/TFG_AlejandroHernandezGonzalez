'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { PostFeed } from '../types/receta.types'

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
    <section className="pt-6 pb-8">
      {/* Header */}
      <h2 className="text-xl font-extrabold text-foreground px-5 mb-4">Te puede gustar</h2>

      {/* Carrusel Embla — sangra hasta los bordes */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 pl-5 pr-5">
          {recetas.map((post) => (
            <Link
              key={post.id}
              href={`/recetas/${post.id}`}
              className="flex-none min-w-[180px] w-[180px] group"
            >
              {/* Imagen con overlay */}
              <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-2.5">
                <Image
                  src={post.receta.imagenUrl}
                  alt={post.receta.titulo}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="180px"
                />
                {/* Heart overlay — top-right */}
                <div className="absolute top-2 right-2 h-7 w-7 bg-white/40 backdrop-blur-md rounded-lg flex items-center justify-center">
                  <Heart size={14} className="text-white" />
                </div>
              </div>

              {/* Info debajo de la imagen */}
              <h4 className="text-sm font-bold text-foreground line-clamp-1 leading-snug mb-1">
                {post.receta.titulo}
              </h4>
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5 shrink-0">
                  <AvatarImage src={post.autor.avatarUrl} alt={post.autor.nombre} />
                  <AvatarFallback className="text-[8px] bg-[var(--warm-bg)]">
                    {post.autor.nombre.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-muted-foreground truncate">
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
