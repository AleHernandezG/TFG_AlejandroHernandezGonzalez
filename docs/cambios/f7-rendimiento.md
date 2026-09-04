# F7 · Rendimiento y consistencia — Cookr

Registro de lo que se tocó en el bloque F7 de `docs/estado/plan-2026-09.md`, con las decisiones que
costaron y lo que queda a medias.

F7.4 se hizo después, en su propia sesión, y está al final. Toca frontend, backend y datos ya
guardados, y es el único apartado del bloque que **no se ha ejecutado contra producción**.

---

## [PERF-001] Índices en Mongo · A4

Fecha: 2026-09-04 | Estado: ✅ Completado | Afecta: BE | Bloque: F7.1

### Qué estaba mal

`recetaMongo.ts` no tenía ni una llamada a `schema.index()`. El feed filtra por `categorias`,
`alergenos`, `dificultad`, `autorId` y `esEvento`, y ordena por `fechaPublicacion`: todo eso era un
recorrido completo de la colección más una ordenación en memoria del servidor. En `Usuario` faltaba
`googleId`, que desde F6 se consulta en cada login con Google.

### Qué se midió antes de tocar nada

`explain("executionStats")` sobre las consultas reales del feed, con 3.000 recetas sembradas en un
`mongodb-memory-server`. Sin índices:

| Consulta | Plan | Docs examinados para devolver 20 |
|---|---|---|
| feed sin filtros | `SORT ← COLLSCAN` | 3000 |
| feed con categoría | `SORT ← COLLSCAN` | 3000 |
| feed con alérgenos | `SORT ← COLLSCAN` | 3000 |
| feed por autor | `SORT ← COLLSCAN` | 3000 |

Con los índices puestos:

| Consulta | Plan | Docs examinados |
|---|---|---|
| feed sin filtros | `LIMIT ← FETCH ← IXSCAN(fechaPublicacion_-1)` | 20 |
| feed con categoría | `LIMIT ← FETCH ← IXSCAN(categorias_1_fechaPublicacion_-1)` | 20 |
| feed con alérgenos | `LIMIT ← FETCH ← IXSCAN(fechaPublicacion_-1)` | 22 |
| feed solo eventos | `LIMIT ← FETCH ← IXSCAN(esEvento_1_fechaPublicacion_-1)` | 20 |
| feed por autor | `LIMIT ← FETCH ← IXSCAN(autorId_1_fechaPublicacion_-1)` | 20 |

Desaparece también la etapa `SORT`: el índice ya trae el orden por fecha, así que el servidor no
tiene que materializar nada.

### Qué se hizo

En `models/recetaMongo.ts`:

```ts
recetaSchema.index({ fechaPublicacion: -1 });
recetaSchema.index({ autorId: 1, fechaPublicacion: -1 });
recetaSchema.index({ categorias: 1, fechaPublicacion: -1 });
recetaSchema.index({ esEvento: 1, fechaPublicacion: -1 });
```

En `models/usuarioMongo.ts`, `usuarioSchema.index({ googleId: 1 }, { sparse: true })`. Va `sparse`
porque las cuentas locales no tienen `googleId` y no hay por qué indexar sus nulos.

Los índices están en el esquema, no creados a mano al arrancar. Nadie configura `autoIndex` en
ninguna parte del repositorio, así que Mongoose usa su valor por defecto (`true`) y los crea al
conectar. Está comprobado en `tests/feed.indices.test.ts`, que los lista contra la base y falla si
no aparecen.

### Decisiones que costaron

**El índice de `alergenos` que proponía la auditoría no está.** La auditoría lo pedía
(`recetaSchema.index({ alergenos: 1 })`), pero medido da exactamente el mismo plan con él y sin él:
el planificador nunca lo elige. La razón es que `alergenos` solo se consulta con `$nin`, que es una
negación y no es selectiva; nunca hay una búsqueda positiva por alérgeno. Un índice que nadie usa
cuesta escrituras y memoria, así que fuera. Si algún día se busca *por* alérgeno en vez de
*excluyendo* alérgenos, hay que volver a plantearlo.

**El índice de texto sobre `titulo` y `descripcion` tampoco está, y es una decisión, no un olvido.**
Era lo que SEC-003 dejó a medias en F6: el `$regex` escapado no puede usar índice y recorre la
colección entera. Pasar a `$text` cambia lo que el usuario encuentra, y esto es lo que se midió:

