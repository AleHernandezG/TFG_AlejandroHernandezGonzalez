"use client";

import { motion } from "framer-motion";
import { ChefHat, Sparkles, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { landingFeatures } from "@/features/landing/data/landing-data";
import type { LandingFeatureIcon } from "@/features/landing/data/landing-data";

const iconMap: Record<LandingFeatureIcon, typeof ChefHat> = {
  chef: ChefHat,
  social: Users,
  ai: Sparkles,
};

const iconGradient: Record<LandingFeatureIcon, string> = {
  chef: "from-amber-400/20 to-orange-300/10 text-amber-600",
  social: "from-sky-400/20 to-blue-300/10 text-sky-600",
  ai: "from-violet-400/20 to-purple-300/10 text-violet-600",
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.14 },
  },
} as const;

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
} as const;

export function FeaturesBento() {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="mt-24 pb-16 md:mt-32 md:pb-24"
    >
      {/* Section heading */}
      <motion.div variants={item} className="mb-12 text-center">
        <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          Funcionalidades
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl lg:text-4xl">
          Todo lo que necesitas para cocinar mejor
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground md:text-base">
          Herramientas pensadas para cada tipo de cocinero, del principiante al experto.
        </p>
      </motion.div>

      {/* Bento grid: hero card (col-span-2) + 2 small cards */}
      <motion.div
        variants={container}
        className="grid grid-cols-1 gap-5 md:grid-cols-3 md:grid-rows-[1fr_1fr]"
      >
        {landingFeatures.map((feature, index) => {
          const Icon = iconMap[feature.icon];
          const gradient = iconGradient[feature.icon];
          const isHero = index === 0;

          return (
            <motion.div
              variants={item}
              key={feature.id}
              className={isHero ? "md:col-span-2 md:row-span-2" : ""}
            >
              <Card
                className={`group relative h-full overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-xl hover:shadow-brand/5 ${
                  isHero ? "flex flex-col justify-between" : ""
                }`}
              >
                {/* Gradient accent on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand/3 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <CardHeader className={`relative ${isHero ? "p-8 md:p-10" : "p-6"}`}>
                  {/* Icon */}
                  <div
                    className={`mb-5 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br p-3.5 ${gradient} ${
                      isHero ? "h-14 w-14" : "h-11 w-11"
                    }`}
                  >
                    <Icon className={isHero ? "h-7 w-7" : "h-5 w-5"} aria-hidden />
                  </div>

                  {/* Subtitle tag */}
                  <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-widest text-brand/70">
                    {feature.subtitle}
                  </span>

                  <CardTitle
                    className={`text-foreground ${
                      isHero ? "text-2xl leading-tight md:text-3xl" : "text-lg leading-snug"
                    }`}
                  >
                    {feature.title}
                  </CardTitle>
                </CardHeader>

                <CardContent
                  className={`relative text-muted-foreground ${
                    isHero
                      ? "px-8 pb-10 text-base leading-relaxed md:px-10 md:text-lg"
                      : "px-6 pb-7 text-sm leading-relaxed"
                  }`}
                >
                  {feature.description}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
