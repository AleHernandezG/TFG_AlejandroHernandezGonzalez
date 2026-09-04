# Checklist de revisión — Sprint 6

> Estado: implementado, pendiente de verificación manual por el autor.
> Marca cada punto cuando lo hayas probado.

---

## A1 — SEED-002: Actualizar imágenes del seed

**Qué hace:** script que reemplaza URLs de picsum por fotos reales de Pexels en todas las recetas de la base de datos.

**Qué cambió:** `backend/src/scripts/updateSeedImages.ts` (ya existía).

**Cómo verificar:**
- [ ] Ejecutar: `cd backend && npx ts-node src/scripts/updateSeedImages.ts`
- [ ] Recargar `/home` → las recetas muestran fotos reales de cocina en lugar de imágenes de picsum

---

## A2 — DESP-003: Vaciar despensa

**Qué hace:** botón "Vaciar todo" en la cabecera de `/despensa`. Muestra un diálogo de confirmación antes de borrar. El botón desaparece cuando la despensa está vacía.

**Qué cambió:**
- BE: `DELETE /api/despensa/vaciar` → `despensaRepository.vaciar()` con `$set { despensa: [] }`
- FE: `useVaciarDespensa` hook con optimistic update + rollback en `useMiDespensa.ts`
- FE: `headerDespensa.tsx` → pill button con patrón iOS/Notion (neutro → destructivo en hover)

**Cómo verificar:**
- [ ] Ir a `/despensa` con ingredientes → el botón "Vaciar todo" es visible
- [ ] Pulsar "Vaciar todo" → aparece diálogo de confirmación
- [ ] Confirmar → la lista se vacía instantáneamente (optimistic update)
- [ ] Recargar página → la despensa sigue vacía
- [ ] Ir a `/despensa` sin ingredientes → el botón NO aparece

---

## A3 — FEED-SMART-001: Feed inteligente en home

**Qué hace:** si el usuario no sigue a nadie (o los seguidos no tienen recetas), el feed muestra recomendaciones basadas en sus preferencias de dieta y alergias. Aparece un chip "Recetas para ti" cuando el feed es de recomendaciones.

**Qué cambió:**
- FE: `feedHome.tsx` → doble query: primero `soloSiguiendo:true`, si vacío activa segunda query con `filtrosAvanzados` del perfil
- FE: `useRecetasFeed.ts` → añadido parámetro `enabled?: boolean`

**Cómo verificar:**
- [ ] Usuario sin seguidos → `/home` muestra chip "Recetas para ti" con feed de recomendaciones
- [ ] Seguir a alguien que tenga recetas → el chip desaparece y aparecen sus recetas
- [ ] Con filtros activos → el fallback a recomendaciones NO se activa aunque seguidos estén vacíos

---

## A4 — Editar receta propia

**Qué hace:** activa el botón "Editar receta" en la colección de mis recetas. Abre un formulario pre-rellenado con todos los datos de la receta. Al guardar, actualiza la receta en la base de datos.

**Qué cambió:**
- BE: `PUT /api/recetas/:id` → `recetaRepository.actualizar()` que verifica autoría (403 si no es el autor)
- FE: `recetasService.actualizar(id, datos, token)` en `/services/recetasService.ts`
- FE: `useEditarReceta(recetaId)` hook en `features/recetas/hooks/useEditarReceta.ts`
- FE: Componente `FormularioEditarReceta` en `features/recetas/components/editarReceta/`
- FE: Página `/editar-receta/[id]/page.tsx` que carga la receta y verifica que el usuario sea el autor
- FE: `tarjetaColeccion.tsx` → botón "Editar receta" activado (ya no tiene `disabled`)

**Cómo verificar:**
- [ ] Ir a `/coleccion?tab=mis-recetas` → en una receta propia, tocar los tres puntos → "Editar receta" (sin `(próximamente)`)
- [ ] Tocar "Editar receta" → navega a `/editar-receta/[id]` con todos los campos pre-rellenados
- [ ] Modificar el título → pulsar "Guardar cambios" → redirige a `/recetas/[id]` con el título actualizado
- [ ] Intentar acceder a `/editar-receta/[id]` de una receta ajena → muestra "No tienes permiso"

---

## A5 — Avatar upload

**Qué hace:** el icono de cámara en el avatar del perfil ahora permite subir una foto. La imagen se convierte a base64 y se guarda en MongoDB. La sesión de NextAuth se actualiza para reflejar el nuevo avatar.

**Qué cambió:**
- BE: `PUT /api/usuarios/me/foto` → `usuarioRepository.actualizarFoto(id, fotoBase64)`
- FE: `perfilService.subirFoto(token, fotoBase64)` en `/services/perfilService.ts`
- FE: `useSubirFoto()` mutation en `features/perfil/hooks/usePerfil.ts` (invalida cache + llama a `update()` de NextAuth)
- FE: `tarjetaAvatarPerfil.tsx` → input file oculto, preview optimista, spinner, rollback en error

