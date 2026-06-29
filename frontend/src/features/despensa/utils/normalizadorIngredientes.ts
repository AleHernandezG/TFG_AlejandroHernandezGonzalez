import { INGREDIENTES_COMUNES } from '@/config/ingredientes'

type IngredienteEscaneado = { nombre: string; cantidad: number; unidad?: string | null }

// Lista de marcas españolas y términos comerciales comunes a omitir en la limpieza
const MARCAS_Y_RELLENO = [
  'hacendado', 'carrefour', 'la lechera', 'solis', 'orlando', 'pescanova',
  'gallo', 'casa tarradellas', 'danone', 'el pozo', 'campofrio', 'asturiana',
  'asturian', 'pascual', 'don simon', 'navidul', 'buitoni', 'ybarra', 'maizena',
  'heinz', 'carbonell', 'koipesol', 'gullon', 'cuetara', 'milka', 'nestle',
  'el caserio', 'philadelphia', 'president', 'el ventero', 'dia', 'lidl',
  'mercadona', 'aldi', 'pack', 'promo', 'ahorro', 'oferta', 'super', 'bio', 'eco'
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
 * Busca si todos los tokens significativos de un ingrediente local están contenidos en el texto escaneado.
 * Esto permite asociar alias u omisiones comunes (ej. "nata de montar" / "nata para montar").
 */
function quitarAcentos(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function sonSimilares(tok1: string, tok2: string): boolean {
  const t1 = quitarAcentos(tok1);
  const t2 = quitarAcentos(tok2);
  if (t1 === t2) return true;
  
  // Para palabras cortas, exigir coincidencia exacta
  if (t1.length < 4 || t2.length < 4) return false;
  
  const lenDiff = Math.abs(t1.length - t2.length);
  if (lenDiff > 1) return false;
  
  if (lenDiff === 1) {
    return t1.includes(t2) || t2.includes(t1);
  }
  
  let diferencias = 0;
  for (let i = 0; i < t1.length; i++) {
    if (t1[i] !== t2[i]) {
      diferencias++;
      if (diferencias > 1) return false;
    }
  }
  return true;
}

function buscarPorTokens(limpio: string): string | null {
  const STOP_WORDS = new Set(['para', 'de', 'con', 'y', 'a', 'la', 'el', 'los', 'las', 'un', 'una', 'en', 'al', 'del']);
  const tokensScanned = limpio.split(/\s+/).filter(t => !STOP_WORDS.has(t) && t.length > 1);
  if (tokensScanned.length === 0) return null;

  let mejorCoincidencia: string | null = null;
  let maxTokensCoincidentes = 0;

  for (const ingrediente of INGREDIENTES_COMUNES) {
    // Limpiar y separar en tokens el nombre del ingrediente común
    const nombreClean = ingrediente.nombre.toLowerCase().replace(/[^a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s]/g, ' ');
    const tokensLocal = nombreClean.split(/\s+/).filter(t => !STOP_WORDS.has(t) && t.length > 1);
    
    if (tokensLocal.length > 0) {
      const todosPresentes = tokensLocal.every(tLocal => 
        tokensScanned.some(tScanned => sonSimilares(tLocal, tScanned))
      );
      if (todosPresentes) {
        if (tokensLocal.length > maxTokensCoincidentes) {
          maxTokensCoincidentes = tokensLocal.length;
          mejorCoincidencia = ingrediente.nombre;
        }
      }
    }

    // Probar también con los alias del ingrediente
    for (const alias of ingrediente.aliases) {
      const aliasClean = alias.toLowerCase().replace(/[^a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s]/g, ' ');
      const tokensAlias = aliasClean.split(/\s+/).filter(t => !STOP_WORDS.has(t) && t.length > 1);
      
      if (tokensAlias.length > 0) {
        const todosPresentes = tokensAlias.every(tAlias => 
          tokensScanned.some(tScanned => sonSimilares(tAlias, tScanned))
        );
        if (todosPresentes) {
          if (tokensAlias.length > maxTokensCoincidentes) {
            maxTokensCoincidentes = tokensAlias.length;
            mejorCoincidencia = ingrediente.nombre;
          }
        }
      }
    }
  }

  return mejorCoincidencia;
}

/**
 * Busca similitudes con la lista de ingredientes comunes locales para homologar el nombre.
 */
export function normalizarNombreIngrediente(nombreOriginal: string): string {
  const limpio = limpiarNombre(nombreOriginal);
  if (!limpio) return nombreOriginal; // Fallback al original si la limpieza vacía la cadena
  
  // 1. Coincidencia exacta o por alias directos (ignorando mayúsculas, espacios y acentos)
  const limpioNorm = quitarAcentos(limpio);
  const coincidenciaDirecta = INGREDIENTES_COMUNES.find(i => 
    quitarAcentos(i.nombre) === limpioNorm ||
    i.aliases.some(alias => quitarAcentos(alias) === limpioNorm)
  );
  if (coincidenciaDirecta) {
    return coincidenciaDirecta.nombre;
  }
  
  // 2. Coincidencia por tokens significativos (evita problemas con conectores omitidos)
  const coincidenciaTokens = buscarPorTokens(limpio);
  if (coincidenciaTokens) {
    return coincidenciaTokens;
  }
  
  // 3. Coincidencia por subcadena en la lista local (ignorando acentos)
  // Ordenamos de mayor a menor longitud para priorizar nombres más específicos (ej. "aceite de oliva" antes que "aceite")
  const coincidenciaContenida = INGREDIENTES_COMUNES
    .filter(i => {
      const nomIng = quitarAcentos(i.nombre);
      const limpioSinAcentos = quitarAcentos(limpio);
      // Evitar que "azúcar glass" coincida con "azúcar" por subcadena
      if (nomIng === 'azucar' && limpioSinAcentos.includes('glas')) {
        return false;
      }
      return limpioSinAcentos.includes(nomIng) || i.aliases.some(alias => limpioSinAcentos.includes(quitarAcentos(alias)));
    })
    .sort((a, b) => b.nombre.length - a.nombre.length)[0];
    
  if (coincidenciaContenida) {
    return coincidenciaContenida.nombre;
  }
  
  // 4. Fallback: Devolver el texto limpio con la primera letra en mayúscula
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

/**
 * Normaliza las unidades estándar y convierte unidades compatibles para poder sumar cantidades.
 */
function normalizarUnidadYCantidad(cantidad: number, unidad?: string | null): { cantidad: number, unidad: string } {
  let u = typeof unidad === 'string' ? unidad.toLowerCase().trim() : '';
  
  if (!u) {
    u = 'unidad';
  }
  
  const PLURAL_A_SINGULAR: Record<string, string> = {
    'sobres': 'sobre',
    'latas': 'lata',
    'bolsas': 'bolsa',
    'dientes': 'diente',
    'hojas': 'hoja',
    'ramas': 'rama',
    'rebanadas': 'rebanada',
    'cucharaditas': 'cucharadita',
    'cucharadas': 'cucharada',
    'tazas': 'taza',
    'pizcas': 'pizca',
    'unidades': 'unidad',
    'kilos': 'kg',
    'kilo': 'kg',
    'litros': 'l',
    'litro': 'l',
    'gramos': 'g',
    'gramo': 'g',
    'mililitros': 'ml',
    'mililitro': 'ml',
    'u': 'unidad',
    'ud': 'unidad',
    'uds': 'unidad'
  };

  if (PLURAL_A_SINGULAR[u]) {
    u = PLURAL_A_SINGULAR[u];
  }
  
  // Validar que la unidad sea conocida en la aplicación; de lo contrario, por seguridad, se asigna 'unidad'
  const UNIDADES_VALIDAS = new Set([
    'g', 'kg', 'mg', 'ml', 'cl', 'dl', 'l', 'cucharadita', 'cucharada',
    'taza', 'pizca', 'unidad', 'diente', 'hoja', 'rama',
    'rebanada', 'lata', 'sobre', 'bolsa', 'al gusto'
  ]);

  if (!UNIDADES_VALIDAS.has(u)) {
    u = 'unidad';
  }

  // Convertir escala
  // g / kg
  if (u === 'kg') {
    return { cantidad: cantidad * 1000, unidad: 'g' };
  }
  // l / ml
  if (u === 'l') {
    return { cantidad: cantidad * 1000, unidad: 'ml' };
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
