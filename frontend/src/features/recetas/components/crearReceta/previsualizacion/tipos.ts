import type { DatosCrearReceta } from '@/features/recetas/types/crearReceta.schema'

export type IngredientePrevisualizado = DatosCrearReceta['ingredientes'][number]
export type PasoPrevisualizado = DatosCrearReceta['pasos'][number]

export interface CreditoFoto {
  fotografo: string
  urlFoto: string
  urlPerfil: string
}
