'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { useAgregarComentario } from '../../hooks/useAgregarComentario'
import { useComentarios, useInvalidarComentarios } from '../../hooks/useComentarios'
import type { Comentario } from '../../types/receta.types'

function tiempoRelativo(fechaIso: string): string {
  const diff = Date.now() - new Date(fechaIso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins} min`
  const horas = Math.floor(mins / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.floor(horas / 24)
  return `hace ${dias} d`
}

function ItemComentario({ c }: { c: Comentario }) {
  return (
    <li className="flex gap-3">
      <Avatar className="h-9 w-9 shrink-0 mt-0.5">
        <AvatarImage src={c.avatarUrl ?? undefined} alt={c.autorNombre} />
        <AvatarFallback className="text-xs bg-[var(--warm-bg)] text-foreground font-semibold">
          {c.autorNombre.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-xs font-bold text-foreground truncate">{c.autorNombre}</span>
          <span className="text-[10px] text-muted-foreground shrink-0" suppressHydrationWarning>
            {tiempoRelativo(c.fecha)}
          </span>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">{c.texto}</p>
      </div>
    </li>
  )
}

function SkeletonComentario() {
  return (
    <li className="flex gap-3">
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-3/4 rounded" />
      </div>
    </li>
  )
}

type Props = {
  recetaId: string
  total: number
}

export function ComentariosReceta({ recetaId, total }: Props) {
  const { data: session } = useSession()
  const [texto, setTexto] = useState('')
  const [nuevos, setNuevos] = useState<Comentario[]>([])
  const [sheetAbierto, setSheetAbierto] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { mutate: enviar } = useAgregarComentario(recetaId)
  const invalidar = useInvalidarComentarios(recetaId)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: cargandoSheet,
  } = useComentarios(recetaId)

  // IntersectionObserver — carga la siguiente página al llegar al sentinel
  useEffect(() => {
    if (!sheetAbierto || !sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [sheetAbierto, hasNextPage, isFetchingNextPage, fetchNextPage])

  const comentariosSheet = data?.pages.flatMap((p) => p.comentarios) ?? []
  const preview = [...nuevos, ...(data?.pages[0]?.comentarios ?? [])].slice(0, 3)
  const totalMostrado = (data?.pages[0]?.total ?? total) + nuevos.length

  function handleEnviar() {
    if (!texto.trim()) return
    const textoTrimmed = texto.trim()

    const optimista: Comentario = {
      autorNombre: session?.user?.name ?? 'Tú',
      avatarUrl: session?.user?.image ?? null,
      texto: textoTrimmed,
      fecha: new Date().toISOString(),
    }
    setNuevos((prev) => [optimista, ...prev])
    setTexto('')

    enviar(textoTrimmed, {
      onSuccess: async () => {
        await invalidar()
        setNuevos((prev) => prev.filter((c) => c !== optimista))
      },
      onError: () => {
        setNuevos((prev) => prev.filter((c) => c !== optimista))
        setTexto(textoTrimmed)
      },
    })
  }

  return (
    <section className="px-5 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-foreground">
          Comentarios{' '}
          <span className="text-muted-foreground font-normal text-base">({totalMostrado})</span>
        </h2>
        {totalMostrado > 3 && (
          <button
            className="text-sm font-semibold text-brand hover:opacity-80 transition-opacity"
            onClick={() => setSheetAbierto(true)}
          >
            Ver todos
          </button>
        )}
      </div>

      {/* Input */}
      {session && (
        <div className="mb-5 flex gap-3 items-start">
          <Avatar className="h-8 w-8 shrink-0 mt-0.5">
            <AvatarImage src={session.user?.image ?? undefined} alt={session.user?.name ?? ''} />
            <AvatarFallback className="text-xs bg-[var(--warm-bg)] text-foreground">
              {(session.user?.name ?? 'TU').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              value={texto}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTexto(e.target.value)}
              placeholder="Añade un comentario..."
              className="w-full resize-none text-sm rounded-2xl bg-[var(--warm-bg)] border-0 px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-brand placeholder:text-muted-foreground/60"
              rows={2}
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{texto.length}/500</span>
              <Button
                size="sm"
                className="rounded-full h-8 px-4 text-xs font-bold"
                onClick={handleEnviar}
                disabled={!texto.trim()}
              >
                Publicar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {totalMostrado === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Sé el primero en comentar
        </p>
      ) : (
        <ul className="space-y-4">
          {cargandoSheet && preview.length === 0 ? (
            <>
              <SkeletonComentario />
              <SkeletonComentario />
            </>
          ) : (
            preview.map((c, i) => <ItemComentario key={i} c={c} />)
          )}
        </ul>
      )}

      {/* Ver todos — solo si hay más de 3 */}
      {totalMostrado > 3 && (
        <button
          className="mt-4 w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors py-2"
          onClick={() => setSheetAbierto(true)}
        >
          Ver los {totalMostrado} comentarios
        </button>
      )}

      {/* Sheet — infinite scroll */}
      <Sheet open={sheetAbierto} onOpenChange={setSheetAbierto}>
        <SheetContent side="bottom" className="h-[85vh] flex flex-col rounded-t-3xl px-0 gap-0">

          {/* Handle visual */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-9 h-1 rounded-full bg-border" />
          </div>

          <SheetHeader className="px-5 py-3 border-b border-border/30">
            <SheetTitle className="text-base font-bold text-center">
              {totalMostrado} comentarios
            </SheetTitle>
          </SheetHeader>

          {/* Lista con scroll */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <ul className="px-5 py-4 space-y-5">
              {cargandoSheet ? (
                <>
                  <SkeletonComentario />
                  <SkeletonComentario />
                  <SkeletonComentario />
                </>
              ) : (
                comentariosSheet.map((c, i) => (
                  <ItemComentario key={i} c={c} />
                ))
              )}

              {/* Sentinel para infinite scroll */}
              <div ref={sentinelRef} className="h-4" />

              {isFetchingNextPage && (
                <div className="space-y-5 pt-1">
                  <SkeletonComentario />
                  <SkeletonComentario />
                </div>
              )}

              {!hasNextPage && comentariosSheet.length > 0 && (
                <p className="text-center text-xs text-muted-foreground py-2">
                  Has visto todos los comentarios
                </p>
              )}
            </ul>
          </div>

          {/* Input dentro del Sheet */}
          {session && (
            <div className="border-t border-border/30 px-5 py-3 flex gap-3 items-start bg-background">
              <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                <AvatarImage src={session.user?.image ?? undefined} alt={session.user?.name ?? ''} />
                <AvatarFallback className="text-xs bg-[var(--warm-bg)] text-foreground">
                  {(session.user?.name ?? 'TU').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2 items-end">
                <textarea
                  value={texto}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTexto(e.target.value)}
                  placeholder="Añade un comentario..."
                  className="flex-1 resize-none text-sm rounded-2xl bg-[var(--warm-bg)] border-0 px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-brand placeholder:text-muted-foreground/60 min-h-[40px] max-h-[120px]"
                  rows={1}
                  maxLength={500}
                />
                <Button
                  size="sm"
                  className="rounded-full h-9 px-4 text-xs font-bold shrink-0"
                  onClick={handleEnviar}
                  disabled={!texto.trim()}
                >
                  Publicar
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </section>
  )
}
