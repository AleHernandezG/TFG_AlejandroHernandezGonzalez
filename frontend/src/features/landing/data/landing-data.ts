export type LandingFeatureIcon = "chef" | "social" | "ai";

export type LandingFeature = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LandingFeatureIcon;
};

export type LandingStat = {
  value: string;
  label: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  avatarId: string;
  comment: string;
  rating: number; // 1–5 hearts
};

export type HeroSlide = {
  id: string;
  gradient: string;
  emoji: string;
  label: string;
};

export const heroSlides: HeroSlide[] = [
  {
    id: "slide-1",
    gradient: "from-amber-300/50 via-orange-200/35 to-yellow-100/25",
    emoji: "🍳",
    label: "Desayunos creativos",
  },
  {
    id: "slide-2",
    gradient: "from-emerald-300/45 via-teal-200/30 to-cyan-100/20",
    emoji: "🥗",
    label: "Ensaladas frescas",
  },
  {
    id: "slide-3",
    gradient: "from-rose-300/45 via-pink-200/30 to-fuchsia-100/20",
    emoji: "🍰",
    label: "Postres caseros",
  },
  {
    id: "slide-4",
    gradient: "from-violet-300/45 via-purple-200/30 to-indigo-100/20",
    emoji: "🍝",
    label: "Pastas artesanales",
  },
];

export const landingFeatures: LandingFeature[] = [
  {
    id: "smart-recipes",
    title: "Recetas inteligentes",
    subtitle: "Ideas en segundos",
    description:
      "Encuentra recetas por ingredientes, tiempo o dificultad y guarda tus favoritas para repetirlas cuando quieras. La IA aprende de tus preferencias para darte sugerencias cada vez más acertadas.",
    icon: "chef",
  },
  {
    id: "food-community",
    title: "Comunidad foodie",
    subtitle: "Comparte y aprende",
    description:
      "Publica tus platos, comenta recetas de otros cocineros y descubre nuevas técnicas en grupos temáticos.",
    icon: "social",
  },
  {
    id: "culinary-ai",
    title: "Asistente con IA",
    subtitle: "Ayuda personalizada",
    description:
      "Recibe recomendaciones basadas en tu despensa y preferencias para decidir qué cocinar hoy en segundos.",
    icon: "ai",
  },
];

export const landingStats: LandingStat[] = [
  { value: "12k+", label: "Recetas compartidas" },
  { value: "3.5k", label: "Cocineros activos" },
  { value: "24/7", label: "Sugerencias IA" },
];

export const landingTestimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Laura García",
    role: "Chef amateur",
    avatarId: "LG",
    comment:
      "La IA me salvó la cena con lo que tenía en la nevera. Propuso una receta increíble en segundos. Ya no puedo vivir sin esta app.",
    rating: 5,
  },
  {
    id: "t2",
    name: "Carlos Méndez",
    role: "Foodie & blogger",
    avatarId: "CM",
    comment:
      "Por fin una red social donde aprender recetas de verdad. La comunidad es superactiva y siempre hay algo nuevo que descubrir.",
    rating: 5,
  },
  {
    id: "t3",
    name: "Sofía Ramos",
    role: "Cocinera en casa",
    avatarId: "SR",
    comment:
      "Muy fácil de usar y el diseño me encanta. Tengo ya más de 30 recetas guardadas y las anoto con mis propias notas.",
    rating: 4,
  },
  {
    id: "t4",
    name: "Martín López",
    role: "Estudiante de cocina",
    avatarId: "ML",
    comment:
      "Uso el asistente IA para practicar técnicas y las sugerencias son sorprendentemente precisas. Muy recomendado.",
    rating: 5,
  },
  {
    id: "t5",
    name: "Elena Torres",
    role: "Nutricionista",
    avatarId: "ET",
    comment:
      "Me ayuda a planificar menús saludables para toda la semana. Los filtros por ingrediente y macros son geniales.",
    rating: 4,
  },
  {
    id: "t6",
    name: "Pablo Ruiz",
    role: "Padre cocinero",
    avatarId: "PR",
    comment:
      "Cocino para mis hijos cada día y esta app me da ideas frescas constantemente. Ha transformado mis cenas familiares.",
    rating: 5,
  },
];
