# Plan Sprint 6 — Completar el TFG

> Generado: 2026-05-31
> Estado: Pendiente de ejecución
> Reglas: `docs/historico/rules.md` · `docs/referencia/estructura-frontend.md` · `docs/referencia/infraestructura.md`

---

## Reglas globales (igual que Sprint 5)

Arquitectura FE: `Componente → Hook → Service → apiClient → Backend`
Arquitectura BE: `Route → Controller → Service → Repository → MongoDB`
0 colores hardcodeados. Barrel imports. camelCase español en componentes.

### Verificación obligatoria entre fases

1. `cd backend && npx tsc --noEmit` → 0 errores
2. `cd frontend && npx next lint` → 0 errores
3. Prueba manual en navegador
4. **Confirmación explícita del autor**

---

## Orden recomendado

```
Fase A → [OK] → Fase B → [OK] → Fase C (necesita Gemini) → [OK] → Fase D (necesita Edamam)
```

Fases A y B no requieren ninguna API externa. C y D requieren claves.

---

## FASE A — Sin APIs externas, máximo impacto inmediato

**Estimación:** ~3-4h
**Riesgo:** Mínimo

### A1 — SEED-002: Actualizar imágenes del seed con Pexels (~5 min)

Script ya creado. Solo ejecutar:

```bash
cd backend
npx ts-node src/scripts/updateSeedImages.ts
```

Verifica que cada receta pasa de URL picsum a una foto real de Pexels.
Recargar `/home` y `/discover` para ver el resultado.

---

### A2 — DESP-003: Botón "Vaciar despensa"

**BE** — nuevo endpoint (ANTES de `/:id` en el router):

```
DELETE /api/despensa/vaciar   (requerirAuth)
→ despensaRepository.vaciar(userId): $set { despensa: [] }
→ devuelve 204
```

**Capas BE:** `despensaRepository.ts` + `despensaController.ts` + `despensa.routes.ts`

**FE:**
- `useVaciarDespensa` mutation en `useMiDespensa.ts` — optimistic update: `setQueryData([...], [])`
- `headerDespensa.tsx`: botón "Vaciar todo" visible solo si `items.length > 0` + Dialog de confirmación

**Docs:** actualizar `docs/historico/desarrollo/despensaIntegracion.html`

---

### A3 — FEED-SMART-001: Feed inteligente en home

**Problema:** si el usuario no sigue a nadie, `soloSiguiendo:true` devuelve feed vacío.

**Solución:** doble query en `feedHome.tsx` — primero intenta solo seguidos, si está vacío lanza una segunda query con las preferencias del usuario.

**FE** (`feedHome.tsx` + `useRecetasFeed.ts`):

```ts
// En feedHome.tsx:
const { data: perfil } = useMiPerfil()  // ya existe en features/perfil/hooks

// Primera query: solo siguiendo
const feedSiguiendo = useRecetasFeed({ soloSiguiendo: true, excluirPropio: true })

// Segunda query (recomendaciones): activada solo cuando siguiendo está vacío
const feedRecomendado = useRecetasFeed({
  dietas: perfil?.preferencias ?? [],
  alergenos: perfil?.alergias ?? [],
  sort: 'likes',
  excluirPropio: true,
}, {
  enabled: feedSiguiendo.isSuccess && feedSiguiendo.data?.recetas.length === 0
})

const recetas = feedSiguiendo.data?.recetas.length
  ? feedSiguiendo.data.recetas
  : feedRecomendado.data?.recetas ?? []

const cargando = feedSiguiendo.isLoading || feedRecomendado.isLoading
const esRecomendado = feedSiguiendo.isSuccess && !feedSiguiendo.data?.recetas.length
```

Cuando `esRecomendado` es true → mostrar chip/label "Recetas para ti" en el header del feed.

**Docs:** actualizar `docs/historico/desarrollo/discoverHomeIntegracion.html`

---

### A4 — Editar receta propia

**Contexto:** `tarjetaColeccion.tsx` tiene el botón "Editar receta" desactivado.

**BE** — nuevo endpoint:
```
PUT /api/recetas/:id   (requerirAuth)
```

**Repository** (`recetaRepository.ts`):
```ts
async actualizar(recetaId: string, usuarioId: string, datos: Partial<DatosCrearRecetaBody>): Promise<void>
// Verifica autorId === usuarioId (403 si no)
// $set de los campos presentes en datos
```

**FE — ruta nueva:** `/editar-receta/[id]`
- Reutiliza el formulario de `/crear-receta` (mismos componentes RHF)
- Carga los datos actuales de la receta con `recetasService.obtenerPorId(id)`
- Pre-rellena el store de Zustand con los datos existentes
- Al guardar llama a `recetasService.actualizar(id, datos, token)` (nuevo método)
- Redirige a `/coleccion?tab=mis-recetas` o a `/recetas/[id]`

