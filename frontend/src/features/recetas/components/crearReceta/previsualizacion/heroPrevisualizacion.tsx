'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { CreditoFoto } from './tipos'

interface Props {
  src: string | null
  alt: string
  credito?: CreditoFoto | null
  textoVacio?: string
  className?: string
  children?: ReactNode
}

export function HeroPrevisualizacion({
  src,
  alt,
  credito,
  textoVacio = 'Sin foto',
  className,
  children,
}: Props) {
  return (
    <div className={cn('relative h-[400px] w-full overflow-hidden', className)}>
      {src ? (
        <Image src={src} alt={alt} fill priority className="object-cover" />
      ) : (
        <div className="h-full w-full bg-muted flex items-center justify-center">
          <span className="text-sm text-muted-foreground">{textoVacio}</span>
        </div>
      )}
      {credito && (
        <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-white/70 px-4 z-10">
          Foto de{' '}
          <a href={credito.urlPerfil} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            {credito.fotografo}
          </a>
          {' '}en{' '}
          <a href={credito.urlFoto} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            Pexels
          </a>
        </p>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-black/25" />
      {children}
    </div>
  )
}
