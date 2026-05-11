import { z } from 'zod'

export const esquemaIngrediente = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  cantidad: z
    .string()
    .min(1, 'La cantidad es obligatoria')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Debe ser un número positivo'),
  unidad: z.string().min(1, 'Selecciona una unidad'),
})

export const esquemaPaso = z.object({
  texto: z.string().min(10, 'El paso debe tener al menos 10 caracteres'),
})

export const esquemaCrearReceta = z.object({
  titulo: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede superar los 100 caracteres'),
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(300, 'La descripción no puede superar los 300 caracteres'),
  ingredientes: z.array(esquemaIngrediente).min(1, 'Añade al menos un ingrediente'),
  pasos: z.array(esquemaPaso).min(1, 'Añade al menos un paso'),
  porciones: z.number().refine((v) => !isNaN(v) && v >= 1, 'Debe haber al menos 1 porción'),
  dificultad: z.enum(['facil', 'media', 'dificil']),
  tiempo: z.number().refine((v) => !isNaN(v) && v >= 1, 'El tiempo debe ser al menos 1'),
  unidadTiempo: z.enum(['min', 'h']),
  dietas: z.array(z.string()),
  foto: z.instanceof(File).optional(),
})

export type DatosCrearReceta = z.infer<typeof esquemaCrearReceta>

export interface DatosRecetaNueva {
  titulo: string
  descripcion: string
  tiempo: number
  unidadTiempo: 'min' | 'h'
  porciones: number
  dificultad: 'facil' | 'media' | 'dificil'
  dietas: string[]
  alergenos: string[]
  ingredientes: { nombre: string; cantidad: string; unidad: string }[]
  pasos: { texto: string }[]
  imagenBase64?: string
}

export type DificultadInterna = 'facil' | 'media' | 'dificil'

export const ETIQUETAS_DIFICULTAD: Record<DificultadInterna, string> = {
  facil: 'Fácil',
  media: 'Media',
  dificil: 'Difícil',
}

export const UNIDADES_INGREDIENTE = [
  // Peso
  'g', 'kg', 'mg',
  // Volumen
  'ml', 'cl', 'dl', 'l',
  // Medidas de cocina
  'cucharadita', 'cucharada', 'taza', 'pizca',
  // Conteo
  'unidad', 'diente', 'hoja', 'rama', 'rebanada',
  // Envases
  'lata', 'sobre', 'bolsa',
  // Impreciso
  'al gusto',
] as const
