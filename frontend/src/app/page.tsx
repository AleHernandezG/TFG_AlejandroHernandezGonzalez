"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChefHat, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { landingFeatures, landingStats } from "@/lib/mocks/landing";

const iconMap = {
  chef: ChefHat,
  social: Users,
  ai: Sparkles,
} as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#fff8ef,_#fff2df_36%,_#fff_70%)] px-4 pb-16 pt-8 md:px-10 md:pt-14">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-8 right-0 h-48 w-48 rounded-full bg-[#ffc68a]/35 blur-3xl md:h-72 md:w-72"
      />

      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-5xl"
      >
        <motion.header
          variants={item}
          className="flex items-center justify-between rounded-2xl border border-[#3f2a1f]/10 bg-white/70 px-3 py-2 backdrop-blur"
        >
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2f1f15] text-white">
              <ChefHat className="h-4 w-4" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-[#2f1f15]">Gastronomica</p>
          </div>

          <Button asChild size="sm" variant="ghost" className="text-[#3f2a1f]">
            <Link href="/login">Iniciar sesion</Link>
          </Button>
        </motion.header>

        <div className="mt-5 grid grid-cols-1 gap-5 md:mt-7 md:grid-cols-[1.15fr_0.85fr] md:items-center">
          <motion.div variants={container} className="order-2 md:order-1">
            <motion.p
              variants={item}
              className="inline-flex rounded-full border border-[#3f2a1f]/15 bg-white/70 px-3 py-1 text-xs font-medium tracking-wide text-[#6d4630] backdrop-blur"
            >
              Red social gastronomica con IA
            </motion.p>

            <motion.h1
              variants={item}
              className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-[#2f1f15] md:text-6xl"
            >
              Cocina mejor cada dia con recetas, comunidad y ayuda inteligente.
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-4 max-w-xl text-sm leading-relaxed text-[#5e4a3f] md:text-base"
            >
              Descubre ideas segun tus gustos, comparte tus platos y recibe
              sugerencias personalizadas para transformar lo que tienes en la
              nevera en tu siguiente receta favorita.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
            >
              <Button asChild size="lg" className="h-11 bg-[#2f1f15] px-6 text-white">
                <Link href="/register" className="inline-flex items-center gap-2">
                  Crear cuenta
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 border-[#6d4630]/25 bg-white/70 px-6 text-[#3f2a1f]"
              >
                <Link href="/login">Ya tengo cuenta</Link>
              </Button>
            </motion.div>

            <motion.ul
              variants={container}
              className="mt-6 grid grid-cols-3 gap-3 rounded-xl border border-[#3f2a1f]/10 bg-white/65 p-3 text-center backdrop-blur"
            >
              {landingStats.map((stat) => (
                <motion.li variants={item} key={stat.label} className="py-2">
                  <p className="text-lg font-semibold text-[#2f1f15] md:text-xl">{stat.value}</p>
                  <p className="text-[11px] text-[#6d4630] md:text-xs">{stat.label}</p>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            variants={item}
            className="order-1 mx-auto w-full max-w-[300px] rounded-[1.75rem] border border-[#3f2a1f]/15 bg-white/80 p-3 shadow-md backdrop-blur md:order-2"
          >
            <div className="rounded-[1.2rem] border border-[#3f2a1f]/10 bg-[#fff8ef] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[#6d4630]">
                Preview app
              </p>
              <h2 className="mt-2 text-base font-semibold text-[#2f1f15]">
                Tu menu de hoy
              </h2>
              <div className="mt-4 space-y-2">
                <div className="h-12 rounded-xl bg-white ring-1 ring-[#3f2a1f]/10" />
                <div className="h-12 rounded-xl bg-white ring-1 ring-[#3f2a1f]/10" />
                <div className="h-12 rounded-xl bg-white ring-1 ring-[#3f2a1f]/10" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
        className="mx-auto mt-10 grid w-full max-w-5xl grid-cols-1 gap-4 md:mt-12 md:grid-cols-3"
      >
        {landingFeatures.map((feature) => {
          const Icon = iconMap[feature.icon];

          return (
            <motion.div variants={item} key={feature.id}>
              <Card className="h-full border border-[#3f2a1f]/10 bg-white/75 py-0 shadow-sm backdrop-blur transition-transform duration-300 hover:-translate-y-0.5">
                <CardHeader className="pb-2 pt-4">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#ffe3c2] text-[#5c3928]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <CardTitle className="pt-2 text-base text-[#2f1f15]">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-[#6d4630]">
                    {feature.subtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4 text-sm leading-relaxed text-[#4f382b]">
                  {feature.description}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.section>
    </main>
  );
}
