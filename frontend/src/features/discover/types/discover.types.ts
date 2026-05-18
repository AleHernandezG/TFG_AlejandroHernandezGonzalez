export type CategoriaDiscover = 'Todos' | 'Desayuno' | 'Pasta' | 'Vegano' | 'Postres'

export type TabDiscover = 'recientes' | 'valorados' | 'evento'

export type RecetaDiscover = {
  id: string
  titulo: string
  autorNombre: string
  imagenUrl: string | null
  tiempoMin: number
  likes: number
  categoria?: Exclude<CategoriaDiscover, 'Todos'>
  esEvento?: boolean
}

export type EventoDestacado = {
  titulo: string
  subtitulo: string
  etiqueta: string
}
