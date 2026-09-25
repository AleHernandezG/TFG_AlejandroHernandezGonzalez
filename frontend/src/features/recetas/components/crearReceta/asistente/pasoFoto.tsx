'use client'

import { useRef, type ChangeEvent } from 'react'
import Image from 'next/image'
import { Camera, Loader2, Trash2 } from 'lucide-react'

export interface PropsPasoFoto {
  url: string | null
  subiendo: boolean
  error: string | null
  onArchivo: (e: ChangeEvent<HTMLInputElement>) => void
  onQuitar: () => void
}

export function PasoFoto({ url, subiendo, error, onArchivo, onQuitar }: PropsPasoFoto) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <section className="bg-(--warm-bg-accent) rounded-2xl overflow-hidden shadow-[0px_4px_20px_oklch(0.1_0.02_50/0.4)]">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onArchivo}
      />
      {url ? (
        <div className="relative h-52 w-full">
          <Image src={url} alt="Preview receta" fill className="object-cover" />
          {subiendo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
              <Loader2 size={28} className="animate-spin text-white" />
            </div>
          )}
          <button
            type="button"
            onClick={onQuitar}
            className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center bg-black/40 backdrop-blur-xs rounded-lg text-white"
            aria-label="Quitar foto"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-44 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-2xl text-muted-foreground hover:bg-muted/30 transition-colors"
        >
          <Camera size={32} />
          <span className="text-sm font-medium">Añadir foto</span>
        </button>
      )}
      {error && <p className="text-xs text-destructive px-4 pb-3">{error}</p>}
    </section>
  )
}
