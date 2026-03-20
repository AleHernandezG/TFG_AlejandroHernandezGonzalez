# Fase 1 — Tareas Pendientes para Retomar
# TFG · Red Social Gastronómica con IA
# Creado: 2026-03-20 | Estado: ⏳ Pendiente
#
# Adjunta este fichero a Claude cuando quieras completar estas tareas.
# Contexto: "Quiero completar las tareas pendientes de la Fase 1"
# ─────────────────────────────────────────────────────────────────────

## [LANDING-001] Configuración Real del Carrusel de Imágenes
Estado:   ⏳ Pendiente (funciona con fondo y emojis temporalmente)
Cuándo:   Sprint 2 o cuando se integren assets reales (Fase 2 / Frontend UI)

Qué hay que hacer:
  1. Sustituir los placeholders de colores/emojis (`gradient`, `emoji`) en `heroSlides` de `src/features/landing/data/landing-data.ts` por URLs de imágenes reales o conectarlo a una API / CDN.
  2. Implementar un componente `Image` de `next/image` en `src/features/landing/components/hero-section.tsx` dentro del bucle del carrusel, con propiedades `fill`, `objectFit="cover"`, `priority` (para la primera imagen) para optimización SEO y LCP.
  3. Asegurarse de que las transiciones de opacidad (fade) de Framer Motion o CSS sigan funcionando correctamente con las imágenes.
  4. Revisar la accesibilidad (alt text) de las imágenes.

Commit esperado:
  feat(landing): implementar imágenes reales en carrusel de hero section
