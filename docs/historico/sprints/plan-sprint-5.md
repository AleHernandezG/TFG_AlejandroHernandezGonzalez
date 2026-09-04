# Plan Sprint 5 — Tareas pendientes

> Generado: 2026-05-21  
> Estado: Pendiente de ejecución  
> Reglas: `docs/historico/rules.md` · `docs/referencia/estructura-frontend.md` · `docs/referencia/infraestructura.md`

---

## Reglas globales de desarrollo (aplican a TODAS las fases)

### Arquitectura FE (obligatorio)
```
Componente → Hook → Service → apiClient → Backend
```
- Ningún componente llama a Axios directamente
- Ningún hook conoce rutas de la API (`/api/...`)
- Nuevas llamadas HTTP → `src/services/<nombre>Service.ts`
- Nuevo estado global → `src/stores/<nombre>Store.ts`
- Imports siempre por barrel raíz: `@/features/<f>/components`

### Arquitectura BE (obligatorio)
```
Route → Controller → Service → Repository → MongoDB
```
- Ningún controller accede a Mongoose directamente
- Toda la lógica de negocio vive en services
- Todo acceso a MongoDB vive en repositories

### Paleta de colores
- 0 colores hardcodeados
- Solo variables CSS de `globals.css` o clases semánticas Tailwind
- Excepciones permitidas: `bg-black/N`, `text-white` sobre overlay, `bg-white/N`

### Nomenclatura
| Ámbito | Convención |
|---|---|
| Componentes FE | `camelCase` español |
| Hooks FE | `use` + camelCase español |
| Services FE | nombre + `Service` |
| Types FE | nombre + `.types` |
| Models BE | nombre + `Mongo` |
| Repositories BE | nombre + `Repository` |

### Verificación obligatoria entre fases
Antes de pasar a la siguiente fase:
1. `cd backend && npx tsc --noEmit` → 0 errores
2. `cd frontend && npx next lint` → 0 errores
3. Prueba manual en el navegador de los flujos afectados
4. **Confirmación explícita del autor**

### Documentación HTML
Cada cambio actualiza o crea el HTML correspondiente en `docs/historico/desarrollo/`:
- Cambios en detalle de receta → `integracionRecetas.html`
- Cambios en comentarios/social → `funcionalidadSocial.html`
- Manos libres → crear `modoManoLibres.html`
- Sidebar tendencias → `discoverHomeIntegracion.html`
- Refactors auth → crear `authRefactor.html`

---

## Fase 1 — Verificaciones y metadatos dinámicos

**Tareas:** ALEG-001 · DET-010  
**Estimación:** ~1-2h  
**Riesgo:** Mínimo — sin cambios de BE, sin estado nuevo

### ALEG-001 — Auditoría de iconos de alérgenos

**Contexto descubierto en exploración:**
- Los iconos viven en `frontend/public/alergenos/*.webp` (14 archivos)
- El componente central es `frontend/src/components/common/chipAlergeno.tsx`
- Mapeo interno: `alergenoId` → `imagen` (string) → `/alergenos/${imagen}.webp`
- `config/opcionesUsuario.ts` tiene `ALERGENOS_OPCIONES` con campo `icono` con rutas completas

**Archivos a auditar:**
```
frontend/src/components/common/chipAlergeno.tsx          ← mapa ID → imagen
frontend/src/config/opcionesUsuario.ts                   ← ALERGENOS_OPCIONES con rutas
frontend/src/features/perfil/components/dialogPreferenciasAlergenos.tsx ← usa alergeno.icono
frontend/src/features/recetas/components/detalleReceta/cabeceraReceta.tsx ← usa ChipAlergeno
frontend/src/features/recetas/components/crearReceta/seccionAlergenos.tsx ← usa ChipAlergeno
frontend/public/alergenos/                               ← 14 webp
```

**Qué verificar:**
1. Los 14 IDs de `chipAlergeno.tsx` coinciden con los 14 de `ALERGENOS_OPCIONES`
2. Las 14 rutas en `ALERGENOS_OPCIONES` apuntan a archivos que existen en `public/alergenos/`
3. El campo `alergeno.icono` en `dialogPreferenciasAlergenos.tsx` usa rutas absolutas (`/alergenos/...`)
4. `next/image` con dominio `undefined` carga rutas locales sin config extra en `next.config.js`

