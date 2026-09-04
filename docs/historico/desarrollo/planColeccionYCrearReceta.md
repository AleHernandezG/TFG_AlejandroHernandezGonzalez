# Plan de implementación — Colección + Crear Receta real
> Sprint 4 · Temporal — borrar cuando todas las tareas estén en ✅

---

## Dependencias entre tareas

```
BLOQUE A — Backend (sin dependencias entre sí, paralelo)
  COL-001  GET /api/recetas/guardadas
  COL-002  GET /api/recetas/mis-recetas
  COL-007  DELETE /api/recetas/:id
  API-013  POST /api/recetas (crear)

BLOQUE B — FE Service (depende de A)
  coleccionService.ts  → obtenerGuardadas, obtenerMisRecetas
  recetasService.ts    → añadir crear()

BLOQUE C — FE Hooks (depende de B)
  useRecetasGuardadas.ts
  useMisRecetas.ts
  useEliminarReceta.ts
  useCrearReceta.ts   (DEBT-009 — extrae lógica de previsualizacionReceta.tsx)

BLOQUE D — FE Componentes (depende de C)
  contenidoColeccion.tsx  → reemplazar mocks por hooks
  tarjetaColeccion.tsx    → Bookmark + ··· funcionales
  previsualizacionReceta.tsx → publicar real via useCrearReceta
```

---

## BLOQUE A — Backend

### Arquitectura aplicada
```
Route → Controller → Service → Repository → MongoDB
```
Todos los cambios de acceso a BD van únicamente en `recetaRepository.ts`.
Toda la lógica de negocio va únicamente en `recetasService.ts` (BE).

---

### A1 · recetaRepository.ts — métodos nuevos

**Archivo:** `backend/src/repositories/recetaRepository.ts`

#### `findGuardadas(userId: string): Promise<RecetaColeccion[]>`
```
- Buscar el documento Usuario por userId → campo recetasGuardadas (ObjectId[])
- Hacer findMany de Receta con _id $in recetasGuardadas
- Proyectar solo: _id, titulo, imagenUrl, autorNombre, avatarUrl
- Mapear a RecetaColeccion: { id: _id.toString(), titulo, imagenUrl, autor: { nombre: autorNombre, avatarUrl } }
- Si recetasGuardadas está vacío → devolver []
```

#### `findPorAutor(userId: string): Promise<RecetaColeccion[]>`
```
- findMany de Receta con { autorId: new ObjectId(userId) }
- Proyectar igual que findGuardadas
- Ordenar por fechaCreacion desc
- Devolver RecetaColeccion[]
```

#### `crear(datos: DatosRecetaNueva, autorId: string, autorNombre: string, avatarUrl: string): Promise<{ id: string }>`
```
- Construir documento IReceta:
    titulo, descripcion, ingredientes, pasos, dificultad, tiempo, unidadTiempo,
    porciones, dietas, alergenos (detectados), autorId, autorNombre, avatarUrl,
    imagenUrl (base64 del body o '' si viene vacía),
    likes: [], listaComentarios: [], fechaCreacion: new Date()
- RecetaMongo.create(doc)
- Devolver { id: doc._id.toString() }
```

#### `eliminar(recetaId: string, userId: string): Promise<void>`
```
- findById(recetaId) → si null → throw Error('not_found')
- Si receta.autorId.toString() !== userId → throw Error('forbidden')
- deleteOne({ _id: recetaId })
```

---

### A2 · recetasService.ts (BE) — métodos nuevos

**Archivo:** `backend/src/services/recetasService.ts`

```typescript
// Añadir:
obtenerGuardadas(userId: string): Promise<RecetaColeccion[]>
  → recetaRepository.findGuardadas(userId)

obtenerMisRecetas(userId: string): Promise<RecetaColeccion[]>
  → recetaRepository.findPorAutor(userId)

crear(datos: DatosRecetaNueva, autorId: string, autorNombre: string, avatarUrl: string): Promise<{ id: string }>
  → recetaRepository.crear(datos, autorId, autorNombre, avatarUrl)

eliminar(recetaId: string, userId: string): Promise<void>
  → recetaRepository.eliminar(recetaId, userId)
    catch 'not_found' → throw { status: 404 }
    catch 'forbidden' → throw { status: 403 }
```

