import { create } from 'zustand'
import { getSession } from 'next-auth/react'
import type { Mensaje } from '@/features/chat/types/chat.types'
import { chatService } from '@/services/chatService'

interface ChatStore {
  mensajes: Mensaje[]
  cargando: boolean
  enviarMensaje: (texto: string) => void
  limpiarChat: () => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  mensajes: [],
  cargando: false,

  enviarMensaje: async (texto: string) => {
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

    try {
      const session = await getSession()
      const token = session?.user?.backendToken ?? ''
      const todosLosMensajes = get().mensajes
      const respuestaTexto = await chatService.enviarMensaje(todosLosMensajes, token)

      const respuesta: Mensaje = {
        id: `${Date.now()}-ia`,
        rol: 'ia',
        contenido: respuestaTexto,
        timestamp: new Date(),
      }

      set((state) => ({
        mensajes: [...state.mensajes, respuesta],
        cargando: false,
      }))
    } catch {
      const errorMsg: Mensaje = {
        id: `${Date.now()}-err`,
        rol: 'ia',
        contenido: 'No pude conectar con el asistente. Inténtalo de nuevo.',
        timestamp: new Date(),
      }
      set((state) => ({
        mensajes: [...state.mensajes, errorMsg],
        cargando: false,
      }))
    }
  },

  limpiarChat: () => set({ mensajes: [], cargando: false }),
}))