**Output:** Si todo está correcto, documentar como verificado. Si hay rutas rotas, corregirlas.

---

### DET-010 — Metadatos dinámicos en `/recetas/[id]`

**Contexto descubierto:**
- `app/(main)/recetas/[id]/page.tsx` tiene metadatos **estáticos**:
  ```ts
  export const metadata = { title: 'Detalle de receta — Cookr', ... }
  ```
- El SSR ya llama a `recetasService.obtenerPorId(params.id, token)` y tiene `receta` disponible
- El servicio ya existe: `frontend/src/services/recetasService.ts` → `obtenerPorId(id, token)`

**Implementación:**

Archivo: `frontend/src/app/(main)/recetas/[id]/page.tsx`

```ts
// Eliminar: export const metadata = { ... }

// Añadir:
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const receta = await recetasService.obtenerPorId(params.id)
  if (!receta) return { title: 'Receta — Cookr' }
  return {
    title: `${receta.titulo} — Cookr`,
    description: `${receta.descripcion ?? receta.titulo} · ${receta.tiempoMin} min · ${receta.dificultad}`,
    openGraph: {
      title: receta.titulo,
      description: receta.descripcion ?? receta.titulo,
      images: receta.imagenUrl ? [{ url: receta.imagenUrl }] : [],
      type: 'article',
    },
  }
}
```

**Restricciones:**
- `generateMetadata` no puede usar `getServerSession` (contexto diferente) → llamar sin token
- Si `receta` es null → fallback genérico sin throw
- Sin cambios en el componente page principal ni en el BE

**Docs a actualizar:** `docs/historico/desarrollo/integracionRecetas.html` — añadir sección "Metadatos dinámicos (DET-010)"

---

### Verificación Fase 1

```bash
cd frontend && npx tsc --noEmit   # 0 errores
cd frontend && npx next lint       # 0 warnings
```

Prueba manual:
1. Abrir `/recetas/[id-real]` y ver el `<title>` en DevTools
2. Compartir un enlace en WhatsApp/Telegram → debe mostrar la tarjeta de la receta
3. Revisar que los 14 iconos de alérgenos se renderizan en detalle de receta y en /perfil dialog

**Confirmación del autor requerida antes de Fase 2.**

---

## Fase 2 — DET-004: Paginación de comentarios

**Estimación:** ~3-4h  
**Riesgo:** Medio — afecta BE + FE, toca comentariosReceta.tsx

### Contexto descubierto

- `comentariosReceta.tsx` ya tiene un `Sheet` que muestra TODOS los comentarios
- Los comentarios llegan por SSR como `receta.listaComentarios[]` (todos de golpe)
- El `Sheet` se abre con `setSheetAbierto(true)` cuando hay > 3
- `recetasService.agregarComentario()` ya existe y funciona con optimistic update
- No hay endpoint separado para listar comentarios paginados

### BE — Nuevo endpoint

**Nuevo archivo:** `backend/src/routes/recetas.routes.ts` — añadir ruta:
```
GET /api/recetas/:id/comentarios?pagina=1&limite=8
```

**Repository** (`backend/src/repositories/recetaRepository.ts`):
```ts
async findComentarios(id: string, pagina: number, limite: number) {
  // Slicing de listaComentarios con skip/limit o slice en MongoDB
  // Devuelve: { comentarios: Comentario[], total: number, hayMas: boolean }
}
```

**Controller** (`backend/src/controllers/recetasController.ts`):
- Parsear `pagina` (default 1) y `limite` (default 8) de query params
- Validar que son números positivos
- optionalAuth — si hay token, no afecta la respuesta (comentarios son públicos)

**Service** (`backend/src/services/recetasService.ts`):
- Delegar en repository, sin lógica adicional

**Capas a tocar (BE):**
```
recetas.routes.ts
recetasController.ts   ← añadir obtenerComentarios()
recetasService.ts      ← añadir obtenerComentarios()
recetaRepository.ts    ← añadir findComentarios()
```

