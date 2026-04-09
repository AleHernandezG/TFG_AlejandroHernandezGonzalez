'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bookmark, BookmarkCheck } from 'lucide-react'

type Props = {
  imagenUrl: string
  titulo: string
  guardado: boolean
  onToggleGuardado: () => void
}

export function HeroReceta({ imagenUrl, titulo, guardado, onToggleGuardado }: Props) {
  const router = useRouter()

  return (
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
  )
}
