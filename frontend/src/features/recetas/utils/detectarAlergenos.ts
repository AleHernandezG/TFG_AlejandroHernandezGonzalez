import { INGREDIENTES_COMUNES } from '../data/datosIngredientes'

export function detectarAlergenos(nombresIngredientes: string[]): string[] {
  const encontrados = new Set<string>()

  for (const nombre of nombresIngredientes) {
    const normalizado = nombre.toLowerCase().trim()
    for (const ingrediente of INGREDIENTES_COMUNES) {
      if (ingrediente.nombre.toLowerCase().includes(normalizado) || normalizado.includes(ingrediente.nombre.toLowerCase())) {
        ingrediente.alergenos.forEach((a) => encontrados.add(a))
      }
    }
  }

  return Array.from(encontrados)
}
