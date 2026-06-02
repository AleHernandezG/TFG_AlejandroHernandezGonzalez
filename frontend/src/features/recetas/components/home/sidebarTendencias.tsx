'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import Link from 'next/link'
import { Star, TrendingUp } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useRecetasPopulares } from '../../hooks/useRecetasPopulares'
import { useChefsDestacados } from '../../hooks/useChefsDestacados'
import { usuariosService, type ChefDestacado } from '@/services/usuariosService'

function SkeletonReceta() {
  return (
    <div className="flex gap-4">
      <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-3 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
        <Skeleton className="h-3 w-1/3 rounded" />
      </div>
    </div>
  )
}

function SkeletonChef() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-warm-bg p-3">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
      <Skeleton className="h-7 w-16 rounded-full" />
    </div>
  )
}

function BotonSeguir({ chef }: { chef: ChefDestacado }) {
  const { data: session } = useSession()
  const token = session?.user?.backendToken ?? ''
  const [siguiendo, setSiguiendo] = useState(chef.siguiendo)

  const { mutate } = useMutation({
    mutationFn: () => usuariosService.toggleSeguir(chef.id, token),
    onSuccess: (res) => setSiguiendo(res.siguiendo),
  })

  if (!session) return null

  return (
    <button
      onClick={(e) => { e.preventDefault(); mutate() }}
      className={`rounded-full border px-3 py-1 text-[10px] font-bold transition-colors ${
        siguiendo
          ? 'border-muted-foreground/30 bg-muted text-muted-foreground hover:border-destructive/40 hover:text-destructive'
          : 'border-brand/20 text-brand hover:bg-brand hover:text-brand-foreground'
      }`}
    >
      {siguiendo ? 'Siguiendo' : 'Seguir'}
    </button>
  )
}

export function SidebarTendencias() {
  const { data: feedPopular, isLoading: cargandoRecetas } = useRecetasPopulares()
  const { data: chefs, isLoading: cargandoChefs } = useChefsDestacados()

  const recetasPopulares = feedPopular?.recetas ?? []

  return (
    <aside className="fixed right-0 top-0 z-40 hidden h-screen w-80 flex-col gap-8 overflow-y-auto bg-background pb-8 pt-28 px-8 lg:flex">

      {/* ── Recetas Populares ─────────────────────────── */}
      <section>
        <h3 className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand">
          <TrendingUp className="h-4 w-4" strokeWidth={2} />
          Recetas Populares
        </h3>

        <div className="flex flex-col gap-5">
          {cargandoRecetas ? (
            <>
              <SkeletonReceta />
              <SkeletonReceta />
              <SkeletonReceta />
            </>
          ) : (
            recetasPopulares.map((post) => (
              <Link key={post.id} href={`/recetas/${post.id}`} className="group flex gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={post.receta.imagenUrl}
                    alt={post.receta.titulo}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="line-clamp-1 text-sm font-bold text-foreground transition-colors group-hover:text-brand">
                    {post.receta.titulo}
                  </h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Por {post.autor.nombre}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight text-brand">
                    <span>{post.receta.tiempo}</span>
                    <span>{post.receta.dificultad}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ── Chefs Destacados ─────────────────────────── */}
      <section>
        <h3 className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand">
          <Star className="h-4 w-4" strokeWidth={2} />
          Chefs Destacados
        </h3>

        <div className="flex flex-col gap-4">
          {cargandoChefs ? (
            <>
              <SkeletonChef />
              <SkeletonChef />
              <SkeletonChef />
            </>
          ) : (
            chefs?.map((chef) => (
              <div
                key={chef.id}
                className="flex items-center justify-between rounded-xl bg-warm-bg p-3 transition-colors hover:bg-warm-bg-accent"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={chef.foto ?? undefined} alt={chef.nombre} />
                    <AvatarFallback className="bg-brand/10 text-sm font-semibold text-brand">
                      {chef.nombre.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-bold text-foreground">{chef.nombre}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {chef.seguidores} {chef.seguidores === 1 ? 'seguidor' : 'seguidores'}
                    </p>
                  </div>
                </div>
                <BotonSeguir chef={chef} />
              </div>
            ))
          )}
        </div>
      </section>
    </aside>
  )
}