### FE — Hook + Componente

**Service** (`frontend/src/services/recetasService.ts`):
```ts
async obtenerComentarios(recetaId: string, pagina = 1, limite = 8): Promise<{
  comentarios: Comentario[]
  total: number
  hayMas: boolean
}>
```

**Hook** (`frontend/src/features/recetas/hooks/useComentarios.ts`):
```ts
// useInfiniteQuery de TanStack Query
// queryKey: ['comentarios', recetaId]
// getNextPageParam: usa hayMas del response
// Exporta: { comentarios[], fetchNextPage, hasNextPage, isFetchingNextPage }
```

**Componente** (`frontend/src/features/recetas/components/detalleReceta/comentariosReceta.tsx`):
- El Sheet pasa de mostrar `listaLocal` completa a usar `useComentarios`
- Botón "Cargar más" al final de la lista cuando `hasNextPage`
- `isLoading` inicial → 3 skeletons en el Sheet
- Optimistic update del nuevo comentario sigue funcionando (prepend a la primera página)
- Props: eliminat `comentarios: Comentario[]` del SSR → solo necesita `recetaId` y `total` (para el badge)

**Barrel** `features/recetas/components/detalleReceta/index.ts` — verificar export de useComentarios

### Docs

Actualizar `docs/historico/desarrollo/funcionalidadSocial.html`:
- Nueva sección: "Paginación de comentarios (DET-004)"
- Diagrama de flujo: Sheet → useInfiniteQuery → GET /api/recetas/:id/comentarios
- Decisiones: por qué infinite query vs paginación numérica

### Verificación Fase 2

```bash
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit
cd frontend && npx next lint
```

Prueba manual:
1. Receta con >8 comentarios → Sheet muestra los primeros 8 + botón "Cargar más"
2. Click en "Cargar más" → aparecen los siguientes 8
3. Añadir comentario → aparece al inicio sin recargar
4. Receta con ≤3 comentarios → no aparece el botón "Ver todos"

**Confirmación del autor requerida antes de Fase 3.**

---

## Fase 3 — HANDS-001: Modo manos libres (TTS)

**Estimación:** ~2-3h  
**Riesgo:** Bajo — sin BE, API del navegador, no afecta otros flujos

### Contexto descubierto

- `pasosReceta.tsx`: botón `<button>Modo manos libres</button>` sin onClick
- `previsualizacionReceta.tsx`: mismo botón sin onClick
- La infraestructura doc en `docs/referencia/infraestructura.md` menciona Web Speech API + Navigator Wake Lock

### Hook `useModoManoLibres.ts`

**Archivo nuevo:** `frontend/src/features/recetas/hooks/useModoManoLibres.ts`

```ts
// Estado:
// - activo: boolean (TTS corriendo)
// - pasoActual: number (índice del paso narrado)
// - soportado: boolean (window.speechSynthesis existe)

// Acciones:
// - iniciar(pasos: string[]) → lee el paso actual con SpeechSynthesisUtterance
// - pausar() / reanudar()
// - siguiente() / anterior()
// - detener()

// Wake Lock:
// - navigator.wakeLock.request('screen') al iniciar
// - wakeLock.release() al detener

// Idioma: 'es-ES' en SpeechSynthesisUtterance
// onend del utterance → avanzar automáticamente al siguiente paso
```

**No usa Zustand** — estado local del hook (solo vive mientras el componente está montado)  
**Guard de soporte:** `typeof window !== 'undefined' && 'speechSynthesis' in window`

### Integración en componentes

**`pasosReceta.tsx`:**
- Importar `useModoManoLibres`
- El botón `Modo manos libres` llama a `iniciar(pasos)`
- Cuando `activo`: resaltar el paso actual con `ring-2 ring-brand`, mostrar controles `← Anterior · ⏸ Pausar · → Siguiente`
- Botón "Detener" cierra el modo

**`previsualizacionReceta.tsx`:**
- Mismo patrón — el botón activa el hook con los pasos del formulario

### Docs

