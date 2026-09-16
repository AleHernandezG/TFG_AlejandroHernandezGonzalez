# Fase 1 — Carrusel Hero: Imágenes Reales + Transición + Accesibilidad
# TFG · Red Social Gastronómica con IA
# Creado: 2026-03-20 | Completado: 2026-04-21 | Estado: ✅ Completado
# ─────────────────────────────────────────────────────────────────────

## [CAROUSEL-001] Imágenes reales en el hero carousel
Estado:   ✅ Completado — 2026-04-21
Cuándo:   Sprint 2 o cuando se integren assets reales (Fase 2 / Frontend UI)

Lo que se hizo:
  - 4 fotografías WebP reales descargadas de Unsplash en `public/images/hero/`:
    `desayuno.webp`, `ensalada.webp`, `postre.webp`, `pasta.webp`
  - Tipo `SlideHero` actualizado: eliminado `emoji`, añadido `imageUrl: string`
  - `seccionHero.tsx`: `<Image fill sizes="100vw" priority={slideActivo === 0} />`
  - Overlays en dos capas para fotografía de producto sobre fondo claro:
    `bg-black/50` (tinte plano) + `bg-gradient-to-t from-black/60` (gradiente bottom-up)
  - Imágenes locales en `/public` — no requieren `remotePatterns` en `next.config.js`

Nota: Las imágenes son fotografía de producto sobre fondo blanco/claro (marble, gris, madera),
por lo que se necesitaron dos capas de overlay en lugar de la capa única del plan original.

---

## [CAROUSEL-002] Transición mejorada entre slides
Estado:   ✅ Completado — 2026-04-21

Lo que se hizo:
  - Evaluadas 6 opciones de transición en `docs/historico/desarrollo/fe/heroOpciones.html`
    (T1 Crossfade · T2 Slide horizontal · T3 Blur dissolve · T4 Ken Burns · T5 Scale reveal · T6 Wipe vertical)
  - Elegida **T1 Crossfade** (patrón Airbnb/Apple): fundido de opacidad puro, atemporalidad garantizada
  - `motion.div`: `initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}`
    `transition={{ duration: 1.2, ease: 'easeInOut' }}` — sin scale/zoom
  - `AnimatePresence mode="popLayout"` existente gestiona el crossfade entre slides

---

## [CAROUSEL-003] Controles accesibles del carrusel
Estado:   ✅ Completado (parcial) — 2026-04-21

Lo que se hizo:
  - `aria-live="polite" aria-atomic="true"` en `<span className="sr-only">` — anuncia cambio de slide
  - Puntos indicadores con `aria-label="Ver slide: {etiqueta}"` y `aria-current` en el activo
  - Carrusel automático (5 s) — sin botones prev/next (decisión de diseño: UX más limpia)
  - Botones prev/next descartados explícitamente por el autor en Sprint 3
