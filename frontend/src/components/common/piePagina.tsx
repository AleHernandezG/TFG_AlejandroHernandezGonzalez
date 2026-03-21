'use client'

import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

const stackTecnologico = [
  { etiqueta: 'Next.js 14', href: 'https://nextjs.org' },
  { etiqueta: 'React 18', href: 'https://react.dev' },
  { etiqueta: 'TypeScript', href: 'https://www.typescriptlang.org' },
  { etiqueta: 'Tailwind CSS', href: 'https://tailwindcss.com' },
  { etiqueta: 'shadcn/ui', href: 'https://ui.shadcn.com' },
  { etiqueta: 'Framer Motion', href: 'https://www.framer.com/motion' },
  { etiqueta: 'NextAuth.js', href: 'https://next-auth.js.org' },
  { etiqueta: 'TanStack Query', href: 'https://tanstack.com/query' },
  { etiqueta: 'Zustand', href: 'https://zustand-demo.pmnd.rs' },
  { etiqueta: 'Zod', href: 'https://zod.dev' },
  { etiqueta: 'React Hook Form', href: 'https://react-hook-form.com' },
  { etiqueta: 'Lucide Icons', href: 'https://lucide.dev' },
]

const enlacesUtiles = [
  { etiqueta: 'Política de privacidad', href: '/privacidad' },
  { etiqueta: 'Términos de uso', href: '/terminos' },
  { etiqueta: 'Contacto', href: '/contacto' },
  { etiqueta: 'GitHub del proyecto', href: 'https://github.com' },
]

export function PiePagina() {
  return (
    <footer className="border-border/50 bg-card/50 border-t backdrop-blur-sm">
      <div className="mx-auto w-full max-w-5xl px-5 py-14 md:px-10">
        <Separator className="mb-12 opacity-50" />

        {/* Grid principal */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Marca + aviso sobre IA */}
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <p className="text-base font-bold text-foreground">Gastronómica</p>
              <p className="mt-1 text-xs text-muted-foreground">Red social gastronómica</p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="text-foreground/70 font-semibold">Aviso sobre el uso de IA — </span>
              Esta aplicación utiliza inteligencia artificial para generar sugerencias de recetas y
              recomendaciones personalizadas. Las respuestas son orientativas y pueden contener
              imprecisiones. Consulta siempre fuentes especializadas para información nutricional o
              alergénica relevante.
            </p>
          </div>

          {/* Stack tecnológico */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Construido con
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {stackTecnologico.map((tecnologia) => (
                <li key={tecnologia.etiqueta}>
                  <a
                    href={tecnologia.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {tecnologia.etiqueta}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Enlaces útiles */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Enlaces
            </p>
            <ul className="flex flex-col gap-2">
              {enlacesUtiles.map((enlace) => (
                <li key={enlace.etiqueta}>
                  <Link
                    href={enlace.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {enlace.etiqueta}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="mb-6 mt-12 opacity-50" />

        {/* Cita */}
        <div className="mb-12 flex justify-center">
          <blockquote className="max-w-2xl text-center text-base italic leading-relaxed text-muted-foreground md:text-lg">
            &ldquo;Mami te quiero mucho&rdquo;
          </blockquote>
        </div>

        {/* Barra inferior */}
        <div className="flex flex-col items-center justify-between gap-2 text-center md:flex-row md:text-left">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Gastronómica — Trabajo de Fin de Grado.
          </p>
        </div>
      </div>
    </footer>
  )
}
