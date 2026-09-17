export const DIETAS: string[] = [
  "vegetariano",
  "vegano",
  "keto",
  "mediterranea",
  "paleo",
  "halal",
  "kosher",
  "bajoEnCalorias",
  "altoEnProteinas",
  "lowCarb",
];

const ALIAS: Record<string, string> = {
  vegetariana: "vegetariano",
  vegana: "vegano",
  mediterraneo: "mediterranea",
  bajoencalorias: "bajoEnCalorias",
  altoenproteinas: "altoEnProteinas",
  lowcarb: "lowCarb",
};

function quitarAcentos(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function canonizarDieta(valor: string): string | null {
  const base = quitarAcentos(valor.trim().toLowerCase());
  if (!base) return null;
  if (ALIAS[base]) return ALIAS[base];
  return DIETAS.find((dieta) => quitarAcentos(dieta.toLowerCase()) === base) ?? null;
}

export function esRestriccionDeAlergeno(valor: string): boolean {
  return /^sin\s/.test(quitarAcentos(valor.trim().toLowerCase()));
}

export function filtrarDietas(dietas: string[] = []): string[] {
  const vistas = new Set<string>();
  for (const dieta of dietas) {
    const canonica = canonizarDieta(dieta);
    if (canonica) vistas.add(canonica);
  }
  return [...vistas];
}

export function normalizarCategorias(categorias: string[] = []): string[] {
  const vistas = new Set<string>();
  for (const categoria of categorias) {
    if (esRestriccionDeAlergeno(categoria)) continue;
    vistas.add(canonizarDieta(categoria) ?? categoria);
  }
  return [...vistas];
}
