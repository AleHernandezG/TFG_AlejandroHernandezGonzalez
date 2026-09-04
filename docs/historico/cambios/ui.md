# UI Changes — Cookr

Registro de cambios visuales y de componentes. Formato: [UI-XXX] por orden cronológico.

> **Regla de oro:** nunca editar una entrada completada. Si el cambio evoluciona, crear una nueva entrada.

---

## [UI-025] — Crear receta: diseño visual A+E (Warm Cards + Layered Elevation)

Fecha: 2026-04-26 | Estado: ✅ Completado | Sprint: 3

**Ficheros modificados:**

- `features/recetas/components/crearReceta/formularioCrearReceta.tsx`
- `features/recetas/components/crearReceta/seccionIngredientes.tsx`
- `features/recetas/components/crearReceta/seccionPasos.tsx`
- `features/recetas/components/crearReceta/seccionAlergenos.tsx`

### Motivación

Las tarjetas de sección del formulario no tenían contraste visual suficiente frente al fondo general (`bg-background`). Al usar `bg-card` con la misma tonalidad oscura y neutral, las secciones se fundían con el entorno. Para una app de cooking, la calidez visual es importante para crear una experiencia invitante.

Se evaluaron 5 opciones en `docs/historico/desarrollo/opcionesUiCrearReceta.html`. Se eligió la **combinación A+E** por ser la de mayor impacto con mínimo esfuerzo y total coherencia con la paleta Cookr.

### Cambios aplicados

**Capa E — Wrapper del formulario:**

```tsx
// Antes
<form className="flex flex-col gap-5 pb-8">

// Después
<form className="flex flex-col gap-4 bg-[var(--warm-bg)] rounded-3xl p-3 pb-8">
```

El formulario completo queda envuelto en un contenedor cálido (`--warm-bg = oklch(0.18 0.015 50)` en dark), creando la primera capa de elevación sobre el fondo de la página.

**Capa A — Tarjetas de sección:**

```tsx
// Antes (todas las secciones)
<section className="bg-card rounded-2xl p-5 shadow-[0px_12px_32px_oklch(0.22_0.02_50_/_0.06)]">

// Después
<section className="bg-[var(--warm-bg-accent)] rounded-2xl p-5 shadow-[0px_4px_20px_oklch(0.1_0.02_50_/_0.4)]">
```

`--warm-bg-accent = oklch(0.22 0.025 55)` en dark — más cálido y ligeramente más claro que el wrapper, creando la segunda capa de elevación. La sombra pasa a ser más profunda y cálida.

**Botones de dificultad (inactivos):**

```tsx
// Antes
'bg-muted text-muted-foreground hover:bg-muted/80'

// Después
'bg-[var(--warm-bg)] text-muted-foreground hover:bg-[var(--warm-bg)]/80'
```

Los botones inactivos usan el color del wrapper, quedando visualmente "recesados" dentro de la card.

### Resultado — 3 capas de profundidad

| Capa               | Color           | Variable                                     |
| ------------------ | --------------- | -------------------------------------------- |
| Fondo de página    | oscuro neutro   | `bg-background`                              |
| Wrapper del form   | oscuro cálido   | `--warm-bg`                                  |
| Tarjetas de sección| cálido elevado  | `--warm-bg-accent`                           |
| Inputs dentro      | oscuro neutro   | `bg-background` — crea contraste hacia abajo |

### Variables CSS utilizadas

Definidas en `frontend/src/app/globals.css` (dark mode):
```css
--warm-bg:        oklch(0.18 0.015 50);   /* wrapper del form */
--warm-bg-accent: oklch(0.22 0.025 55);   /* tarjetas de sección */
```

---

## [UI-026] — Crear receta: título hero con tipografía de marca

Fecha: 2026-04-26 | Estado: ✅ Completado | Sprint: 3

**Ficheros modificados:**

- `app/(main)/crear-receta/page.tsx`

### UI-026 — Motivación

El h1 "Nueva receta" era genérico, alineado a la izquierda y sin personalidad visual. El objetivo era darle presencia y calidez usando los mismos patrones tipográficos del hero del landing page.

### UI-026 — Cambios aplicados

```tsx
// Antes
<h1 className="text-2xl font-extrabold text-foreground mb-6">Nueva receta</h1>

// Después
<h1 className="text-center text-[1.75rem] font-bold leading-snug tracking-tight text-foreground mb-6">
  ¿Cuál es tu nueva{' '}
  <span
    className="font-black italic text-brand relative inline-block"
    style={{ filter: 'drop-shadow(0 1px 6px oklch(0.6 0.22 50 / 0.35))' }}
  >
    creación
    <svg aria-hidden className="absolute -bottom-1 left-0 w-full overflow-visible"
         height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
      <path d="M0,4 Q25,1 50,4 Q75,7 100,4" fill="none"
            stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </span>?
</h1>
```

