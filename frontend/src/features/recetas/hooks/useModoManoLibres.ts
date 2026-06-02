'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useModoManoLibres() {
  const [activo, setActivo] = useState(false)
  const [pasoActual, setPasoActual] = useState(0)
  const [pausado, setPausado] = useState(false)
  const [soportado, setSoportado] = useState(false)

  const pasosRef = useRef<string[]>([])
  const pasoActualRef = useRef(0)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    setSoportado(typeof window !== 'undefined' && 'speechSynthesis' in window)
  }, [])

  const leerPaso = useCallback((indice: number) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()

    const texto = pasosRef.current[indice]
    if (!texto) return

    const utterance = new SpeechSynthesisUtterance(`Paso ${indice + 1}. ${texto}`)
    utterance.lang = 'es-ES'
    utterance.rate = 0.9

    utterance.onend = () => {
      const sig = pasoActualRef.current + 1
      if (sig < pasosRef.current.length) {
        pasoActualRef.current = sig
        setPasoActual(sig)
        leerPaso(sig)
      }
    }

    window.speechSynthesis.speak(utterance)
  }, [])

  const iniciar = useCallback(
    async (pasos: string[]) => {
      if (!soportado || pasos.length === 0) return
      pasosRef.current = pasos
      pasoActualRef.current = 0
      setPasoActual(0)
      setPausado(false)
      setActivo(true)

      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as Navigator & { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen')
        }
      } catch {}

      leerPaso(0)
    },
    [soportado, leerPaso],
  )

  const pausar = useCallback(() => {
    window.speechSynthesis?.pause()
    setPausado(true)
  }, [])

  const reanudar = useCallback(() => {
    window.speechSynthesis?.resume()
    setPausado(false)
  }, [])

  const irAPaso = useCallback(
    (indice: number) => {
      pasoActualRef.current = indice
      setPasoActual(indice)
      setPausado(false)
      leerPaso(indice)
    },
    [leerPaso],
  )

  const siguiente = useCallback(() => {
    const sig = pasoActualRef.current + 1
    if (sig < pasosRef.current.length) irAPaso(sig)
  }, [irAPaso])

  const anterior = useCallback(() => {
    const ant = pasoActualRef.current - 1
    if (ant >= 0) irAPaso(ant)
  }, [irAPaso])

  const detener = useCallback(() => {
    window.speechSynthesis?.cancel()
    wakeLockRef.current?.release().catch(() => {})
    wakeLockRef.current = null
    setActivo(false)
    setPausado(false)
    setPasoActual(0)
    pasoActualRef.current = 0
  }, [])

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
      wakeLockRef.current?.release().catch(() => {})
    }
  }, [])

  return { activo, pasoActual, pausado, soportado, iniciar, pausar, reanudar, siguiente, anterior, detener }
}
