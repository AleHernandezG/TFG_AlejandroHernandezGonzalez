# Landing Page — Documentación Técnica

> **Última actualización:** 2026-03-20
> **Sprint:** Sprint 1 · Fase 1 — Autenticación (Frontend)
> **Tarea Linear:** TFG-14

---

## Visión general

La landing page es la primera pantalla que ve un usuario no autenticado. Su objetivo es convertir visitas en registros mediante un diseño mobile-first, animaciones suaves y contenido que transmite el valor de la app.

La página está implementada como Server Component raíz (`app/page.tsx`) que orquesta Client Components independientes animados con Framer Motion.

---

## Árbol de componentes

```
app/page.tsx                          ← Página raíz (Server Component shell)
│
├── HeroSection                       ← Carrusel fullscreen + copy + CTAs
│   └── [heroSlides data]
│
├── motion.div (container stagger)    ← Wrapper de animación de entrada
│   ├── TestimonialsBento             ← Sección de testimonios de usuarios
│   │   └── TestimonialCard × 6      ← Tarjeta individual de testimonio
│   │       └── [landingTestimonials data]
│   │
│   └── FeaturesBento                 ← Sección de funcionalidades bento
│       └── [landingFeatures data]
│
└── LandingFooter                     ← Footer global con tech stack, links y quote
```

---

## Flujo de datos

Todos los datos son **mock estáticos** definidos en:

```
frontend/src/features/landing/data/landing-data.ts
```

No hay llamadas a API ni estado de servidor en la landing. La conexión a datos reales ocurrirá en Fase 4 (Backend) cuando el perfil de usuario y las recetas estén disponibles.

### Tipos exportados desde `landing-data.ts`

| Tipo | Uso |
|---|---|
| `HeroSlide` | Slides del carrusel del hero (gradient, emoji, label) |
| `LandingFeature` | Cards de funcionalidades (título, descripción, icono) |
| `LandingFeatureIcon` | Union type `"chef" \| "social" \| "ai"` |
| `Testimonial` | Tarjetas de testimonios (nombre, rol, avatarId, comentario, rating) |
| `LandingStat` | *(definido, actualmente no usado — sección eliminada)* |

---

## Componentes — Detalle

### `app/page.tsx`

Componente raíz. No tiene estado propio. Compone el layout vertical de la página:

1. `HeroSection` fuera de cualquier contenedor (fullscreen real).
2. `motion.div` con `max-w-5xl` y padding lateral que agrupa `TestimonialsBento` + `FeaturesBento`.
3. `LandingFooter` a ancho completo.

El `motion.div` usa `whileInView` + `staggerChildren: 0.1` para animar las secciones al hacer scroll.

---

### `HeroSection` — `features/landing/components/hero-section.tsx`

**Tipo:** Client Component (`'use client'`)

**Responsabilidad:** Carrusel de fondo a pantalla completa con texto de cabecera y CTAs superpuestos.

**Estado:**
- `activeSlide: number` — índice del slide activo, controlado por `useState`.

**Efectos:**
- `useEffect` + `setInterval` (5 s) para auto-avanzar el carrusel. Se limpia en el return.
- `useCallback` en `nextSlide` para evitar recreación en cada render.

**Estructura visual (capas):**
```
<section> min-h-screen, overflow-hidden
  ├── Capa 0 (z-0): AnimatePresence > motion.div por slide
  │   ├── Gradiente de color (tailwind bg-gradient-to-br)
  │   └── Emoji decorativo difuminado (blur-2xl, opacity-10, aria-hidden)
  ├── Overlay 1: bg-background/25 (oscurece globalmente)
  ├── Overlay 2: bg-gradient-to-b (oscurece bordes superior e inferior)
  ├── Overlay 3: bg-gradient-to-r (oscurece bordes laterales)
  ├── Capa z-10: Contenido (headline + subheading + CTAs)
  └── Capa z-20: Indicadores de slide (puntos / pill)
```