---

### A3 · recetasController.ts — handlers nuevos

**Archivo:** `backend/src/controllers/recetasController.ts`

```typescript
// Añadir:

obtenerGuardadas: async (req, res) => {
  // recetasService.obtenerGuardadas(req.usuario!.id)
  // res.status(200).json(resultado)
}

obtenerMisRecetas: async (req, res) => {
  // recetasService.obtenerMisRecetas(req.usuario!.id)
  // res.status(200).json(resultado)
}

crear: async (req, res) => {
  // Validar body con Zod (titulo, descripcion, ingredientes, pasos, dificultad, tiempo, porciones...)
  // recetasService.crear(body, req.usuario!.id, req.usuario!.nombre, req.usuario!.avatarUrl)
  // res.status(201).json({ id })
}

eliminar: async (req, res) => {
  // recetasService.eliminar(req.params.id, req.usuario!.id)
  // res.status(204).send()
}
```

---

### A4 · recetas.routes.ts — rutas nuevas

**Archivo:** `backend/src/routes/recetas.routes.ts`

```typescript
// Añadir estas 4 líneas al router existente:
router.get("/guardadas",   requerirAuth, recetasController.obtenerGuardadas)
router.get("/mis-recetas", requerirAuth, recetasController.obtenerMisRecetas)
router.post("/",           requerirAuth, recetasController.crear)
router.delete("/:id",      requerirAuth, recetasController.eliminar)
```

> ATENCIÓN: `/guardadas` y `/mis-recetas` deben ir ANTES de `/:id` en el router
> para que Express no los capture como parámetro de ID.

---

### A5 · Tipo RecetaColeccion compartido BE

Añadir en `backend/src/types/receta.ts`:
```typescript
export interface RecetaColeccion {
  id: string
  titulo: string
  imagenUrl: string
  autor: { nombre: string; avatarUrl: string }
}
```

---

### A6 · Tipo DatosRecetaNueva (body crear) — Zod en BE

Crear o añadir a `backend/src/lib/validadores.ts`:
```typescript
export const esquemaCrearRecetaBody = z.object({
  titulo:       z.string().min(3).max(100),
  descripcion:  z.string().min(10).max(300),
  tiempo:       z.number().int().min(1),
  unidadTiempo: z.enum(['min', 'h']),
  porciones:    z.number().int().min(1),
  dificultad:   z.enum(['facil', 'media', 'dificil']),
  dietas:       z.array(z.string()).default([]),
  ingredientes: z.array(z.object({
    nombre:   z.string().min(1),
    cantidad: z.string().min(1),
    unidad:   z.string(),
  })).min(1),
  pasos: z.array(z.object({
    texto: z.string().min(10),
  })).min(1),
  imagenBase64: z.string().optional(),  // foto en base64 o vacío
})
```

---

## BLOQUE B — Frontend Services

### Arquitectura aplicada
```
Hook → Service → apiClient → Backend
```
Los hooks NO conocen URLs. Todo va por el service.

---

### B1 · coleccionService.ts — NUEVO

**Archivo:** `frontend/src/services/coleccionService.ts`

```typescript
import { apiClient } from './apiClient'
import type { RecetaColeccion } from '@/features/coleccion/types/coleccion.types'

export const coleccionService = {
  async obtenerGuardadas(token: string): Promise<RecetaColeccion[]> {
    const { data } = await apiClient.get<RecetaColeccion[]>('/recetas/guardadas', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  },

  async obtenerMisRecetas(token: string): Promise<RecetaColeccion[]> {
    const { data } = await apiClient.get<RecetaColeccion[]>('/recetas/mis-recetas', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  },

  async eliminarReceta(recetaId: string, token: string): Promise<void> {
    await apiClient.delete(`/recetas/${recetaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  },
}
```

---

### B2 · recetasService.ts (FE) — añadir crear()

**Archivo:** `frontend/src/services/recetasService.ts`

```typescript
// Añadir al objeto recetasService:

