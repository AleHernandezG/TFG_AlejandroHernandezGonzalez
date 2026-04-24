export type DatoIngrediente = {
  nombre: string
  alergenos: string[]
}

export const INGREDIENTES_COMUNES: DatoIngrediente[] = [
  { nombre: 'Harina de trigo', alergenos: ['cereales'] },
  { nombre: 'Huevo', alergenos: ['huevo'] },
  { nombre: 'Leche', alergenos: ['lacteos'] },
  { nombre: 'Mantequilla', alergenos: ['lacteos'] },
  { nombre: 'Queso', alergenos: ['lacteos'] },
  { nombre: 'Nata', alergenos: ['lacteos'] },
  { nombre: 'Yogur', alergenos: ['lacteos'] },
  { nombre: 'Almendra', alergenos: ['frutosSecos'] },
  { nombre: 'Nuez', alergenos: ['frutosSecos'] },
  { nombre: 'Avellana', alergenos: ['frutosSecos'] },
  { nombre: 'Cacahuete', alergenos: ['cacahuetes'] },
  { nombre: 'Salmón', alergenos: ['pescado'] },
  { nombre: 'Atún', alergenos: ['pescado'] },
  { nombre: 'Bacalao', alergenos: ['pescado'] },
  { nombre: 'Gamba', alergenos: ['crustaceos'] },
  { nombre: 'Langostino', alergenos: ['crustaceos'] },
  { nombre: 'Mejillón', alergenos: ['moluscos'] },
  { nombre: 'Calamar', alergenos: ['moluscos'] },
  { nombre: 'Tofu', alergenos: ['soja'] },
  { nombre: 'Salsa de soja', alergenos: ['soja', 'cereales'] },
  { nombre: 'Mostaza', alergenos: ['mostaza'] },
  { nombre: 'Sésamo', alergenos: ['sesamo'] },
  { nombre: 'Apio', alergenos: ['apio'] },
  { nombre: 'Altramuz', alergenos: ['altramuz'] },
  { nombre: 'Vino tinto', alergenos: ['sulfitos'] },
  { nombre: 'Vino blanco', alergenos: ['sulfitos'] },
  { nombre: 'Pollo', alergenos: [] },
  { nombre: 'Cebolla', alergenos: [] },
  { nombre: 'Ajo', alergenos: [] },
  { nombre: 'Tomate', alergenos: [] },
]

export const NOMBRES_INGREDIENTES = INGREDIENTES_COMUNES.map((i) => i.nombre)