Crear `docs/historico/desarrollo/modoManoLibres.html`:
- Descripción del hook: estado, acciones, ciclo de vida
- Limitaciones conocidas: Safari mobile requiere interacción del usuario, voces disponibles varían por SO
- Tabla: componentes que usan el hook

### Verificación Fase 3

```bash
cd frontend && npx tsc --noEmit
cd frontend && npx next lint
```

Prueba manual (Chrome en desktop):
1. `/recetas/[id]` → click "Modo manos libres" → TTS lee el paso 1
2. Botón Siguiente → lee el paso 2, el paso activo se resalta visualmente
3. Botón Detener → TTS para, modo desactivado
4. Cerrar pestaña → Wake Lock liberado sin error en consola
5. En Firefox/Safari → si no hay soporte, botón oculto o deshabilitado con tooltip

**Confirmación del autor requerida antes de Fase 4.**

---

## Fase 4 — TEND-001: Sidebar de tendencias con datos reales

**Estimación:** ~3-4h  
**Riesgo:** Bajo-medio — solo visible en `lg+`, no afecta móvil

### Contexto descubierto

- `sidebarTendencias.tsx` importa `RECETAS_POPULARES` y `CHEFS_DESTACADOS` de `datosTendencias.ts` (mock)
- `recetasService.obtenerFeed({ sort: 'likes', limite: 5 })` ya funciona → "Recetas Populares" gratuito
- No existe endpoint de usuarios destacados en el BE

### Parte A — "Recetas Populares" (sin nuevo endpoint)

**Hook nuevo:** `frontend/src/features/recetas/hooks/useRecetasPopulares.ts`
```ts
// useQuery con recetasService.obtenerFeed({ sort: 'likes', limite: 5 })
// staleTime: 5 * 60 * 1000 (5 min — cambia lento)
// Devuelve: PostFeed[]
```

**`sidebarTendencias.tsx`:** reemplaza `RECETAS_POPULARES` mock por `useRecetasPopulares()`

### Parte B — "Chefs Destacados" (nuevo endpoint BE)

**Repository** (`backend/src/repositories/usuarioRepository.ts`):
```ts
async findDestacados(limite = 5): Promise<{ id, nombre, foto, _count: { recetas, seguidores } }[]>
// Aggregate: lookup recetas, contar por autorId, sort desc, limit
```

**Endpoint:** `GET /api/usuarios/destacados?limite=5`  
**Auth:** público (sin requerirAuth)  
**Capas BE:** `usuarios.routes.ts` + `usuariosController.ts` + `usuariosService.ts` + `usuarioRepository.ts`

**Service FE:** añadir `obtenerDestacados()` a `frontend/src/services/usuariosService.ts` (o crear si no existe)

**Hook nuevo:** `frontend/src/features/recetas/hooks/useChefsDestacados.ts`
```ts
// useQuery con usuariosService.obtenerDestacados()
// staleTime: 10 * 60 * 1000 (10 min)
```

**`sidebarTendencias.tsx`:** reemplaza `CHEFS_DESTACADOS` mock por `useChefsDestacados()`

**Botón Seguir:** conectar al endpoint `POST /api/usuarios/:id/seguir` ya existente — usar `useToggleSeguir` si existe o el endpoint directamente

### Docs

Actualizar `docs/historico/desarrollo/discoverHomeIntegracion.html`:
- Nueva sección: "Sidebar de tendencias — datos reales (TEND-001)"
- Documenta los dos hooks y el nuevo endpoint

### Verificación Fase 4

```bash
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit
cd frontend && npx next lint
```

Prueba manual (desktop `lg+`):
1. `/home` en ventana ≥1024px → sidebar muestra recetas reales ordenadas por likes
2. Sidebar muestra usuarios reales ordenados por recetas publicadas
3. Botón Seguir en un chef → cambia a Siguiendo
4. En móvil → sidebar completamente oculto, sin errores

**Confirmación del autor requerida antes de Fase 5.**

---

## Fase 5 — Refactors de auth (baja prioridad)

**Estimación:** ~3-4h  
**Riesgo:** Bajo — refactor puro, sin cambiar comportamiento