async crear(
  datos: DatosRecetaNueva,
  token: string,
): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>(
    '/recetas',
    datos,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return data
},
```

Tipo `DatosRecetaNueva` a definir en `@/features/recetas/types/crearReceta.schema.ts`:
```typescript
export interface DatosRecetaNueva {
  titulo: string
  descripcion: string
  tiempo: number
  unidadTiempo: 'min' | 'h'
  porciones: number
  dificultad: 'facil' | 'media' | 'dificil'
  dietas: string[]
  ingredientes: { nombre: string; cantidad: string; unidad: string }[]
  pasos: { texto: string }[]
  imagenBase64?: string
}
```

---

## BLOQUE C — Frontend Hooks

### Arquitectura aplicada
```
Componente llama al hook → hook usa TanStack Query → hook llama al service
```
Los hooks van en `features/coleccion/hooks/` (scope de feature).
Todos los hooks que hacen fetch usan `useQuery` / `useMutation` de TanStack Query.

---

### C1 · useRecetasGuardadas.ts — NUEVO

**Archivo:** `frontend/src/features/coleccion/hooks/useRecetasGuardadas.ts`

```typescript
'use client'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { coleccionService } from '@/services/coleccionService'

export function useRecetasGuardadas() {
  const { data: session } = useSession()
  const token = (session as { backendToken?: string })?.backendToken ?? ''

  return useQuery({
    queryKey: ['coleccion', 'guardadas', token],
    queryFn: () => coleccionService.obtenerGuardadas(token),
    enabled: !!token,
    staleTime: 0,
  })
}
```

---

### C2 · useMisRecetas.ts — NUEVO

**Archivo:** `frontend/src/features/coleccion/hooks/useMisRecetas.ts`

```typescript
'use client'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { coleccionService } from '@/services/coleccionService'

export function useMisRecetas() {
  const { data: session } = useSession()
  const token = (session as { backendToken?: string })?.backendToken ?? ''

  return useQuery({
    queryKey: ['coleccion', 'mis-recetas', token],
    queryFn: () => coleccionService.obtenerMisRecetas(token),
    enabled: !!token,
    staleTime: 0,
  })
}
```

---

### C3 · useEliminarReceta.ts — NUEVO

**Archivo:** `frontend/src/features/coleccion/hooks/useEliminarReceta.ts`

```typescript
'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { coleccionService } from '@/services/coleccionService'

export function useEliminarReceta() {
  const { data: session } = useSession()
  const token = (session as { backendToken?: string })?.backendToken ?? ''
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recetaId: string) => coleccionService.eliminarReceta(recetaId, token),
    onSuccess: () => {
      // Invalidar cache de mis-recetas para que se recargue
      queryClient.invalidateQueries({ queryKey: ['coleccion', 'mis-recetas'] })
    },
  })
}
```

---

### C4 · useCrearReceta.ts — NUEVO (DEBT-009)

**Archivo:** `frontend/src/features/recetas/hooks/useCrearReceta.ts`

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { recetasService } from '@/services/recetasService'
import { useCrearRecetaStore } from '@/stores/useCrearRecetaStore'

export function useCrearReceta() {
  const router = useRouter()
  const { data: session } = useSession()
  const { datos, fotoPreview, limpiar } = useCrearRecetaStore()
  const [publicando, setPublicando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function publicar() {
    if (!datos) return
    const token = (session as { backendToken?: string })?.backendToken ?? ''

    setPublicando(true)
    setError(null)
    try {
      await recetasService.crear(
        {
          ...datos,
          imagenBase64: fotoPreview ?? undefined,
        },
        token,
      )
      limpiar()
      router.push('/coleccion?tab=mis-recetas')
    } catch {
      setError('No se pudo publicar la receta. Inténtalo de nuevo.')
    } finally {
      setPublicando(false)
    }
  }

  return { publicar, publicando, error }
}
```

