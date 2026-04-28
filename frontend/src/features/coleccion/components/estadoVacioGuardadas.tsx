import { Bookmark, Compass } from 'lucide-react'
import Link from 'next/link'

export function EstadoVacioGuardadas() {
  return (
    <div className="flex flex-col items-center gap-5 py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center">
        <Bookmark className="w-10 h-10 text-brand/60" strokeWidth={1.5} />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-foreground">
          Aún no has guardado ninguna receta
        </p>
        <p className="text-sm text-muted-foreground">
          Toca el marcador en cualquier receta para guardarla aquí
        </p>
      </div>
      <Link
        href="/home"
        className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-sm active:scale-95 transition-transform"
      >
        <Compass className="w-4 h-4" />
        Explorar recetas
      </Link>
    </div>
  )
}
