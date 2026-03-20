"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
} as const;

export function LandingHeader() {
  return (
    <motion.header
      variants={item}
      className="flex items-center justify-between rounded-2xl border border-border bg-card/70 px-3 py-2 backdrop-blur-sm"
    >
      <div className="inline-flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <ChefHat className="h-4 w-4" aria-hidden />
        </span>
        <p className="text-sm font-semibold text-foreground">Gastronómica</p>
      </div>

      <Button asChild size="sm" variant="ghost" className="text-muted-foreground">
        <Link href="/login">Iniciar sesión</Link>
      </Button>
    </motion.header>
  );
}
