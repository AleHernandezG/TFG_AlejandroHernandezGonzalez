'use client'

import { useFormContext, useWatch } from 'react-hook-form'
import { detectarAlergenos } from '@/features/recetas/utils/detectarAlergenos'
import type { DatosCrearReceta } from '@/features/recetas/types/crearReceta.schema'
import { SeccionAlergenos } from '../seccionAlergenos'

export function PasoAlergenos() {
  const { control } = useFormContext<DatosCrearReceta>()
  const ingredientes = useWatch({ control, name: 'ingredientes' })
  const detectados = detectarAlergenos((ingredientes ?? []).map((i) => i.nombre).filter(Boolean))

  return <SeccionAlergenos alergenosDetectados={detectados} />
}
