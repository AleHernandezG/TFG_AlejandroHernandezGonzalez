import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Image from 'next/image'
import { Star, TrendingUp } from 'lucide-react'
import { CHEFS_DESTACADOS, RECETAS_POPULARES } from '../data/datosTendencias'

export function SidebarTendencias() {
  return (
    <aside className="fixed right-0 top-0 z-40 hidden h-screen w-80 flex-col gap-8 overflow-y-auto bg-background pb-8 pt-28 px-8 lg:flex">
      {/* ── Recetas Populares ─────────────────────────── */}
      <section>
        <h3 className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand">
          <TrendingUp className="h-4 w-4" strokeWidth={2} />
          Recetas Populares
        </h3>

        <div className="flex flex-col gap-5">
          {RECETAS_POPULARES.map((receta) => (
            <div key={receta.id} className="group flex cursor-pointer gap-4">
              {/* Thumbnail */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-warm-bg-accent">
                <Image
                  src={receta.imagenUrl}
                  alt={receta.titulo}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="64px"
                />
              </div>

              {/* Info */}
              <div className="min-w-0">
                <h4 className="line-clamp-1 text-sm font-bold text-foreground transition-colors group-hover:text-brand">
                  {receta.titulo}
                </h4>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Por {receta.autor}
                </p>
                <div className="mt-1 flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight text-brand">
                  <span>{receta.tiempo}</span>
                  <span>{receta.dificultad}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Chefs Destacados ─────────────────────────── */}
      <section>
        <h3 className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand">
          <Star className="h-4 w-4" strokeWidth={2} />
          Chefs Destacados
        </h3>

        <div className="flex flex-col gap-4">
          {CHEFS_DESTACADOS.map((chef) => (
            <div
              key={chef.id}
              className="flex cursor-pointer items-center justify-between rounded-xl bg-warm-bg p-3 transition-colors hover:bg-warm-bg-accent"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={chef.avatarUrl} alt={chef.nombre} />
                  <AvatarFallback className="bg-brand/10 text-sm font-semibold text-brand">
                    {chef.nombre.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-bold text-foreground">{chef.nombre}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {chef.seguidores} seguidores
                  </p>
                </div>
              </div>

              <button className="rounded-full border border-brand/20 px-3 py-1 text-[10px] font-bold text-brand transition-colors hover:bg-brand hover:text-brand-foreground">
                Seguir
              </button>
            </div>
          ))}
        </div>
      </section>
    </aside>
  )
}
