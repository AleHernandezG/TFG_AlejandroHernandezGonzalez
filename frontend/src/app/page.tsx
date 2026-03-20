"use client";

import { motion } from "framer-motion";
import { HeroSection, FeaturesBento, TestimonialsBento } from "@/features/landing/components";
import { LandingFooter } from "@/components/common/landing-footer";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background">
      {/* Hero — full viewport, no container constraints */}
      <HeroSection />

      {/* Content sections — padding lateral generoso para que los bordes de las cards no se corten */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.05 }}
        className="mx-auto w-full max-w-5xl px-5 md:px-10"
      >
        <TestimonialsBento />
        <FeaturesBento />
      </motion.div>

      <LandingFooter />
    </main>
  );
}