Patrones aplicados del landing hero:

- `text-center` — centrado relativo al ancho del formulario
- `font-black italic text-brand` en "creación" — mismo tratamiento que "cocinando" en el hero
- SVG underline curvo bajo "creación" — mismo componente que "recetas" en el hero
- `drop-shadow` naranja suave — da profundidad sin fondo fotográfico

---

## [UI-028] — Crear receta: fondo fotográfico con atribución Unsplash

Fecha: 2026-04-26 | Estado: ✅ Completado | Sprint: 3

**Ficheros modificados:**

- `app/(main)/crear-receta/page.tsx`

**Asset añadido:** `public/images/recetas/crearRecetaImagen.webp` — 1920×2880 portrait (Delfina Iacub / Unsplash)

### UI-028 — Motivación

Dar profundidad y contexto visual a la página de creación de recetas, siguiendo el mismo patrón fotográfico de las páginas de auth. La imagen portrait encuadra perfectamente en móvil con `object-top`.

### UI-028 — Cambios aplicados

Estructura de la page reemplazada de `<main>` simple a contenedor fotográfico igual a `login/page.tsx`:

```tsx
<div className="relative min-h-screen">
  <Image src="/images/recetas/crearRecetaImagen.webp"
    fill priority sizes="100vw"
    className="object-cover object-top" aria-hidden="true" />
  <div className="absolute inset-0 bg-black/45" />

  {/* Crédito Unsplash — ver rules.md §16 */}
  <p className="absolute bottom-2 right-3 z-10 text-[10px] text-white/40">
    Foto de <a href="...">Delfina Iacub</a> en <a href="...">Unsplash</a>
  </p>

  <main className="relative z-10 max-w-[390px] mx-auto px-5 pt-6 pb-8">
    <h1 ... className="... text-white" style={{ textShadow: '...' }}>
    <FormularioCrearReceta />
  </main>
</div>
```

Ajustes al h1 por el nuevo contexto fotográfico oscuro:

- `text-foreground` → `text-white` (regla auth: no sustituible por foreground sobre overlay)
- `textShadow` en inline style (`rgba` — excepción técnica documentada en rules.md §3)
- `filter drop-shadow` reforzado en el span brand (`rgba(0,0,0,0.7)`)

Nota PC futura: cuando se implemente el bento grid en escritorio, el `max-w-[390px]` se eliminará y la imagen de fondo ya estará en su posición correcta como `fill object-cover`.

---

## [UI-027] — Crear receta: alérgenos chips tamaño md

Fecha: 2026-04-26 | Estado: ✅ Completado | Sprint: 3

**Ficheros modificados:**

- `features/recetas/components/crearReceta/seccionAlergenos.tsx`

### UI-027 — Motivación

Los chips de alérgenos usaban `size="sm"` (icono 16px, `text-[10px]`), lo que dificultaba la lectura de un dato importante de seguridad alimentaria.

### UI-027 — Cambios aplicados

```tsx
// Antes
<ChipAlergeno key={id} alergenoId={id} size="sm" />

// Después
<ChipAlergeno key={id} alergenoId={id} size="md" />
```

`size="md"` usa icono 20px, `text-xs`, más padding (`px-3 py-1`) — más legible manteniendo el mismo componente.

---

## [UI-023] — Asset: fondo-auth.jpg → fondo-auth.webp ✅

Fecha: 2026-04-22 | Estado: ✅ Completado | Sprint: 3

**Ficheros modificados:**
`app/registro/page.tsx` · `app/login/page.tsx` · `app/recuperar-contrasena/page.tsx` · `app/nueva-contrasena/page.tsx`

**Asset renombrado:**
`public/images/fondo-auth.jpg` → `public/images/fondo-auth.webp`

### Razón del cambio

La imagen de fondo de las páginas de autenticación se convirtió a WebP para mantener coherencia con el resto de assets del proyecto (las imágenes del hero ya son `.webp`). WebP ofrece mejor compresión que JPEG sin pérdida visible de calidad.

### Alcance

Sustitución de la referencia `src="/images/fondo-auth.jpg"` por `src="/images/fondo-auth.webp"` en las 4 páginas que usan el asset. Sin cambios en layout ni estilos.

---

## [UI-022] — Auth: fondo imagen completo + rediseño panel de marca ✅

