# 0003 · Los alérgenos del perfil son un suelo, y lo aplica el backend

**Fecha:** escrita el 4 de octubre de 2026; la decisión es de la Fase 2b, 17 de julio de 2026 · **Estado:** aceptada · **Origen:** F10.4 del plan, regla «El filtro de alérgenos es un suelo» de `CLAUDE.md`

## Contexto

Un usuario declara en su perfil a qué es alérgico. El feed tiene además un drawer de filtros donde
se pueden marcar alérgenos para una búsqueda concreta. Había que decidir qué relación tienen las dos
cosas y quién la hace cumplir.

No es una preferencia de navegación: enseñarle una receta con cacahuete a alguien alérgico al
cacahuete es un problema de salud.

## Decisión

```
alergenosEfectivos = union(perfil.alergias, query.alergenos)
```

Vive en `recetasService.resolverAlergenos()`. Los alérgenos del perfil se aplican siempre al usuario
autenticado, mande el cliente lo que mande. El query solo puede sumar. La única forma de dejar de
filtrar por uno es quitarlo del perfil. Un visitante sin sesión no tiene perfil y solo se le aplica
el query.

Se aplica al feed y a los similares, tanto los de `findById` como los de `findSimilares`.

Para que el suelo sirva, las recetas tienen que estar bien etiquetadas, así que el backend tampoco
se fía de los `alergenos` que manda el cliente al crear o editar: guarda `alergenosDeReceta()`, que
es lo declarado, filtrado a los 14 conocidos, más lo que detecta en los ingredientes. Solo suma.

## Alternativa descartada

Filtrar en el frontend, o en el controlador a partir de un parámetro que mande el cliente. Es lo
obvio, porque el drawer ya manda `alergenos` en el query. Se descarta por lo que dice `CLAUDE.md`: si
la protección depende de que el cliente se acuerde de mandar el parámetro, no es una protección.
Cualquier pantalla nueva, o cualquier llamada directa a la API, se la saltaría sin querer.

Por lo mismo no existe un parámetro para «desactivar» el perfil en una búsqueda.

## Consecuencias

- Un usuario no puede ver, ni siquiera una vez, una receta con un alérgeno de su perfil sin cambiar
  el perfil. Es una molestia real para quien cocina para otros, y está aceptada.
- El drawer tiene que enseñar los alérgenos del perfil marcados y bloqueados, con candado y enlace a
  `/perfil`. Si se dejan pulsar, el control miente. Van con `aria-disabled` y `aria-describedby`, no
  con `disabled`, para que el lector de pantalla llegue a leer por qué.
- Cada vía nueva que devuelva recetas tiene que recibir la unión. No hay nada que lo imponga solo:
  `tests/feed.alergenos.test.ts` cubre las vías que existen hoy, no las que se añadan.
- El catálogo de ingredientes y el detector están copiados en `backend/src/lib/ingredientes.ts` y
  `frontend/src/config/ingredientes.ts`, porque los dos paquetes no comparten código. Tocar uno
  obliga a tocar el otro; `tests/alergenos.deteccion.test.ts` falla si se separan.
- La detección es por palabras. Protege tanto como lo bueno que sea el catálogo: un ingrediente que
  el detector no conoce no suma su alérgeno, y la receta pasa el filtro.
- Las recetas guardadas antes de un cambio en el catálogo no se reetiquetan solas. Hay que pasar
  `npm run recalcular:alergenos` contra la base.
- El contexto del usuario entra en la clave de la caché del chat (F7.6) por el mismo motivo, y eso
  hace que la caché acierte menos.
