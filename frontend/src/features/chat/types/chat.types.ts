export type RolMensaje = 'usuario' | 'ia'

export interface Mensaje {
  id: string
  rol: RolMensaje
  contenido: string
  timestamp: Date
}

export interface ChipSugerido {
  id: string
  texto: string
  icono: string
}