> Nota: tras publicar, redirigir a `/coleccion?tab=mis-recetas` para que el usuario
> vea su nueva receta en "Mis recetas" en lugar de ir a /home.

---

## BLOQUE D — Frontend Componentes

### Arquitectura aplicada
```
Componente → llama al hook → NO llama al service directamente
```

---

### D1 · contenidoColeccion.tsx — reemplazar mocks por hooks

**Archivo:** `frontend/src/features/coleccion/components/contenidoColeccion.tsx`

Cambios:
1. Eliminar imports de `datosColeccion.ts` (MIS_RECETAS, RECETAS_GUARDADAS)
2. Añadir `useRecetasGuardadas()` y `useMisRecetas()`
3. Añadir estado de carga: `isLoading` → mostrar skeleton (3 tarjetas)
4. Añadir estado de error: mostrar mensaje "No se pudieron cargar las recetas"
5. Pasar datos reales a `GridRecetasColeccion`

```tsx
// Estructura aproximada del componente tras el cambio:
const { data: guardadas = [], isLoading: cargandoGuardadas } = useRecetasGuardadas()
const { data: misRecetas = [], isLoading: cargandoMisRecetas } = useMisRecetas()

const recetas = pestana === 'guardadas' ? guardadas : misRecetas
const cargando = pestana === 'guardadas' ? cargandoGuardadas : cargandoMisRecetas
const vacio = !cargando && recetas.length === 0

// Si cargando → mostrar GridSkeletonColeccion (4 tarjetas aspect-[3/4] animate-pulse)
// Si vacio → estadoVacio
// Si datos → GridRecetasColeccion
```

Crear `GridSkeletonColeccion` como componente inline en el mismo archivo o nuevo archivo:
```tsx
function GridSkeletonColeccion() {
  return (
    <div className="px-5 pt-8 pb-10 grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  )
}
```

---

### D2 · contenidoColeccion.tsx — soporte tab por URL (opcional pero recomendado)

Cuando se redirige a `/coleccion?tab=mis-recetas` desde `useCrearReceta`, leer el param:
```tsx
import { useSearchParams } from 'next/navigation'
const searchParams = useSearchParams()
const tabInicial = searchParams.get('tab') === 'mis-recetas' ? 'mis-recetas' : 'guardadas'
const [pestana, setPestana] = useState<PestanaColeccion>(tabInicial)
```

---

### D3 · tarjetaColeccion.tsx — Bookmark funcional (COL-005)

**Archivo:** `frontend/src/features/coleccion/components/tarjetaColeccion.tsx`

Añadir:
```tsx
// Import del hook (ya existe)
import { useToggleGuardado } from '@/features/recetas/hooks/useToggleGuardado'

// Estado local optimista
const [guardado, setGuardado] = useState(true)  // en guardadas siempre empieza true
const { mutate: toggleGuardado } = useToggleGuardado(receta.id)

// Handler
function handleDesguardar(e: React.MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  setGuardado(false)  // optimista: desaparece la tarjeta
  toggleGuardado(undefined, {
    onError: () => setGuardado(true),  // rollback si falla
  })
}
```

Si `!guardado` en modo guardadas → no renderizar la tarjeta (`return null`).

---

### D4 · tarjetaColeccion.tsx — Botón ··· funcional (COL-006)

Añadir un `Sheet` de shadcn/ui (ya instalado) con opciones:

```tsx
// Imports nuevos
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useEliminarReceta } from '@/features/coleccion/hooks/useEliminarReceta'
import { Trash2 } from 'lucide-react'

// Estado local
const [sheetAbierto, setSheetAbierto] = useState(false)
const [confirmando, setConfirmando] = useState(false)
const [eliminada, setEliminada] = useState(false)
const { mutate: eliminar, isPending } = useEliminarReceta()

// Si eliminada → return null

// Handler
function handleEliminar() {
  eliminar(receta.id, {
    onSuccess: () => { setConfirmando(false); setEliminada(true) },
  })
}
```

