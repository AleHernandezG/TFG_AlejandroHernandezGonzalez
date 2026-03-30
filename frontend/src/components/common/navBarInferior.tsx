'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  ChefHat,
  CircleUserRound,
  Home,
  ShoppingBasket,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type EnlaceNav = {
  href: string
  Icono: LucideIcon
  etiqueta: string
  esCentral: boolean
}

const RUTAS_SIN_NAVBAR = ['/']

const enlaces: EnlaceNav[] = [
  { href: '/home',     Icono: Home,           etiqueta: 'Inicio',   esCentral: false },
  { href: '/despensa', Icono: ShoppingBasket,  etiqueta: 'Despensa', esCentral: false },
  { href: '/chat',     Icono: ChefHat,         etiqueta: 'Cookr IA', esCentral: true  },
  { href: '/discover', Icono: TrendingUp,      etiqueta: 'Discover', esCentral: false },
  { href: '/perfil',   Icono: CircleUserRound, etiqueta: 'Perfil',   esCentral: false },
]

export function NavBarInferior() {
  const rutaActual = usePathname()

  if (RUTAS_SIN_NAVBAR.includes(rutaActual)) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around px-2 py-1">
        {enlaces.map(({ href, Icono, etiqueta, esCentral }) => {
          const estaActivo = rutaActual === href || rutaActual.startsWith(`${href}/`)

          if (esCentral) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 py-1"
              >
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-brand shadow-md"
                  whileTap={{ scale: 0.88 }}
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                >
                  <Icono className="h-6 w-6 text-brand-foreground" strokeWidth={2} />
                </motion.div>
                <span
                  className={`text-[10px] leading-none ${
                    estaActivo ? 'font-semibold text-brand' : 'font-medium text-muted-foreground'
                  }`}
                >
                  {etiqueta}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center gap-1 rounded-xl px-4 py-2"
            >
              {estaActivo && (
                <motion.div
                  layoutId="indicador-nav"
                  className="absolute inset-0 rounded-xl bg-brand/10"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <motion.div
                animate={{ scale: estaActivo ? 1.08 : 1 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="relative"
              >
                <Icono
                  className={`h-[22px] w-[22px] ${
                    estaActivo ? 'text-brand' : 'text-muted-foreground'
                  }`}
                  strokeWidth={estaActivo ? 2.2 : 1.8}
                />
              </motion.div>
              <span
                className={`relative text-[10px] leading-none ${
                  estaActivo ? 'font-semibold text-brand' : 'font-medium text-muted-foreground'
                }`}
              >
                {etiqueta}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
