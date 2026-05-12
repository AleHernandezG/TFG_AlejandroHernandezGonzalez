import type { CategoriaDiscover, EventoDestacado, RecetaDiscover } from '@/features/discover/types/discover.types'

export const CATEGORIAS_DISCOVER: CategoriaDiscover[] = [
  'Todos', 'Desayuno', 'Pasta', 'Vegano', 'Postres',
]

export const SUGERENCIAS_POPULARES: string[] = [
  'Tacos de Birria',
  'Pasta al Pesto',
  'Ensalada Keto',
  'Postres Sin Horno',
]

export const EVENTO_DESTACADO_MOCK: EventoDestacado = {
  titulo: 'Semana de la Cocina Mediterránea',
  subtitulo: 'Recetas frescas, saludables y llenas de sabor',
  etiqueta: 'Especial de la semana',
}

export const RECETAS_DISCOVER_MOCK: RecetaDiscover[] = [
  {
    id: 'd-001',
    titulo: 'Bowl Energético de Quinoa y Aguacate',
    autorNombre: 'user_chef',
    imagenUrl: null,
    tiempoMin: 15,
    likes: 128,
    categoria: 'Vegano',
  },
  {
    id: 'd-002',
    titulo: 'Fettuccine Alfredo Clásico',
    autorNombre: 'la_pastaia',
    imagenUrl: null,
    tiempoMin: 30,
    likes: 830,
    categoria: 'Pasta',
  },
  {
    id: 'd-003',
    titulo: 'Tarta de Chocolate con Fresas y Frambuesas',
    autorNombre: 'dulce_art',
    imagenUrl: null,
    tiempoMin: 60,
    likes: 460,
    categoria: 'Postres',
    esEvento: true,
  },
  {
    id: 'd-004',
    titulo: 'Asado Perfecto al Romero',
    autorNombre: 'grillmaster',
    imagenUrl: null,
    tiempoMin: 90,
    likes: 310,
    categoria: 'Vegano',
    esEvento: true,
  },
  {
    id: 'd-005',
    titulo: 'Tostadas de Aguacate con Tomate Cherry',
    autorNombre: 'mañanitas_sanas',
    imagenUrl: null,
    tiempoMin: 10,
    likes: 215,
    categoria: 'Desayuno',
  },
  {
    id: 'd-006',
    titulo: 'Espagueti Carbonara Auténtica',
    autorNombre: 'roma_cocina',
    imagenUrl: null,
    tiempoMin: 25,
    likes: 644,
    categoria: 'Pasta',
  },
]