Sheet content (modo mis-recetas):
```tsx
<Sheet open={sheetAbierto} onOpenChange={setSheetAbierto}>
  <SheetContent side="bottom" className="rounded-t-2xl pb-8">
    <SheetHeader className="mb-4">
      <SheetTitle className="text-left text-sm font-bold truncate">{receta.titulo}</SheetTitle>
    </SheetHeader>
    {/* Opción Eliminar */}
    <button
      onClick={() => { setSheetAbierto(false); setConfirmando(true) }}
      className="flex items-center gap-3 w-full px-1 py-3 text-sm font-medium text-destructive hover:opacity-80"
    >
      <Trash2 size={18} />
      Eliminar receta
    </button>
    {/* Opción Editar — desactivada hasta Fase 7 */}
    <button disabled className="flex items-center gap-3 w-full px-1 py-3 text-sm font-medium text-muted-foreground cursor-not-allowed opacity-40">
      <Pencil size={18} />
      Editar receta (próximamente)
    </button>
  </SheetContent>
</Sheet>

{/* Dialog confirmación */}
<Dialog open={confirmando} onOpenChange={setConfirmando}>
  <DialogContent className="max-w-sm rounded-2xl p-6">
    <DialogHeader>
      <DialogTitle>¿Eliminar receta?</DialogTitle>
      <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
    </DialogHeader>
    <div className="flex gap-3 mt-4">
      <Button variant="outline" className="flex-1" onClick={() => setConfirmando(false)}>
        Cancelar
      </Button>
      <Button variant="destructive" className="flex-1" onClick={handleEliminar} disabled={isPending}>
        {isPending ? 'Eliminando...' : 'Eliminar'}
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

---

### D5 · previsualizacionReceta.tsx — publicar real (CREAR-002)

**Archivo:** `frontend/src/features/recetas/components/crearReceta/previsualizacionReceta.tsx`

Cambios:
1. Eliminar `useState(publicando)` y `handlePublicar()` del componente
2. Importar `useCrearReceta`
3. Usar `{ publicar, publicando, error }` del hook

```tsx
// Antes:
const [publicando, setPublicando] = useState(false)
function handlePublicar() { setPublicando(true); setTimeout(...) }

// Después:
const { publicar, publicando, error } = useCrearReceta()
```

Añadir feedback de error bajo los botones:
```tsx
{error && <p className="text-xs text-destructive text-center mt-2">{error}</p>}
```

Cambiar el botón Publicar:
```tsx
<Button onClick={publicar} disabled={publicando} ...>
  {publicando ? 'Publicando...' : 'Publicar receta'}
