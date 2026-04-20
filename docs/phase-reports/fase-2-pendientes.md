# Fase 2 — Tareas Pendientes para Retomar
# TFG · Cookr — Red Social Gastronómica con IA
# Creado: 2026-04-07 | Estado: ⏳ Pendiente
#
# Adjunta este fichero a Claude cuando quieras completar estas tareas.
# Contexto: "Quiero completar las tareas pendientes de la Fase 2"
# ─────────────────────────────────────────────────────────────────────

## [DET-001] Guardar receta persistente
Estado:   ⏳ Pendiente — Sprint 3
Componentes: heroReceta.tsx · cabeceraReceta.tsx · detalleRecetaCliente.tsx

Qué hay que hacer:
  1. Crear endpoint BE: POST /api/recetas/:id/guardar (toggle)
  2. Crear recetasService.toggleGuardado(id) en src/services/recetasService.ts
  3. Añadir mutación TanStack Query con optimistic update
  4. Mover estado guardado de useState local a Zustand store (recetasStore)
  5. El icono BookmarkCheck en hero y cabecera se sincronizan via store

---

## [DET-002] Like persistente
Estado:   ⏳ Pendiente — Sprint 3
Componentes: cabeceraReceta.tsx · tarjetaPost.tsx

Qué hay que hacer:
  1. Crear endpoint BE: POST /api/recetas/:id/like (toggle)
  2. Crear recetasService.toggleLike(id) en src/services/recetasService.ts
  3. Añadir mutación TanStack Query con optimistic update (contador +1/-1)
  4. El estado liked/likes local (useState) se sustituye por useMutation

---

## [DET-003] Compartir receta
Estado:   ⏳ Pendiente — Sprint 5
Componentes: cabeceraReceta.tsx (botón Share2 sin handler)

Qué hay que hacer:
  1. Añadir handler onClick al botón Share2
  2. Implementar Web Share API: navigator.share({ title, url })
  3. Fallback si navigator.share no disponible: copiar URL al portapapeles
     con navigator.clipboard.writeText(window.location.href)
  4. Toast de confirmación: "Enlace copiado" (shadcn/ui toast)

---

## [DET-004] Ver comentarios completos
Estado:   ⏳ Pendiente — Sprint 4
Componentes: comentariosReceta.tsx (botón "Ver todos" sin handler)

Qué hay que hacer:
  1. Crear endpoint BE: GET /api/recetas/:id/comentarios?page=1&limit=20
  2. Crear Sheet/Drawer shadcn con lista paginada de comentarios
  3. Hook useComentarios(recetaId) con TanStack Query (infinite scroll)
  4. El botón "Ver todos" abre el Sheet

---

## [DET-005] Añadir comentario
Estado:   ⏳ Pendiente — Sprint 4
Componentes: comentariosReceta.tsx (sin input de comentario)

Qué hay que hacer:
  1. Crear endpoint BE: POST /api/recetas/:id/comentarios (autenticado)
  2. Añadir textarea + botón "Comentar" al pie de comentariosReceta
  3. Validación: mínimo 3 caracteres, máximo 500
  4. Mutación TanStack Query con invalidación de caché de comentarios
  5. Requiere sesión activa (useSession NextAuth) — mostrar prompt login si no

---

## [DET-006] Añadir ingredientes a despensa
Estado:   ⏳ Pendiente — Sprint 6
Componentes: tabsReceta.tsx (link "Añadir a mi despensa" sin handler)

Qué hay que hacer:
  1. Crear modelo Despensa en MongoDB: { usuario, ingrediente, cantidad, unidad, fechaAdicion }
  2. Crear endpoint BE: POST /api/despensa/anadir-desde-receta
     Body: { recetaId, ingredientes: [{ nombre, cantidad, unidad }] }
  3. Crear despensaService.anadirDesdeReceta() en src/services/despensaService.ts
  4. El link abre un Sheet de confirmación con los ingredientes pre-seleccionados
  5. El usuario puede desmarcar los que ya tiene antes de confirmar

---

## [DET-007] Modo Manos Libres
Estado:   ⏳ Pendiente — Sprint 8
Componentes: pasosReceta.tsx (botón Headphones sin handler)

Qué hay que hacer:
  1. Implementar Web Speech API — síntesis de voz (SpeechSynthesisUtterance)
  2. Crear hook useModoManoLibres(pasos: string[])
     - Estado: pasoActual, reproduciendo, pausa/resume
  3. Narrar cada paso al activar; "siguiente paso" / "paso anterior" por voz
     (SpeechRecognition API)
  4. UI: overlay con paso actual grande + controles anterior/pausa/siguiente
  5. Probar compatibilidad: Chrome/Safari mobile (iOS requiere interacción previa)

---

## [DET-008] Carga de receta real por ID
Estado:   ⏳ Pendiente — Fase 5
Componentes: app/(main)/recetas/[id]/page.tsx

Qué hay que hacer:
  1. Crear endpoint BE: GET /api/recetas/:id
     Devuelve RecetaDetalle completo (con ingredientes, pasos, macros, etc.)
  2. Crear recetasService.obtenerPorId(id) en src/services/recetasService.ts
  3. Crear hook useRecetaDetalle(id) con TanStack Query
  4. Sustituir en page.tsx:
       const receta = RECETA_DETALLE_MOCK
     por:
       const receta = await recetasService.obtenerPorId(params.id)
  5. Añadir notFound() si el id no existe (404)
  6. Los componentes hijo NO cambian

---

## [DET-009] Navegación carrusel similares funcional
Estado:   ⏳ Pendiente — Sprint 3
Componentes: carruselSimilares.tsx

Qué hay que hacer:
  1. Los links ya apuntan a /recetas/:id correctamente
  2. Cuando haya datos reales, el endpoint GET /api/recetas/:id/similares
     debe devolver PostFeed[] con recetas del mismo estilo/categoría
  3. Crear recetasService.obtenerSimilares(id)
  4. Las mini cards usarán datos reales — el componente carruselSimilares NO cambia

---

## [DET-010] Metadatos dinámicos por receta (SEO)
Estado:   ⏳ Pendiente — Fase 5
Componentes: app/(main)/recetas/[id]/page.tsx

Qué hay que hacer:
  1. Sustituir el export estático:
       export const metadata = { title: 'Detalle de receta — Cookr' }
     por función dinámica:
       export async function generateMetadata({ params }) {
         const receta = await recetasService.obtenerPorId(params.id)
         return {
           title: `${receta.receta.titulo} — Cookr`,
           description: receta.receta.descripcion,
           openGraph: { images: [receta.receta.imagenUrl] }
         }
       }
  2. Añadir Open Graph tags para compartir en redes sociales con imagen

---

## [HOME-001] Chips de filtros del feed — RESUELTO con drawer ✅
Estado:   ✅ Completado — Sprint 3 (solución alternativa aprobada)

Resuelto de forma distinta a lo planificado: en lugar de chips inline con categorías,
se implementó un DrawerFiltros (vaul bottom-sheet) con 3 secciones separadas:
  - Dieta: 10 opciones de DIETAS_OPCIONES (config/opcionesUsuario.ts)
  - Dificultad: Fácil / Media / Difícil
  - Excluir alérgenos: 14 opciones de ALERGENOS_OPCIONES (config/opcionesUsuario.ts)

Ventaja: los chips inline causaban desbordamiento del viewport — el drawer elimina ese problema.
Ver: ui-changes.md [UI-017] y docs/desarrollo/busquedaFiltros.html