**Cómo verificar:**
- [ ] Ir a `/perfil` → tocar el icono de cámara → selector de archivos
- [ ] Seleccionar una imagen → el avatar se actualiza instantáneamente (preview optimista)
- [ ] Esperar a que termine → el spinner desaparece
- [ ] Recargar la página → el nuevo avatar sigue ahí
- [ ] Probar con una imagen grande (>1MB) → funciona o muestra error manejado

---

## A6 — STATE-001: Auditoría cache TanStack Query

**Qué hace:** corrige tres bugs donde las mutations no invalidaban las queries correctas, lo que causaba que partes de la UI quedaran desincronizadas.

**Qué cambió:**
- `useAgregarComentario.ts`: ahora invalida `['comentarios', recetaId]` (antes invalidaba `['recetas', 'detalle', recetaId]` que no existe como query cacheada)
- `useToggleGuardado.ts`: ahora también invalida `['coleccion', 'guardadas']` para que la pestaña de guardadas se actualice
- `useEliminarReceta.ts`: ahora también invalida `['recetas', 'feed']` para que la receta desaparezca del feed si el usuario navega al home

**Cómo verificar:**
- [ ] Añadir un comentario en un detalle de receta → el comentario aparece inmediatamente en el sheet sin recargar
- [ ] Guardar/desguardar una receta desde el feed → ir a `/coleccion?tab=guardadas` → el estado es correcto
- [ ] Eliminar una receta propia → volver al `/home` → la receta ya no aparece en el feed

---

## A7 — PERF-SSR-001: Carga inicial y loading states

**Qué hace:** añade páginas `loading.tsx` para `/home` y `/recetas/[id]`, que muestran skeletons mientras Next.js realiza la carga inicial. Esto evita pantallas en blanco durante la navegación.

**Qué cambió:**
- Creado `app/(main)/home/loading.tsx` → skeleton con 3 tarjetas y chips de filtro
- Creado `app/(main)/recetas/[id]/loading.tsx` → skeleton del hero + cabecera + ingredientes

**Cómo verificar:**
- [ ] En Chrome DevTools → Network → throttling a "Slow 3G"
- [ ] Navegar a `/home` → debe aparecer un skeleton durante la carga en lugar de pantalla en blanco
- [ ] Navegar a `/recetas/[id]` → skeleton visible antes de que cargue la receta

---

## B1 — NUTR-001: Macros reales (Edamam)

**Qué hace:** al publicar una receta, los macros se calculan automáticamente usando la Edamam Nutrition Analysis API. Si la clave no está configurada, guarda ceros (comportamiento anterior).

**Qué cambió:**
- BE: Nuevo `backend/src/services/nutritionService.ts` → `calcularMacros()` que llama a Edamam
- BE: `recetaRepository.crear()` → ahora llama a `calcularMacros()` antes de guardar en MongoDB

**Necesita:** `EDAMAM_APP_ID` y `EDAMAM_APP_KEY` en `.env` del backend.

**Cómo verificar:**
- [ ] **Sin claves:** crear receta → los macros son `0` (igual que antes, sin error)
- [ ] **Con claves:** crear receta con ingredientes conocidos (ej: "200g pasta, 100g tomate") → en el detalle de la receta los macros muestran valores reales en kcal/g

---

## B2 — INGR-001: Búsqueda de ingredientes con Edamam

**Qué hace:** cuando el usuario escribe un ingrediente en el formulario de crear receta o en la despensa, y no hay 3+ resultados locales, la app consulta automáticamente Edamam Food Database para obtener sugerencias externas.

**Qué cambió:**
- BE: Nuevo `GET /api/ingredientes/buscar?q=...` en `backend/src/routes/ingredientes.routes.ts`
- BE: Nuevo `backend/src/services/ingredientesService.ts` → `buscarIngredientesEdamam()`
- FE: `frontend/src/services/ingredientesService.ts` → conectado al endpoint real (antes devolvía `[]`)

**Necesita:** `EDAMAM_APP_ID`/`EDAMAM_APP_KEY` (o `EDAMAM_FOOD_APP_ID`/`EDAMAM_FOOD_APP_KEY`) en `.env`.

**Cómo verificar:**
- [ ] **Sin claves:** escribir ingrediente raro → no aparecen sugerencias externas (sin error)
- [ ] **Con claves:** escribir "trufa" → si no está en los 239 ingredientes locales, aparece desde Edamam

---

## C1/C2 — Chat Gemini + contexto despensa/perfil

