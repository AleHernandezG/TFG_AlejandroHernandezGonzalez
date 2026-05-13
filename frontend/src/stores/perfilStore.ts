import { create } from 'zustand'
import type { PermisoKey, PermisosPerfil } from '@/features/perfil/types/perfil.types'

interface PermisosState {
  permisos: PermisosPerfil
  togglePermiso: (key: PermisoKey) => void
}

export const usePerfilStore = create<PermisosState>((set) => ({
  permisos: { ubicacion: true, camara: false, notificaciones: true },
  togglePermiso: (key) =>
    set((state) => ({
      permisos: { ...state.permisos, [key]: !state.permisos[key] },
    })),
}))
