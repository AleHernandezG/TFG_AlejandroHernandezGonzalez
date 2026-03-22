"use client";

import { motion } from "framer-motion";
import { TarjetaTestimonio } from "./tarjetaTestimonio";
import { testimoniosLanding } from "@/features/landing/data/datosLanding";

const contenedor = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
} as const;

const elemento = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
} as const;

export function BentoTestimonios() {
  return (
    <motion.section
      variants={contenedor}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      className="mt-24 md:mt-32"
    >
      {/* Encabezado de sección */}
      <motion.div variants={elemento} className="mb-12 text-center">
        <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          Comunidad
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl lg:text-4xl">
          Lo que dicen nuestros usuarios
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground md:text-base">
          Miles de personas ya cocinan mejor con Cookr cada día.
        </p>
      </motion.div>

      {/* Grid bento: 1 col → 2 col → 3 col */}
      <motion.div
        variants={contenedor}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {testimoniosLanding.map((testimonio) => (
          <TarjetaTestimonio
            key={testimonio.id}
            testimonio={testimonio}
            variants={elemento}
          />
        ))}
      </motion.div>
    </motion.section>
  );
}
