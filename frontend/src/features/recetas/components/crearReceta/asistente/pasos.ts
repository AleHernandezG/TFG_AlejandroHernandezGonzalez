import type { FieldErrors, FieldPath } from 'react-hook-form'
import type { DatosCrearReceta } from '@/features/recetas/types/crearReceta.schema'

export type IdPasoAsistente = 'foto' | 'datos' | 'ingredientes' | 'pasos' | 'alergenos'

export interface PasoAsistente {
  id: IdPasoAsistente
  titulo: string
  descripcion: string
  campos: FieldPath<DatosCrearReceta>[]
  ayuda?: string
}

export const PASOS_ASISTENTE: PasoAsistente[] = [
  {
    id: 'foto',
    titulo: 'Empieza por la foto',
    descripcion: 'Es lo primero que ve quien se cruza con tu receta. Puedes saltarla y añadirla después.',
    campos: [],
    ayuda: 'Con luz natural y un fondo limpio se nota. Una buena foto es media receta.',
  },
  {
    id: 'datos',
    titulo: '¿Qué vas a cocinar?',
    descripcion: 'Cómo se llama, de qué va, cuánto lleva y para cuántos.',
    campos: ['titulo', 'descripcion', 'tiempo', 'unidadTiempo', 'porciones', 'dificultad', 'dietas'],
  },
  {
    id: 'ingredientes',
    titulo: '¿Qué lleva tu receta?',
    descripcion: 'Todo lo que hace falta, con su cantidad.',
    campos: ['ingredientes'],
    ayuda: 'Pon siempre cantidad y unidad: es lo que permite reproducir la receta sin adivinar.',
  },
  {
    id: 'pasos',
    titulo: '¿Cómo se hace?',
    descripcion: 'Una instrucción por paso, en orden.',
    campos: ['pasos'],
  },
  {
    id: 'alergenos',
    titulo: 'Alérgenos detectados',
    descripcion: 'Salen solos de los ingredientes que has escrito.',
    campos: [],
    ayuda: 'En la pantalla siguiente verás la receta tal cual la verán los demás, antes de publicarla.',
  },
]

export function pasoConPrimerError(errores: FieldErrors<DatosCrearReceta>): number {
  const indice = PASOS_ASISTENTE.findIndex((paso) => paso.campos.some((campo) => campo in errores))
  return indice === -1 ? 0 : indice
}