| | `$regex` escapado (lo que hay) | `$text` con índice |
|---|---|---|
| Coste de `"queso"` | 3003 docs examinados | 1 clave |
| `"ques"` → «Tarta de queso» | sí | sí, por el stemmer español |
| `"tar"` → «Tarta de queso» | **sí** | **no** |
| `"arro"` → «Arroz con leche» | **sí** | **no** |
| `"limon"` → «Sorbete de limón» | **no** | **sí** |
| `"leche limon"` | no encuentra nada | encuentra las dos |
| `"de"` | encuentra | nada, es una palabra vacía |

Lo que decide es que la búsqueda de hoy es incremental: `headerDiscover.tsx` llama a `onChange` en
cada pulsación y `q` está en la `queryKey` de `useDiscover`, sin *debounce*. Con `$text`, quien
escribe «arroz» ve la lista vacía en «a», «ar», «arr» y «arro», y solo aparece algo al cerrar la
palabra. Ganar acentos y coste a cambio de romper el buscador mientras se teclea no compensa, y
arreglarlo del todo pide además un *debounce* en el frontend, que es trabajo de otro bloque.

Así que la búsqueda se queda como está y su recorrido completo sigue siendo deuda conocida.

---

## [PERF-002] El feed ordenado, a la base de datos · A3

Fecha: 2026-09-04 | Estado: ✅ Completado | Afecta: BE | Bloque: F7.2

### Qué estaba mal

Con `sort=score` y con `sort=likes`, `recetaRepository.findAll` hacía `Receta.find(query)` **sin
`limit`**, con `populate` del autor, ordenaba el array en JavaScript y luego cortaba la página. Cada
petición del feed ordenado traía la colección entera al proceso de Node. Con las imágenes dentro del
documento (A5, todavía sin arreglar) eso son cientos de megas por petición.

### Qué se hizo

`calcularScoreFeed` ya no existe. En su lugar hay dos constructores de etapas, `etapasScore` y
`etapasLikes`, y un `paginarOrdenado` que las monta sobre un `aggregate`. El score es el mismo,
término a término:

| Término | JavaScript | Agregación |
|---|---|---|
| popularidad | `likes*2 + comentarios*3` | `$add` de dos `$multiply` sobre `$size` |
| decay | `1/(1+√max(0,días))` | `$divide` con `$sqrt` y `$max` |
| followBoost | `seguidos.has(autor) ? 1.5 : 0` | `$cond` con `$in` sobre el array de seguidos |
| prefBoost | `categorias.filter(...).length * 0.5` | `$size` de un `$filter` con `$in` |

El `prefBoost` usa `$filter` y no `$setIntersection` a propósito: `$setIntersection` deduplica y el
`filter` de JavaScript no, así que con una categoría repetida las dos versiones no darían lo mismo.

`sort=likes` es `$addFields: { numLikes: { $size: "$likes" } }` y a ordenar por ahí.

El autor se rellena después con `Receta.populate(docs, ...)`, que es una consulta más y no obliga a
reordenar nada en JavaScript. El `total` sale de un `countDocuments`, no de contar el array
completo.

`buscarCandidatasParaDespensa` también pasa a `aggregate`: calcula `prefBoost` y `numLikes` y ordena
en la base. `elegirMejorReceta` en `chatService.ts` ya no ordena, solo hace `find` sobre la lista que
llega ordenada. Como el orden es (preferencias desc, likes desc) y filtrar preserva el orden, el
primero que pasa el filtro es el mismo que salía antes.

### Decisiones que costaron

**El desempate ahora está fijado y antes no lo estaba.** El `Array.prototype.sort` de V8 es estable,
así que a igualdad de score el orden que salía era el que trajera `Receta.find()`, es decir, el orden
natural de la colección. Eso no es una garantía de nada: cambia si cambia el plan, y de hecho acaba
de cambiar al añadir los índices de PERF-001. La agregación ordena por `{ score: -1,
fechaPublicacion: -1 }` y `sort=likes` por `{ numLikes: -1, fechaPublicacion: -1 }`, que además es lo
que `sort=likes` hacía de facto porque partía de una lista ya ordenada por fecha. A igualdad, gana la
más reciente, y eso ya no depende del azar.

