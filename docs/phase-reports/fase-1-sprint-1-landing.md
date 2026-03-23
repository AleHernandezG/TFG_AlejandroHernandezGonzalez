# Fase 1 — Sprint 1 — Reporte TFG-14 (Landing Page)

**Fecha:** 2026-03-20 (actualizado: 2026-03-21)
**Estado:** ✅ Implementado, refinado y documentado

## Objetivo

Implementar la Landing Page inicial de la app cumpliendo criterios de aceptacion de Sprint 1 con enfoque mobile-first y datos mock.

## Criterios de aceptacion

- ✅ Hero section con CTA hacia registro
- ✅ Seccion de 3 features de la app
- ✅ Responsive: mobile primero, desktop adaptado
- ✅ Animada con Framer Motion
- ✅ Botones con shadcn/ui Button
- ✅ Implementada en App Router (Next.js)

## Cambios realizados — Iteración 1 (implementación base)

- Reemplazo de la pagina inicial por Landing productiva.
- Estructura mobile-first con:
  - Header ligero
  - Hero con copy principal
  - CTA primario (registro) y secundario (login)
  - Bloque de stats
  - Seccion de 3 features
- Animaciones de entrada y stagger con Framer Motion.
- Datos mock separados para facilitar iteracion de contenido sin backend.
- Metadatos base actualizados para la app.

## Cambios realizados — Iteración 2 (refinamiento de UI)

- HeroSection convertida a fullscreen (min-h-screen, sin card border/radius)
- Carrusel como imagen de fondo real con overlays para legibilidad del texto
- LandingHeader (barra con ChefHat + Iniciar sesión) eliminada de la vista
- Sección de estadísticas eliminada
- Nuevo componente TestimonialCard: avatar + nombre bold + rol + comentario + corazones
- TestimonialsBento: 6 testimonios en grid 1→2→3 cols con heading de sección
- FeaturesBento: iconos con gradiente por categoría, card hero col-span-2, subtítulo con tracking
- Datos mock enriquecidos: 6 testimonios con campo `role`, 4 slides en carrusel

## Cambios realizados — Iteración 3 (footer + documentación)

- LandingFooter creado en `components/common/landing-footer.tsx`:
  - Grid 3 columnas (marca centrada, tech stack con 12 enlaces, links útiles)
  - Disclaimer explícito sobre uso de IA
  - Cita textual en blockquote itálico
  - Copyright con año dinámico
- Corrección mobile: borde derecho de tarjetas bento visible en viewport < 768 px (padding lateral en contenedor)
- Documentación técnica completa creada en `docs/desarrollo/landingPage.md`

## Archivos creados / modificados

### Creados

- `frontend/src/features/landing/components/testimonial-card.tsx`
- `frontend/src/features/landing/components/testimonials-bento.tsx`
- `frontend/src/components/common/landing-footer.tsx`
- `docs/phase-reports/fase-1-sprint-1-carrousel-pendientes.md`
- `docs/desarrollo/landingPage.md`

### Modificados

- `frontend/src/app/page.tsx`
- `frontend/src/app/layout.tsx`
- `frontend/tailwind.config.ts` (añadido src/features/\*\* al content array)
- `frontend/src/features/landing/components/hero-section.tsx`
- `frontend/src/features/landing/components/features-bento.tsx`
- `frontend/src/features/landing/components/index.ts`
- `frontend/src/features/landing/data/landing-data.ts`
- `docs/context.md`

## Cambios realizados — Iteración 4 (renombrado a español + documentación de deuda técnica)

- Todos los componentes renombrados a convención en español para coherencia con el idioma del proyecto:
  - `hero-section.tsx` → `seccionHero.tsx` (export: `SeccionHero`)
  - `features-bento.tsx` → `bentoCaracteristicas.tsx` (export: `BentoCaracteristicas`)
  - `testimonials-bento.tsx` → `bentoTestimonios.tsx` (export: `BentoTestimonios`)
  - `testimonial-card.tsx` → `tarjetaTestimonio.tsx` (export: `TarjetaTestimonio`)
  - `landing-footer.tsx` → `piePagina.tsx` (export: `PiePagina`, movido a `components/common/`)
  - `landing-data.ts` → `datosLanding.ts`
  - `landing-header.tsx` eliminado (ya no se usaba)