**Animaciones:**
- Entrada del slide de fondo: `opacity: 0 → 1` + `scale: 1.06 → 1` en 1.4 s (`easeInOut`).
- `AnimatePresence mode="popLayout"` gestiona la salida del slide anterior.
- Contenido: `staggerChildren: 0.12`, cada hijo entra con `opacity + y: 20 → 0`.

**CTAs:**
- Botón primario → `/registro` (rounded-full, shadow de brand).
- Botón secundario → `/login` (outline, backdrop-blur).

**Indicadores de slide:**
- Pill alargado (`w-7`) para el activo, círculo (`w-2`) para los demás.
- Click en indicador salta directamente al slide.

**Pendiente:** Sustituir gradientes + emoji por imágenes reales con `next/image`. Ver [fase-1-sprint-1-carrousel-pendientes.md](../phase-reports/fase-1-sprint-1-carrousel-pendientes.md).

---

### `TestimonialsBento` — `features/landing/components/testimonials-bento.tsx`

**Tipo:** Client Component

**Responsabilidad:** Sección de opiniones de usuarios con heading y grid responsive.

**Grid:** `1 col → 2 cols (sm) → 3 cols (lg)`, gap de 4.

**Animación:** `staggerChildren: 0.1` con `whileInView` (threshold 15 %). Cada `TestimonialCard` recibe las `variants` del item padre para participar en el stagger.

**Datos:** Consume `landingTestimonials` (6 items mock) de `landing-data.ts`.

---

### `TestimonialCard` — `features/landing/components/testimonial-card.tsx`

**Tipo:** Client Component

**Props:**
```ts
interface TestimonialCardProps {
  testimonial: Testimonial;
  variants?: object;  // recibe las variants del stagger padre
}
```

**Estructura interna:**
```
<motion.div> (recibe variants del padre)
  └── <Card> flex-col gap-5, h-full
      ├── Línea superior de acento (w-0 → w-full en hover)
      ├── <Quote> icono (Lucide, text-brand/30)
      ├── <blockquote> comentario (flex-1, text-sm)
      └── Footer (flex justify-between)
          ├── Avatar + nombre + rol
          └── Rating en corazones (Heart × 5)
```

**Avatar:** Usa `AvatarFallback` con las iniciales del usuario (`avatarId`). Pendiente: conectar a foto real cuando exista backend de usuario.

**Rating:** Array de 5 `Heart` de Lucide. Los corazones `i < rating` tienen `fill-rose-500`, los demás `fill-transparent`. Incluye `aria-label` con el valor numérico para accesibilidad.

**Hover effect:** `border-brand/25`, `shadow-xl shadow-brand/5`, `-translate-y-1`. La línea superior transiciona de `w-0` a `w-full` con `duration-500`.

---

### `FeaturesBento` — `features/landing/components/features-bento.tsx`

**Tipo:** Client Component

**Responsabilidad:** Grid bento de las 3 funcionalidades principales de la app.

**Grid:** `1 col → 3 cols md`, 2 rows. La primera feature (`index === 0`) ocupa `col-span-2 row-span-2` como tarjeta hero.

**Mapa de iconos:**
```ts
const iconMap: Record<LandingFeatureIcon, typeof ChefHat> = {
  chef: ChefHat,
  social: Users,
  ai: Sparkles,
}
```

**Mapa de gradientes por categoría:**
```ts
const iconGradient: Record<LandingFeatureIcon, string> = {
  chef:   "from-amber-400/20 to-orange-300/10 text-amber-600",
  social: "from-sky-400/20 to-blue-300/10 text-sky-600",
  ai:     "from-violet-400/20 to-purple-300/10 text-violet-600",
}
```

**Estructura de cada card:**
```
<Card> border-border/40, backdrop-blur-sm
  ├── Overlay gradiente de brand (opacity-0 → opacity-100 en hover)
  ├── <CardHeader>
  │   ├── Icono (rounded-2xl, bg-gradient-to-br, tamaño h-14/h-11 según isHero)
  │   ├── Subtitle tag (uppercase tracking-widest, text-brand/70)
  │   └── <CardTitle>
  └── <CardContent> descripción
```