**La memoria del `$sort` está acotada, y conviene saber por qué.** Ordenar por un campo calculado
obliga a puntuar todos los documentos que pasan el `$match`; eso no se puede evitar. Lo que sí se
evita es materializarlos: MongoDB fusiona `$sort` + `$skip` + `$limit` en un *top-k*, comprobado en
el `explain` del pipeline (`"limit": 20` dentro de la etapa `$sort`, `usedDisk: false`). Con un
filtro de categoría sobre 3.000 recetas, el `$match` entra por `categorias_1_fechaPublicacion_-1`,
puntúa las 1.500 que casan y solo se queda con 20. Antes esas 1.500 viajaban enteras a Node.

La agregación de la despensa lleva `allowDiskUse(true)` porque ahí el `$sort` no tiene `$limit` que
lo acote: hacen falta todas las candidatas para el filtro de ingredientes.

### Qué queda a medias

`buscarCandidatasParaDespensa` **sigue trayendo todas las recetas**. Lo que se movió a la base es la
ordenación, no la selección. El filtro que decide qué es candidata es `ingredienteCoincide` en
`chatService.ts`, que normaliza acentos y compara subcadenas en las dos direcciones, con una regla
distinta para palabras de menos de cuatro letras. Eso no se expresa en una consulta de Mongo sin
denormalizar antes los nombres de ingrediente a un campo normalizado e indexado. Es un cambio de
modelo y no entraba aquí.

La búsqueda por `q` sigue sin usar índice. Está explicado arriba, en PERF-001.

---

## [PERF-003] Escrituras atómicas · M6

Fecha: 2026-09-04 | Estado: ✅ Completado | Afecta: BE | Bloque: F7.3

### Qué estaba mal, exactamente

La auditoría dice que los tres casos (`toggleLike`, `toggleGuardado`, `agregarComentario`) cargan el
documento, lo modifican en memoria y hacen `save()`, y que por eso la segunda petición escribe el
array que leyó antes de la primera. Mirando lo que Mongoose manda de verdad por el cable, el
diagnóstico es correcto en el resultado pero no en el mecanismo, y la diferencia importa:

```
receta.likes.push(uid); await receta.save();
  → update: { $push: { likes: { $each: [...] } } }

usuario.recetasGuardadas = [...guardadas, rid]; await usuario.save();
  → update: { $set: { recetasGuardadas: [...] } }
```

Es decir:

- **Likes y comentarios** ya salían como `$push`, que es atómico. Su problema no era perder
  escrituras: era que `$push` no tiene semántica de conjunto, así que dos likes simultáneos del mismo
  usuario dejaban **la misma persona dos veces** en el array.
- **Guardados** sí perdía escrituras de verdad, porque reasignar el array entero se traduce en un
  `$set` del array completo: guardar dos recetas a la vez dejaba solo una.

Los dos casos están comprobados en `tests/escrituras.concurrentes.test.ts`, que con el código
anterior falla exactamente en esos dos y en ninguno más.

### Qué se hizo

- `toggleLike`: `Receta.exists` para saber la dirección y `findByIdAndUpdate` con `$addToSet` o
  `$pull`. `$addToSet` no puede crear un duplicado por definición. `totalLikes` sale del documento
  devuelto con `new: true`, proyectando solo `likes`.
- `toggleGuardado`: lo mismo sobre `Usuario.recetasGuardadas`.
- `agregarComentario`: `Receta.updateOne` con `$push`, y el 404 sale de `matchedCount === 0`.

Como efecto secundario, ninguno de los tres vuelve a cargar el documento entero de la receta. Con la
imagen en base64 dentro (A5), eso eran varios megas por cada like.

### Decisiones que costaron

**Un interruptor pulsado varias veces a la vez no tiene resultado definido, y el test lo dice así.**
Con dos likes simultáneos del mismo usuario el array acaba con una sola entrada, que es lo que pide
el plan. Con ocho, el resultado depende de cómo se intercalen lecturas y escrituras: puede quedar en
uno o en cero, porque alguna petición llega a leer el like que otra acaba de poner y lo quita. Eso no
es un fallo del cambio: es lo que significa pulsar un interruptor ocho veces a la vez. La garantía
que sí da `$addToSet`, y la que fija el test, es que **el usuario nunca aparece dos veces**, salga el
número que salga.

