const PEXELS_BASE = "https://api.pexels.com/v1";

export interface ResultadoFotoPexels {
  url: string;
  fotografo: string;
  urlFoto: string;
  urlPerfil: string;
}

type PexelsPhoto = {
  src: { large2x: string; large: string };
  photographer: string;
  url: string;
  photographer_url: string;
};

// Tipo de plato — máxima prioridad visual
const TIPOS_PLATO: [RegExp, string][] = [
  [/\bsopa\b/, "soup"],
  [/\bcrema\b/, "cream soup"],
  [/\bcaldo\b/, "broth soup"],
  [/\bguiso\b|\bestofado\b/, "stew"],
  [/\bcurry\b/, "curry"],
  [/\bpaella\b/, "paella"],
  [/\barroz\b/, "rice dish"],
  [/\bpasta\b|\bespagueti\b|\bmacarrones\b|\bfideos\b/, "pasta dish"],
  [/\bpizza\b/, "pizza"],
  [/\bhamburguesa\b/, "burger"],
  [/\btacos?\b|\bburritos?\b/, "tacos"],
  [/\bensalada\b/, "salad"],
  [/\bbarbacoa\b|\bbbq\b/, "barbecue food"],
  [/\bparrilla\b|\ba la brasa\b/, "grilled food"],
  [/\bsandwich\b|\bbocadillo\b/, "sandwich"],
  [/\btortilla\b/, "omelette"],
  [/\bhuev/, "eggs dish"],
  [/\btarta\b|\bpastel\b|\bbizcocho\b/, "cake"],
  [/\bgalletas?\b/, "cookies"],
  [/\bpan\b|\bbaguette\b/, "bread"],
  [/\bhelado\b/, "ice cream"],
  [/\bflan\b|\bmousse\b|\bpudding\b/, "dessert"],
  [/\bwaffles?\b|\bpancakes?\b/, "pancakes"],
  [/\bdesayuno\b/, "breakfast"],
  [/\bcocido\b|\bpuchero\b/, "stew pot"],
];

// Ingrediente principal — secundario, solo si no hay tipo de plato
const INGREDIENTES_VISUALES: [RegExp, string][] = [
  [/\bpollo\b/, "chicken"],
  [/\bternera\b|\bcarne\b/, "beef"],
  [/\bcerdo\b|\blomo\b/, "pork"],
  [/\bcordero\b/, "lamb"],
  [/\bsalm[oó]n\b/, "salmon"],
  [/\bat[uú]n\b/, "tuna"],
  [/\bbacalao\b/, "cod fish"],
  [/\bgambas\b|\blagostinos\b/, "shrimp"],
  [/\blentejas\b/, "lentils"],
  [/\bgarbanzos\b/, "chickpeas"],
  [/\btomate\b/, "tomato"],
  [/\bespinacas\b/, "spinach"],
  [/\bcalabaz/, "pumpkin"],
  [/\bchampinones\b|\bsetas\b/, "mushrooms"],
  [/\bberenjenas\b/, "eggplant"],
];

// Mapa de categorías/dietas → fallback genérico
const MAPA_CATEGORIAS_EN: Record<string, string> = {
  vegano: "vegan food",
  vegetariano: "vegetarian food",
  keto: "keto meal",
  "sin gluten": "gluten free food",
  "sin lactosa": "dairy free food",
  postre: "dessert",
  desayuno: "breakfast food",
  snack: "snack food",
};

function extraerTipoPlato(titulo: string): string | null {
  const lower = titulo.toLowerCase();
  for (const [patron, termEN] of TIPOS_PLATO) {
    if (patron.test(lower)) return termEN;
  }
  return null;
}

function extraerIngredientePrincipal(titulo: string): string | null {
  const lower = titulo.toLowerCase();
  for (const [patron, termEN] of INGREDIENTES_VISUALES) {
    if (patron.test(lower)) return termEN;
  }
  return null;
}

function categoriaEnIngles(categorias: string[]): string {
  for (const cat of categorias) {
    const key = cat.toLowerCase();
    if (MAPA_CATEGORIAS_EN[key]) return MAPA_CATEGORIAS_EN[key];
  }
  return "food photography";
}

async function llamarPexels(
  apiKey: string,
  query: string
): Promise<ResultadoFotoPexels | null> {
  const params = new URLSearchParams({
    query,
    per_page: "3",
    orientation: "landscape",
  });

  const res = await fetch(`${PEXELS_BASE}/search?${params}`, {
    headers: { Authorization: apiKey },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { photos: PexelsPhoto[] };
  const foto = data.photos?.[0];
  if (!foto) return null;

  return {
    url: foto.src.large2x || foto.src.large,
    fotografo: foto.photographer,
    urlFoto: foto.url,
    urlPerfil: foto.photographer_url,
  };
}

export async function buscarFotoPexels(
  query: string
): Promise<ResultadoFotoPexels | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  try {
    return await llamarPexels(apiKey, query);
  } catch {
    return null;
  }
}

export async function buscarFotoPexelsCascada(
  titulo: string,
  categorias: string[] = []
): Promise<ResultadoFotoPexels | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  try {
    // Intento 1: tipo de plato detectado en el título
    const tipoPlato = extraerTipoPlato(titulo);
    if (tipoPlato) {
      const resultado = await llamarPexels(apiKey, `${tipoPlato} food photography`);
      if (resultado) return resultado;
    }

    // Intento 2: ingrediente principal del título como refuerzo visual
    const ingrediente = extraerIngredientePrincipal(titulo);
    if (ingrediente) {
      const query = tipoPlato
        ? `${ingrediente} ${tipoPlato}`
        : `${ingrediente} food dish`;
      const resultado = await llamarPexels(apiKey, query);
      if (resultado) return resultado;
    }

    // Intento 3: categoría/dieta genérica
    const catEN = categoriaEnIngles(categorias);
    return await llamarPexels(apiKey, catEN);
  } catch {
    return null;
  }
}
