import type { RecetaColeccion } from '../types/coleccion.types'

export const MIS_RECETAS: RecetaColeccion[] = [
  {
    id: 'r1',
    titulo: 'Pasta al pesto casero',
    imagenUrl: 'https://picsum.photos/seed/colr1/400/533',
    autor: { nombre: 'Tú', avatarUrl: 'https://picsum.photos/seed/myavatar/80/80' },
  },
  {
    id: 'r2',
    titulo: 'Tarta de limón',
    imagenUrl: 'https://picsum.photos/seed/colr2/400/533',
    autor: { nombre: 'Tú', avatarUrl: 'https://picsum.photos/seed/myavatar/80/80' },
  },
  {
    id: 'r3',
    titulo: 'Ensalada mediterránea',
    imagenUrl: 'https://picsum.photos/seed/colr3/400/533',
    autor: { nombre: 'Tú', avatarUrl: 'https://picsum.photos/seed/myavatar/80/80' },
  },
  {
    id: 'r4',
    titulo: 'Brochetas BBQ',
    imagenUrl: 'https://picsum.photos/seed/colr4/400/533',
    autor: { nombre: 'Tú', avatarUrl: 'https://picsum.photos/seed/myavatar/80/80' },
  },
]

export const RECETAS_GUARDADAS: RecetaColeccion[] = [
  {
    id: 'g1',
    titulo: 'Buddha Bowl de Verano',
    imagenUrl: 'https://picsum.photos/seed/colg1/400/533',
    autor: { nombre: 'Clara M.', avatarUrl: 'https://picsum.photos/seed/avatar3/80/80' },
  },
  {
    id: 'g2',
    titulo: 'Pizza Rústica Margarita',
    imagenUrl: 'https://picsum.photos/seed/colg2/400/533',
    autor: { nombre: 'Chef Juan', avatarUrl: 'https://picsum.photos/seed/avatar4/80/80' },
  },
  {
    id: 'g3',
    titulo: 'Pancakes Esponjosos',
    imagenUrl: 'https://picsum.photos/seed/colg3/400/533',
    autor: { nombre: 'Ana Cocina', avatarUrl: 'https://picsum.photos/seed/avatar5/80/80' },
  },
  {
    id: 'g4',
    titulo: 'Tostada Avo & Huevo',
    imagenUrl: 'https://picsum.photos/seed/colg4/400/533',
    autor: { nombre: 'Sano y Rico', avatarUrl: 'https://picsum.photos/seed/avatar6/80/80' },
  },
]
