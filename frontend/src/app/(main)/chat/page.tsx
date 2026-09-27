import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ContenidoChat } from '@/features/chat/components'

export const metadata: Metadata = {
  title: 'Cookr IA — Asistente culinario',
  description: 'Pregunta a Cookr IA qué cocinar con lo que tienes en casa.',
}

export default function PaginaChat() {
  return (
    <Suspense>
      <ContenidoChat />
    </Suspense>
  )
}
