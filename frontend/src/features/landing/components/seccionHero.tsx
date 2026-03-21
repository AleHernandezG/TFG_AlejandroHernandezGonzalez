'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { slidesHero } from '@/features/landing/data/datosLanding'

const contenedorContenido = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
}

const elemento = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

export function SeccionHero() {
  const [slideActivo, setSlideActivo] = useState(0)

  const siguienteSlide = useCallback(() => {
    setSlideActivo((prev) => (prev + 1) % slidesHero.length)
  }, [])

  useEffect(() => {
    const temporizador = setInterval(siguienteSlide, 5000)
    return () => clearInterval(temporizador)
  }, [siguienteSlide])

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
      {/* ── Carrusel de fondo ─────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={slideActivo}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
            className={`absolute inset-0 bg-gradient-to-br ${slidesHero[slideActivo].gradiente}`}
          >
            {/* Emoji decorativo de fondo */}
            <span
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[32rem] opacity-10 blur-2xl"
              role="presentation"
              aria-hidden
            >
              {slidesHero[slideActivo].emoji}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Capas de overlay para legibilidad del texto */}
        <div className="bg-background/25 absolute inset-0" />
        <div className="from-background/5 to-background/75 absolute inset-0 bg-gradient-to-b via-transparent" />
        <div className="from-background/20 to-background/20 absolute inset-0 bg-gradient-to-r via-transparent" />
      </div>

      {/* ── Contenido principal + CTAs ───────────────────────────── */}
      <motion.div
        variants={contenedorContenido}
        initial="hidden"
        animate="show"
        className="relative z-10 flex w-full max-w-4xl flex-col items-center px-6 text-center md:px-12"
      >
        {/* Titular principal */}
        <motion.h1
          variants={elemento}
          className="text-balance text-4xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[5rem]"
        >
          Cocina mejor cada día con recetas, comunidad y ayuda inteligente.
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          variants={elemento}
          className="mx-auto mt-7 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground md:text-lg lg:text-xl"
        >
          Descubre ideas según tus gustos, comparte tus platos y recibe sugerencias personalizadas
          para transformar lo que tienes en la nevera en tu siguiente receta favorita.
        </motion.p>

        {/* Botones de acción */}
        <motion.div
          variants={elemento}
          className="mt-12 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="shadow-brand/20 hover:shadow-brand/30 h-16 min-w-[220px] rounded-full px-12 text-lg font-semibold shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            <Link href="/registro" className="inline-flex items-center gap-3">
              Crear cuenta hoy
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border/60 bg-card/50 hover:bg-card/70 h-16 min-w-[220px] rounded-full px-12 text-lg backdrop-blur-sm transition-all hover:scale-105"
          >
            <Link href="/login">Ya tengo cuenta</Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* ── Indicadores de slide ────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {slidesHero.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => setSlideActivo(i)}
            aria-label={`Ver slide: ${slide.etiqueta}`}
            className={`rounded-full transition-all duration-500 ease-out ${
              i === slideActivo
                ? 'h-2 w-7 bg-brand shadow-[0_0_12px_rgba(var(--brand),0.6)]'
                : 'bg-foreground/20 hover:bg-foreground/40 h-2 w-2'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
