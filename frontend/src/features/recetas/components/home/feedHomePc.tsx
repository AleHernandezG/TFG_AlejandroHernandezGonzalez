'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Sparkles } from 'lucide-react'
import type { PostFeed } from '../../types/receta.types'
import { TarjetaPostPc, type VarianteTarjeta } from './tarjetaPostPc'

const VARIANTES: VarianteTarjeta[] = [
  'hero', 'small', 'small', 'wide', 'small', 'small', 'small',
]

function varianteParaIndice(i: number): VarianteTarjeta {
  return VARIANTES[i % VARIANTES.length]
}

export function TarjetaPostSkeletonPc() {
  return (
    <div className="overflow-hidden rounded-xl">
      <Skeleton className="h-48 w-full" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

function GridBento({ posts }: { posts: PostFeed[] }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {posts.map((post, i) => (
        <TarjetaPostPc key={post.id} post={post} variante={varianteParaIndice(i)} />
      ))}
    </div>
  )
}

function BannerRecomendados() {
  return (
    <div className="mb-6 flex items-center gap-2 rounded-xl border border-brand/15 bg-brand/8 px-4 py-3">
      <Sparkles size={16} className="shrink-0 text-brand-texto" />
      <p className="text-sm font-semibold text-brand-texto">
        Recetas para ti — basadas en tus gustos
      </p>
    </div>
  )
}

interface FeedHomePcProps {
  posts: PostFeed[]
  indiceRecomendados: number
}

export function FeedHomePc({ posts, indiceRecomendados }: FeedHomePcProps) {
  if (indiceRecomendados > 0) {
    return (
      <div className="space-y-6">
        <GridBento posts={posts.slice(0, indiceRecomendados)} />
        <BannerRecomendados />
        <GridBento posts={posts.slice(indiceRecomendados)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {indiceRecomendados === 0 && <BannerRecomendados />}
      <GridBento posts={posts} />
    </div>
  )
}