### AUTH-004 — Verificar avatar en sesión NextAuth

**Contexto descubierto:** La sesión YA tiene el campo `image` mapeado desde `picture` en el JWT. El login de credentials ya pasa `usuario.foto` → `picture`. Puede que ya funcione.

**Tarea:** Verificar que `session.user.image` llega con valor cuando el usuario tiene `foto` en MongoDB.  
Si no funciona → revisar que `authService.login()` en el BE devuelve `foto` en la respuesta y que el callback `jwt` lo captura (línea ~52 de `lib/auth.ts`).  
**Sin cambios adicionales** si ya funciona.

### API-012 — Hook `useAuth.ts`

**Archivo nuevo:** `frontend/src/features/auth/hooks/useAuth.ts`

```ts
// Consolida:
// - iniciarSesionConCredenciales(correo, contrasena) → signIn("credentials", ...)
// - iniciarSesionConGoogle() → signIn("google", ...)
// - cerrarSesion(callbackUrl?) → signOut(...)
// - registrar(datos) → authService.registro(datos)
// - recuperarContrasena(correo) → authService.recuperarContrasena(correo)
// - nuevaContrasena(token, contrasena) → authService.nuevaContrasena(token, contrasena)
// Gestiona: estado cargando (boolean), error (string | null)
```

**Sin Zustand** — estado local del hook por formulario

### UI-008 a UI-013 — Extraer lógica inline

**Archivos a refactorizar:**

| Archivo | Qué mover a useAuth |
|---|---|
| `formularioRegistro.tsx` | función `alEnviar` completa |
| `formularioLogin.tsx` | función `alEnviar` completa |
| `formularioRecuperarContrasena.tsx` | función `alEnviar` |
| `formularioNuevaContrasena.tsx` | función `alEnviar` |
| `tarjetaVerificacionPendiente.tsx` | lógica de reenvío |
| `tarjetaRecuperacionPendiente.tsx` | lógica de reenvío + cooldown |

**Patrón resultante en cada componente:**
```ts
const { iniciarSesionConCredenciales, cargando, error } = useAuth()
// onSubmit → llamar al hook, sin Axios ni authService directo
```

**Barrel:** `frontend/src/features/auth/hooks/index.ts` — exportar `useAuth`

### Docs

Crear `docs/historico/desarrollo/authRefactor.html`:
- Antes/después del patrón
- Tabla: componente → método del hook que usa
- Decisión de diseño: por qué hook y no solo el service

### Verificación Fase 5

```bash
cd frontend && npx tsc --noEmit
cd frontend && npx next lint
```

Prueba manual (flujos completos):
1. Registro con email → flujo completo hasta /verificar-email/pendiente
2. Login con credenciales → redirige a /home
3. Login con Google → redirige a /completar-perfil o /home
4. Recuperar contraseña → email enviado, cooldown visible
5. Nueva contraseña → cambio exitoso, redirige a /login

**Confirmación del autor requerida al terminar.**

---

## Tareas diferidas — Sprint 6

Estas tareas NO se abordan en este sprint:

| ID | Razón |
|---|---|
| NUTR-001 | Requiere API key de Edamam + presupuesto de llamadas (100/mes tier gratuito) |
| /chat Gemini | Requiere `GEMINI_API_KEY` activa en `.env` + diseño de prompts |
| DOCS-003 | Se hace al final del proyecto, una vez todas las vistas estén estables |
| DESP-TICKET-001 | OCR ticket de compra → requiere Gemini Vision API (multimodal) |
| CHAT-SMART-001 | Chat recomienda recetas con contexto despensa → depende de /chat Gemini |
| CREAR-TEXT-001 | Crear receta desde texto → depende de Gemini API |

---

## Tareas adicionales — identificadas en sesión 2026-05-31

Estas tareas se añaden al backlog sprint 5 y se encolan después de las Fases 1-5:

### FEED-SMART-001 — Feed inteligente en home (Sprint 5)

**Objetivo:** el feed de /home no queda vacío para nuevos usuarios con pocos seguidos. Mezcla seguidos + recomendaciones personalizadas.

