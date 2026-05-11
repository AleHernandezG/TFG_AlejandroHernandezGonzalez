import type { DatosPerfil } from '../types/perfil.types'

export const DATOS_PERFIL_MOCK: DatosPerfil = {
  nombre: 'Alejandro Hernández',
  email: 'alejeshernandez0407@gmail.com',
  avatar: null,
  dietas: ['mediterranea'],
  alergenos: ['lacteos', 'huevo'],
  permisos: {
    ubicacion: true,
    camara: false,
    notificaciones: true,
  },
}
