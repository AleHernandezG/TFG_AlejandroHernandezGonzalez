import { create } from 'zustand'
import type { Mensaje } from '@/features/chat/types/chat.types'
import { getMockRespuesta } from '@/features/chat/data/datosChat'

interface ChatStore {
  mensajes: Mensaje[]
  cargando: boolean
  enviarMensaje: (texto: string) => void
  limpiarChat: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  mensajes: [],
  cargando: false,

  enviarMensaje: (texto: string) => {
    const mensajeUsuario: Mensaje = {
      id: `${Date.now()}-u`,
      rol: 'usuario',
      contenido: texto,
      timestamp: new Date(),
    }

    set((state) => ({
      mensajes: [...state.mensajes, mensajeUsuario],
      cargando: true,
    }))

    setTimeout(() => {
      const respuesta: Mensaje = {
        id: `${Date.now()}-ia`,
        rol: 'ia',
        contenido: getMockRespuesta(texto),
        timestamp: new Date(),
      }

      set((state) => ({
        mensajes: [...state.mensajes, respuesta],
        cargando: false,
      }))
    }, 1400)
  },

  limpiarChat: () => set({ mensajes: [], cargando: false }),
}))