La alternativa era un `update` con *pipeline* que hiciera el toggle en una sola operación atómica,
sin lectura previa. Se descartó porque entonces dos likes simultáneos se anulan entre sí y el array
acaba vacío, que es justo lo contrario de lo que pide el criterio de cierre de F7.3.

### Qué queda a medias

**`usuarioRepository.seguir` tiene el mismo bug y no se ha tocado.** Está en
`repositories/usuarioRepository.ts:153`, hace `await Promise.all([seguidor.save(), seguido.save()])`
sobre dos documentos con los arrays reasignados enteros, así que es un `$set` de `seguidos` y otro de
`seguidores`: dos seguimientos simultáneos se pisan igual que se pisaban los guardados. F7.3 acota el
arreglo a likes, guardados y comentarios y ahí se ha quedado. El arreglo es mecánico, el mismo
`$addToSet` / `$pull` por partida doble, pero merece su propia tarea porque toca dos documentos y no
hay transacción que los cubra.

---

## [PERF-004] Las imágenes fuera de Mongo · A5

Fecha: 2026-09-04 | Estado: ✅ Completado y migrado | Afecta: BE + FE + datos | Bloque: F7.4

### Qué se midió antes de tocar nada

Contra Atlas, en solo lectura:

| Colección | Docs | Tamaño | De eso, base64 |
|---|---|---|---|
| `recetas` | 145 | 3,90 MB | 3,68 MB |
| `usuarios` | 39 | 2,82 MB | 2,80 MB |

Una receta con foto propia ocupa **412 KB de media** y la peor 1191 KB. Las 141 que tiran de una URL
de Pexels se quedan en 16,6 KB. La receta más gorda de la colección **sin** nada incrustado son
3,2 KB, y el usuario más gordo sin avatar incrustado, 0,6 KB. Ese es el suelo real del contenido.

**La auditoría se queda corta y eso cambió el plan.** A5 habla de `imagenUrl`, pero desglosando
`recetas` por campo aparece que `imagenUrl` son 1,61 MB y `listaComentarios` **2,07 MB**: los
comentarios pesan más que las fotos. `comentarioSchema.avatarUrl` guarda una copia del avatar del
autor dentro de cada comentario, así que un único comentario mete 1967,6 KB dentro de la receta donde
se escribió. La receta más pesada de toda la base (1969,5 KB) tiene una `imagenUrl` de Pexels de
0,1 KB: todo su peso es el avatar de otra persona. Tres comentarios sumaban 2,07 MB.

De los 6,72 MB de las dos colecciones, 6,47 MB son base64 y unos 250 KB son contenido de verdad. Una
migración que solo tocara `imagenUrl` habría dejado dentro más de la mitad del problema.

### Qué se hizo

La foto ya no pasa por el backend. El navegador pide una firma, sube el fichero directamente a
Cloudinary y manda a la API solo la URL que le devuelven.

- `lib/cloudinary.ts`: lee `CLOUDINARY_URL`, firma con SHA-1 y sube desde el servidor cuando hace
  falta, que es solo en la migración. Sin SDK.
- `POST /api/subidas/firma`: devuelve la URL de subida y los campos ya firmados. El `public_id` del
  avatar es `cookr/avatares/<id>`, determinista a propósito, para que cambiar de foto sobrescriba en
  vez de acumular. El de receta lleva marca de tiempo y azar, porque un usuario tiene muchas.
- `imagenBase64` pasa a llamarse `imagenUrl` en el esquema de crear receta, en los tipos y en los dos
  formularios del frontend, y se valida contra `^https://` con un regex.
- `usuariosService.actualizarFoto` recibe `fotoUrl` y rechaza lo que no sea `https`.
- `scripts/migrarImagenes.ts`: sube lo que ya está guardado y lo sustituye. Modo seco por defecto,
  `--apply` para escribir.
- El límite de cuerpo baja: `/api/recetas` y `/api/usuarios` pasan de 10 MB a los 100 KB del
  `jsonEstandar` que ya existía, y `/api/chat` y `/api/despensa` a 8 MB.

Una receta nueva con foto ocupa ahora **0,64 KB**, medidos con `$bsonSize` en
`tests/imagenes.test.ts`, contra los 412 KB de media de antes.

La migración se aplicó el mismo día contra el Atlas de producción:

