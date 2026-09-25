'use client'

import { useCallback, useState } from 'react'
import type { UseFormTrigger } from 'react-hook-form'
import type { DatosCrearReceta } from '@/features/recetas/types/crearReceta.schema'
import { PASOS_ASISTENTE } from './pasos'

export function useAsistenteCrearReceta(trigger: UseFormTrigger<DatosCrearReceta>) {
  const [indice, setIndice] = useState(0)

  const paso = PASOS_ASISTENTE[indice]
  const esUltimo = indice === PASOS_ASISTENTE.length - 1

  const validarPaso = useCallback(async () => {
    if (paso.campos.length === 0) return true
    return trigger(paso.campos, { shouldFocus: true })
  }, [paso, trigger])

  const siguiente = useCallback(async () => {
    const valido = await validarPaso()
    if (valido && !esUltimo) setIndice((i) => i + 1)
    return valido
  }, [validarPaso, esUltimo])

  const atras = useCallback(() => setIndice((i) => Math.max(0, i - 1)), [])

  return {
    paso,
    indice,
    total: PASOS_ASISTENTE.length,
    esPrimero: indice === 0,
    esUltimo,
    siguiente,
    atras,
    irAPaso: setIndice,
  }
}

export type Asistente = ReturnType<typeof useAsistenteCrearReceta>