Fecha: 2026-04-21 | Estado: ✅ Completado | Sprint: 3

**Ficheros modificados:**
`app/login/page.tsx` · `app/registro/page.tsx`

### Motivación

El layout split-screen original (`bg-[var(--auth-dark)]` + panel imagen lateral oculto en móvil) generaba un contraste brusco y desaprovechaba la fotografía gastronómica. El rediseño convierte ambas páginas al mismo patrón visual del hero de la landing: imagen de fondo a pantalla completa con texto superpuesto.

### Cambios de layout

- **Antes:** `flex min-h-screen` con dos paneles — panel oscuro `bg-[var(--auth-dark)]` para el formulario + panel imagen `hidden lg:block` con `bg-black/30` + gradientes laterales de fusión
- **Ahora:** imagen `<Image fill>` como fondo completo (igual que `SeccionHero`), overlay único `bg-black/25`, ambos paneles `relative z-10` sin fondo propio

### Panel de marca (texto editorial)

- Proporción: 50/50 entre panel formulario y panel de marca (antes 40/60 o 60/40)
- Posición del contenido: `items-end` (registro, panel izquierdo) / `items-start` (login, panel derecho) → contenido se acerca al centro de pantalla (seam), patrón Clerk/Linear
- Contenido ampliado: etiqueta + marca + tagline + 3 feature bullets (antes solo etiqueta + marca + subtítulo)
- Feature bullets simplificados a solo texto en iteración final (iconos eliminados a petición)
- Separador `h-px` entre tagline y bullets eliminado

### Tipografía del panel de marca

| Elemento | Antes | Ahora |
|---|---|---|
| "Cookr" | `bg-gradient-to-r from-brand to-brand-muted bg-clip-text text-transparent` + `clamp(3.5rem, 6vw, 6.5rem)` | `bg-gradient-to-br from-amber-100 to-amber-200 bg-clip-text text-transparent` + `clamp(4rem, 5.5vw, 6.5rem)` |
| Tagline | `font-light text-white/90` | `font-medium text-white` |
| Feature bullets | `text-white/85` | `font-semibold text-white` |
| Etiqueta | `text-white/80` | `text-white` |
| `textShadow` | `0 1px 10px rgba(0,0,0,0.85)` | `0 1px 12px rgba(0,0,0,0.95), 0 2px 24px rgba(0,0,0,0.7)` (doble capa) |

El gradiente `amber-100 → amber-200` da un resultado crema/beige cálido, más luminoso y menos saturado que el naranja sólido `text-brand`, que se fundía con la madera del `fondo-auth.jpg`.

### Posiciones mantenidas

- `/login`: formulario izquierda, panel de marca derecha
- `/registro`: panel de marca izquierda, formulario derecha
- Móvil: solo formulario a pantalla completa (sin cambio)

---

## [UI-021] — Landing: fondo cálido + hero con imágenes reales y transición T1 ✅

Fecha: 2026-04-21 | Estado: ✅ Completado | Sprint: 3

**Ficheros modificados:**
`app/page.tsx` · `features/landing/components/seccionHero.tsx` · `features/landing/data/datosLanding.ts`

**Ficheros creados:** `public/images/hero/desayuno.webp` · `ensalada.webp` · `postre.webp` · `pasta.webp`

### CAROUSEL-001 — Imágenes reales

- Tipo `SlideHero`: eliminado campo `emoji`, añadido `imageUrl: string`
- Hero usa `<Image fill sizes="100vw" priority={slideActivo === 0} />` de `next/image`
- Imágenes locales en `public/images/hero/` (~1920 px wide, formato WebP)
- Overlays en dos capas necesarios por fotografía de producto sobre fondo claro:
  - `bg-black/50` — tinte plano uniforme
  - `bg-gradient-to-t from-black/60 via-black/25 to-black/10` — refuerzo zona texto

### CAROUSEL-002 — Transición T1 Crossfade

- 6 opciones evaluadas y documentadas en `docs/historico/desarrollo/fe/heroOpciones.html`
- Elegida **T1 Crossfade** (Airbnb/Apple): fundido de opacidad puro sin zoom
- `motion.div key={slideActivo}`: `opacity 0→1` entrada, `opacity 1→0` salida, 1.2 s easeInOut
- Ken Burns descartado: zoom interfería con legibilidad sobre fotografía densa

### CAROUSEL-003 — Accesibilidad

- `<span className="sr-only" aria-live="polite" aria-atomic="true">` — anuncia slide activo
- Puntos indicadores con `aria-label` y `aria-current` en el activo
- Botones prev/next descartados — diseño automático más limpio (decisión de autor)

