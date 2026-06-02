'use client'

import { useState } from 'react'
import { ChefHat, Check, Copy, ThumbsUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Props {
  contenido: string
  timestamp: Date
}

function formatearHora(fecha: Date): string {
  return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export function BurbujaIA({ contenido, timestamp }: Props) {
  const [copiado, setCopiado] = useState(false)
  const [liked, setLiked] = useState(false)

  async function handleCopiar() {
    await navigator.clipboard.writeText(contenido)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="flex w-full justify-start gap-2">
      {/* Avatar IA */}
      <div className="mt-auto flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--brand-subtle)]">
        <ChefHat className="h-4 w-4 text-brand" />
      </div>

      <div className="flex max-w-[85%] flex-col items-start gap-1">
        <div className="rounded-2xl rounded-tl-sm border border-border/15 bg-card px-5 py-4 shadow-[0px_4px_12px_oklch(0.22_0.02_50_/_0.03)]">
          <div className="prose-chat text-sm leading-relaxed text-foreground">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-0.5 last:mb-0">{children}</ul>,
                ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-0.5 last:mb-0">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                h3: ({ children }) => <p className="mb-1 mt-3 font-semibold text-foreground first:mt-0">{children}</p>,
              }}
            >
              {contenido}
            </ReactMarkdown>
          </div>
        </div>

        {/* Acciones + timestamp */}
        <div className="flex items-center gap-1 px-1">
          <span
            suppressHydrationWarning
            className="mr-1 text-[11px] text-muted-foreground"
          >
            {formatearHora(timestamp)}
          </span>
          <button
            onClick={handleCopiar}
            className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-[var(--warm-bg)] hover:text-brand"
          >
            {copiado ? (
              <><Check className="h-3.5 w-3.5" />Copiado</>
            ) : (
              <><Copy className="h-3.5 w-3.5" />Copiar</>
            )}
          </button>
          <button
            onClick={() => setLiked((v) => !v)}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${
              liked
                ? 'text-brand'
                : 'text-muted-foreground hover:bg-[var(--warm-bg)] hover:text-brand'
            }`}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            Me gusta
          </button>
        </div>
      </div>
    </div>
  )
}
