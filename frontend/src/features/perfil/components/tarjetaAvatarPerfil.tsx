'use client'

import { Camera, UserCircle2 } from 'lucide-react'

interface Props {
  nombre: string
  email: string
  avatar: string | null
}

export function TarjetaAvatarPerfil({ nombre, email, avatar }: Props) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-[var(--warm-bg)] p-6 flex flex-col items-center shadow-[0px_12px_32px_oklch(0.22_0.02_50_/_0.06)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--warm-bg-accent)] to-transparent opacity-40 pointer-events-none" />

      {/* Avatar */}
      <div className="relative mb-4 z-10">
        <div className="w-20 h-20 rounded-full border-2 border-brand/30 p-0.5 bg-background">
          {avatar ? (
            <img
              src={avatar}
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
          className="absolute bottom-0 right-0 bg-card rounded-full p-1.5 shadow-sm border border-border text-muted-foreground hover:text-brand transition-colors"
          aria-label="Cambiar foto de perfil"
        >
          <Camera size={14} />
        </button>
      </div>

      {/* Nombre y email */}
      <h2 className="font-extrabold text-xl text-foreground z-10 text-center">{nombre}</h2>
      <p className="text-sm text-muted-foreground z-10 mt-0.5 text-center">{email}</p>
    </section>
  )
}