**Contexto:**
- `feedHome.tsx` pasa `soloSiguiendo: true` → si el usuario no sigue a nadie, el feed queda vacío
- El perfil del usuario tiene `alergias[]` y `preferencias[]` desde `/completar-perfil`
- `GET /api/recetas` ya acepta `dietas[]`, `alergenos[]`, `sort`

**BE** (`recetaRepository.findAll()`):
- Nuevo modo `recomendado: true` — cuando el usuario no sigue a nadie:
  - Filtra por `preferencias` del usuario (`categorias: { $in: preferencias }`)
  - Excluye `alergias` (`alergenos: { $nin: alergias }`)
  - `sort: 'likes'` — los más populares compatibles

**FE** (`useRecetasFeed.ts` + `feedHome.tsx`):
- Si `soloSiguiendo: true` y el resultado está vacío → fallback con `recomendado: true`
- O bien: dos queries en paralelo (siguiendo + recomendadas) que se mezclan

**Archivos a tocar:**
```
backend/src/repositories/recetaRepository.ts     ← nuevo filtro recomendado
backend/src/controllers/recetasController.ts     ← parsear param recomendado
frontend/src/features/recetas/hooks/useRecetasFeed.ts  ← lógica fallback
frontend/src/features/recetas/components/home/feedHome.tsx
```

**Docs:** actualizar `docs/historico/desarrollo/discoverHomeIntegracion.html`

---

### DESP-003 — Vaciar despensa (Sprint 5)

**Objetivo:** botón para eliminar todos los ítems de la despensa de una vez.

**BE** — nuevo endpoint:
```
DELETE /api/despensa/vaciar   (requerirAuth)
→ $set: { despensa: [] }
→ devuelve 204
```

**FE:**
- Botón "Vaciar todo" en `headerDespensa.tsx` (solo visible si `items.length > 0`)
- Dialog de confirmación antes de ejecutar
- `useVaciarDespensa` mutation en `useMiDespensa.ts` con optimistic update

**Archivos:**
```
backend/src/repositories/despensaRepository.ts   ← añadir vaciar()
backend/src/controllers/despensaController.ts    ← añadir vaciar()
backend/src/routes/despensa.routes.ts            ← DELETE /vaciar (antes de /:id)
frontend/src/features/despensa/hooks/useMiDespensa.ts
frontend/src/features/despensa/components/headerDespensa.tsx
```

**Docs:** actualizar `docs/historico/desarrollo/despensaIntegracion.html`

---

### PERF-SSR-001 — Análisis y optimización de carga de vistas (Sprint 5)

**Objetivo:** identificar qué vistas tienen latencia alta y si se pueden mejorar con RSC, Suspense streaming o static rendering.

**Qué analizar:**
- `/home`: `force-dynamic` en feedHome por el token → ¿conviene separar SSR shell + CSR feed?
- `/recetas/[id]`: `force-dynamic` + SSR pesado → candidato a Suspense streaming
- `/perfil`, `/despensa`: todo CSR (hooks) → ya optimal
- `/discover`: `force-dynamic` → igual que home

**Implementación si aplica:**
- Suspense boundaries alrededor de componentes pesados (loading skeleton ya existe)
- RSC para el shell de la página + Client Component para el feed
- No tocar `staleTime` ni invalidaciones (ya correctas)

**Docs:** crear `docs/historico/desarrollo/optimizacionRendimiento.html`

---

### STATE-001 — Auditoría del estado de recetas (Sprint 5)

**Objetivo:** verificar que la caché de TanStack Query se invalida correctamente entre vistas y que no hay estados desincronizados.

**Qué revisar:**
- `queryKey: ['recetas', ...]` — consistencia entre hooks (`useRecetasFeed`, `useToggleLike`, `useToggleGuardado`, etc.)
- Si un like en detalle → ¿actualiza el contador en el feed?
- Si se publica una receta → ¿se invalida `['mis-recetas']`?
- Si se elimina una receta → ¿se invalida `['feed']` y `['guardadas']`?

