"use client";

import { motion } from "framer-motion";
import { SeccionHero, BentoCaracteristicas, BentoTestimonios } from "@/features/landing/components";
import { PiePagina } from "@/components/common/piePagina";

const contenedor = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function PaginaInicio() {
  return (
    <main className="relative min-h-screen bg-[var(--warm-bg)]">
      
      <SeccionHero />
      
      <motion.div
        variants={contenedor}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.05 }}
        className="mx-auto w-full max-w-5xl px-5 md:px-10"
      >
        <BentoTestimonios />
        <BentoCaracteristicas />
      </motion.div>

      <PiePagina />
    </main>
  );
}