### Tipografía hero (A+D mix)

- Evaluadas 5 opciones tipográficas en `heroOpciones.html`
- Elegida mezcla A+D: texto blanco puro + `drop-shadow` editorial + `text-shadow` en subtítulo
- `h1`: `filter: drop-shadow(0 2px 12px rgba(0,0,0,0.9)) drop-shadow(0 4px 32px rgba(0,0,0,0.65))`
- `"Cookr"` cambiado de `bg-clip-text text-transparent` a `text-brand` (gradiente clip invisible sobre overlay oscuro)
- Botón outline: `border-white/25 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm`

### Fondo warm-bg en landing

- `page.tsx`: `bg-background` → `bg-[var(--warm-bg)]` (crema muy suave en light, cálido en dark)
- Suaviza el contraste visual entre el hero oscuro y el contenido inferior sin bleed ni wave

**Excepciones rules.md documentadas:** `text-white`, `bg-black/N`, `border-white/N`, `bg-white/N`, `rgba(0,0,0,N)` en inline styles — ver sección "Excepciones permitidas" de `docs/historico/rules.md`.

---

## [UI-020] — Vista /coleccion — dos subpestañas (Guardadas + Mis Recetas) ✅

Fecha: 2026-04-20 | Estado: ✅ Completado | Sprint: 3

**Fichero creado:** `app/(main)/coleccion/page.tsx`

- Dos pestañas pill: **Guardadas** (filtra `POSTS_MOCK` donde `guardado === true`) y **Mis recetas** (2 posts mock de placeholder)
- Estado vacío en "Mis recetas" con CTA "Crear receta" → `/crear-receta` (icono `PlusCircle`)
- Mobile: columna única de `TarjetaPost`. Desktop: `SidebarNavPc` + columna `max-w-2xl` centrada
- Lint ✅ · 0 errores TypeScript

**Pendiente:** conectar al backend cuando existan `GET /api/usuarios/:id/guardadas` y `GET /api/usuarios/:id/recetas` (UI-021 + UI-022).

---

## [UI-019b] — NavBar inferior: patrón FAB (Cookr IA) + ruta Colección ✅

Fecha: 2026-04-20 | Estado: ✅ Completado | Sprint: 3

**Ficheros modificados:** `components/common/navBarInferior.tsx` · `features/recetas/components/home/sidebarNavPc.tsx`

**Patrón FAB (Material Design / WhatsApp):**
- Cookr IA (`/chat`) pasa de botón central inline a FAB flotante (`position: fixed`, `z-50`, `left: 50%`) sobre la navbar
- Sombra `shadow-[0_4px_20px_rgba(0,0,0,0.22)]`, `whileTap scale 0.88` (Framer Motion), `lg:hidden`
- Cuando la ruta es `/chat`: añade `ring-2 ring-brand` como indicador activo
- Bottom: `calc(4.5rem + env(safe-area-inset-bottom) + 0.25rem)` — respeta safe area y flota justo encima

**Nav:** 5 ítems planos (Inicio · Despensa · Discover · Colección · Perfil). Eliminado `esCentral` del tipo.

**Sidebar PC:** 6 ítems (añadidos Discover + Colección). El FAB no aplica en desktop — Cookr IA queda como ítem normal con icono `Bot`.

---

## [UI-017] — Drawer de filtros avanzados ✅

Fecha: 2026-04-20 | Estado: ✅ Completado | Sprint: 3

**Fichero creado:** `features/recetas/components/home/drawerFiltros.tsx`

**Cambios en:** `components/common/buscadorFiltros.tsx` · `features/recetas/components/home/feedHome.tsx` · `feedHomePc.tsx` · `layoutHomePc.tsx` · `headerHomePc.tsx`

- Botón "Filtros" fijo junto a la barra de búsqueda (`shrink-0`), nunca se corta — patrón YouTube/Instagram
- Drawer vaul (bottom-sheet) con **3 secciones**: Dieta (10 ops de `DIETAS_OPCIONES`), Dificultad (Fácil/Media/Difícil), Excluir alérgenos (14 ops de `ALERGENOS_OPCIONES`)
- Estado interno: copia local hasta "Aplicar" — padre no actualiza en cada toggle
- Badge naranja con total de filtros activos (`dietas.length + dificultad.length + alergenos.length`)
- `DIETAS_OPCIONES`: eliminados `sinGluten` y `sinLactosa` (duplicados semánticos de los alérgenos Cereales/Lácteos)
- `FiltrosAvanzados { dietas: string[], alergenos: string[], dificultad: string[] }` como tipo único en `receta.types.ts`

