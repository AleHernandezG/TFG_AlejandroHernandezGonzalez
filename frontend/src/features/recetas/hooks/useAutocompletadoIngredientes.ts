'use client'

import { useEffect, useRef, useState } from 'react'
import { buscarIngredientes, type DatoIngrediente } from '@/config/ingredientes'
import { ingredientesService } from '@/services/ingredientesService'
import { useIngredientesCustomStore } from '@/stores/ingredientesCustomStore'

export function useAutocompletadoIngredientes(query: string) {
  const [sugerencias, setSugerencias] = useState<DatoIngrediente[]>([])
  const [cargando, setCargando] = useState(false)
  const [esFallback, setEsFallback] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const buscarEnCustom = useIngredientesCustomStore((s) => s.buscarEnCustom)

  useEffect(() => {
    clearTimeout(debounceRef.current)

    if (query.length < 2) {
      setSugerencias([])
      return
    }

    const locales = buscarIngredientes(query)
    const custom = buscarEnCustom(query)
    const combinados = [
      ...locales,
      ...custom.filter((c) => !locales.some((l) => l.nombre === c.nombre)),
    ]

    if (combinados.length >= 3) {
      setSugerencias(combinados)
      setEsFallback(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setCargando(true)
      try {
        const externos = await ingredientesService.buscarEdamam(query)
        setSugerencias([...combinados, ...externos])
        setEsFallback(externos.length > 0)
      } finally {
        setCargando(false)
      }
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [query, buscarEnCustom])

  return { sugerencias, cargando, esFallback }
}
