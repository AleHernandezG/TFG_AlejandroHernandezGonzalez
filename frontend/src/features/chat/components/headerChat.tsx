'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, History } from 'lucide-react'

interface Props {
  onVerHistorial?: () => void
}

export function HeaderChat({ onVerHistorial }: Props) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 flex flex-col items-center bg-background/80 backdrop-blur-xl shadow-[0px_12px_32px_oklch(0.22_0.02_50_/_0.06)] border-b border-border/20">
      <div className="flex w-full items-center justify-between px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-brand transition-colors hover:bg-[var(--warm-bg)] active:scale-95"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center">
          <h1 className="text-lg font-extrabold tracking-wide text-foreground">Cookr IA</h1>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Asistente Culinario
          </span>
        </div>

        <div className="h-10 w-10" />
      </div>

      <button
        onClick={onVerHistorial}
        className="mb-3 flex items-center gap-1.5 rounded-full bg-[var(--warm-bg)] px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-[var(--warm-bg-accent)] active:scale-95"
      >
        <History className="h-3.5 w-3.5" />
        Ver historial de chats
      </button>
    </header>
  )
}
