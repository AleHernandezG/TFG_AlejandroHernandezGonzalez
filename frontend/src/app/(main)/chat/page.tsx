import { Suspense } from 'react'
import { ContenidoChat } from '@/features/chat/components'

export default function PaginaChat() {
  return (
    <Suspense>
      <ContenidoChat />
    </Suspense>
  )
}