---

## [UI-016b] — Búsqueda con debounce + skeleton loaders + estado vacío ✅

Fecha: 2026-04-20 | Estado: ✅ Completado | Sprint: 3

**Fichero creado:** `hooks/useDebounce.ts`

**Ficheros modificados:** `features/recetas/components/home/feedHome.tsx` · `feedHomePc.tsx`

- Hook genérico `useDebounce<T>(value, delay)` con `useEffect + setTimeout`
- `cargando = busqueda !== busquedaDebounciada` — se activa durante los 300 ms de rebote
- Mobile: 3 × `TarjetaPostSkeleton` mientras carga. Desktop: 6 × `TarjetaPostSkeletonPc` en grid 3 cols
- Estado vacío: icono `SearchX` (lucide-react) + texto "No hay recetas que coincidan"
- Filtrado combina: búsqueda debounced + dieta + dificultad + exclusión de alérgenos

---

## [UI-019] — Home: click en tarjeta → DetalleReceta + multi-select filtros + quitar ajustes PC ✅

Fecha: 2026-04-10 | Estado: ✅ Completado | Sprint: 2

**Cambios aplicados:**

**Navegación desde tarjeta:**

- `tarjetaPost.tsx` (mobile) — imagen + título + descripción + metadatos envueltos en `<Link href="/recetas/{id}">`. Botones de like/guardar/comentarios quedan fuera del Link como hermanos.
- `tarjetaPostPc.tsx` (PC, variantes hero/wide/small) — `<Link>` con `position: absolute; inset-0; z-0` sobre el `<article>` (patrón overlay). `AccionesBar` envuelta en `<div relative z-10>` para quedar por encima del link y seguir siendo pulsable.

**Multi-select en filtros:**

- `buscadorFiltros.tsx` — prop `filtroActivo: string` → `filtrosActivos: string[]`; active check cambia a `filtrosActivos.includes(filtro.id)`.
- `feedHome.tsx` — estado `useState('todas')` → `useState<string[]>(['todas'])`; función `toggleFiltro()`: seleccionar "Todas" limpia el resto; deseleccionar el último chip vuelve a "Todas".
- `feedHomePc.tsx` — prop actualizado a `filtrosActivos: string[]`.
- `layoutHomePc.tsx` — estado y `toggleFiltro()` añadidos; pasa `filtrosActivos` a `FeedHomePc`.

**Header PC:**

- `headerHomePc.tsx` — eliminado botón `<Settings>` e import de `Settings` de lucide-react.

**Pendiente (documentado en fase-2-pendientes.md):**

- Los chips de filtro actuales (Todas/Vegano/Keto/Sin gluten/Sin lactosa) son placeholders. Cuando el autor facilite el listado completo de alérgenos + dietas + dificultad, se sustituirán los datos de `FILTROS_FEED` y se añadirá separación visual por categoría (alérgenos / dietas / dificultad). Ver tarea pendiente en docs/historico/fases/fase-2-pendientes.md.

---

## [UI-016] — Fix hydration: tiempos relativos con `suppressHydrationWarning` + fechas mock fijas ✅

Fecha: 2026-04-10 | Estado: ✅ Completado | Sprint: 2

**Problema:** React lanzaba un error de hidratación porque el texto de tiempo relativo ("Hace 35m") calculado en servidor no coincidía con el calculado en cliente (milisegundos después). Había dos causas combinadas:

1. Los datos mock usaban `new Date(Date.now() - ...)` al evaluar el módulo → cada carga generaba fechas distintas.
2. Las funciones `tiempoRelativo()` usan `Date.now()` en render → el valor cambia entre SSR y CSR.

**Solución aplicada:**

- `features/recetas/data/datosFeed.ts` — 7 fechas `Date.now()` sustituidas por strings ISO fijos (`'2026-04-10T09:25:00.000Z'`, etc.)
- `features/recetas/data/datosDetalle.ts` — 4 fechas `Date.now()` sustituidas por strings ISO fijos
- `features/recetas/components/home/tarjetaPost.tsx` — `suppressHydrationWarning` en el `<p>` del tiempo
- `features/recetas/components/detalleReceta/cabeceraReceta.tsx` — `suppressHydrationWarning` en el `<span>` del tiempo
- `features/recetas/components/detalleReceta/comentariosReceta.tsx` — `suppressHydrationWarning` en el `<span>` del tiempo

**Regla para el futuro:** Cualquier elemento que muestre tiempo relativo calculado con `Date.now()` en render DEBE llevar `suppressHydrationWarning`. Cuando los datos vengan del backend las fechas serán ISO fijos (problema 1 desaparece), pero el problema 2 persiste → `suppressHydrationWarning` es permanente en estos elementos.