| | Antes | Después |
|---|---|---|
| `recetas` | 3,90 MB | 0,22 MB |
| `usuarios` | 2,82 MB | 0,02 MB |
| Receta más pesada | 1969,5 KB | 3,4 KB |

Once referencias con solo 8 subidas: los tres avatares de comentarios reutilizaron la URL del usuario
ya migrado, que es para lo que existe el mapa `urlPorUsuario`. Ningún documento falló y la segunda
pasada en seco no encuentra nada. Las 8 URL responden 200 y los bytes servidos son tres cuartas
partes de lo que ocupaba el base64, o sea exactamente el inflado que mete base64: la imagen es la
misma, no se recodificó.

### Decisiones que costaron

**Cloudinary o R2, y quién sube el fichero.** Las dos las decidió Alejandro y las dos cambiaban todo
lo demás, así que se pararon y se preguntaron con los números delante. Cloudinary por el plan
gratuito y las transformaciones por URL. Subida directa desde el navegador con firma del backend, que
es más trabajo que reenviar el base64 pero es lo único que quita el problema de raíz: si el fichero
no atraviesa Render, el límite de cuerpo puede bajar de verdad.

**Sin dependencia nueva.** La firma son cuatro líneas de `crypto` y la subida un `POST` con `axios`.
Es el mismo criterio que ya se sigue en `lib/email.ts`, que habla con la API REST de Mailjet en vez
de arrastrar un SDK.

**`z.string().url()` no vale.** `new URL("data:image/png;base64,...")` es una URL perfectamente
válida, así que ese validador aceptaría justo lo que hay que prohibir. De ahí el regex explícito.

**Los dos formularios tenían que ir juntos.** Si crear manda URL y editar manda base64, el campo se
llena de las dos cosas y ya no hay forma de saber qué hay dentro. Editar además tenía un fallo
latente: inicializaba `fotoUrl` con la imagen existente si no empezaba por `http`, o sea que reenviaba
el base64 viejo en cada guardado. Con el validador nuevo eso habría sido un 400 en cada edición de
receta antigua. Ahora arranca en `null` y solo se manda foto si el usuario elige una.

**Dejar que el avatar entre en la sesión de NextAuth.** Los tres filtros de `frontend/src/lib/auth.ts`
que descartan `data:` se han dejado tal cual, como red para las filas viejas, pero en cuanto la foto
sea `https` dejan de descartar y el avatar empieza a viajar en la cookie. Se comprobó que no rompe
nada: `session.user.image` solo se pinta con `<img>` y con el `AvatarImage` de shadcn, nunca con
`next/image`, y `res.cloudinary.com` ya estaba en los `remotePatterns` de `next.config.mjs`.

**El 413 no era el que dice CLAUDE.md.** El plan pedía un test de que un cuerpo pasado de tamaño dé
413 y no 500. CLAUDE.md afirma que `middlewares/errores.ts` nunca llega a ejecutarse y que descarta
`err.status` devolviendo siempre 500; las dos cosas son falsas hoy. `manejadorErrores` delega en
`manejarError`, que sí lee `err.status`, y los errores de `body-parser` no los captura nadie antes,
así que llegan ahí y salen como 413. Esa nota de CLAUDE.md está vieja y conviene corregirla.

### Qué queda a medias

**Falta `CLOUDINARY_URL` en Render y falta un navegador.** En local está puesta y la migración ya
corrió, pero en producción el backend todavía no tiene la variable, y sin ella
`POST /api/subidas/firma` responde 503 y no se puede subir ninguna foto. Tampoco ha salido aún
ninguna subida de un navegador de verdad: que las 8 imágenes migradas respondan 200 prueba que el
fichero está y se sirve, no que la página lo pinte donde toca ni que el camino
navegador → Cloudinary funcione. Las casillas están en `docs/estado/pruebas-manuales.md`, apartado 5.

**Hay copia de seguridad.** Antes del `--apply` se volcaron `recetas`, `usuarios` y `tokens` a
`4 Curso/backup-antes-de-f74/`, con un `restaurar.js` al lado. Está fuera del repositorio a
propósito, porque lleva correos y contraseñas hasheadas.

**Los avatares de los comentarios se siguen copiando.** La migración reescribe los que ya están,
pero `recetaRepository.agregarComentario` sigue metiendo `usuario.foto` dentro de cada comentario.
Con URLs eso son unos 100 bytes y deja de doler, así que se ha dejado como está: quitar la
desnormalización obliga a un `$lookup` en el detalle de receta y eso es otra tarea. El día que alguien
cambie de avatar, sus comentarios viejos seguirán enseñando el anterior.

