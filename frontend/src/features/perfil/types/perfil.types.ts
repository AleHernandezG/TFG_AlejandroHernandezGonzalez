export type PermisoKey = 'ubicacion' | 'camara' | 'notificaciones'

export interface PermisosPerfil {
  ubicacion: boolean
  camara: boolean
  notificaciones: boolean
}

export interface DatosPerfil {
  nombre: string
  email: string
  avatar: string | null
  dietas: string[]
  alergenos: string[]
  permisos: PermisosPerfil
}