**Diferenciación hero vs small:**
- Hero card: padding `p-8 md:p-10`, título `text-2xl md:text-3xl`, descripción `text-base md:text-lg`.
- Small cards: padding `p-6`, título `text-lg`, descripción `text-sm`.

---

### `LandingFooter` — `components/common/landing-footer.tsx`

**Tipo:** Client Component

**Ubicación:** `components/common/` — es un componente global, no pertenece al feature `landing`.

**Estructura:**
```
<footer>
  └── max-w-5xl container
      ├── <Separator> superior
      ├── Grid 3 columnas (1 col en móvil)
      │   ├── Columna 1: Marca (centrada) + disclaimer de IA
      │   ├── Columna 2: Tech stack (12 tecnologías con enlaces externos)
      │   └── Columna 3: Enlaces útiles (privacidad, términos, contacto, GitHub)
      ├── <Separator> inferior
      ├── <blockquote> cita en itálica (centrada)
      └── Copyright
```

**Tech stack listado:** Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, NextAuth.js, TanStack Query, Zustand, Zod, React Hook Form, Lucide Icons.

**Disclaimer IA:** Aviso explícito de que las sugerencias de recetas generadas por IA son orientativas y pueden contener imprecisiones.

---

## Barrel export

```ts
// features/landing/components/index.ts
export { LandingHeader } from "./landing-header"
export { HeroSection } from "./hero-section"
export { FeaturesBento } from "./features-bento"
export { TestimonialsBento } from "./testimonials-bento"
export { TestimonialCard } from "./testimonial-card"
```

Import desde fuera del feature:
```ts
import { HeroSection, FeaturesBento, TestimonialsBento } from "@/features/landing/components"
import { LandingFooter } from "@/components/common/landing-footer"
```

---

## Decisiones de diseño

| Decisión | Motivo |
|---|---|
| Hero fullscreen sin navbar | Impacto visual máximo en primera visita. La navbar aparecerá dentro de la app autenticada. |
| Datos mock en `landing-data.ts` | Aísla el contenido del componente. Fácil de actualizar sin tocar JSX. |
| `TestimonialCard` como componente separado | Reutilizable en futuras páginas. Recibe `variants` del padre para participar en el stagger sin acoplarse a él. |
| `LandingFooter` en `components/common/` | El footer se usará también en páginas como `/privacidad` o `/terminos`, por lo que no es exclusivo de la landing. |
| `AnimatePresence mode="popLayout"` en carrusel | Evita z-index flickering durante la transición entre slides. |
| Overlays en capas independientes | Permiten ajustar la opacidad de fondo, bordes y lateral por separado sin sobrecargar un solo gradiente. |

---

## Dependencias externas usadas

| Librería | Uso en landing |
|---|---|
| `framer-motion` | Animaciones de entrada, stagger, transición del carrusel |
| `lucide-react` | Iconos (ArrowRight, ChefHat, Users, Sparkles, Heart, Quote) |
| `next/link` | Navegación a `/registro` y `/login` |
| `shadcn/ui` | Button, Card, CardContent, CardHeader, CardTitle, Avatar, AvatarFallback, Separator |

---

## Pendientes relacionados

- [CAROUSEL-001] Imágenes reales en hero carousel → [fase-1-sprint-1-carrousel-pendientes.md](../phase-reports/fase-1-sprint-1-carrousel-pendientes.md)
- [CAROUSEL-002] Transición Ken Burns → mismo doc
- [CAROUSEL-003] Controles accesibles prev/next + aria-live → mismo doc
- Conectar `AvatarFallback` a foto real de usuario cuando exista backend (Fase 4)
- Conectar `landingTestimonials` a datos reales de la base de datos (Fase 4)