---

## [UI-015] — Home responsive: layout de escritorio (lg+)
Fecha: 2026-04-01 | Estado: 👁️ Pendiente revisión | Sprint: 2

Nuevos componentes PC creados siguiendo Stitch `docs/diseno/stitch/home/PC/`:

**Nuevos ficheros:**
- `features/recetas/data/datosTendencias.ts` — mock RecetaPopular[] + ChefDestacado[] para sidebars
- `features/recetas/components/headerHomePc.tsx` — header fijo h-20: logo | search | avatar (lg+)
- `features/recetas/components/sidebarNavPc.tsx` — sidebar izquierdo fijo w-64: Inicio/Despensa/CocinaIA/Discover/Perfil (lg+)
- `features/recetas/components/sidebarTendencias.tsx` — sidebar derecho fijo w-80: Recetas Populares + Chefs Destacados (lg+)
- `features/recetas/components/tarjetaPostPc.tsx` — tarjeta bento con 3 variantes: hero (col-span-2 row-span-2), small (col-span-1), wide (col-span-2 horizontal)
- `features/recetas/components/feedHomePc.tsx` — grid bento 3 cols + chips filtros (usa POSTS_MOCK y FILTROS_FEED)
- `features/recetas/components/layoutHomePc.tsx` — wrapper Client que posee busqueda + filtroActivo y ensambla la vista PC

**Ficheros modificados:**
- `app/(main)/home/page.tsx` — renderiza `<div class="lg:hidden">` (mobile) y `<div class="hidden lg:block">` (desktop)
- `features/recetas/components/index.ts` — barrel exports de los nuevos componentes PC

**Reglas de diseño aplicadas (Stitch PC como referencia de layout):**
- Paleta 100% Cookr (sin colores hardcodeados)
- No-Line Rule: separaciones por color de fondo, no bordes 1px
- Ambient shadow: `shadow-[0px_12px_32px_oklch(0.22_0.02_50_/_0.06)]` en tarjetas
- Glassmorphism: `bg-background/80 backdrop-blur-md` en header PC
- Bento grid: CSS grid-cols-3 con auto-placement natural → hero row-span-2 + smalls + wide
- NavBarInferior ya tenía `lg:hidden` — no necesita cambios

---

## [UI-014] — Comportamiento scroll en Home: header y buscador no sticky
Fecha: 2026-04-01 | Estado: 👁️ Pendiente revisión | Sprint: 2

Decisión del autor: tanto `HeaderHome` como `BuscadorFiltros` desaparecen al hacer scroll,
sin quedarse anclados en pantalla.

Ficheros modificados:
- `features/recetas/components/headerHome.tsx` — eliminado `sticky top-0 z-40`; también
  eliminada la campana (Bell) y centrado el título "Cookr" (`justify-center`)
- `components/common/buscadorFiltros.tsx` — eliminado `sticky z-30` del contenedor base
- `features/recetas/components/feedHome.tsx` — eliminado `className="top-0"` del prop
  `BuscadorFiltros` (ya no es necesario)

Motivo: preferencia visual del autor — la pantalla completa es para el feed de recetas.

---

## [UI-001] — Layout split-screen /registro ✅

**Fecha:** 2026-03-21
**Fichero:** `frontend/src/app/registro/page.tsx`

Layout de dos paneles para la ruta `/registro`:

- Panel izquierdo (lg+): imagen gastronómica `fondo-auth.jpg` con `overlay bg-black/30` + gradiente lateral `from-transparent to-[var(--auth-dark)]` que funde imagen y panel sin corte brusco
- Texto editorial: `h1 font-black italic` + etiqueta decorativa con líneas horizontales + subtítulo `uppercase tracking-[0.35em]`
- Panel derecho: `bg-[var(--auth-dark)]` — negro cálido; Card blanca flota con contraste elegante
- Móvil: imagen oculta, formulario a pantalla completa con fondo oscuro

---

## [UI-002] — Paleta de colores Cookr completa ✅

**Fecha:** 2026-03-23
**Ficheros:** `frontend/src/app/globals.css`, `datosLanding.ts`, `bentoCaracteristicas.tsx`, `tarjetaTestimonio.tsx`, `formularioRegistro.tsx`, `registro/page.tsx`

Refactorización en dos pasadas para eliminar todos los colores hardcodeados:

**Pasada 1** — colores Tailwind genéricos sustituidos por vars existentes (`--brand`, `--brand-muted`, `--hero-gradient-*`, `--destructive`, `--chart-3`).

