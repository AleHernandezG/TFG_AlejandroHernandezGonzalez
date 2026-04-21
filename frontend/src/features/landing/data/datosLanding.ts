export type IconoCaracteristicaLanding = 'chef' | 'social' | 'ia'

export type CaracteristicaLanding = {
  id: string
  titulo: string
  subtitulo: string
  descripcion: string
  icono: IconoCaracteristicaLanding
}

export type EstadisticaLanding = {
  valor: string
  etiqueta: string
}

export type Testimonio = {
  id: string
  nombre: string
  rol: string
  avatarId: string
  comentario: string
  valoracion: number // 1–5 corazones
}

export type SlideHero = {
  id: string
  imageUrl: string
  gradiente: string // fallback CSS si la imagen no carga
  etiqueta: string
}

export const slidesHero: SlideHero[] = [
  {
    id: 'slide-1',
    imageUrl: '/images/hero/desayuno.webp',
    gradiente:
      'from-[var(--hero-gradient-start)] via-[var(--hero-gradient-mid)] to-[var(--hero-gradient-end)]',
    etiqueta: 'Desayunos creativos',
  },
  {
    id: 'slide-2',
    imageUrl: '/images/hero/ensalada.webp',
    gradiente:
      'from-[var(--theme-fresh)]/45 via-[var(--theme-fresh)]/20 to-[var(--theme-fresh)]/10',
    etiqueta: 'Ensaladas frescas',
  },
  {
    id: 'slide-3',
    imageUrl: '/images/hero/postre.webp',
    gradiente:
      'from-[var(--theme-sweet)]/45 via-[var(--theme-sweet)]/20 to-[var(--theme-sweet)]/10',
    etiqueta: 'Postres caseros',
  },
  {
    id: 'slide-4',
    imageUrl: '/images/hero/pasta.webp',
    gradiente:
      'from-[var(--theme-pasta)]/45 via-[var(--theme-pasta)]/20 to-[var(--theme-pasta)]/10',
    etiqueta: 'Pastas artesanales',
  },
]

export const caracteristicasLanding: CaracteristicaLanding[] = [
  {
    id: 'recetas-inteligentes',
    titulo:
      'Recetas propias y personalizadas junto a una gran variedad de recetas compartidas por la comunidad',
    subtitulo: 'Ideas en segundos',
    descripcion:
      'Encuentra recetas por ingredientes, tiempo o dificultad y guarda tus favoritas para repetirlas cuando quieras. Ademas, de crear tus propias recetas y compartirlas con la comunidad, para que otros Cookrs puedan descubrirlas y probarlas. Comparte tus platos, comenta recetas de otros Cookrs y descubre nuevas técnicas en grupos temáticos.',
    icono: 'chef',
  },
  {
    id: 'comunidad-foodie',
    titulo: 'Comunidad Cookr',
    subtitulo: 'Comparte y aprende con gente de cualquier parte del mundo',
    descripcion:
      'Publica tus recetas en grupos con Cookrs de todo el mundo, comenta tus platos favoritos y descubre nuevas técnicas en grupos temáticos.',
    icono: 'social',
  },
  {
    id: 'asistente-ia',
    titulo: 'Asistente con IA',
    subtitulo: 'Ayuda personalizada',
    descripcion:
      'Recibe recomendaciones basadas en tu despensa y preferencias para decidir qué cocinar.',
    icono: 'ia',
  },
]

export const testimoniosLanding: Testimonio[] = [
  {
    id: 't1',
    nombre: 'Laura García',
    rol: 'Chef amateur',
    avatarId: 'LG',
    comentario:
      'La IA me salvó la cena con lo que tenía en la nevera. Ya no puedo vivir sin esta app.',
    valoracion: 5,
  },
  {
    id: 't2',
    nombre: 'Carlos Méndez',
    rol: 'Foodie & blogger',
    avatarId: 'CM',
    comentario:
      'Por fin una red social donde aprender recetas de verdad. La comunidad es superactiva y siempre hay algo nuevo que descubrir.',
    valoracion: 5,
  },
  {
    id: 't3',
    nombre: 'Sofía Ramos',
    rol: 'Cocinera en casa',
    avatarId: 'SR',
    comentario:
      'Muy fácil de usar y el diseño me encanta. Tengo ya más de 30 recetas guardadas para hacer.',
    valoracion: 4,
  },
  {
    id: 't4',
    nombre: 'Martín López',
    rol: 'Estudiante de cocina',
    avatarId: 'ML',
    comentario: 'Uso el asistente IA para practicar técnicas. Muy recomendado.',
    valoracion: 5,
  },
  {
    id: 't5',
    nombre: 'Elena Torres',
    rol: 'Nutricionista',
    avatarId: 'ET',
    comentario:
      'Me ayuda a planificar comidas saludables para toda la semana. Los filtros por alergias son geniales.',
    valoracion: 4,
  },
  {
    id: 't6',
    nombre: 'Pablo Ruiz',
    rol: 'Padre cocinero',
    avatarId: 'PR',
    comentario: 'Cocino para mis hijos cada día y esta app me da ideas todo el rato. Muy top.',
    valoracion: 5,
  },
]
