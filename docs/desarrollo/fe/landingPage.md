# Landing Page — Documentación Técnica

> **Última actualización:** 2026-04-21
> **Sprint:** Sprint 3 (última actualización) · Iniciado en Sprint 1
> **Tarea Linear:** TFG-14

---

## Visión general

La landing page es la primera pantalla que ve un usuario no autenticado. Su objetivo es convertir visitas en registros mediante un diseño mobile-first, animaciones suaves y contenido que transmite el valor de la app.

La página está implementada como Server Component raíz (`app/page.tsx`) que orquesta Client Components independientes animados con Framer Motion.

---

## Árbol de componentes

```
app/page.tsx                          ← Página raíz ('use client', bg-[var(--warm-bg)])
│
├── SeccionHero                       ← Carrusel fullscreen + copy + CTAs
│   └── [slidesHero data]
│
├── motion.div (container stagger)    ← Wrapper de animación de entrada
│   ├── BentoTestimonios             ← Sección de testimonios de usuarios
│   │   └── TarjetaTestimonio × 6   ← Tarjeta individual de testimonio
│   │       └── [testimoniosLanding data]
│   │
│   └── BentoCaracteristicas         ← Sección de funcionalidades bento
│       └── [caracteristicasLanding data]
│
└── PiePagina                         ← Footer global con tech stack, links y quote
```

---

## Flujo de datos

Todos los datos son **mock estáticos** definidos en:

```
frontend/src/features/landing/data/datosLanding.ts
```

No hay llamadas a API ni estado de servidor en la landing. La conexión a datos reales ocurrirá en Fase 4 (Backend) cuando el perfil de usuario y las recetas estén disponibles.

### Tipos exportados desde `datosLanding.ts`

| Tipo | Uso |
|---|---|
| `SlideHero` | Slides del carrusel (`imageUrl`, `gradiente` fallback, `etiqueta`) |
| `CaracteristicaLanding` | Cards de funcionalidades (título, descripción, icono) |
| `IconoCaracteristicaLanding` | Union type `"chef" \| "social" \| "ia"` |
| `Testimonio` | Tarjetas de testimonios (nombre, rol, avatarId, comentario, valoracion) |
| `EstadisticaLanding` | *(definido, actualmente no usado — sección eliminada)* |

---

## Componentes — Detalle

### `app/page.tsx`

Componente raíz. No tiene estado propio. Compone el layout vertical de la página:

1. `HeroSection` fuera de cualquier contenedor (fullscreen real).
2. `motion.div` con `max-w-5xl` y padding lateral que agrupa `TestimonialsBento` + `FeaturesBento`.
3. `LandingFooter` a ancho completo.

El `motion.div` usa `whileInView` + `staggerChildren: 0.1` para animar las secciones al hacer scroll.

---

### `SeccionHero` — `features/landing/components/seccionHero.tsx`

**Tipo:** Client Component (`'use client'`)

**Responsabilidad:** Carrusel de fondo a pantalla completa con fotografía real, texto de cabecera y CTAs superpuestos.

**Estado:**
- `slideActivo: number` — índice del slide activo, controlado por `useState`.

**Efectos:**
- `useEffect` + `setInterval` (5 s) para auto-avanzar. `useCallback` en `siguienteSlide`.

**Estructura visual (capas):**
```
<section> min-h-screen, overflow-hidden
  ├── Capa 0 (z-0): AnimatePresence mode="popLayout" > motion.div por slide
  │   ├── bg-gradient-to-br [gradiente CSS] — fallback si imagen no carga
  │   └── <Image fill sizes="100vw" priority={slideActivo === 0} /> — fotografía WebP real
  ├── Overlay 1: bg-black/50 — tinte plano, oscurece imagen uniformemente
  ├── Overlay 2: bg-gradient-to-t from-black/60 via-black/25 to-black/10 — refuerzo zona texto
  ├── <span sr-only aria-live="polite"> — accesibilidad lectores de pantalla
  ├── Capa z-10: motion.div con stagger → h1 + p + botones
  └── Capa z-20: Indicadores de slide (puntos / pill con aria-label + aria-current)
```

**Transición de slides (T1 Crossfade):**
- `initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}`
- `transition={{ duration: 1.2, ease: 'easeInOut' }}`
- Sin zoom/scale — fundido de opacidad puro (patrón Airbnb/Apple)

**Tipografía (mezcla A+D):**
- `h1`: `text-white` + `filter: drop-shadow(...)` inline — editorial, legible sobre cualquier foto
- `"cocinando"`: `font-black italic text-brand` — énfasis naranja sólido
- `"recetas"`: subrayado wavy SVG `var(--brand)` — decorativo
- `"Cookr"`: `text-brand` — naranja sólido (gradient clip-text invisible sobre overlay oscuro)
- Subtítulo: `text-white/75` + `textShadow` inline

**CTAs:**
- Botón primario → `/registro` (rounded-full, shadow brand).
- Botón secundario → `/login` (outline `border-white/25 bg-white/10 text-white backdrop-blur-sm`).

**Indicadores de slide:**
- Pill alargado (`w-7 bg-brand`) para el activo, círculo (`w-2 bg-white/30`) para los demás.
- `aria-label="Ver slide: {etiqueta}"` + `aria-current` en activo.

---

### `BentoTestimonios` — `features/landing/components/bentoTestimonios.tsx`

**Tipo:** Client Component

