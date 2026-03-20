'use client'

import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

const techStack = [
  { label: 'Next.js 14', href: 'https://nextjs.org' },
  { label: 'React 18', href: 'https://react.dev' },
  { label: 'TypeScript', href: 'https://www.typescriptlang.org' },
  { label: 'Tailwind CSS', href: 'https://tailwindcss.com' },
  { label: 'shadcn/ui', href: 'https://ui.shadcn.com' },
  { label: 'Framer Motion', href: 'https://www.framer.com/motion' },
  { label: 'NextAuth.js', href: 'https://next-auth.js.org' },
  { label: 'TanStack Query', href: 'https://tanstack.com/query' },
  { label: 'Zustand', href: 'https://zustand-demo.pmnd.rs' },
  { label: 'Zod', href: 'https://zod.dev' },
  { label: 'React Hook Form', href: 'https://react-hook-form.com' },
  { label: 'Lucide Icons', href: 'https://lucide.dev' },
]

const usefulLinks = [
  { label: 'Política de privacidad', href: '/privacidad' },
  { label: 'Términos de uso', href: '/terminos' },
  { label: 'Contacto', href: '/contacto' },
  { label: 'GitHub del proyecto', href: 'https://github.com' },
]

export function LandingFooter() {
  return (
    <footer className="border-border/50 bg-card/50 border-t backdrop-blur-sm">
      <div className="mx-auto w-full max-w-5xl px-5 py-14 md:px-10">
        <Separator className="mb-12 opacity-50" />

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand + AI disclaimer */}
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

          {/* Tech stack */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Construido con
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {techStack.map((tech) => (
                <li key={tech.label}>
                  <a
                    href={tech.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {tech.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Enlaces
            </p>
            <ul className="flex flex-col gap-2">
              {usefulLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="mb-6 mt-12 opacity-50" />

        {/* Quote */}
        <div className="mb-12 flex justify-center">
          <blockquote className="max-w-2xl text-center text-base italic leading-relaxed text-muted-foreground md:text-lg">
            &ldquo;Mami te quiero mucho&rdquo;
          </blockquote>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-2 text-center md:flex-row md:text-left">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Gastronómica — Trabajo de Fin de Grado.
          </p>
        </div>
      </div>
    </footer>
  )
}
