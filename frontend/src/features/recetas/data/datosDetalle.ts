import type { RecetaDetalle } from '../types/receta.types'
import { POSTS_MOCK } from './datosFeed'

export const RECETA_DETALLE_MOCK: RecetaDetalle = {
  // ── Datos base PostFeed ───────────────────────────────────────────
  id: '10',
  autor: {
    id: '',
    nombre: 'Alejandro Romero',
    username: 'alejandrococinero',
    avatarUrl: 'https://picsum.photos/seed/avatardetalle/80/80',
  },
  receta: {
    titulo: 'Pollo al limón con alcaparras y espinacas',
    descripcion:
      'Un clásico mediterráneo reinventado. Pechuga de pollo dorada en mantequilla, salsa de limón reducida con alcaparras y espinacas frescas. Elegante, ligero y listo en 30 minutos.',
    imagenUrl: 'https://picsum.photos/seed/pollolimon/1200/800',
    tiempo: '30 min',
    dificultad: 'Media',
  },
  likes: 847,
  comentarios: 64,
  guardado: false,
  liked: false,
  sigueAlAutor: false,
  fechaPublicacion: '2026-04-10T07:00:00.000Z',

  // ── Detalle extendido ─────────────────────────────────────────────
  categorias: ['Mediterráneo', 'Alto en proteína', 'Sin gluten'],
  porciones: 2,

  ingredientes: [
    { nombre: 'Pechuga de pollo', cantidad: 400, unidad: 'g' },
    { nombre: 'Mantequilla', cantidad: 30, unidad: 'g' },
    { nombre: 'Aceite de oliva virgen extra', cantidad: 2, unidad: 'cdas' },
    { nombre: 'Limón (zumo)', cantidad: 60, unidad: 'ml' },
    { nombre: 'Alcaparras', cantidad: 2, unidad: 'cdas' },
    { nombre: 'Espinacas frescas', cantidad: 100, unidad: 'g' },
    { nombre: 'Ajo', cantidad: 2, unidad: 'dientes' },
    { nombre: 'Caldo de pollo', cantidad: 120, unidad: 'ml' },
  ],

  alergenos: ['lacteos', 'huevo'],

  pasos: [
    'Aplana las pechugas de pollo a un grosor uniforme de 1,5 cm con un mazo de cocina. Sazónalas generosamente con sal y pimienta por ambos lados.',
    'Calienta el aceite de oliva en una sartén grande a fuego medio-alto. Dora el pollo 4-5 minutos por cada lado hasta que esté dorado y cocido. Reserva en un plato caliente.',
    'Baja el fuego a medio. En la misma sartén, añade el ajo laminado y sofríe 30 segundos. Incorpora el caldo de pollo y el zumo de limón, raspa los jugos del fondo con una espátula.',
    'Añade la mantequilla en trozos y las alcaparras. Mueve la sartén para emulsionar la salsa durante 2-3 minutos hasta que espese ligeramente.',
    'Incorpora las espinacas frescas y remueve hasta que se marchiten (1 minuto). Devuelve el pollo a la sartén, nápalo con la salsa y sirve inmediatamente.',
  ],

  macros: {
    calorias: 380,
    proteinas: 42,
    carbos: 6,
    grasas: 20,
  },

  listaComentarios: [
    {
      autorNombre: 'Laura Vidal',
      avatarUrl: 'https://picsum.photos/seed/comentario1/80/80',
      texto:
        'He probado muchas versiones de pollo al limón pero esta salsa con alcaparras es otra dimensión. He añadido un poco de vino blanco al caldo y quedó espectacular.',
      fecha: '2026-04-10T09:00:00.000Z',
    },
    {
      autorNombre: 'Marcos Iglesias',
      avatarUrl: 'https://picsum.photos/seed/comentario2/80/80',
      texto:
        'Perfecto para una cena entre semana. Rápido, ligero y con ingredientes que suelo tener siempre. Lo hago casi cada semana ahora.',
      fecha: '2026-04-10T04:00:00.000Z',
    },
    {
      autorNombre: 'Cristina Molina',
      avatarUrl: null,
      texto:
        'La técnica de aplanar el pollo antes de dorar es un cambio de juego. Se cocina mucho más uniformemente y queda jugosísimo por dentro.',
      fecha: '2026-04-09T16:00:00.000Z',
    },
  ],

  // Reutiliza posts del feed como recetas similares
  similares: [POSTS_MOCK[3], POSTS_MOCK[2], POSTS_MOCK[6]],
}
