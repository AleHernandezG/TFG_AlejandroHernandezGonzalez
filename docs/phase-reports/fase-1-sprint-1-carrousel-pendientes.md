# Fase 1 — Tareas Pendientes: Carrusel con Imágenes Reales
# TFG · Red Social Gastronómica con IA
# Creado: 2026-03-20 | Estado: ⏳ Pendiente
#
# Adjunta este fichero a Claude cuando quieras completar estas tareas.
# Contexto: "Quiero configurar el carrusel con imágenes reales en la landing"
# ─────────────────────────────────────────────────────────────────────

## [CAROUSEL-001] Imágenes reales en el hero carousel
Estado:   ⏳ Pendiente (actualmente usa fondos de gradiente + emoji placeholder)
Cuándo:   Sprint 2 o cuando se integren assets reales (Fase 2 / Frontend UI)

Qué hay que hacer:
  1. Obtener fotografías de alta resolución de comida para cada slide.
     Opciones:
     - Unsplash API (gratuita, sin sign-up para uso básico)
     - Cloudinary CDN (recomendado si ya se configura para subida de fotos de usuario)
     - Assets propios en /public/images/hero/

  2. Actualizar `heroSlides` en `src/features/landing/data/landing-data.ts`:
     - Añadir campo `imageUrl: string` a cada slide
     - Mantener `gradient` como fallback mientras carga la imagen

  3. Actualizar `HeroSection` en `src/features/landing/components/hero-section.tsx`:
     - Importar `Image` de `next/image`
     - Reemplazar el emoji decorativo por:
       ```tsx
       <Image
         src={heroSlides[activeSlide].imageUrl}
         alt={heroSlides[activeSlide].label}
         fill
         className="object-cover"
         priority={activeSlide === 0}
       />
       ```
     - Mantener los overlays de gradiente para legibilidad del texto

  4. Configurar `next.config.js` para permitir dominios de imagen externos:
     ```js
     images: {
       domains: ["images.unsplash.com", "res.cloudinary.com"],
     }
     ```

  5. Revisar accesibilidad:
     - `alt` descriptivo para cada imagen
     - No mostrar el emoji cuando hay imagen real

  6. Ajustar opacidad de los overlays si las imágenes tienen mucho detalle.

Commit esperado:
  feat(landing): integrar imágenes reales en carrusel hero section

---

## [CAROUSEL-002] Transición mejorada entre slides
Estado:   ⏳ Pendiente (actualmente fade simple con Framer Motion)
Cuándo:   Opcional — Sprint 3 o cuando se mejore el polish visual

Qué hay que hacer:
  1. Valorar transición de tipo "Ken Burns" (zoom lento en la imagen mientras hace fade).
  2. Añadir dirección de transición (slide-left/right) opcionalmente.
  3. Reducir duración del timer si las imágenes son más impactantes (de 5 s a 4 s).
  4. Considerar preload de la siguiente imagen para evitar parpadeo.

Commit esperado:
  feat(landing): mejorar transiciones del carrusel con efecto Ken Burns

---

## [CAROUSEL-003] Controles accesibles del carrusel
Estado:   ⏳ Pendiente (actualmente solo hay indicadores de puntos)
Cuándo:   Sprint 3 — mejoras de accesibilidad

Qué hay que hacer:
  1. Añadir botones prev/next con flechas (visibles en hover o permanentes en desktop).
  2. Añadir `role="region"` y `aria-label="Carrusel de imágenes"` al `<section>`.
  3. Añadir `aria-live="polite"` para anunciar el cambio de slide a lectores de pantalla.
  4. Pausar auto-play cuando el usuario hace hover o foco sobre el carrusel.
  5. Respetar `prefers-reduced-motion` — desactivar auto-play y animaciones.

Commit esperado:
  feat(landing): añadir controles accesibles y pausa al carrusel
