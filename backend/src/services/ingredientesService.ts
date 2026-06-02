import axios from "axios";

const OFF_SUGGEST_URL =
  "https://world.openfoodfacts.org/cgi/suggest.pl";

export async function buscarIngredientesEdamam(query: string): Promise<string[]> {
  return buscarIngredientesOpenFoodFacts(query);
}

export async function buscarIngredientesOpenFoodFacts(
  query: string,
): Promise<string[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const { data } = await axios.get<string[]>(OFF_SUGGEST_URL, {
      params: { tagtype: "ingredients", term: query.trim(), lc: "es" },
      timeout: 3000,
    });
    return Array.isArray(data)
      ? data.map((s) => s.trim()).filter(Boolean).slice(0, 10)
      : [];
  } catch {
    return [];
  }
}
