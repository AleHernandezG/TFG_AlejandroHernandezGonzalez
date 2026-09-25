'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface PropsGeneracionIa {
  generando: boolean
  error: string | null
  hayContenido: () => boolean
  onGenerar: (texto: string) => Promise<boolean>
}

interface Props extends PropsGeneracionIa {
  onVolver: () => void
}

export function VistaGenerarIa({ generando, error, hayContenido, onGenerar, onVolver }: Props) {
  const [texto, setTexto] = useState('')
  const [confirmando, setConfirmando] = useState(false)

  const cortoDeMas = texto.trim().length < 10

  async function handleGenerar() {
    if (cortoDeMas) return
    if (hayContenido() && !confirmando) {
      setConfirmando(true)
      return
    }
    const ok = await onGenerar(texto.trim())
    if (ok) {
      setTexto('')
      setConfirmando(false)
      onVolver()
    }
  }

  return (
    <section className="bg-[var(--warm-bg-accent)] rounded-2xl p-5 shadow-[0px_4px_20px_oklch(0.1_0.02_50_/_0.4)]">
      <textarea
        value={texto}
        onChange={(e) => { setTexto(e.target.value); setConfirmando(false) }}
        placeholder="Ej: Un risotto cremoso de setas con parmesano, para 4 personas, listo en 40 minutos..."
        rows={5}
        className="w-full bg-background border border-border rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-brand/40"
      />

      {error && <p className="text-xs text-destructive mt-2">{error}</p>}

      {confirmando && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2.5">
          <AlertTriangle size={14} className="text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Ya tienes cosas escritas en esta receta. Al generar, la IA las sustituye todas.
          </p>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => (confirmando ? setConfirmando(false) : onVolver())}
          disabled={generando}
        >
          {confirmando ? 'Mejor no' : 'Volver'}
        </Button>
        <Button
          type="button"
          className="flex-1 bg-brand text-brand-foreground font-bold"
          onClick={handleGenerar}
          disabled={generando || cortoDeMas}
        >
          {generando ? (
            <>
              <Loader2 size={14} className="animate-spin mr-1.5" />
              Generando…
            </>
          ) : confirmando ? (
            'Sustituir y generar'
          ) : (
            'Generar'
          )}
        </Button>
      </div>
    </section>
  )
}