**Pasada 2** — nuevas variables CSS añadidas a `globals.css` (`:root` y `.dark`):

- `--category-social` → azul para elementos de comunidad
- `--category-ai` → violeta para elementos de IA
- `--theme-fresh` → verde para carrusel ensaladas
- `--theme-sweet` → rosa para carrusel postres
- `--theme-pasta` → violeta para carrusel pastas
- `--auth-dark` → negro cálido para panel de autenticación

Excepciones documentadas: `bg-black/30` (overlay funcional) y Google SVG fills (colores corporativos obligatorios).

---

## [UI-003] — Páginas legales /privacidad y /terminos ✅

**Fecha:** 2026-03-23
**Ficheros:** `frontend/src/app/privacidad/page.tsx`, `frontend/src/app/terminos/page.tsx`

**Política de privacidad** (`/privacidad`) — 10 secciones RGPD:

- Responsable del tratamiento (aviso académico TFG)
- Datos recogidos, tabla de finalidades con base legal
- Servicios de terceros: Google OAuth, Gemini, Edamam, Cloudinary, Resend, MongoDB Atlas, Vercel
- Retención, derechos RGPD, seguridad, menores (mín. 14 años)

**Términos de uso** (`/terminos`) — 11 secciones:

- Descripción completa del servicio (recetas, despensa, Gemini IA, Edamam, grupos, Modo Manos Libres, PWA)
- Tabla uso aceptable (✅ permitido / 🚫 prohibido)
- Aviso legal IA (respuestas orientativas, no consejo médico)

Diseño: cabecera sticky con logo Cookr + botón volver, índice navegable con anclas `#id`, 100% paleta Cookr.

---

## [UI-005] — Flujo de verificación de email (mock) ✅

**Fecha:** 2026-03-23
**Ficheros:** `frontend/src/app/verificar-email/pendiente/page.tsx`, `frontend/src/app/verificar-email/page.tsx`, `frontend/src/features/auth/components/tarjetaVerificacionPendiente.tsx`, `frontend/src/features/auth/components/formularioRegistro.tsx`

Pantallas del flujo de verificación de email post-registro. Todo es mock hasta Fase 4-6.

**`/verificar-email/pendiente`** — Pantalla "revisa tu correo":
- Icono de sobre con fondo `--brand-subtle`
- Muestra el email pasado como `?email=` desde `formularioRegistro.tsx`
- Aviso de carpeta spam
- Botón "Reenviar correo" con cooldown de 60 s (mock, TODO [AUTH-005] Fase 6: Resend)
- Link "Volver al registro"

**`/verificar-email`** — Verificación de token:
- Lee `?token=` de la query string
- Estado `verificando` → spinner + texto
- Si hay token: éxito tras 1.5 s (mock) → CheckCircle2 + botón a `/login`
- Si no hay token: error inmediato → XCircle + botones a `/registro` y reenvío
- TODO [AUTH-006] Fase 4: POST /api/auth/verificar-email con validación real del JWT

**`formularioRegistro.tsx`** — Modificación:
- Al hacer submit con éxito, `router.push('/verificar-email/pendiente?email=...')` en lugar del inline success card
- Eliminada la vista de éxito inline (reemplazada por la página dedicada)

0 colores hardcodeados — usa `--brand-subtle`, `--chart-3`, `text-brand`, `text-destructive`.

---

## [UI-008] Refactor capas — FormularioRegistro
Fecha:   2026-03-31 | Estado: ⏳ Pendiente | Sprint: 4
Fichero: `src/features/auth/components/formularioRegistro.tsx`

Cambio:
  Extraer `alEnviar` a hook `useRegistro()` en `useAuth.ts`.
  El componente solo llama al hook: `const { registrar, estado } = useAuth()`.

Archivos afectados:
  `src/services/apiClient.ts` → CREAR (instancia Axios con JWT)
  `src/services/authService.ts` → CREAR (método `registro`)
  `src/features/auth/hooks/useAuth.ts` → CREAR (hook `useRegistro`)
  `src/features/auth/components/formularioRegistro.tsx` → MODIFICAR

Motivo: cumplir patrón FE: Componente → Hook → Service → apiClient.
        Ver [DEBT-001](../fases/tech-debt.md)

---

## [UI-009] Refactor capas — FormularioLogin
Fecha:   2026-03-31 | Estado: ⏳ Pendiente | Sprint: 4
Fichero: `src/features/auth/components/formularioLogin.tsx`

Cambio:
  Extraer `alEnviar` a hook `useLogin()` en `useAuth.ts`.

