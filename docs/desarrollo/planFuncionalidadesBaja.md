# Plan — Funcionalidades dificultad baja

Sprint 4 · 2026-05-11

---

## Tarea A — CREAR-001: Tutorial primer usuario real

**Archivo afectado:** `frontend/src/features/recetas/components/crearReceta/formularioCrearReceta.tsx`

### Situación actual

```ts
const MOCK_ES_PRIMER_USUARIO = false   // línea 29

useEffect(() => {
  if (MOCK_ES_PRIMER_USUARIO) setMostrarTutorial(true)
}, [])
```

El tutorial nunca se muestra porque la constante siempre es `false`.

### Solución

1. Eliminar `MOCK_ES_PRIMER_USUARIO`.
2. Importar `useMisRecetas` desde `@/features/coleccion/hooks/useMisRecetas`.
3. Llamar al hook dentro del componente (ya existe el endpoint `GET /api/recetas/mis-recetas` activo en BE, tarea COL-002 ✅).
4. Reemplazar el `useEffect` por un efecto reactivo a `data`: cuando la query termina (`!isLoading`) y el usuario no tiene recetas (`data?.length === 0`), abrir el tutorial.

```ts
// ANTES (eliminar)
const MOCK_ES_PRIMER_USUARIO = false

useEffect(() => {
  if (MOCK_ES_PRIMER_USUARIO) setMostrarTutorial(true)
}, [])

// DESPUÉS
const { data: misRecetas, isLoading: cargandoRecetas } = useMisRecetas()

useEffect(() => {
  if (!cargandoRecetas && (misRecetas?.length ?? 1) === 0) {
    setMostrarTutorial(true)
  }
}, [cargandoRecetas, misRecetas])
```

### Restricciones a respetar

- El hook devuelve `undefined` mientras carga → la condición `?? 1` evita mostrar el tutorial prematuramente.
- Arquitectura: componente → hook → service → apiClient (sin llamada a Axios directamente).
- `useMisRecetas` ya está implementado y exportado desde su módulo, sin duplicar lógica.

---

## Tarea B — DET-006-FE: Añadir ingredientes a la despensa

**Archivo afectado:** `frontend/src/features/recetas/components/detalleReceta/tabsReceta.tsx`

### Situación actual

```tsx
<button className="mb-8 flex w-full items-center justify-center text-sm font-bold text-brand ...">
  Comparar con mi despensa
</button>
```

El botón no tiene `onClick` y el texto no describe la acción real.

### Solución

1. Importar `useDespensaStore` desde `@/stores/despensaStore`.
2. Importar `getEmojiIngrediente` desde `@/features/despensa/data/datosDespensa`.
3. Añadir estado local `añadido: boolean` para feedback visual (no hay `toast` disponible).
4. Implementar `handleAnadirDespensa`:
   - Leer `ingredientes` actuales del store.
   - Por cada ingrediente de la receta que **no** exista ya en la despensa (comparación case-insensitive por `nombre`), llamar a `store.añadir()`.
   - `Ingrediente.cantidad` es `number` en `receta.types.ts` → no requiere conversión.
   - Activar `añadido = true` y restaurarlo a `false` tras 3 s.
5. Cambiar el texto del botón a **"Añadir a mi despensa"** / **"✓ Añadidos"** según estado.

```tsx
// Importaciones adicionales
import { useDespensaStore } from '@/stores/despensaStore'
import { getEmojiIngrediente } from '@/features/despensa/data/datosDespensa'

// Dentro de TabsReceta
const [añadido, setAñadido] = useState(false)
const storeIngredientes = useDespensaStore((s) => s.ingredientes)
const añadir = useDespensaStore((s) => s.añadir)

function handleAnadirDespensa() {
  const nombresEnStore = new Set(
    storeIngredientes.map((i) => i.nombre.toLowerCase())
  )
  ingredientes.forEach((ing) => {
    if (!nombresEnStore.has(ing.nombre.toLowerCase())) {
      añadir({
        nombre: ing.nombre,
        cantidad: ing.cantidad,
        unidad: ing.unidad,
        emoji: getEmojiIngrediente(ing.nombre),
      })
    }
  })
  setAñadido(true)
  setTimeout(() => setAñadido(false), 3000)
}

// Botón actualizado
<button
  onClick={handleAnadirDespensa}
  disabled={añadido}
  className="mb-8 flex w-full items-center justify-center text-sm font-bold text-brand transition-opacity hover:opacity-80 disabled:opacity-60"
>
  {añadido ? '✓ Añadidos' : 'Añadir a mi despensa'}
</button>
```

### Restricciones a respetar

- 0 colores hardcoded — no añadir valores hex ni rgb en className.
- No lógica en JSX — `handleAnadirDespensa` es función declarada fuera del return.
- Deduplicación por nombre (case-insensitive) para no duplicar un ingrediente que el usuario ya tiene.
- El store es Zustand (Sprint 4 FE mock) — en Fase 5 se sustituirá por llamada a BE.

---

## Documentación a actualizar al terminar

### `docs/desarrollo/estadoTareas.html`

- **CREAR-001** (`formularioCrearReceta.tsx`): cambiar estado de `🟡 Pendiente · Sprint 4` a `✅ Completado · Sprint 4`.
- **DET-006-FE** (`tabsReceta.tsx`): añadir nueva fila con estado `✅ Completado · Sprint 4`.
- Actualizar contador de completadas (+2) y fecha de cabecera a la fecha del día.

### `docs/context.md`

- En la sección de ruta `/crear-receta`, actualizar nota de CREAR-001 a ✅.
- En la sección de ruta `/receta/[id]`, añadir o actualizar nota de DET-006-FE a ✅.