</Button>
```

---

## Archivos a crear (nuevos)

| Archivo | Descripción |
|---|---|
| `frontend/src/services/coleccionService.ts` | Service HTTP para colección |
| `frontend/src/features/coleccion/hooks/useRecetasGuardadas.ts` | Hook TanStack Query |
| `frontend/src/features/coleccion/hooks/useMisRecetas.ts` | Hook TanStack Query |
| `frontend/src/features/coleccion/hooks/useEliminarReceta.ts` | Mutation TanStack Query |
| `frontend/src/features/recetas/hooks/useCrearReceta.ts` | Hook publicar receta |

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `backend/src/repositories/recetaRepository.ts` | +findGuardadas, +findPorAutor, +crear, +eliminar |
| `backend/src/services/recetasService.ts` | +obtenerGuardadas, +obtenerMisRecetas, +crear, +eliminar |
| `backend/src/controllers/recetasController.ts` | +obtenerGuardadas, +obtenerMisRecetas, +crear, +eliminar |
| `backend/src/routes/recetas.routes.ts` | +4 rutas (guardar ORDEN: /guardadas antes de /:id) |
| `backend/src/types/receta.ts` | +RecetaColeccion interface |
| `backend/src/lib/validadores.ts` | +esquemaCrearRecetaBody (Zod) |
| `frontend/src/services/recetasService.ts` | +crear() |
| `frontend/src/features/recetas/types/crearReceta.schema.ts` | +DatosRecetaNueva interface |
| `frontend/src/features/coleccion/components/contenidoColeccion.tsx` | mocks → hooks, skeleton |
| `frontend/src/features/coleccion/components/tarjetaColeccion.tsx` | Bookmark + ··· funcionales |
| `frontend/src/features/recetas/components/crearReceta/previsualizacionReceta.tsx` | useCrearReceta |

## Archivos a eliminar

| Archivo | Cuándo |
|---|---|
| `frontend/src/features/coleccion/data/datosColeccion.ts` | Tras conectar COL-004 (ya no se usa) |

---

## Orden de implementación recomendado

```
1. A1 → A2 → A3 → A4 → A5 → A6   (backend completo, typecheck al final)
2. B1 → B2                         (services FE)
3. C4                               (useCrearReceta — independiente)
4. C1 → C2 → C3                    (hooks colección)
5. D5                               (previsualizacionReceta — usa C4)
6. D1 → D2                         (contenidoColeccion — usa C1+C2)
7. D3 → D4                         (tarjetaColeccion — usa C3)
8. Borrar datosColeccion.ts
9. next lint + tsc --noEmit en FE y BE
10. Probar flujo completo: crear receta → aparece en Mis Recetas → eliminar → desaparece
```

---

## Notas técnicas

- **Orden de rutas en Express**: `/guardadas` y `/mis-recetas` DEBEN declararse ANTES de `/:id`
  en el router, o Express los interpreta como IDs.

- **backendToken en sesión**: Los hooks usan `session?.backendToken`. Verificar que
  `lib/auth.ts` expone este campo. Si no existe, los hooks deben usar `session?.user?.email`
  y pasar el JWT del formulario de credentials, o añadir backendToken al callback de sesión.

- **imagenBase64**: Enviar la foto como base64 en el body puede ser pesado (>1MB). Para
  este sprint es aceptable (MVP). En Fase 6 migrar a Cloudinary.

- **Skeleton de carga**: Usar `animate-pulse` con `bg-muted` sobre divs `aspect-[3/4]`
  para mantener el layout del grid durante la carga. Sin dependencias extra.

- **`useToggleGuardado` en tarjetaColeccion**: El hook ya existe en
  `features/recetas/hooks/`. Importar directamente — está en el mismo dominio.

- **Pencil icon**: Importar de `lucide-react` junto al resto de iconos.

---

## Fixes aplicados post-sprint (2026-05-12) ✅

### FIX-01 — Dropdown ingredientes cortado

- **Problema**: el `<ul>` de autocompletado estaba dentro del `div` con `overflow-hidden` del card y se recortaba.
- **Fix**: mover el `<ul>` fuera del card, como hermano del contenedor `relative`, con `top-12`.
- **Archivo**: `seccionIngredientes.tsx`

### FIX-02 — Foto Pexels en vista previa

- **Problema**: la preview mostraba "Sin foto" cuando el usuario no subía imagen.
- **Fix**: nuevo endpoint `GET /recetas/foto-preview?query=xxx` (sin auth) + hook `useFotoPexelsPreview(titulo)` + atribución superpuesta.
- **Archivos nuevos**: `useFotoPexelsPreview.ts`
- **Archivos modificados**: `recetasService.ts` (BE+FE), `recetasController.ts`, `recetas.routes.ts`, `previsualizacionReceta.tsx`, `next.config.mjs` (+images.pexels.com)

### FIX-03 — Redirect a /crear-receta tras publicar

- **Problema**: `router.push()` es asíncrono en Next.js App Router. Al llamar `limpiar()` (incluso después del push), React re-renderiza síncronamente antes de que la navegación complete. El `useEffect([datos, router])` detectaba `datos === null` y disparaba `router.replace('/crear-receta')` ganando la carrera.
- **Fix**: capturar el valor inicial de `datos` con `useRef` y que el efecto de guardia use ese ref en lugar de la dep `datos`. Así el efecto sólo se ejecuta en el montaje y nunca cuando `limpiar()` vacía el store.
- **Archivo**: `previsualizacionReceta.tsx` (`useRef(datos)` + `useEffect` sin `datos` en deps)
