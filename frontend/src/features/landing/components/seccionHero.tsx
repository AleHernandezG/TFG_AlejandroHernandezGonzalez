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
          className="text-balance text-[2.25rem] font-bold leading-[1.2] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[4.25rem] xl:text-[5rem]"
        >
          Disfruta {/* "cocinando" — italic bold brand color: énfasis en la acción */}
          <span className="font-black italic text-brand">cocinando</span> con nuevas{' '}
          {/* "recetas" — subrayado wavy SVG (patrón Notion / Framer) */}
          <span className="relative inline-block">
            recetas
            <svg
              aria-hidden
              className="absolute -bottom-1 left-0 w-full overflow-visible"
              height="8"
              viewBox="0 0 100 8"
              preserveAspectRatio="none"
            >
              <path
                d="M0,5 Q25,1 50,5 Q75,9 100,5"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>{' '}
          y una amplia comunidad{' '}
          {/* "Cookr" — gradiente brand→brand-muted: nombre de marca destacado */}
          <span className="bg-gradient-to-r from-brand to-brand-muted bg-clip-text text-transparent">
            Cookr
          </span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          variants={elemento}
          className="mx-auto mt-5 max-w-2xl text-balance text-sm leading-relaxed text-muted-foreground sm:mt-7 sm:text-base md:text-lg lg:text-xl"
        >
          Descubre ideas según tus gustos,{' '}
          <span className="text-foreground/80 font-semibold">comparte tus recetas</span> y conéctate
          con otros amantes de la cocina. ¡Únete a la comunidad gastronómica más sabrosa y creativa!
        </motion.p>

        {/* Botones de acción */}
        <motion.div
          variants={elemento}
          className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:mt-11 sm:w-auto sm:flex-row"
        >
          <Button
            asChild
            className="shadow-brand/20 hover:shadow-brand/30 h-11 w-full rounded-full px-8 text-base font-semibold shadow-xl transition-all hover:scale-105 hover:shadow-2xl sm:h-12 sm:w-auto sm:min-w-[200px] sm:px-10 lg:h-14 lg:min-w-[220px] lg:px-12 lg:text-lg"
          >
            <Link href="/registro" className="inline-flex items-center gap-2">
              Crear cuenta hoy
              <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-border/60 bg-card/50 hover:bg-card/70 h-11 w-full rounded-full px-8 text-base backdrop-blur-sm transition-all hover:scale-105 sm:h-12 sm:w-auto sm:min-w-[200px] sm:px-10 lg:h-14 lg:min-w-[220px] lg:px-12 lg:text-lg"
          >
            <Link href="/login">Ya tengo cuenta</Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* ── Indicador de slide ────────────────────────────────── */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-6 lg:bottom-8">
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