**Responsabilidad:** Sección de opiniones de usuarios con heading y grid responsive.

**Grid:** `1 col → 2 cols (sm) → 3 cols (lg)`, gap de 4.

**Animación:** `staggerChildren: 0.1` con `whileInView` (threshold 15 %). Cada `TestimonialCard` recibe las `variants` del item padre para participar en el stagger.

**Datos:** Consume `testimoniosLanding` (6 items mock) de `datosLanding.ts`.

---

### `TarjetaTestimonio` — `features/landing/components/tarjetaTestimonio.tsx`

**Tipo:** Client Component

**Props:**
```ts
interface TarjetaTestimonioProps {
  testimonio: Testimonio;
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

### `BentoCaracteristicas` — `features/landing/components/bentoCaracteristicas.tsx`

**Tipo:** Client Component

**Responsabilidad:** Grid bento de las 3 funcionalidades principales de la app.

**Grid:** `1 col → 3 cols md`, 2 rows. La primera característica (`index === 0`) ocupa `col-span-2 row-span-2` como tarjeta hero.

**Mapa de iconos:**
```ts
const mapaIconos: Record<IconoCaracteristicaLanding, typeof ChefHat> = {
  chef: ChefHat,
  social: Users,
  ia: Sparkles,
}
```

**Mapa de gradientes por categoría (usa CSS vars — 0 colores hardcodeados):**
```ts
const gradienteIcono: Record<IconoCaracteristicaLanding, string> = {
  chef:   "from-brand/20 to-brand-muted/10 text-brand",
  social: "bg-[oklch(0.92_0.04_240)] text-[var(--category-social)]",
  ia:     "bg-[oklch(0.92_0.04_290)] text-[var(--category-ai)]",
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

### `PiePagina` — `components/common/piePagina.tsx`

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
export { SeccionHero } from "./seccionHero"
export { BentoCaracteristicas } from "./bentoCaracteristicas"
export { BentoTestimonios } from "./bentoTestimonios"
export { TarjetaTestimonio } from "./tarjetaTestimonio"
```

Import desde fuera del feature:
```ts
import { SeccionHero, BentoCaracteristicas, BentoTestimonios } from "@/features/landing/components"
import { PiePagina } from "@/components/common/piePagina"
```

---

## Decisiones de diseño

| Decisión | Motivo |
|---|---|
| Hero fullscreen sin navbar | Impacto visual máximo en primera visita. La navbar aparece dentro de la app autenticada. |
| Datos mock en `datosLanding.ts` | Aísla el contenido del componente. Fácil de actualizar sin tocar JSX. |
| `TarjetaTestimonio` como componente separado | Reutilizable en futuras páginas. Recibe `variants` del padre para el stagger. |
| `PiePagina` en `components/common/` | El footer se usa también en `/privacidad` y `/terminos`. |
| `AnimatePresence mode="popLayout"` en carrusel | Evita z-index flickering durante la transición entre slides. |
| Dos capas de overlay en hero | Las imágenes son fotografía de producto sobre fondo blanco/claro. Una sola capa es insuficiente. |
| T1 Crossfade en lugar de Ken Burns | 6 opciones evaluadas en `heroOpciones.html`. Crossfade más elegante sobre fotografía densa. |
| `text-white` + `text-brand` sólido | `text-foreground` es oscuro en light mode — inlegible sobre overlay. Gradient clip-text invisible sobre oscuro. |
| `bg-[var(--warm-bg)]` en `page.tsx` | Elimina el contraste brusco entre el hero oscuro y el fondo blanco puro. Usa variable ya definida. |
| Sin botones prev/next | Carrusel automático — diseño más limpio. Los puntos indicadores ofrecen navegación manual suficiente. |

---

## Dependencias externas usadas

| Librería | Uso en landing |
|---|---|
| `framer-motion` | Animaciones de entrada, stagger, crossfade del carrusel (`AnimatePresence`) |
| `next/image` | `<Image fill>` para fotografías reales del hero con optimización automática |
| `lucide-react` | Iconos (ArrowRight, ChefHat, Users, Sparkles, Heart, Quote) |
| `next/link` | Navegación a `/registro` y `/login` |
| `shadcn/ui` | Button, Card, CardContent, CardHeader, CardTitle, Avatar, AvatarFallback, Separator |

---

## Assets

```
public/images/hero/
├── desayuno.webp   ← slide 1 — fotografía de desayuno (~1920px, Unsplash)
├── ensalada.webp   ← slide 2 — fotografía de ensalada (~1920px, Unsplash)
├── postre.webp     ← slide 3 — fotografía de postre (~1920px, Unsplash)
└── pasta.webp      ← slide 4 — fotografía de pasta (~1920px, Unsplash)
```

Las imágenes son locales (`/public`) — no requieren `remotePatterns` en `next.config.js`.

---

## Pendientes relacionados

- [DET-009] Carrusel de recetas similares — aplazado a Sprint 4 (requiere modelo Receta en MongoDB)
- Conectar `TarjetaTestimonio` → `AvatarFallback` a foto real cuando exista backend (Fase 4)
- Conectar `testimoniosLanding` a datos reales de la base de datos (Fase 4)
- [UI-021] ✅ Completado — ver `docs/changes/ui-changes.md`
- [CAROUSEL-001/002/003] ✅ Completados — ver `docs/phase-reports/fase-1-sprint-1-carrousel-completados.md`
