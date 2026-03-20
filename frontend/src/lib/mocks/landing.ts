export type LandingFeatureIcon = "chef" | "social" | "ai";

type LandingFeature = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LandingFeatureIcon;
};

type LandingStat = {
  value: string;
  label: string;
};

export const landingFeatures: LandingFeature[] = [
  {
    id: "smart-recipes",
    title: "Recetas inteligentes",
    subtitle: "Ideas en segundos",
    description:
      "Encuentra recetas por ingredientes, tiempo o dificultad y guarda tus favoritas para repetirlas cuando quieras.",
    icon: "chef",
  },
  {
    id: "food-community",
    title: "Comunidad foodie",
    subtitle: "Comparte y aprende",
    description:
      "Publica tus platos, comenta recetas de otros usuarios y descubre nuevas tecnicas de cocina en grupos tematicos.",
    icon: "social",
  },
  {
    id: "culinary-ai",
    title: "Asistente IA",
    subtitle: "Ayuda personalizada",
    description:
      "Recibe recomendaciones basadas en tu despensa y tus preferencias para decidir mas rapido que cocinar hoy.",
    icon: "ai",
  },
];

export const landingStats: LandingStat[] = [
  { value: "12k+", label: "Recetas compartidas" },
  { value: "3.5k", label: "Cocineros activos" },
  { value: "24/7", label: "Sugerencias IA" },
];