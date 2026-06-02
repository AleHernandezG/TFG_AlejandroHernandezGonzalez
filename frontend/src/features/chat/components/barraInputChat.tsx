'use client'

import { useRef, useState } from 'react'
import { Paperclip, Send, X } from 'lucide-react'

interface Props {
  onEnviar: (texto: string, imagen?: string) => void
  deshabilitado?: boolean
}

export function BarraInputChat({ onEnviar, deshabilitado = false }: Props) {
  const [valor, setValor] = useState('')
  const [imagen, setImagen] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleEnviar() {
    const texto = valor.trim()
    if ((!texto && !imagen) || deshabilitado) return
    onEnviar(texto, imagen ?? undefined)
    setValor('')
    setImagen(null)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEnviar()
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValor(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 4 * 1024 * 1024) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImagen(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const puedeEnviar = (valor.trim().length > 0 || imagen !== null) && !deshabilitado

  return (
    <div
      className="border-t border-border/20 bg-background/90 px-4 py-3 backdrop-blur-xl"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto max-w-2xl">
        {imagen && (
          <div className="mb-2 flex items-start gap-2">
            <div className="relative">
              <img
                src={imagen}
                alt="Preview"
                className="h-16 w-16 rounded-xl object-cover border border-border/30"
              />
              <button
                onClick={() => setImagen(null)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-end gap-2 rounded-3xl border border-border/30 bg-card px-3 py-2 shadow-[0px_-4px_16px_oklch(0.22_0.02_50_/_0.02)] transition-colors focus-within:border-brand/30">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={deshabilitado}
            className={`mb-0.5 flex-shrink-0 self-end rounded-full p-2 transition-colors hover:bg-[var(--warm-bg)] ${
              imagen ? 'text-brand' : 'text-muted-foreground hover:text-brand'
            } disabled:opacity-40`}
            aria-label="Adjuntar imagen"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={valor}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={imagen ? 'Pregunta algo sobre la imagen...' : '¿En qué estás pensando?'}
            rows={1}
            disabled={deshabilitado}
            className="min-h-[44px] max-h-32 flex-1 resize-none border-none bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 disabled:opacity-50"
          />

          <button
            onClick={handleEnviar}
            disabled={!puedeEnviar}
            aria-label="Enviar mensaje"
            className={`mb-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full self-end transition-all active:scale-95 ${
              puedeEnviar
                ? 'bg-brand text-brand-foreground shadow-[0px_8px_16px_oklch(0.55_0.15_50_/_0.25)] hover:opacity-90'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
