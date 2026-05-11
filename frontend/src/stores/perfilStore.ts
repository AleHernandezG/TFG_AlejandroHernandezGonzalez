import { create } from 'zustand'
import type { DatosPerfil, PermisoKey } from '@/features/perfil/types/perfil.types'
import { DATOS_PERFIL_MOCK } from '@/features/perfil/data/datosPerfil'

interface PerfilState extends DatosPerfil {
  actualizarNombre: (nombre: string) => void
  actualizarAvatar: (url: string) => void
  actualizarDietas: (dietas: string[]) => void
  actualizarAlergenos: (alergenos: string[]) => void
  togglePermiso: (key: PermisoKey) => void
}

export const usePerfilStore = create<PerfilState>((set) => ({
  ...DATOS_PERFIL_MOCK,

  actualizarNombre: (nombre) => set({ nombre }),

  actualizarAvatar: (url) => set({ avatar: url }),

  actualizarDietas: (dietas) => set({ dietas }),

  actualizarAlergenos: (alergenos) => set({ alergenos }),

  togglePermiso: (key) =>
    set((state) => ({
      permisos: { ...state.permisos, [key]: !state.permisos[key] },
    })),
}))
