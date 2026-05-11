import type { ItemDespensa } from '../types/despensa.types'

export const DATOS_DESPENSA_MOCK: ItemDespensa[] = [
  { id: '1',  nombre: 'Tomates',          cantidad: 4,   unidad: 'unidad', emoji: '🍅' },
  { id: '2',  nombre: 'Cebolla',          cantidad: 2,   unidad: 'unidad', emoji: '🧅' },
  { id: '3',  nombre: 'Ajo',              cantidad: 1,   unidad: 'cabeza', emoji: '🧄' },
  { id: '4',  nombre: 'Zanahorias',       cantidad: 500, unidad: 'g',      emoji: '🥕' },
  { id: '5',  nombre: 'Arroz blanco',     cantidad: 1,   unidad: 'kg',     emoji: '🍚' },
  { id: '6',  nombre: 'Huevos',           cantidad: 12,  unidad: 'unidad', emoji: '🥚' },
  { id: '7',  nombre: 'Aceite de oliva',  cantidad: 500, unidad: 'ml',     emoji: '🫒' },
  { id: '8',  nombre: 'Queso parmesano',  cantidad: 200, unidad: 'g',      emoji: '🧀' },
  { id: '9',  nombre: 'Leche',            cantidad: 1,   unidad: 'l',      emoji: '🥛' },
  { id: '10', nombre: 'Mantequilla',      cantidad: 250, unidad: 'g',      emoji: '🧈' },
  { id: '11', nombre: 'Perejil',          cantidad: 1,   unidad: 'rama',   emoji: '🌿' },
  { id: '12', nombre: 'Limón',            cantidad: 3,   unidad: 'unidad', emoji: '🍋' },
]

export const EMOJIS_INGREDIENTES: Record<string, string> = {
  'tomate': '🍅', 'tomates': '🍅',
  'cebolla': '🧅', 'cebollas': '🧅',
  'ajo': '🧄', 'ajos': '🧄',
  'zanahoria': '🥕', 'zanahorias': '🥕',
  'arroz': '🍚', 'arroz blanco': '🍚',
  'huevo': '🥚', 'huevos': '🥚',
  'aceite de oliva': '🫒', 'aceite': '🫒', 'oliva': '🫒',
  'queso': '🧀', 'queso parmesano': '🧀', 'mozzarella': '🧀', 'queso cheddar': '🧀',
  'leche': '🥛', 'nata': '🥛',
  'mantequilla': '🧈', 'yogur': '🧈',
  'perejil': '🌿', 'albahaca': '🌿', 'orégano': '🌿', 'espinacas': '🌿', 'cilantro': '🌿',
  'limón': '🍋', 'limones': '🍋', 'naranja': '🍊',
  'patata': '🥔', 'patatas': '🥔',
  'pimiento': '🫑', 'pimientos': '🫑',
  'pollo': '🍗', 'muslos de pollo': '🍗', 'pechuga de pollo': '🍗',
  'carne': '🥩', 'ternera': '🥩', 'cerdo': '🥩',
  'salmón': '🐟', 'atún': '🐟', 'bacalao': '🐟',
  'gambas': '🦐', 'mejillones': '🦪',
  'pasta': '🍝', 'espaguetis': '🍝', 'macarrones': '🍝',
  'harina': '🌾', 'harina de trigo': '🌾', 'pan': '🍞',
  'azúcar': '🍬', 'sal': '🧂', 'miel': '🍯',
  'brócoli': '🥦', 'lechuga': '🥬', 'pepino': '🥒',
  'manzana': '🍎', 'pera': '🍐', 'plátano': '🍌', 'fresa': '🍓',
  'aguacate': '🥑', 'maíz': '🌽', 'champiñón': '🍄', 'champiñones': '🍄',
  'limón exprimido': '🍋', 'zumo de limón': '🍋',
}

export function getEmojiIngrediente(nombre: string): string {
  return EMOJIS_INGREDIENTES[nombre.toLowerCase()] ?? '🥘'
}
