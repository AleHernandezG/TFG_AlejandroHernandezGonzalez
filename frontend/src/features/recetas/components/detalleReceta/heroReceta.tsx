'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bookmark, BookmarkCheck } from 'lucide-react'
import type { FotoCredito } from '@/features/recetas/types/receta.types'

type Props = {
  imagenUrl: string
  titulo: string
  guardado: boolean
  onToggleGuardado: () => void
  fotoFuente?: 'usuario' | 'pexels'
  fotoCredito?: FotoCredito | null
}

export function HeroReceta({ imagenUrl, titulo, guardado, onToggleGuardado, fotoFuente, fotoCredito }: Props) {
  const router = useRouter()

  return (
    <div className="relative">
      <div className="relative h-[400px] w-full overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <Image
            src={imagenUrl}
            alt={titulo}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>

        {/* Gradiente: oscuro en top (legibilidad botones) + funde en bottom con contenido */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/25" />

        {/* Botón volver — top-left glassmorphism */}
        <button
          onClick={() => router.back()}
          aria-label="Volver"
          className="absolute top-4 left-4 z-10 h-10 w-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-xl text-white shadow-sm active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Botón guardar — top-right glassmorphism */}
        <button
          onClick={onToggleGuardado}
          aria-label={guardado ? 'Quitar de guardados' : 'Guardar receta'}
          className="absolute top-4 right-4 z-10 h-10 w-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-xl text-white shadow-sm active:scale-95 transition-transform"
        >
          {guardado ? (
            <BookmarkCheck size={20} className="fill-white text-white" />
          ) : (
            <Bookmark size={20} className="text-white" />
          )}
        </button>
      </div>

      {/* Créditos Pexels — obligatorio por licencia cuando fotoFuente === 'pexels' */}
      {fotoFuente === 'pexels' && fotoCredito && (
        <p className="px-5 pt-1.5 pb-0 text-[11px] text-muted-foreground">
          Foto por{' '}
          <a
            href={fotoCredito.urlPerfil}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            {fotoCredito.fotografo}
          </a>
          {' '}en{' '}
          <a
            href={fotoCredito.urlFoto}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Pexels
          </a>
        </p>
      )}
    </div>
  )
}
