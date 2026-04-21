# UI Changes — Cookr

Registro de cambios visuales y de componentes. Formato: [UI-XXX] por orden cronológico.

> **Regla de oro:** nunca editar una entrada completada. Si el cambio evoluciona, crear una nueva entrada.

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

- 6 opciones evaluadas y documentadas en `docs/desarrollo/fe/heroOpciones.html`
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

**Excepciones rules.md documentadas:** `text-white`, `bg-black/N`, `border-white/N`, `bg-white/N`, `rgba(0,0,0,N)` en inline styles — ver sección "Excepciones permitidas" de `docs/rules.md`.

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

- Los chips de filtro actuales (Todas/Vegano/Keto/Sin gluten/Sin lactosa) son placeholders. Cuando el autor facilite el listado completo de alérgenos + dietas + dificultad, se sustituirán los datos de `FILTROS_FEED` y se añadirá separación visual por categoría (alérgenos / dietas / dificultad). Ver tarea pendiente en docs/phase-reports/fase-2-pendientes.md.

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

Nuevos componentes PC creados siguiendo Stitch `docs/stitch/home/PC/`:

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
        Ver [DEBT-001](../tech-debt.md)

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

Motivo: ver [DEBT-002](../tech-debt.md)

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

Motivo: ver [DEBT-003](../tech-debt.md)

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

Motivo: ver [DEBT-004](../tech-debt.md)

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

Motivo: ver [DEBT-005](../tech-debt.md)

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

Motivo: ver [DEBT-006](../tech-debt.md)

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
