export type RolMensaje = 'usuario' | 'ia'

export interface Mensaje {
  id: string
  rol: RolMensaje
  contenido: string
  timestamp: Date
  imagen?: string
}

export interface ConversacionGuardada {
  id: string
  fecha: string
  primerMensaje: string
  mensajes: Mensaje[]
}

export interface ChipSugerido {
  id: string
  texto: string
  icono: string
}
