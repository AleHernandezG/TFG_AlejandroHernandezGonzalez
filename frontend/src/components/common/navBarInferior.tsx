'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  BookMarked,
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
}

const RUTAS_SIN_NAVBAR = ['/', '/chat']

const enlaces: EnlaceNav[] = [
  { href: '/home',      Icono: Home,           etiqueta: 'Inicio'    },
  { href: '/despensa',  Icono: ShoppingBasket,  etiqueta: 'Despensa'  },
  { href: '/discover',  Icono: TrendingUp,      etiqueta: 'Discover'  },
  { href: '/coleccion', Icono: BookMarked,      etiqueta: 'Colección' },
  { href: '/perfil',    Icono: CircleUserRound, etiqueta: 'Perfil'    },
]

export function NavBarInferior() {
  const rutaActual = usePathname()

  if (RUTAS_SIN_NAVBAR.includes(rutaActual)) return null

  const chatActivo = rutaActual === '/chat' || rutaActual.startsWith('/chat/')

  return (
    <>
      {/* FAB — Cookr IA (flota sobre la navbar) */}
      <Link
        href="/chat"
        aria-label="Cookr IA"
        className="fixed left-1/2 z-50 -translate-x-1/2 lg:hidden"
        style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom) + 0.25rem)' }}
      >
        <motion.div
          whileTap={{ scale: 0.88 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.22)] transition-opacity ${
            chatActivo ? 'bg-brand/80 ring-2 ring-brand ring-offset-2 ring-offset-background' : 'bg-brand'
          }`}
        >
          <ChefHat className="h-6 w-6 text-brand-foreground" strokeWidth={2} />
        </motion.div>
      </Link>

      {/* Barra de navegación inferior */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around px-2 py-1">
          {enlaces.map(({ href, Icono, etiqueta }) => {
            const estaActivo = rutaActual === href || rutaActual.startsWith(`${href}/`)

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
    </>
  )
}