Archivos afectados:
  `src/services/authService.ts` → MODIFICAR (añadir método `login`)
  `src/features/auth/hooks/useAuth.ts` → MODIFICAR (añadir `useLogin`)
  `src/features/auth/components/formularioLogin.tsx` → MODIFICAR

Motivo: ver [DEBT-002](../fases/tech-debt.md)

---

## [UI-010] Refactor capas — FormularioRecuperarContrasena
Fecha:   2026-03-31 | Estado: ⏳ Pendiente | Sprint: 5
Fichero: `src/features/auth/components/formularioRecuperarContrasena.tsx`

Cambio:
  Extraer `alEnviar` a hook `useRecuperarContrasena()` en `useAuth.ts`.

Archivos afectados:
  `src/services/authService.ts` → MODIFICAR (añadir método `recuperarContrasena`)
  `src/features/auth/hooks/useAuth.ts` → MODIFICAR
  `src/features/auth/components/formularioRecuperarContrasena.tsx` → MODIFICAR

Motivo: ver [DEBT-003](../fases/tech-debt.md)

---

## [UI-011] Refactor capas — FormularioNuevaContrasena
Fecha:   2026-03-31 | Estado: ⏳ Pendiente | Sprint: 5
Fichero: `src/features/auth/components/formularioNuevaContrasena.tsx`

Cambio:
  Extraer `alEnviar` a hook `useNuevaContrasena()` en `useAuth.ts`.

Archivos afectados:
  `src/services/authService.ts` → MODIFICAR (añadir método `nuevaContrasena`)
  `src/features/auth/hooks/useAuth.ts` → MODIFICAR
  `src/features/auth/components/formularioNuevaContrasena.tsx` → MODIFICAR

Motivo: ver [DEBT-004](../fases/tech-debt.md)

---

## [UI-012] Refactor capas — TarjetaVerificacionPendiente
Fecha:   2026-03-31 | Estado: ⏳ Pendiente | Sprint: 5
Fichero: `src/features/auth/components/tarjetaVerificacionPendiente.tsx`

Cambio:
  Extraer `handleReenviar` a hook `useReenviarVerificacion()` en `useAuth.ts`.

Archivos afectados:
  `src/services/authService.ts` → MODIFICAR (añadir método `reenviarVerificacion`)
  `src/features/auth/hooks/useAuth.ts` → MODIFICAR
  `src/features/auth/components/tarjetaVerificacionPendiente.tsx` → MODIFICAR

Motivo: ver [DEBT-005](../fases/tech-debt.md)

---

## [UI-013] Refactor capas — TarjetaRecuperacionPendiente
Fecha:   2026-03-31 | Estado: ⏳ Pendiente | Sprint: 5
Fichero: `src/features/auth/components/tarjetaRecuperacionPendiente.tsx`

Cambio:
  Extraer `handleReenviar` a hook `useReenviarRecuperacion()` en `useAuth.ts`.

Archivos afectados:
  `src/services/authService.ts` → MODIFICAR (añadir método `reenviarRecuperacion`)
  `src/features/auth/hooks/useAuth.ts` → MODIFICAR
  `src/features/auth/components/tarjetaRecuperacionPendiente.tsx` → MODIFICAR

Motivo: ver [DEBT-006](../fases/tech-debt.md)

---

## [UI-004] — Tipografía creativa en SeccionHero ✅

**Fecha:** 2026-03-23
**Fichero:** `frontend/src/features/landing/components/seccionHero.tsx`

Patrones tipográficos creativos aplicados al titular y subtítulo de la hero section, inspirados en Linear, Framer, Notion y Spotify:

**H1 — tres tratamientos por palabra clave:**

| Palabra     | Técnica CSS                                                                | Referente            |
| ----------- | -------------------------------------------------------------------------- | -------------------- |
| `cocinando` | `font-black italic text-brand`                                             | Spotify, Bon Appétit |
| `recetas`   | SVG wavy `var(--brand)`, `preserveAspectRatio="none"`                      | Notion, Framer, Arc  |
| `Cookr`     | `bg-gradient-to-r from-brand to-brand-muted bg-clip-text text-transparent` | Linear, Stripe       |

El SVG wavy usa la curva cuadrática `M0,5 Q25,1 50,5 Q75,9 100,5` con `overflow-visible` para no recortarse fuera del bounding box del texto.

**Subtítulo:** `comparte tus recetas` en `font-semibold text-foreground/80` para contrastar dentro del párrafo muted.

0 colores hardcodeados — toda la paleta usa variables Cookr del sistema de diseño.
