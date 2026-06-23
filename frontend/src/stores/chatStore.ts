import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getSession } from 'next-auth/react'
import type { Mensaje, ConversacionGuardada } from '@/features/chat/types/chat.types'
import { chatService } from '@/services/chatService'

const MAX_HISTORIAL = 20

interface ChatStore {
  mensajes: Mensaje[]
  cargando: boolean
  historial: ConversacionGuardada[]
  enviarMensaje: (texto: string, imagen?: string) => void
  recetaConDespensa: () => void
  limpiarChat: () => void
  nuevaConversacion: () => void
  restaurarConversacion: (id: string) => void
  eliminarConversacion: (id: string) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      mensajes: [],
      cargando: false,
      historial: [],

      enviarMensaje: async (texto: string, imagen?: string) => {
        const mensajeUsuario: Mensaje = {
          id: `${Date.now()}-u`,
          rol: 'usuario',
          contenido: texto,
          timestamp: new Date(),
          imagen,
        }

        set((state) => ({
          mensajes: [...state.mensajes, mensajeUsuario],
          cargando: true,
        }))

        try {
          const session = await getSession()
          const token = session?.user?.backendToken ?? ''
          const todosLosMensajes = get().mensajes
          const respuestaTexto = await chatService.enviarMensaje(todosLosMensajes, token, imagen)

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

      recetaConDespensa: async () => {
        const mensajeUsuario: Mensaje = {
          id: `${Date.now()}-u`,
          rol: 'usuario',
          contenido: 'Receta con lo que tengo',
          timestamp: new Date(),
        }

        set((state) => ({
          mensajes: [...state.mensajes, mensajeUsuario],
          cargando: true,
        }))

        try {
          const session = await getSession()
          const token = session?.user?.backendToken ?? ''
          const respuestaTexto = await chatService.recetaConDespensa(token)

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

      nuevaConversacion: () => {
        const { mensajes, historial } = get()
        const mensajesUsuario = mensajes.filter((m) => m.rol === 'usuario')
        if (mensajesUsuario.length === 0) return

        const nueva: ConversacionGuardada = {
          id: `conv-${Date.now()}`,
          fecha: new Date().toISOString(),
          primerMensaje: mensajesUsuario[0].contenido.slice(0, 80),
          mensajes: mensajes.map(({ imagen: _img, ...rest }) => rest),
        }

        const historialActualizado = [nueva, ...historial].slice(0, MAX_HISTORIAL)
        set({ mensajes: [], cargando: false, historial: historialActualizado })
      },

      restaurarConversacion: (id: string) => {
        const { historial } = get()
        const conv = historial.find((c) => c.id === id)
        if (!conv) return
        set({ mensajes: conv.mensajes, cargando: false })
      },

      eliminarConversacion: (id: string) => {
        set((state) => ({
          historial: state.historial.filter((c) => c.id !== id),
        }))
      },
    }),
    {
      name: 'cookr-chat',
      partialize: (state) => ({ historial: state.historial }),
    },
  ),
)
