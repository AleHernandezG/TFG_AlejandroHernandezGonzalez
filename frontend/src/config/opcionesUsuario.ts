/**
 * Listas estáticas de opciones de perfil de usuario.
 * Fuente de verdad — nunca se calculan dinámicamente.
 * Importar siempre desde este fichero, nunca inline.
 */

export const ALERGENOS_OPCIONES = [
  { id: 'cereales', label: 'Cereales', icono: '/alergenos/cereales.webp' },
  { id: 'lacteos', label: 'Lácteos', icono: '/alergenos/lacteos.webp' },
  { id: 'huevo', label: 'Huevo', icono: '/alergenos/huevo.webp' },
  { id: 'frutosSecos', label: 'Frutos secos', icono: '/alergenos/frutos-secos.webp' },
  { id: 'pescado', label: 'Pescado', icono: '/alergenos/pescado.webp' },
  { id: 'crustaceos', label: 'Marisco', icono: '/alergenos/crustaceo.webp' },
  { id: 'soja', label: 'Soja', icono: '/alergenos/soja.webp' },
  { id: 'cacahuetes', label: 'Cacahuetes', icono: '/alergenos/cacahuetes.webp' },
  { id: 'mostaza', label: 'Mostaza', icono: '/alergenos/mostaza.webp' },
  { id: 'sesamo', label: 'Sésamo', icono: '/alergenos/sesamo.webp' },
  { id: 'apio', label: 'Apio', icono: '/alergenos/apio.webp' },
  { id: 'sulfitos', label: 'Sulfitos', icono: '/alergenos/sulfitos.webp' },
  { id: 'moluscos', label: 'Moluscos', icono: '/alergenos/moluscos.webp' },
  { id: 'altramuz', label: 'Altramuz', icono: '/alergenos/altramuz.webp' },
] as const

export const DIETAS_OPCIONES = [
  { id: 'vegetariano', label: 'Vegetariano' },
  { id: 'vegano', label: 'Vegano' },
  { id: 'keto', label: 'Keto' },
  { id: 'sinGluten', label: 'Sin gluten' },
  { id: 'mediterranea', label: 'Mediterránea' },
  { id: 'paleo', label: 'Paleo' },
  { id: 'sinLactosa', label: 'Sin lactosa' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
  { id: 'bajoEnCalorias', label: 'Bajo en calorías' },
  { id: 'altoEnProteinas', label: 'Alto en proteínas' },
  { id: 'lowCarb', label: 'Low carb' },
] as const

export type IdAlergeno = (typeof ALERGENOS_OPCIONES)[number]['id']
export type IdDieta = (typeof DIETAS_OPCIONES)[number]['id']
