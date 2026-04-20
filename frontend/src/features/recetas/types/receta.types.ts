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
  alergenos?: string[] // ids de ALERGENOS_OPCIONES en opcionesUsuario.ts
}

export interface FiltrosAvanzados {
  dietas: string[]
  alergenos: string[]
  dificultad: string[]
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

export type Ingrediente = {
  nombre: string
  cantidad: number
  unidad: string
}

export type Comentario = {
  autorNombre: string
  avatarUrl: string | null
  texto: string
  fecha: string // ISO 8601
}

export type MacrosReceta = {
  calorias: number
  proteinas: number
  carbos: number
  grasas: number
}

export type RecetaDetalle = PostFeed & {
  categorias: string[]
  pasos: string[]
  ingredientes: Ingrediente[]
  alergenos: string[] // ids del map ALERGENOS en chipAlergeno
  macros: MacrosReceta
  listaComentarios: Comentario[] // diferente de PostFeed.comentarios (number)
  similares: PostFeed[]
  porciones: number // porciones base para escalar ingredientes
}
