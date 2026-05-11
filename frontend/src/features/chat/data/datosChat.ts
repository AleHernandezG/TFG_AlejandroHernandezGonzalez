import type { ChipSugerido } from '@/features/chat/types/chat.types'

export const CHIPS_SUGERIDOS: ChipSugerido[] = [
  { id: 'cocinar-hoy',          texto: '¿Qué cocino hoy?',          icono: '🍽️' },
  { id: 'receta-ingredientes',  texto: 'Receta con lo que tengo',   icono: '🧺' },
  { id: 'sin-gluten',           texto: 'Dieta sin gluten',          icono: '🚫' },
]

const RESPUESTAS_MOCK: Record<string, string> = {
  '¿Qué cocino hoy?':
    'Con los ingredientes típicos de una cocina española te recomiendo una Tortilla de Patata Cremosa. Es rápida, nutritiva y llena de sabor. ¿Quieres que te guíe paso a paso?',
  'Receta con lo que tengo':
    '¡Perfecto! Cuéntame qué ingredientes tienes a mano y te sugiero la mejor receta. También puedes añadirlos en tu despensa de Cookr para que yo los recuerde la próxima vez 🧺',
  'Dieta sin gluten':
    'Hay muchas opciones deliciosas sin gluten. Desde arroz con verduras hasta carnes a la plancha o ensaladas de legumbres. ¿Prefieres algo rápido para el día a día o una receta especial?',
}

const RESPUESTA_DEFAULT =
  '¡Hola! Soy Cookr IA, tu asistente culinario personal. Puedo ayudarte a encontrar recetas, adaptar platos a tus preferencias o darte ideas según lo que tengas en casa. ¿En qué te puedo ayudar hoy?'

export function getMockRespuesta(mensaje: string): string {
  return RESPUESTAS_MOCK[mensaje] ?? RESPUESTA_DEFAULT
}
