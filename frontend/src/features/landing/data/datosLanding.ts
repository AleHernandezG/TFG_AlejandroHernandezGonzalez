export type IconoCaracteristicaLanding = "chef" | "social" | "ia";

export type CaracteristicaLanding = {
  id: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  icono: IconoCaracteristicaLanding;
};

export type EstadisticaLanding = {
  valor: string;
  etiqueta: string;
};

export type Testimonio = {
  id: string;
  nombre: string;
  rol: string;
  avatarId: string;
  comentario: string;
  valoracion: number; // 1–5 corazones
};

export type SlideHero = {
  id: string;
  gradiente: string;
  emoji: string;
  etiqueta: string;
};

export const slidesHero: SlideHero[] = [
  {
    id: "slide-1",
    // Hero gradient Cookr (ocre/naranja cálido) — vars definidas en globals.css
    gradiente: "from-[var(--hero-gradient-start)] via-[var(--hero-gradient-mid)] to-[var(--hero-gradient-end)]",
    emoji: "🍳",
    etiqueta: "Desayunos creativos",
  },
  {
    id: "slide-2",
    gradiente: "from-[var(--theme-fresh)]/45 via-[var(--theme-fresh)]/20 to-[var(--theme-fresh)]/10",
    emoji: "🥗",
    etiqueta: "Ensaladas frescas",
  },
  {
    id: "slide-3",
    gradiente: "from-[var(--theme-sweet)]/45 via-[var(--theme-sweet)]/20 to-[var(--theme-sweet)]/10",
    emoji: "🍰",
    etiqueta: "Postres caseros",
  },
  {
    id: "slide-4",
    gradiente: "from-[var(--theme-pasta)]/45 via-[var(--theme-pasta)]/20 to-[var(--theme-pasta)]/10",
    emoji: "🍝",
    etiqueta: "Pastas artesanales",
  },
];

export const caracteristicasLanding: CaracteristicaLanding[] = [
  {
    id: "recetas-inteligentes",
    titulo: "Recetas inteligentes",
    subtitulo: "Ideas en segundos",
    descripcion:
      "Encuentra recetas por ingredientes, tiempo o dificultad y guarda tus favoritas para repetirlas cuando quieras. La IA aprende de tus preferencias para darte sugerencias cada vez más acertadas.",
    icono: "chef",
  },
  {
    id: "comunidad-foodie",
    titulo: "Comunidad foodie",
    subtitulo: "Comparte y aprende",
    descripcion:
      "Publica tus platos, comenta recetas de otros cocineros y descubre nuevas técnicas en grupos temáticos.",
    icono: "social",
  },
  {
    id: "asistente-ia",
    titulo: "Asistente con IA",
    subtitulo: "Ayuda personalizada",
    descripcion:
      "Recibe recomendaciones basadas en tu despensa y preferencias para decidir qué cocinar hoy en segundos.",
    icono: "ia",
  },
];

export const estadisticasLanding: EstadisticaLanding[] = [
  { valor: "12k+", etiqueta: "Recetas compartidas" },
  { valor: "3.5k", etiqueta: "Cocineros activos" },
  { valor: "24/7", etiqueta: "Sugerencias IA" },
];

export const testimoniosLanding: Testimonio[] = [
  {
    id: "t1",
    nombre: "Laura García",
    rol: "Chef amateur",
    avatarId: "LG",
    comentario:
      "La IA me salvó la cena con lo que tenía en la nevera. Propuso una receta increíble en segundos. Ya no puedo vivir sin esta app.",
    valoracion: 5,
  },
  {
    id: "t2",
    nombre: "Carlos Méndez",
    rol: "Foodie & blogger",
    avatarId: "CM",
    comentario:
      "Por fin una red social donde aprender recetas de verdad. La comunidad es superactiva y siempre hay algo nuevo que descubrir.",
    valoracion: 5,
  },
  {
    id: "t3",
    nombre: "Sofía Ramos",
    rol: "Cocinera en casa",
    avatarId: "SR",
    comentario:
      "Muy fácil de usar y el diseño me encanta. Tengo ya más de 30 recetas guardadas y las anoto con mis propias notas.",
    valoracion: 4,
  },
  {
    id: "t4",
    nombre: "Martín López",
    rol: "Estudiante de cocina",
    avatarId: "ML",
    comentario:
      "Uso el asistente IA para practicar técnicas y las sugerencias son sorprendentemente precisas. Muy recomendado.",
    valoracion: 5,
  },
  {
    id: "t5",
    nombre: "Elena Torres",
    rol: "Nutricionista",
    avatarId: "ET",
    comentario:
      "Me ayuda a planificar menús saludables para toda la semana. Los filtros por ingrediente y macros son geniales.",
    valoracion: 4,
  },
  {
    id: "t6",
    nombre: "Pablo Ruiz",
    rol: "Padre cocinero",
    avatarId: "PR",
    comentario:
      "Cocino para mis hijos cada día y esta app me da ideas frescas constantemente. Ha transformado mis cenas familiares.",
    valoracion: 5,
  },
];
