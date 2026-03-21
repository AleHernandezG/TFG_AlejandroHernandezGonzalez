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
    gradiente: "from-amber-300/50 via-orange-200/35 to-yellow-100/25",
    emoji: "🍳",
    etiqueta: "Desayunos creativos",
  },
  {
    id: "slide-2",
    gradiente: "from-emerald-300/45 via-teal-200/30 to-cyan-100/20",
    emoji: "🥗",
    etiqueta: "Ensaladas frescas",
  },
  {
    id: "slide-3",
    gradiente: "from-rose-300/45 via-pink-200/30 to-fuchsia-100/20",
    emoji: "🍰",
    etiqueta: "Postres caseros",
  },
  {
    id: "slide-4",
    gradiente: "from-violet-300/45 via-purple-200/30 to-indigo-100/20",
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
