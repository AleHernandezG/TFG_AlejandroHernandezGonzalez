import type { FiltroFeed, PostFeed } from '../types/receta.types'

export const FILTROS_FEED: FiltroFeed[] = [
  { id: 'todas',      etiqueta: 'Todas' },
  { id: 'vegano',     etiqueta: 'Vegano' },
  { id: 'keto',       etiqueta: 'Keto' },
  { id: 'sinGluten',  etiqueta: 'Sin gluten' },
  { id: 'sinLactosa', etiqueta: 'Sin lactosa' },
]

export const POSTS_MOCK: PostFeed[] = [
  {
    id: '1',
    autor: { id: '', nombre: 'María García', username: 'mariacocina', avatarUrl: 'https://picsum.photos/seed/avatar1/80/80' },
    receta: {
      titulo: 'Pasta al pesto de albahaca fresca',
      descripcion: 'Un clásico italiano que nunca falla. Albahaca recién cogida del jardín, piñones tostados y parmesano de calidad. Lista en 20 minutos.',
      imagenUrl: 'https://picsum.photos/seed/pasta1/800/600',
      tiempo: '20 min', dificultad: 'Fácil', alergenos: ['cereales'],
    },
    likes: 142, comentarios: 18, guardado: false, liked: false, sigueAlAutor: false,
    fechaPublicacion: '2026-04-10T09:25:00.000Z',
  },
  {
    id: '2',
    autor: { id: '', nombre: 'Carlos Ruiz', username: 'chefcarlos', avatarUrl: 'https://picsum.photos/seed/avatar2/80/80' },
    receta: {
      titulo: 'Bowl de açaí con frutas tropicales',
      descripcion: 'Desayuno energético y visualmente espectacular. Base de açaí congelado, plátano, mango y granola artesanal crujiente.',
      imagenUrl: 'https://picsum.photos/seed/acai2/800/600',
      tiempo: '10 min', dificultad: 'Fácil', alergenos: [],
    },
    likes: 89, comentarios: 7, guardado: true, liked: true, sigueAlAutor: false,
    fechaPublicacion: '2026-04-10T08:00:00.000Z',
  },
  {
    id: '3',
    autor: { id: '', nombre: 'Ana Martínez', username: 'veganana', avatarUrl: 'https://picsum.photos/seed/avatar3/80/80' },
    receta: {
      titulo: 'Curry de garbanzos con leche de coco',
      descripcion: 'Reconfortante y lleno de sabor. Garbanzos cremosos en una salsa de coco con curry y jengibre fresco. 100% vegano.',
      imagenUrl: 'https://picsum.photos/seed/curry3/800/600',
      tiempo: '35 min', dificultad: 'Media', alergenos: ['lacteos'],
    },
    likes: 214, comentarios: 31, guardado: false, liked: false, sigueAlAutor: false,
    fechaPublicacion: '2026-04-10T05:00:00.000Z',
  },
  {
    id: '4',
    autor: { id: '', nombre: 'Luis Fernández', username: 'luisfit', avatarUrl: 'https://picsum.photos/seed/avatar4/80/80' },
    receta: {
      titulo: 'Salmón al horno con costra de hierbas',
      descripcion: 'Proteína de alta calidad con muy pocos carbohidratos. Salmón noruego con eneldo, perejil y limón. Perfecto para dieta keto.',
      imagenUrl: 'https://picsum.photos/seed/salmon4/800/600',
      tiempo: '25 min', dificultad: 'Fácil', alergenos: ['pescado'],
    },
    likes: 176, comentarios: 22, guardado: false, liked: false, sigueAlAutor: false,
    fechaPublicacion: '2026-04-10T02:00:00.000Z',
  },
  {
    id: '5',
    autor: { id: '', nombre: 'Sara López', username: 'sararepostera', avatarUrl: 'https://picsum.photos/seed/avatar5/80/80' },
    receta: {
      titulo: 'Tarta de manzana sin gluten con canela',
      descripcion: 'Toda la ternura de la tarta de abuela sin una miga de gluten. Harina de almendra y manzanas de temporada asadas con canela.',
      imagenUrl: 'https://picsum.photos/seed/tarta5/800/600',
      tiempo: '55 min', dificultad: 'Media', alergenos: ['huevo'],
    },
    likes: 303, comentarios: 47, guardado: true, liked: false, sigueAlAutor: false,
    fechaPublicacion: '2026-04-09T20:00:00.000Z',
  },
  {
    id: '6',
    autor: { id: '', nombre: 'Pablo Sánchez', username: 'pabloasador', avatarUrl: 'https://picsum.photos/seed/avatar6/80/80' },
    receta: {
      titulo: 'Gazpacho de remolacha con menta',
      descripcion: 'Una vuelta de tuerca al gazpacho tradicional. Remolacha asada, tomate, pepino y un toque de menta fresca.',
      imagenUrl: 'https://picsum.photos/seed/gazpacho6/800/600',
      tiempo: '15 min', dificultad: 'Fácil', alergenos: [],
    },
    likes: 128, comentarios: 14, guardado: false, liked: true, sigueAlAutor: false,
    fechaPublicacion: '2026-04-09T14:00:00.000Z',
  },
  {
    id: '7',
    autor: { id: '', nombre: 'Elena Torres', username: 'elenamediterranea', avatarUrl: 'https://picsum.photos/seed/avatar7/80/80' },
    receta: {
      titulo: 'Risotto de champiñones y trufa',
      descripcion: 'El plato estrella de cualquier cena especial. Arroz arborio meloso con champiñones y aceite de trufa.',
      imagenUrl: 'https://picsum.photos/seed/risotto7/800/600',
      tiempo: '40 min', dificultad: 'Difícil', alergenos: ['lacteos'],
    },
    likes: 391, comentarios: 58, guardado: false, liked: false, sigueAlAutor: false,
    fechaPublicacion: '2026-04-09T06:00:00.000Z',
  },
]
