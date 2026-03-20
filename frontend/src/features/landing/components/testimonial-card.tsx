"use client";

import { motion } from "framer-motion";
import { Heart, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { Testimonial } from "@/features/landing/data/landing-data";

interface TestimonialCardProps {
  testimonial: Testimonial;
  variants?: object;
}

export function TestimonialCard({ testimonial, variants }: TestimonialCardProps) {
  return (
    <motion.div variants={variants} className="h-full">
      <Card className="group relative flex h-full flex-col gap-5 overflow-hidden border-border/40 bg-card/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-xl hover:shadow-brand/5">
        {/* Subtle top accent line */}
        <div className="absolute left-0 top-0 h-[2px] w-0 rounded-full bg-gradient-to-r from-brand/60 to-transparent transition-all duration-500 group-hover:w-full" />

        {/* Quote icon */}
        <Quote className="h-5 w-5 text-brand/30" aria-hidden />

        {/* Comment text */}
        <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground">
          &ldquo;{testimonial.comment}&rdquo;
        </blockquote>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3">
          {/* Avatar + Name */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 shrink-0 border-2 border-brand-subtle shadow-sm">
              <AvatarFallback className="bg-brand-subtle text-xs font-bold text-brand">
                {testimonial.avatarId}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight text-foreground">
                {testimonial.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {testimonial.role}
              </p>
            </div>
          </div>

          {/* Heart rating */}
          <div className="flex shrink-0 items-center gap-0.5" aria-label={`Valoración: ${testimonial.rating} de 5`}>
            {[...Array(5)].map((_, i) => (
              <Heart
                key={i}
                className={`h-3.5 w-3.5 transition-colors ${
                  i < testimonial.rating
                    ? "fill-rose-500 text-rose-500"
                    : "fill-transparent text-muted-foreground/25"
                }`}
              />
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
