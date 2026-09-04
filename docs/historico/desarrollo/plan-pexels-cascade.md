# Plan — Búsqueda Pexels en cascada

## Objetivo

Reemplazar la búsqueda única de Pexels (título crudo) por una función con tres intentos en cascada, para pasar de "a veces sale comida" a "casi siempre sale la comida correcta".

---

## Archivos modificados

| Archivo | Capa | Cambio |
|---|---|---|
| `backend/src/services/imagenService.ts` | Service | Nueva función `buscarFotoPexelsCascada()` + mapa de traducción ES→EN + helper de categoría |
| `backend/src/repositories/recetaRepository.ts` | Repository | Llamar a `buscarFotoPexelsCascada()` pasando `datos.dietas` como hint de categoría |
| `backend/src/services/recetasService.ts` | Service | `obtenerFotoPreview` usa también la cascada |

---

## Estrategia en cascada

```
Intento 1: "${titulo} food photography"
  → si photos.length > 0 → devuelve
  ↓
Intento 2: "${traducirTerminos(titulo)} food recipe"
  → traducción ES→EN con mapa estático de términos culinarios comunes
  → si photos.length > 0 → devuelve
  ↓
Intento 3: "${categoriaEN(dietas[0] ?? 'food')} dish"
  → usa la primera dieta/categoría traducida (vegano→vegan, pasta→pasta, etc.)
  → si photos.length > 0 → devuelve
  ↓
null (sin resultados — no se muestra imagen)
```

---

## Mapa de traducción ES→EN

Palabras clave extraídas del título. Solo los términos culinarios más comunes del proyecto:

| ES | EN |
|---|---|
| pollo | chicken |
| ternera / carne | beef |
| cerdo | pork |
| pescado / salmón / atún / bacalao | salmon / tuna / cod |
| pasta / fideos | pasta |
| arroz / paella | rice / paella |
| ensalada | salad |
| sopa / crema | soup |
| tarta / pastel / bizcocho | cake |
| galletas | cookies |
| pan | bread |
| tortilla | omelette |
| gazpacho | gazpacho |
| lentejas / garbanzos | lentils / chickpeas |
| verduras / espinacas / calabacín | vegetables |
| huevo | egg |

La función `traducirTerminos(titulo)` tokeniza el título, busca en el mapa (case-insensitive) y reconstruye la frase. Si no traduce nada, devuelve el título original para que el intento 2 sea idéntico al 1 (y se salte al 3).

---

## Mapa de categorías (dietas → EN)

| Dieta/categoría | Query EN |
|---|---|
| vegano | vegan food |
| vegetariano | vegetarian food |
| keto | keto food |
| sin gluten | gluten free food |
| sin lactosa | dairy free food |
| pasta | pasta dish |
| (default) | food photography |

---

## Interfaz pública

```ts
// Conserva la firma original — todos los llamadores siguen funcionando
export async function buscarFotoPexels(query: string): Promise<ResultadoFotoPexels | null>

// Nueva función para los casos con contexto de categoría
export async function buscarFotoPexelsCascada(
  titulo: string,
  categorias?: string[]
): Promise<ResultadoFotoPexels | null>
```

`buscarFotoPexels` sigue existiendo (la usa el script de seed directamente). `buscarFotoPexelsCascada` la reemplaza en los flujos de creación y preview.

---

## Decisiones de diseño

- **Sin API externa de traducción:** el mapa estático es suficiente para los términos del dominio culinario. Sin coste, sin latencia, sin dependencias.
- **Orientación `landscape` ya activa:** no hay que cambiar nada en el filtro de Pexels.
- **`per_page: "3"` en lugar de `"1"`** en cada intento: permite evaluar si hay resultados sin paginar, y se toma el primero. Muy bajo coste de red.
- **Compatibilidad total:** `buscarFotoPexels` no cambia de firma. El script de seed, que la llama directamente, no se toca.
- **`recetasService.obtenerFotoPreview`** recibe el query ya formateado desde el FE (`/recetas/foto-preview?query=...`). Lo más limpio es que use `buscarFotoPexelsCascada(query)` sin categorías — el usuario ya teclea lo que quiere buscar, el intento 2 añade contexto de comida.

---

## Flujo de datos

```
POST /api/recetas (crear receta sin imagen)
  ↓
recetaRepository.crear(datos)
  ↓ (sin imagenBase64)
buscarFotoPexelsCascada(datos.titulo, datos.dietas)
  ↓ intento 1: "Tortilla española food photography"
  ↓ intento 2: "Spanish omelette food recipe"
  ↓ intento 3: "food photography dish" (sin dietas)
  ↓
imagenUrl + fotoFuente="pexels" + fotoCredito
```
