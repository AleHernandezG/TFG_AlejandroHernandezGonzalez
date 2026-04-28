export type PestanaColeccion = 'guardadas' | 'mis-recetas'

export type RecetaColeccion = {
  id: string
  titulo: string
  imagenUrl: string
  autor: { nombre: string; avatarUrl: string }
}