**Activar el botón** en `tarjetaColeccion.tsx` → `router.push('/editar-receta/' + receta.id)`

**Docs:** actualizar `docs/historico/desarrollo/coleccionYCrearReceta.html`

---

### A5 — Avatar upload real

**Contexto:** `/perfil` muestra el avatar pero el icono de cámara no hace nada.

**BE** — nuevo endpoint:
```
PUT /api/usuarios/me/foto   (requerirAuth)
Body: { fotoBase64: string }
→ usuarioRepository.actualizarFoto(id, fotoBase64)
→ devuelve { foto: string }
```

**FE:**
- `perfilService.ts`: añadir `subirFoto(fotoBase64, token)`
- `usePerfil.ts`: añadir `useSubirFoto` mutation
- `tarjetaAvatarPerfil.tsx`: `<input type="file" accept="image/*">` oculto + click en el icono cámara lo dispara → convierte a base64 → llama al hook → actualiza `session.image` con `update({ image: nuevaUrl })`

**Docs:** actualizar `docs/historico/desarrollo/perfilIntegracion.html`

---

### A6 — STATE-001: Auditoría del cache TanStack Query

**Objetivo:** verificar que las mutations invalidan el cache correcto para evitar estados desincronizados.

**Qué revisar y corregir si falta:**

| Acción | queryKey a invalidar |
|---|---|
| Like en detalle | `['recetas', 'feed']` |
| Guardar receta | `['coleccion', 'guardadas']` |
| Publicar receta | `['coleccion', 'mis-recetas']` |
| Eliminar receta | `['coleccion', 'mis-recetas']` + `['recetas', 'feed']` |
| Añadir item despensa | `['despensa']` (ya correcto) |
| Vaciar despensa | `['despensa']` |
| Actualizar preferencias | `['perfil', 'me']` (ya correcto) |
| Nuevo comentario | `['comentarios', recetaId]` (ya correcto) |

**Archivos a revisar:** todos los hooks con `useMutation` en `features/recetas/hooks/`, `features/coleccion/hooks/`, `features/despensa/hooks/`.

---

### A7 — PERF-SSR-001: Análisis y optimización de carga

**Análisis de las rutas más lentas:**

| Ruta | Situación actual | Mejora posible |
|---|---|---|
| `/home` | `force-dynamic` por token → siempre SSR | RSC shell estático + `<Suspense>` alrededor del feed |
| `/recetas/[id]` | `force-dynamic` + SSR pesado | Suspense streaming para comentarios y similares |
| `/discover` | `force-dynamic` | Igual que home |
| `/perfil` | CSR puro | Ya óptimo |
| `/despensa` | CSR puro | Ya óptimo |

**Implementación:**
- En `/home/page.tsx`: el shell (header, navbar) como RSC estático; el feed en Client Component con `<Suspense fallback={<SkeletonFeed />}>`
- En `/recetas/[id]/page.tsx`: datos del hero/cabecera en SSR; comentarios y similares en `<Suspense>` con Client Component
- Medir con Chrome DevTools → Network → ver tiempo hasta First Contentful Paint

**Docs:** crear `docs/historico/desarrollo/optimizacionRendimiento.html`

---

### Verificación Fase A

```bash
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit
cd frontend && npx next lint
```

Pruebas manuales:
1. `/home` sin seguidos → debe mostrar "Recetas para ti" con feed de recomendaciones
2. `/despensa` → botón "Vaciar todo" aparece y elimina todo con confirmación
3. `/coleccion` → botón "Editar" en mis recetas → abre formulario pre-rellenado
4. `/perfil` → cámara → subir foto → avatar actualizado en sesión
5. Sidebar desktop → recetas e items reales con click funcional

**Confirmación del autor requerida antes de Fase B.**

---

## FASE B — Edamam API (EDAMAM_APP_ID + EDAMAM_APP_KEY)

**Estimación:** ~3-4h
**Prerrequisito:** claves de Edamam en `.env` del backend

