export type DificultadReceta = 'Fácil' | 'Media' | 'Difícil'

export type Autor = {
  nombre: string
  username: string
  avatarUrl: string
}

export type DatosReceta = {
  titulo: string
  descripcion: string
  imagenUrl: string
  tiempo: string
  dificultad: DificultadReceta
}

export type PostFeed = {
  id: string
  autor: Autor
  receta: DatosReceta
  likes: number
  comentarios: number
  guardado: boolean
  liked: boolean
  fechaPublicacion: string // ISO 8601
}

export type FiltroFeed = {
  id: string
  etiqueta: string
}