**Qué hace:** el chat de Cookr ya no usa respuestas mock. Llama a Gemini 1.5 Flash con un prompt de sistema que incluye las preferencias, alergias y despensa del usuario. Responde en español con sugerencias personalizadas.

**Qué cambió:**
- BE: Nuevo `backend/src/services/chatService.ts` → `responderChat()` construye el prompt con contexto del usuario y llama a Gemini
- BE: Nuevo `POST /api/chat` en `backend/src/routes/chat.routes.ts`
- FE: Nuevo `frontend/src/services/chatService.ts` → `enviarMensaje(mensajes, token)`
- FE: `frontend/src/stores/chatStore.ts` → reemplazado el mock con llamada real al backend; si hay error, muestra mensaje de error

**Necesita:** `GEMINI_API_KEY` en `.env` del backend.

**Cómo verificar:**
- [ ] **Sin clave:** abrir chat → escribir mensaje → recibe: "El asistente no está disponible en este momento..."
- [ ] **Con clave:** escribir "¿qué cocino con lo que tengo?" → respuesta contextualizada con tu despensa
- [ ] Comprobar que el historial de conversación funciona (el contexto se mantiene en mensajes sucesivos)
- [ ] Comprobar que el spinner desaparece cuando llega la respuesta

---

## C3 — CREAR-TEXT-001: Crear receta desde descripción

**Qué hace:** botón "Crear desde descripción (IA)" en `/crear-receta`. Abre un diálogo donde describes la receta con palabras y Gemini rellena automáticamente todos los campos del formulario.

**Qué cambió:**
- BE: `POST /api/recetas/generar-desde-texto` en `recetas.routes.ts` → `chatService.generarRecetaDesdeTexto()`
- FE: `recetasService.generarDesdeTexto(descripcion, token)` en `/services/recetasService.ts`
- FE: `formularioCrearReceta.tsx` → botón "Crear desde descripción (IA)" + dialog con textarea + `methods.reset()` para pre-rellenar el form

**Necesita:** `GEMINI_API_KEY` en `.env` del backend.

**Cómo verificar:**
- [ ] Ir a `/crear-receta` → ver el botón "Crear desde descripción (IA)" encima del formulario
- [ ] **Sin clave:** pulsar el botón, escribir descripción, pulsar "Generar" → aparece mensaje de error
- [ ] **Con clave:** escribir "Risotto cremoso de setas para 4 personas, 40 minutos" → el formulario se rellena automáticamente con título, ingredientes, pasos, etc.
- [ ] Editar el formulario generado si hace falta → publicar normalmente

---

## C4 — DESP-TICKET-001: Escanear ticket de compra

**Qué hace:** botón "Escanear ticket de compra" en el sheet de añadir ingredientes. Se selecciona/fotografía el ticket, Gemini Vision extrae los ingredientes y muestra una lista para confirmar antes de añadirlos.

**Qué cambió:**
- BE: `POST /api/despensa/escanear-ticket` en `despensa.routes.ts` → `chatService.escanearTicket(imagenBase64)`
- FE: `sheetAnadirIngrediente.tsx` → input file `capture="environment"`, `FileReader` a base64, llamada a `/despensa/escanear-ticket`, lista de confirmación con "Añadir todos"

**Necesita:** `GEMINI_API_KEY` en `.env` del backend.

**Cómo verificar:**
- [ ] Ir a `/despensa` → pulsar el + para añadir → ver el botón "Escanear ticket de compra" al fondo del sheet
- [ ] **Sin clave:** seleccionar imagen → error manejado visible
- [ ] **Con clave:** fotografiar un ticket de supermercado → aparece lista de ingredientes detectados → pulsar "Añadir todos" → se añaden a la despensa

---

## Variables de entorno necesarias (backend `.env`)

```bash
# Ya funcionando (no requieren acción):
PEXELS_API_KEY=...
GMAIL_USER=...
GMAIL_APP_PASSWORD=...

# Para B1 + B2 (Edamam):
EDAMAM_APP_ID=...          # developer.edamam.com → Nutrition Analysis
EDAMAM_APP_KEY=...
# Opcional (si tienes cuenta separada de Food Database):
EDAMAM_FOOD_APP_ID=...
EDAMAM_FOOD_APP_KEY=...

# Para C1, C3, C4 (Gemini):
GEMINI_API_KEY=...         # aistudio.google.com → gratis tier
```

---

## Orden de prueba recomendado

1. Verificar que el backend arranca sin errores: `cd backend && npm run dev`
2. Verificar que el frontend arranca sin errores: `cd frontend && npm run dev`
3. Probar en este orden: A2 → A3 → A4 → A5 → A6 → A7
4. Si tienes claves Edamam: probar B1 → B2
5. Si tienes clave Gemini: probar C1 → C3 → C4
