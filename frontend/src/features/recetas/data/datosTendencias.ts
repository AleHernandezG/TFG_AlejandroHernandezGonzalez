// Mock data for the PC desktop right sidebar (Recetas Populares + Chefs Destacados)
// Phase 5: replace with real API calls via useRecetasPopulares / useChefsDestacados hooks

export type RecetaPopular = {
  id: string
  titulo: string
  autor: string
  tiempo: string
  dificultad: string
  imagenUrl: string
}

export type ChefDestacado = {
  id: string
  nombre: string
  seguidores: string
  avatarUrl: string
}

export const RECETAS_POPULARES: RecetaPopular[] = [
  {
    id: 'rp-1',
    titulo: 'Bowl de Quinoa y Aguacate',
    autor: 'Julia Child Jr.',
    tiempo: '15 min',
    dificultad: 'Fácil',
    imagenUrl: 'https://picsum.photos/seed/bowl-quinoa/80/80',
  },
  {
    id: 'rp-2',
    titulo: 'Pizza Napolitana Casera',
    autor: 'Luigi V.',
    tiempo: '45 min',
    dificultad: 'Experto',
    imagenUrl: 'https://picsum.photos/seed/pizza-nap/80/80',
  },
  {
    id: 'rp-3',
    titulo: 'Sushi Roll Arcoíris',
    autor: 'Kenji O.',
    tiempo: '60 min',
    dificultad: 'Medio',
    imagenUrl: 'https://picsum.photos/seed/sushi-roll/80/80',
  },
]

export const CHEFS_DESTACADOS: ChefDestacado[] = [
  {
    id: 'ch-1',
    nombre: 'David Muñoz',
    seguidores: '2.4k',
    avatarUrl: 'https://picsum.photos/seed/chef-david/80/80',
  },
  {
    id: 'ch-2',
    nombre: 'Ana Ros',
    seguidores: '1.8k',
    avatarUrl: 'https://picsum.photos/seed/chef-ana/80/80',
  },
]