- `index.ts` actualizado para exportar los nuevos nombres
- `page.tsx` actualizado: imports, nombre de la función (`PaginaInicio`), variable de animación (`contenedor`)
- `layout.tsx`: limpieza menor (sin cambios funcionales)
- Nuevo archivo `docs/tech-debt.md` con registro de deuda técnica (DEBT-001: eslint@8 + next-pwa@5)
- Nuevo archivo `docs/landing.html` (exportación estática de referencia visual)
- Nuevo archivo `frontend/.env.example` con todas las variables de entorno del proyecto documentadas

## Archivos creados / modificados — Iteración 4

### Creados

- `frontend/src/features/landing/components/seccionHero.tsx`
- `frontend/src/features/landing/components/bentoCaracteristicas.tsx`
- `frontend/src/features/landing/components/bentoTestimonios.tsx`
- `frontend/src/features/landing/components/tarjetaTestimonio.tsx`
- `frontend/src/features/landing/data/datosLanding.ts`
- `frontend/src/components/common/piePagina.tsx`
- `docs/tech-debt.md`
- `docs/landing.html`
- `frontend/.env.example`

### Modificados

- `frontend/src/features/landing/components/index.ts`
- `frontend/src/app/page.tsx`
- `frontend/src/app/layout.tsx`
- `docs/context.md`
- `docs/phase-reports/fase-0-pendientes.md`

### Eliminados

- `frontend/src/features/landing/components/hero-section.tsx`
- `frontend/src/features/landing/components/features-bento.tsx`
- `frontend/src/features/landing/components/testimonials-bento.tsx`
- `frontend/src/features/landing/components/testimonial-card.tsx`
- `frontend/src/features/landing/components/landing-header.tsx`
- `frontend/src/features/landing/data/landing-data.ts`
- `frontend/src/components/common/landing-footer.tsx`

## Cambios realizados — Iteración 5 (tipografía creativa hero — [UI-004])

**Fecha:** 2026-03-23

Patrones de estilo tipográfico aplicados al titular y subtítulo de `SeccionHero`, inspirados en Linear, Framer, Notion y Spotify:

### H1 — tratamientos tipográficos por palabra clave

| Palabra     | Técnica                                                                    | Referente              |
| ----------- | -------------------------------------------------------------------------- | ---------------------- |
| `cocinando` | `font-black italic text-brand`                                             | Spotify, Bon Appétit   |
| `recetas`   | Subrayado wavy SVG `var(--brand)`, `preserveAspectRatio="none"`            | Notion, Framer, Arc    |
| `Cookr`     | `bg-gradient-to-r from-brand to-brand-muted bg-clip-text text-transparent` | Linear, Stripe, Vercel |

El SVG del subrayado wavy usa la curva cuadrática `M0,5 Q25,1 50,5 Q75,9 100,5` con `preserveAspectRatio="none"` para que se estire proporcionalmente al texto en cualquier viewport.

### Subtítulo

- `comparte tus recetas` envuelto en `<span className="font-semibold text-foreground/80">` para contrastar dentro del párrafo muted

### Archivos modificados

- `frontend/src/features/landing/components/seccionHero.tsx`

### Regla mantenida

- 0 colores hardcodeados — todos los estilos usan variables Cookr del sistema de diseño

## Riesgos y bloqueos

- Entorno local sin npm/node operativo en PATH durante esta sesion.
- No se pudo ejecutar validacion final de lint/build en local.

## Validacion pendiente

- Ejecutar en frontend:
  - npm install
  - npm run lint
  - npm run build
- Revisar visual final en viewport mobile (<=768px) y desktop.

## Commits realizados

```
feat(landing): implementar landing page mobile-first con hero, cta y 3 features animadas
chore(landing): renombrar componentes a español, añadir tech-debt doc y .env.example
```

## Siguiente paso de Sprint 1

- Iniciar TFG de Login y Registro.
- Integrar Google OAuth una vez cerrados formularios base.
