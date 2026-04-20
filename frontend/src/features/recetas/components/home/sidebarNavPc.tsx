'use client'

import { cn } from '@/lib/utils'
import { BookMarked, Bot, Compass, Home, ShoppingBasket, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Desktop: todos los destinos de la app (FAB no aplica en PC — Cookr IA es ítem normal)
const NAV_ITEMS = [
  { href: '/home',      Icono: Home,          etiqueta: 'Inicio'    },
  { href: '/despensa',  Icono: ShoppingBasket, etiqueta: 'Despensa'  },
  { href: '/chat',      Icono: Bot,           etiqueta: 'Cookr IA'  },
  { href: '/discover',  Icono: Compass,       etiqueta: 'Discover'  },
  { href: '/coleccion', Icono: BookMarked,    etiqueta: 'Colección' },
  { href: '/perfil',    Icono: User,          etiqueta: 'Perfil'    },
]

export function SidebarNavPc() {
  const rutaActual = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-border/40 bg-background pb-8 pt-24 px-6 lg:flex">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, Icono, etiqueta }) => {
          const activo = rutaActual === href || rutaActual.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl p-3 text-sm transition-all duration-200',
                activo
                  ? 'bg-warm-bg-accent font-bold text-brand'
                  : 'font-medium text-muted-foreground hover:translate-x-0.5 hover:bg-warm-bg',
              )}
            >
              <Icono
                className="h-5 w-5 shrink-0"
                strokeWidth={activo ? 2.5 : 1.8}
              />
              {etiqueta}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
