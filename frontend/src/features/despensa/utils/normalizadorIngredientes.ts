import { INGREDIENTES_COMUNES, obtenerIngrediente } from '@/config/ingredientes'

type IngredienteEscaneado = { nombre: string; cantidad: number; unidad: string }

// Lista de marcas españolas y términos comerciales comunes a omitir en la limpieza
const MARCAS_Y_RELLENO = [
  'hacendado', 'carrefour', 'la lechera', 'solis', 'orlando', 'pescanova',
  'gallo', 'casa tarradellas', 'danone', 'el pozo', 'campofrio', 'asturiana',
  'pascual', 'don simon', 'navidul', 'buitoni', 'ybarra', 'maizena', 'heinz',
  'carbonell', 'koipesol', 'gullon', 'cuetara', 'milka', 'nestle', 'el caserio',
  'philadelphia', 'president', 'el ventero', 'dia', 'lidl', 'mercadona', 'aldi',
  'pack', 'promo', 'ahorro', 'oferta', 'super', 'bio', 'eco'
]

/**
 * Limpia y normaliza el nombre de un ingrediente eliminando ruido, paréntesis y marcas conocidas.
 */
function limpiarNombre(nombre: string): string {
  let limpio = nombre.toLowerCase();
  
  // Eliminar texto entre paréntesis o corchetes (ej. "Flan de huevo (pack de 4)")
  limpio = limpio.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '');
  
  // Quitar caracteres especiales y dejar solo letras, números y espacios
  limpio = limpio.replace(/[^a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s]/g, ' ');
  
  // Limpiar marcas comunes y palabras de relleno
  MARCAS_Y_RELLENO.forEach(marca => {
    const regex = new RegExp(`\\b${marca}\\b`, 'gi');
    limpio = limpio.replace(regex, '');
  });
  
  return limpio.replace(/\s+/g, ' ').trim();
}

/**
 * Busca similitudes con la lista de ingredientes comunes locales para homologar el nombre.
 */
export function normalizarNombreIngrediente(nombreOriginal: string): string {
  const limpio = limpiarNombre(nombreOriginal);
  if (!limpio) return nombreOriginal; // Fallback al original si la limpieza vacía la cadena
  
  // 1. Coincidencia exacta o por alias
  const coincidenciaDirecta = obtenerIngrediente(limpio);
  if (coincidenciaDirecta) {
    return coincidenciaDirecta.nombre;
  }
  
  // 2. Coincidencia por subcadena en la lista local
  // Ordenamos de mayor a menor longitud para priorizar nombres más específicos (ej. "aceite de oliva" antes que "aceite")
  const coincidenciaContenida = INGREDIENTES_COMUNES
    .filter(i => {
      const nomIng = i.nombre.toLowerCase();
      return limpio.includes(nomIng) || i.aliases.some(alias => limpio.includes(alias.toLowerCase()));
    })
    .sort((a, b) => b.nombre.length - a.nombre.length)[0];
    
  if (coincidenciaContenida) {
    return coincidenciaContenida.nombre;
  }
  
  // 3. Fallback: Devolver el texto limpio con la primera letra en mayúscula
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

/**
 * Normaliza las unidades estándar y convierte unidades compatibles para poder sumar cantidades.
 */
function normalizarUnidadYCantidad(cantidad: number, unidad: string): { cantidad: number, unidad: string } {
  const u = unidad.toLowerCase().trim();
  
  // g / kg
  if (u === 'kg' || u === 'kilo' || u === 'kilos') {
    return { cantidad: cantidad * 1000, unidad: 'g' };
  }
  // l / ml
  if (u === 'l' || u === 'litro' || u === 'litros') {
    return { cantidad: cantidad * 1000, unidad: 'ml' };
  }
  // u / ud / uds / unidad / unidades
  if (['u', 'ud', 'uds', 'unidad', 'unidades'].includes(u)) {
    return { cantidad, unidad: 'unidad' };
  }
  
  return { cantidad, unidad: u };
}

/**
 * Procesa la lista de ingredientes escaneados: normaliza nombres y agrupa duplicados sumando sus cantidades.
 */
export function normalizarYAgruparIngredientes(ingredientes: IngredienteEscaneado[]): IngredienteEscaneado[] {
  const mapa = new Map<string, IngredienteEscaneado>();

  for (const ing of ingredientes) {
    // A. Normalizar nombre (quitar marcas y mapear a base local)
    const nombreNormalizado = normalizarNombreIngrediente(ing.nombre);
    
    // B. Normalizar unidades para poder sumar compatibles (ej: kg -> g)
    const { cantidad: cantNorm, unidad: uniNorm } = normalizarUnidadYCantidad(ing.cantidad, ing.unidad);

    const clave = `${nombreNormalizado.toLowerCase()}|${uniNorm}`;

    if (mapa.has(clave)) {
      const existente = mapa.get(clave)!;
      existente.cantidad += cantNorm;
    } else {
      mapa.set(clave, {
        nombre: nombreNormalizado,
        cantidad: cantNorm,
        unidad: uniNorm
      });
    }
  }

  return Array.from(mapa.values());
}