**Implementación si hay gaps:**
- `queryClient.invalidateQueries({ queryKey: [...] })` en los onSuccess de cada mutation
- Sin Zustand extra — TanStack Query ya es el estado centralizado de servidor

---

### DESP-TICKET-001 — OCR ticket de compra → despensa (Sprint 6)

**Objetivo:** el usuario fotografía un ticket de compra y los ingredientes se añaden automáticamente a la despensa.

**Tecnología:** Gemini Vision API (gemini-1.5-flash, multimodal — acepta imagen + texto)

**Flujo:**
1. Usuario sube foto del ticket en una nueva acción de `sheetAnadirIngrediente.tsx`
2. BE recibe la imagen en base64 → llama a Gemini: `"Extrae los ingredientes alimentarios de este ticket en JSON: [{nombre, cantidad, unidad}]"`
3. BE devuelve el array → FE muestra previsualización para confirmar antes de añadir
4. Usuario confirma → se añaden a la despensa vía `useAñadirItem`

**Requiere:** `GEMINI_API_KEY` en Render + cuenta Google AI Studio

---

### CHAT-SMART-001 — Chat recomienda recetas con contexto despensa (Sprint 6)

**Objetivo:** cuando el usuario pregunta al chat sobre qué cocinar, Gemini recibe como contexto:
- Contenido actual de la despensa (`nombre, cantidad, unidad`)
- Preferencias y alergias del perfil

**Implementación:**
- Prompt del sistema: `"El usuario tiene en su despensa: [lista]. Sus alergias: [lista]. Sus preferencias: [lista]. Recomienda recetas de Cookr cuando te lo pidan."`
- El contexto se construye en el BE antes de llamar a Gemini
- Depende de `/chat` Gemini activo

---

### CREAR-TEXT-001 — Crear receta desde descripción de texto (Sprint 6)

**Objetivo:** el usuario escribe o dicta "quiero una receta de pasta con gambas para 2 personas, fácil y rápida" y el formulario de crear receta se pre-rellena.

**Flujo:**
1. Botón "Crear desde texto" en `/crear-receta` (o en el chat)
2. Input de texto libre → Gemini genera JSON de receta (titulo, ingredientes, pasos, tiempoMin, dificultad, porciones)
3. El JSON se carga en `useCrearRecetaStore` → el formulario aparece pre-rellenado
4. El usuario revisa y edita antes de publicar

---

## Orden de ejecución recomendado

```
Fase 1 → [OK del autor] → Fase 2 → [OK del autor] → Fase 3 → [OK del autor] → Fase 4 → [OK del autor] → Fase 5 → [OK del autor]
→ FEED-SMART-001 → DESP-003 → PERF-SSR-001 → STATE-001 → [OK del autor]
→ Sprint 6: DESP-TICKET-001 → CHAT-SMART-001 → CREAR-TEXT-001
```

Cada fase es independiente. Si el autor quiere saltarse o reordenar fases, es posible sin dependencias entre ellas.

---

## Archivos HTML de docs a crear/actualizar

| Fase | Acción | Archivo |
|---|---|---|
| 1 — ALEG-001 | Crear | `docs/historico/desarrollo/integracionRecetas.html` |
| 1 — DET-010 | Crear | `docs/historico/desarrollo/integracionRecetas.html` |
| 2 — DET-004 | Actualizar | `docs/historico/desarrollo/funcionalidadSocial.html` |
| 3 — HANDS-001 | Crear | `docs/historico/desarrollo/modoManoLibres.html` |
| 4 — TEND-001 | Actualizar | `docs/historico/desarrollo/discoverHomeIntegracion.html` |
| 5 — Refactors | Crear | `docs/historico/desarrollo/authRefactor.html` |
| FEED-SMART-001 | Actualizar | `docs/historico/desarrollo/discoverHomeIntegracion.html` |
| DESP-003 | Actualizar | `docs/historico/desarrollo/despensaIntegracion.html` |
| PERF-SSR-001 | Crear | `docs/historico/desarrollo/optimizacionRendimiento.html` |
| Todas | Actualizar contadores | `docs/historico/desarrollo/estadoTareas.html` |
