import { apiClient } from './apiClient'
import type { Mensaje } from '@/features/chat/types/chat.types'

function mapearRol(rol: 'usuario' | 'ia'): 'user' | 'model' {
  return rol === 'usuario' ? 'user' : 'model'
}

export const chatService = {
  async enviarMensaje(mensajes: Mensaje[], token: string): Promise<string> {
    const { data } = await apiClient.post<{ respuesta: string }>(
      '/chat',
      { mensajes: mensajes.map((m) => ({ rol: mapearRol(m.rol), texto: m.contenido })) },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return data.respuesta
  },
}
