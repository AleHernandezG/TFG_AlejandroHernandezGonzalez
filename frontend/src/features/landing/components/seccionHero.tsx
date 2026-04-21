'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
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

      {/* ── Carrusel de fondo — crossfade simple ──────────── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={slideActivo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className={`absolute inset-0 bg-gradient-to-br ${slidesHero[slideActivo].gradiente}`}
          >
            <Image
              src={slidesHero[slideActivo].imageUrl}
              alt=""
              fill
              sizes="100vw"
              priority={slideActivo === 0}
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/*
          Las imágenes son fotografía de producto sobre fondo blanco/claro.
          Se necesitan 2 capas de oscurecimiento para garantizar legibilidad:
          1. Tinte plano al 50% — oscurece uniformemente toda la imagen
          2. Gradiente bottom-up — refuerza extra en la zona del texto central
        */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10" />
      </div>

      {/* ── Aria live para lectores de pantalla ───────────── */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {`Slide ${slideActivo + 1} de ${slidesHero.length}: ${slidesHero[slideActivo].etiqueta}`}
      </span>

      {/* ── Contenido principal + CTAs ───────────────────────────── */}
      <motion.div
        variants={contenedorContenido}
        initial="hidden"
        animate="show"
        className="relative z-10 flex w-full max-w-4xl flex-col items-center px-6 text-center md:px-12"
      >
        {/* Titular principal
            Tipografía A+D: texto blanco puro + drop-shadow fuerte.
            "cocinando" y "Cookr" en naranja sólido (bg-clip-text pierde contraste sobre oscuro).
        */}
        <motion.h1
          variants={elemento}
          style={{
            filter:
              'drop-shadow(0 2px 12px rgba(0,0,0,0.9)) drop-shadow(0 4px 32px rgba(0,0,0,0.65))',
          }}
          className="text-balance text-[2.25rem] font-bold leading-[1.2] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[4.25rem] xl:text-[5rem]"
        >
          Disfruta{' '}
          <span className="font-black italic text-brand">cocinando</span> con nuevas{' '}
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
          {/* Naranja sólido — el gradient clip-text pierde contraste sobre overlays oscuros */}
          <span className="text-brand">Cookr</span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          variants={elemento}
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}
          className="mx-auto mt-5 max-w-2xl text-balance text-sm leading-relaxed text-white/75 sm:mt-7 sm:text-base md:text-lg lg:text-xl"
        >
          Descubre ideas según tus gustos,{' '}
          <span className="font-semibold text-white/90">comparte tus recetas</span> y conéctate
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
            className="border-white/25 bg-white/10 hover:bg-white/20 h-11 w-full rounded-full px-8 text-base text-white backdrop-blur-sm transition-all hover:scale-105 sm:h-12 sm:w-auto sm:min-w-[200px] sm:px-10 lg:h-14 lg:min-w-[220px] lg:px-12 lg:text-lg"
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
            aria-current={i === slideActivo ? 'true' : undefined}
            className={`rounded-full transition-all duration-500 ease-out ${
              i === slideActivo
                ? 'h-2 w-7 bg-brand shadow-[0_0_12px_rgba(var(--brand),0.6)]'
                : 'h-2 w-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
