import axios from "axios";
import type { IMacrosReceta } from "../types/receta";

const EDAMAM_URL = "https://api.edamam.com/api/nutrition-details";
const USDA_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

interface EdamamResponse {
  calories: number;
  totalNutrients: {
    PROCNT?: { quantity: number };
    CHOCDF?: { quantity: number };
    FAT?: { quantity: number };
  };
}

interface UsdaFood {
  foodNutrients: { nutrientId: number; value: number }[];
}

interface UsdaResponse {
  foods: UsdaFood[];
}

const CEROS: IMacrosReceta = { calorias: 0, proteinas: 0, carbos: 0, grasas: 0 };

function gramos(cantidad: number, unidad: string): number {
  const u = unidad.toLowerCase().trim();
  if (u === "kg") return cantidad * 1000;
  if (u === "l" || u === "litro" || u === "litros") return cantidad * 1000;
  if (u === "ml" || u === "cc") return cantidad;
  if (u === "tsp" || u === "cucharadita") return cantidad * 5;
  if (u === "tbsp" || u === "cucharada" || u === "cucharadas") return cantidad * 15;
  if (u === "taza" || u === "cup") return cantidad * 240;
  if (u === "unidad" || u === "unidades" || u === "ud" || u === "pieza" || u === "piezas") return cantidad * 100;
  return cantidad;
}

async function calcularMacrosEdamam(
  ingredientes: { nombre: string; cantidad: number; unidad: string }[],
): Promise<IMacrosReceta | null> {
  const appId = process.env.EDAMAM_APP_ID;
  const appKey = process.env.EDAMAM_APP_KEY;
  if (!appId || !appKey) return null;

  try {
    const ingr = ingredientes.map((i) => `${i.cantidad}${i.unidad} ${i.nombre}`);
    const { data } = await axios.post<EdamamResponse>(
      EDAMAM_URL,
      { ingr },
      { params: { app_id: appId, app_key: appKey }, timeout: 8000 },
    );
    return {
      calorias: Math.round(data.calories ?? 0),
      proteinas: Math.round(data.totalNutrients?.PROCNT?.quantity ?? 0),
      carbos: Math.round(data.totalNutrients?.CHOCDF?.quantity ?? 0),
      grasas: Math.round(data.totalNutrients?.FAT?.quantity ?? 0),
    };
  } catch {
    return null;
  }
}

async function calcularMacrosUSDA(
  ingredientes: { nombre: string; cantidad: number; unidad: string }[],
): Promise<IMacrosReceta | null> {
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) return null;

  let calorias = 0, proteinas = 0, carbos = 0, grasas = 0;

  for (const ing of ingredientes) {
    try {
      const { data } = await axios.get<UsdaResponse>(USDA_URL, {
        params: {
          query: ing.nombre,
          api_key: apiKey,
          pageSize: 1,
          dataType: "Foundation,SR Legacy",
        },
        timeout: 5000,
      });

      const food = data.foods?.[0];
      if (!food) continue;

      const factorPor100g = gramos(ing.cantidad, ing.unidad) / 100;
      const get = (id: number) =>
        food.foodNutrients.find((n) => n.nutrientId === id)?.value ?? 0;

      calorias += get(1008) * factorPor100g;
      proteinas += get(1003) * factorPor100g;
      carbos += get(1005) * factorPor100g;
      grasas += get(1004) * factorPor100g;
    } catch {
      continue;
    }
  }

  return {
    calorias: Math.round(calorias),
    proteinas: Math.round(proteinas),
    carbos: Math.round(carbos),
    grasas: Math.round(grasas),
  };
}

export async function calcularMacros(
  ingredientes: { nombre: string; cantidad: number; unidad: string }[],
): Promise<IMacrosReceta> {
  if (!ingredientes.length) return CEROS;

  const edamam = await calcularMacrosEdamam(ingredientes);
  if (edamam) return edamam;

  const usda = await calcularMacrosUSDA(ingredientes);
  if (usda) return usda;

  return CEROS;
}
