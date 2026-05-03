'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAgregarComentario } from '../../hooks/useAgregarComentario'
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

type Props = {
  recetaId: string
  comentarios: Comentario[]
  total: number
}

export function ComentariosReceta({ recetaId, comentarios, total }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [texto, setTexto] = useState('')
  const [listaLocal, setListaLocal] = useState<Comentario[]>(comentarios)
  const { mutate: enviar } = useAgregarComentario(recetaId)

  const preview = listaLocal.slice(0, 3)

  function handleEnviar() {
    if (!texto.trim()) return
    const textoTrimmed = texto.trim()

    const optimista: Comentario = {
      autorNombre: session?.user?.name ?? 'Tú',
      avatarUrl: session?.user?.image ?? null,
      texto: textoTrimmed,
      fecha: new Date().toISOString(),
    }
    setListaLocal((prev) => [optimista, ...prev])
    setTexto('')

    enviar(textoTrimmed, {
      onSuccess: () => router.refresh(),
      onError: () => {
        setListaLocal((prev) => prev.filter((c) => c !== optimista))
        setTexto(textoTrimmed)
      },
    })
  }

  return (
    <section className="px-5 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-foreground">
          Comentarios <span className="text-muted-foreground font-normal text-base">({listaLocal.length})</span>
        </h2>
        {listaLocal.length > 3 && (
          <button className="text-sm font-bold text-brand hover:opacity-80 transition-opacity">
            Ver todos
          </button>
        )}
      </div>

      {/* Input — solo si hay sesión */}
      {session && (
        <div className="mb-5 flex flex-col gap-2">
          <textarea
            value={texto}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTexto(e.target.value)}
            placeholder="Escribe un comentario..."
            className="w-full resize-none text-sm rounded-2xl bg-[var(--warm-bg)] border-0 px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-brand"
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
      )}

      {/* Lista de comentarios */}
      {listaLocal.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Sé el primero en comentar
        </p>
      ) : (
        <ul className="space-y-3">
          {preview.map((c, i) => (
            <li key={i} className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                <AvatarImage src={c.avatarUrl ?? undefined} alt={c.autorNombre} />
                <AvatarFallback className="text-xs bg-[var(--warm-bg)] text-foreground">
                  {c.autorNombre.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-[var(--warm-bg)] rounded-2xl rounded-tl-sm px-3.5 py-3">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-bold text-foreground">{c.autorNombre}</span>
                  <span className="text-[10px] text-muted-foreground" suppressHydrationWarning>
                    {tiempoRelativo(c.fecha)}
                  </span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{c.texto}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