**Nadie borra nada en Cloudinary.** Al eliminar una receta su imagen se queda subida para siempre.
Con el volumen actual da igual, pero es deuda con nombre.

**El chat y la despensa siguen mandando base64.** Va a Gemini como imagen en línea y no se guarda en
ningún sitio, por eso se han dejado igual y por eso su límite se queda en 8 MB y no baja más. Las dos
rutas ya cortaban por su cuenta en 7.000.000 de caracteres y ese tope no se ha tocado.

**Los scripts de seed no se han tocado**, y se comprobó antes de darlo por bueno: `seedMasivo.ts` y
`updateSeedImages.ts` ya guardaban URLs de picsum, Pexels y ui-avatars, y además escriben directos a
Mongo sin pasar por la validación de la ruta.

---

## Lo que hay que comprobar a mano

Nada de esto se puede dar por bueno contra `mongodb-memory-server`. Está en
`docs/estado/pruebas-manuales.md`, apartado 5, con los pasos:

- Que los índices existan de verdad en Atlas y no se hayan quedado a medio construir.
- Que el `explain()` elija los mismos planes con los datos reales, que no están repartidos como los
  sintéticos de las mediciones.
- Que el `$sort` de la despensa aguante con las imágenes en base64 dentro de los documentos.
- **Lo que queda de F7.4.** La migración ya está aplicada, pero falta `CLOUDINARY_URL` en Render y
  falta subir una foto y un avatar desde un navegador de verdad.

---

## Ficheros tocados

| Fichero | Qué |
|---|---|
| `backend/src/models/recetaMongo.ts` | Cuatro índices |
| `backend/src/models/usuarioMongo.ts` | Índice `googleId` sparse |
| `backend/src/repositories/recetaRepository.ts` | Agregaciones y escrituras atómicas |
| `backend/src/services/chatService.ts` | `elegirMejorReceta` ya no ordena |
| `backend/tests/feed.indices.test.ts` | Nuevo. Índices y planes sin `COLLSCAN` |
| `backend/tests/feed.orden.test.ts` | Nuevo. El orden de `score` y de `likes` |
| `backend/tests/escrituras.concurrentes.test.ts` | Nuevo. Likes, guardados y comentarios a la vez |
| `backend/tests/helpers/factories.ts` | `crearReceta` acepta likes, comentarios y fecha |
| `backend/src/lib/cloudinary.ts` | Nuevo. Firma y subida, sin SDK |
| `backend/src/services/subidasService.ts` | Nuevo. Decide el `public_id` según el tipo |
| `backend/src/controllers/subidasController.ts` | Nuevo |
| `backend/src/routes/subidas.routes.ts` | Nuevo. `POST /api/subidas/firma` |
| `backend/src/scripts/migrarImagenes.ts` | Nuevo. Migración repetible, seca por defecto |
| `backend/src/lib/validadores.ts` | `esquemaUrlImagen`, `esquemaFirmaSubida`, `esquemaFotoUsuario` |
| `backend/src/types/receta.ts` | `imagenBase64` → `imagenUrl` |
| `backend/src/app.ts` | Límites de cuerpo y la ruta de subidas |
| `backend/src/services/usuariosService.ts` | La foto tiene que ser `https` |
| `backend/tests/imagenes.test.ts` | Nuevo. 413, URL contra `data:` y el peso del documento |
| `frontend/src/services/subidasService.ts` | Nuevo. Pide firma y sube al almacén |
| `frontend/src/features/recetas/components/**/formulario*.tsx` | Suben la foto y enseñan el estado |
| `frontend/src/features/perfil/components/tarjetaAvatarPerfil.tsx` | Sin `FileReader` |

Backend: 128 tests en verde (eran 102, y 123 al cerrar F7.3). `npm run lint` y
`npx tsc --noEmit -p tsconfig.test.json` en verde. Frontend: `npm run lint` y `npx tsc --noEmit` en
verde, con los avisos de `no-img-element` que ya estaban antes.

`tests/feed.alergenos.test.ts` y `resolverAlergenos` no se han tocado: siguen en verde tal cual, que
es la prueba de que la agregación no se ha comido el filtro del perfil.