Obtener en: [developer.edamam.com](https://developer.edamam.com) — tier gratuito: 100 llamadas/mes análisis nutricional, 1000/mes búsqueda alimentos.

### B1 — NUTR-001: Macros reales al crear receta

**Contexto:** al publicar una receta, los macros se guardan como `{calorias:0, proteinas:0, carbos:0, grasas:0}`. La sección de nutrición en el detalle muestra "—".

**BE** — `imagenService.ts` → añadir `calcularMacros()`:
```ts
async function calcularMacros(ingredientes: { nombre: string; cantidad: number; unidad: string }[]): Promise<IMacrosReceta>
// Llama a Edamam Nutrition Analysis API:
// POST https://api.edamam.com/api/nutrition-details
// Body: { ingr: ["200g espaguetis", "100g guanciale", ...] }
// Devuelve: { calories, totalNutrients: { PROCNT, CHOCDF, FAT } }
```

Integrar en `recetaRepository.crear()` antes de guardar el documento.

**FE:** sin cambios — la sección de nutrición ya lee `receta.macros`.

**Docs:** crear `docs/historico/desarrollo/nutricionIntegracion.html`

---

### B2 — INGR-001 Edamam fallback

**Contexto:** `ingredientesService.buscarEdamam()` ya existe y devuelve `[]`. Solo hay que implementarlo.

**BE** — nuevo endpoint:
```
GET /api/ingredientes/buscar?q=tomate
→ Edamam Food Database API: GET /auto-complete?q=tomate&ingr=1
→ Devuelve string[] de nombres de alimentos
```

**FE** — `ingredientesService.ts` (FE): `buscarEdamam(query)` ya tiene el stub, conectar al nuevo endpoint.

El hook `useAutocompletadoIngredientes` ya tiene la lógica de fallback implementada — cuando hay menos de 3 resultados locales, llama a Edamam automáticamente.

**Docs:** actualizar `docs/historico/desarrollo/coleccionYCrearReceta.html`

---

### Verificación Fase B

```bash
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit
```

Pruebas manuales:
1. Crear receta con ingredientes → tras publicar, ver el detalle → macros reales (no 0)
2. En formulario crear receta, escribir "tru" en un ingrediente → debe aparecer "Trufa" de Edamam si no está en los 239 locales

**Confirmación del autor requerida antes de Fase C.**

---

## FASE C — Gemini API (GEMINI_API_KEY)

**Estimación:** ~5-6h
**Prerrequisito:** `GEMINI_API_KEY` en `.env` del backend

Obtener en: [aistudio.google.com](https://aistudio.google.com) — tier gratuito: 15 RPM, 1M tokens/día con gemini-1.5-flash.

Instalar en BE: `npm install @google/generative-ai`

### C1 — /chat real (conectar UI a Gemini)

**Contexto:** el chat tiene UI completa con mock de 1.4s. Solo falta el backend real.

**BE** — nueva ruta y servicio:
```
POST /api/chat   (requerirAuth)
Body: { mensajes: { rol: 'user'|'model', texto: string }[] }
→ chatService.responder(mensajes, usuarioId)
→ carga perfil del usuario (alergias, preferencias)
→ carga despensa del usuario
→ construye prompt del sistema con contexto
→ llama a gemini-1.5-flash con historial
→ devuelve { respuesta: string }
```

**Prompt del sistema:**
```
Eres el asistente culinario de Cookr. El usuario tiene estas preferencias:
- Dietas: [preferencias del perfil]
- Alergias: [alergias del perfil]
- En su despensa: [lista de items de la despensa]

Responde siempre en español. Si te preguntan qué cocinar, sugiere recetas
que usen los ingredientes de la despensa y respeten sus restricciones.
```

**FE** — `chatService.ts` (nuevo):
```ts
export const chatService = {
  async enviarMensaje(mensajes: Mensaje[], token: string): Promise<string>
}
```

**Store** (`chatStore.ts`): reemplazar `getMockRespuesta` y el `setTimeout` por llamada real a `chatService.enviarMensaje`.

**Docs:** crear `docs/historico/desarrollo/chatIntegracion.html`

---

### C2 — CHAT-SMART-001: Contexto despensa + perfil en el chat

Está incluido en C1 — el prompt del sistema ya incluye la despensa y el perfil. Solo hay que asegurarse de que la carga de datos sea correcta en `chatService.ts` (BE).

---

### C3 — CREAR-TEXT-001: Crear receta desde descripción

**FE** — nuevo botón "Crear desde texto" en `/crear-receta`:
- Input/textarea: "Describe tu receta..." + botón "Generar"
- Llama a nuevo endpoint `POST /api/recetas/generar-desde-texto`
- La respuesta JSON pre-rellena `useCrearRecetaStore`
- El formulario aparece ya relleno para que el usuario revise y edite

**BE** — `POST /api/recetas/generar-desde-texto` (requerirAuth):
```ts
// Body: { descripcion: string }
// Prompt a Gemini: "Dado este texto: [descripcion], genera una receta en JSON con este formato exacto:
// { titulo, descripcion, tiempo (número), unidadTiempo ('min'|'h'), porciones, dificultad ('facil'|'media'|'dificil'),
//   dietas[], ingredientes[{nombre,cantidad,unidad}], pasos[{texto}] }
// Solo responde con el JSON, sin markdown."
// Parsear respuesta JSON → validar con Zod → devolver
```

**Docs:** actualizar `docs/historico/desarrollo/coleccionYCrearReceta.html`

---

### C4 — DESP-TICKET-001: OCR foto ticket → despensa

**FE** — nueva opción en `sheetAnadirIngrediente.tsx`:
- Botón "Escanear ticket" + `<input type="file" accept="image/*" capture="environment">`
- Al seleccionar imagen → convierte a base64 → `POST /api/despensa/escanear-ticket`
- Muestra lista de ingredientes detectados para confirmar antes de añadir
- Al confirmar → `useAñadirItem` para cada ingrediente

**BE** — `POST /api/despensa/escanear-ticket` (requerirAuth):
```ts
// Body: { imagenBase64: string }
// Prompt a Gemini Vision (gemini-1.5-flash):
// "Esta es una foto de un ticket de compra. Extrae los ingredientes alimentarios
//  en formato JSON: [{nombre, cantidad, unidad}]. Solo ingredientes comestibles.
//  Si no puedes determinar la cantidad, usa 1 como valor. Solo responde con el JSON."
// Parsear y devolver el array
```

**Docs:** actualizar `docs/historico/desarrollo/despensaIntegracion.html`

---

### Verificación Fase C

```bash
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit
cd frontend && npx next lint
```

Pruebas manuales:
1. `/chat` → preguntar "¿qué cocino con lo que tengo?" → respuesta real de Gemini con ingredientes de la despensa
2. `/crear-receta` → "Crear desde texto" → escribir descripción → formulario pre-rellenado
3. `/despensa` → "Escanear ticket" → subir foto → ingredientes detectados → confirmar → aparecen en despensa

**Confirmación del autor requerida antes de Fase D (opcional).**

---

## FASE D — Mejoras opcionales post-Gemini/Edamam

Estas tareas mejoran la experiencia pero no son críticas para la demo del TFG:

| ID | Tarea | Depende de |
|---|---|---|
| PERF-SSR-001 | Suspense streaming en /home y /recetas/[id] | Nada (análisis puro) |
| STATE-001 | Auditoría invalidación cache TanStack | Nada |
| Cloudinary | Upload real de imágenes (no base64) | API key Cloudinary |
| Grupos/Comunidades | Feature social completa | Sin scope TFG |

---

## Archivos HTML de docs a crear/actualizar

| Fase | Acción | Archivo |
|---|---|---|
| A2 — DESP-003 | Actualizar | `docs/historico/desarrollo/despensaIntegracion.html` |
| A3 — FEED-SMART-001 | Actualizar | `docs/historico/desarrollo/discoverHomeIntegracion.html` |
| A4 — Editar receta | Actualizar | `docs/historico/desarrollo/coleccionYCrearReceta.html` |
| A5 — Avatar upload | Actualizar | `docs/historico/desarrollo/perfilIntegracion.html` |
| A7 — PERF-SSR-001 | Crear | `docs/historico/desarrollo/optimizacionRendimiento.html` |
| B1 — NUTR-001 | Crear | `docs/historico/desarrollo/nutricionIntegracion.html` |
| C1 — Chat Gemini | Crear | `docs/historico/desarrollo/chatIntegracion.html` |
| C3 — Crear desde texto | Actualizar | `docs/historico/desarrollo/coleccionYCrearReceta.html` |
| C4 — OCR ticket | Actualizar | `docs/historico/desarrollo/despensaIntegracion.html` |
| Todas | Actualizar contadores | `docs/historico/desarrollo/estadoTareas.html` |

---

## Variables de entorno necesarias

### Backend `.env`

```bash
# Ya configuradas:
PEXELS_API_KEY=...         # Funcionando (seed + crear receta)
GMAIL_USER=...             # Email funcionando
GMAIL_APP_PASSWORD=...

# Necesitan configurarse para Fases B y C:
EDAMAM_APP_ID=...          # developer.edamam.com → Nutrition Analysis API
EDAMAM_APP_KEY=...
EDAMAM_FOOD_APP_ID=...     # developer.edamam.com → Food Database API
EDAMAM_FOOD_APP_KEY=...
GEMINI_API_KEY=...         # aistudio.google.com
```

---

## Resumen de tareas por fase

| Fase | Tareas | Externo | Estimación |
|---|---|---|---|
| A | SEED-002, DESP-003, FEED-SMART-001, Editar receta, Avatar, STATE-001, PERF-SSR-001 | Nada | ~4-6h |
| B | NUTR-001, INGR-001 Edamam fallback | Edamam keys | ~2-3h |
| C | Chat real, CHAT-SMART-001, CREAR-TEXT-001, DESP-TICKET-001 | Gemini key | ~5-6h |
| D | Cloudinary, Grupos (fuera de scope) | Opcional | — |

**Total estimado para TFG completo: ~11-15h de desarrollo**
