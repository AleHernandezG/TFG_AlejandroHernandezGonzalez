'use client'

import { useRef, useState } from 'react'
import { Camera, UserCircle2, Loader2 } from 'lucide-react'
import { useSubirFoto } from '../hooks/usePerfil'

interface Props {
  nombre: string
  email: string
  avatar: string | null
}

export function TarjetaAvatarPerfil({ nombre, email, avatar }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const { mutate: subirFoto, isPending } = useSubirFoto()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setPreview(base64)
      subirFoto(base64, {
        onError: () => setPreview(null),
      })
    }
    reader.readAsDataURL(file)
  }

  const fotoMostrada = preview ?? avatar

  return (
    <section className="relative overflow-hidden rounded-2xl bg-[var(--warm-bg)] p-6 flex flex-col items-center shadow-[0px_12px_32px_oklch(0.22_0.02_50_/_0.06)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--warm-bg-accent)] to-transparent opacity-40 pointer-events-none" />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Avatar */}
      <div className="relative mb-4 z-10">
        <div className="w-20 h-20 rounded-full border-2 border-brand/30 p-0.5 bg-background">
          {fotoMostrada ? (
            <img
              src={fotoMostrada}
              alt={nombre}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-[var(--warm-bg-accent)] flex items-center justify-center">
              <UserCircle2 size={40} className="text-muted-foreground" />
            </div>
          )}
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="absolute bottom-0 right-0 bg-card rounded-full p-1.5 shadow-sm border border-border text-muted-foreground hover:text-brand transition-colors disabled:opacity-60"
          aria-label="Cambiar foto de perfil"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Camera size={14} />
          )}
        </button>
      </div>

      {/* Nombre y email */}
      <h2 className="font-extrabold text-xl text-foreground z-10 text-center">{nombre}</h2>
      <p className="text-sm text-muted-foreground z-10 mt-0.5 text-center">{email}</p>
    </section>
  )
}
