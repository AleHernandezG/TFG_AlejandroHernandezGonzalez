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

**Falta `CLOUDINARY_URL` en Render.** En local está puesta, la migración corrió y el camino
completo desde el navegador quedó probado el 5 de septiembre. En producción el backend todavía no
tiene la variable, y sin ella `POST /api/subidas/firma` responde 503 y no se puede subir ninguna
foto. Es lo único que separa a F7.4 de estar cerrada.

**El navegador ya no es una duda.** Se condujo Chromium con Playwright contra los servidores locales,
que apuntan al Atlas y al Cloudinary de producción, con un usuario temporal borrado al terminar junto
con sus recetas y sus ficheros. Salió todo: la firma y la subida a `api.cloudinary.com` responden 200
y ocurren al **elegir** el fichero, no al publicar; el documento resultante pesa 0,76 KB; editar sin
tocar la foto no dispara ninguna firma nueva ni duplica el fichero; el avatar cambiado dos veces deja
uno solo, porque su `public_id` sí es determinista; y la cookie de NextAuth mide 845 bytes, una sola,
sin trocear, llevando la URL dentro. Lo único que enseñó algo que no esperaba es que las fotos de
receta ahora pasan por `/_next/image`: el `unoptimized={imagenUrl.startsWith('data:')}` evalúa a
false y Next las optimiza, que es lo que queríamos, pero nadie lo había escrito en ningún sitio.
Quedan dos casillas que necesitan manos: una cuenta de Google real y una foto de cámara para el
escaneo de tickets. Las casillas están en `docs/estado/pruebas-manuales.md`, apartado 5.

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

## [PERF-005] La cuota de Gemini y las cachés de IA, a Redis · A6

Fecha: 2026-09-05 | Estado: ✅ Completado en código, ⏳ sin efecto en producción | Afecta: BE | Bloque: F7.6

### Qué estaba mal

Tres estados globales dentro de `chatService.ts`, los tres en variables de módulo:

- `llamadasHoy` con `diaActual` al lado, que es el tope diario de Gemini. Un `let`. Render reinicia
  el contenedor al desplegar y al despertar del sueño del plan gratuito, así que el contador volvía
  a cero varias veces al día y el tope de 1000 no protegía de nada.
- `cacheContexto`, un `Map` con el perfil, las alergias y la despensa de cada usuario. TTL de cinco
  minutos, y una consulta a Mongo por cada fallo.
- `cacheRecetaGenerada`, otro `Map` con dos minutos de TTL para las recetas generadas.

Los dos `Map` tampoco se comparten entre instancias, aunque hoy solo haya una.

### Qué se midió antes de tocar nada

**Nada, y hay que decirlo tal cual.** El plan pide bajar la factura de Gemini cacheando las
preguntas repetidas, y no existe ningún dato en ningún sitio que diga cuántas se repiten:

- `llamadasHoy` es local al proceso y no se expone por ninguna ruta. El único sitio donde aparece es
  un `console.log`.
- Render en plan gratuito duerme el servicio cada ~15 minutos y no tiene *log drain*, así que los
  logs viejos no están.
- `morgan` escribe la línea de petición, no el cuerpo. `POST /api/chat 200` no dice qué se preguntó.
- No hay colección de conversaciones en Mongo: el historial del chat vive en el `localStorage` del
  navegador y muere ahí. No hay Sentry ni analítica.

Lo único que sí se puede afirmar leyendo el código: las cuatro llamadas a Gemini pasan por
`registrarLlamadaGemini`, la proporción es una acción del usuario por llamada, y los topes son 30
por minuto y usuario (`rateLimitIA`) y 1000 al día en total.

Por eso el trabajo incluye dos contadores nuevos, `ia:cache:aciertos:AAAA-MM-DD` y
`ia:cache:fallos:AAAA-MM-DD`, con 30 días de TTL. La próxima vez que alguien se haga esta pregunta,
la respuesta estará en el *data browser* de Upstash en vez de ser una estimación.

### Qué se hizo

`lib/almacenIA.ts`, nuevo, con el mismo criterio que ya usaba `lib/rateLimitStore.ts`: Upstash si
están `UPSTASH_REDIS_URL` y `UPSTASH_REDIS_TOKEN`, memoria si no. Cuatro operaciones
(`incrementar`, `leer`, `guardar`, `borrar`) y un `reiniciarAlmacenIA()` para los tests, al lado del
`reiniciarLimitesAuth()` que ya existía.

| Estado | Antes | Ahora |
|---|---|---|
| Tope diario | `let llamadasHoy` + `diaActual` | `ia:gemini:llamadas:AAAA-MM-DD`, TTL 48 h |
| Contexto de usuario | `Map`, TTL 5 min | `ia:contexto:<usuarioId>`, TTL 5 min |
| Receta generada | `Map`, TTL 2 min | `ia:receta:<huella>`, TTL 2 min |
| Dudas de cocina | no existía | `ia:chat:v1:<huella>`, TTL 7 días |
| Aciertos y fallos | no existía | `ia:cache:aciertos:...` y `ia:cache:fallos:...`, TTL 30 días |

La caché semántica solo entra si la pregunta va sola: un único mensaje con `rol: "user"`, sin imagen
y de menos de 200 caracteres. Una conversación con historial no se cachea, porque la respuesta
depende de lo anterior y la clave no lo recogería.

El `v1` de `ia:chat:v1` es la versión del *system prompt*. Si alguien lo cambia y no toca esa
constante, la caché sigue devolviendo respuestas escritas con las instrucciones viejas durante una
semana. Subirla invalida todo de golpe sin tener que borrar nada a mano.

### Decisiones que costaron

**La clave lleva dentro el contexto del usuario, no solo la pregunta.** Es lo que más se pensó.
`responderChat` mete las dietas, las alergias y la despensa en el `systemInstruction`, así que la
misma pregunta con dos perfiles distintos tiene dos respuestas distintas, y una de ellas puede
mencionar un alimento al que el otro es alérgico. Cachear por pregunta a secas habría servido la
respuesta de un usuario a otro. Es el mismo tipo de problema que el filtro de alérgenos del feed y
se ha resuelto igual: la clave es `sha256(contexto || pregunta normalizada)`. El precio es que la
despensa cambia a menudo y cada cambio invalida las respuestas cacheadas de ese usuario, así que la
caché acertará menos de lo que dice el informe original. Se prefiere eso a servir una respuesta
ajena.

**Normalización conservadora.** Minúsculas, tildes fuera, signos de interrogación y admiración
fuera, espacios colapsados. Nada más: ni quitar palabras vacías, ni ordenar los términos, ni
lematizar. Confundir dos preguntas es mucho peor que fallar la caché, y ordenando términos
«¿puedo sustituir mantequilla por aceite?» y «¿puedo sustituir aceite por mantequilla?» darían la
misma clave siendo preguntas contrarias. Hay un test que fija justo ese par.

**Si Upstash se cae, la llamada pasa.** Bloquearla protege la factura, pero rompe la función
principal de la aplicación por un fallo de infraestructura ajena. Se deja pasar, con suelo: el
almacén en memoria sigue debajo y recoge lo que Redis no pudo, así que una caída degrada al
comportamiento de antes de F7.6, no a «sin tope». El aviso se imprime una sola vez para no llenar
el log.

**El cupo se cobra después de mirar la caché.** El orden en `responderChat` es contexto, caché, y
solo si hay fallo se llama a `registrarLlamadaGemini()`. Un acierto no consume cupo del tope diario,
que es justo lo que hace que el tope aguante más. Hay un test que lo comprueba leyendo el contador.

**El envoltorio `{ v: valor }`.** `@upstash/redis` parsea JSON al leer. Una respuesta que fuese
`"10"` volvía como el número `10` y rompía el tipo. Se guarda envuelto y se desenvuelve al leer.

### Qué queda a medias

**Esto no arregla nada en producción todavía.** `UPSTASH_REDIS_URL` y `UPSTASH_REDIS_TOKEN` no están
en Render, así que hoy el contador y las tres cachés siguen en memoria exactamente igual que antes.
El código elige solo; falta crear la base en Upstash y pegar las dos variables. Los pasos están en
`docs/estado/pruebas-manuales.md`, apartado 6.

**La comprobación que pide el plan no se ha hecho.** «El contador sobrevive a un redeploy» exige
reiniciar un proceso con Upstash delante y leer el número, y eso no se puede hacer desde los tests.
Lo que sí está probado sin tocar Redis de verdad: `tests/almacenIA.redis.test.ts` mockea el cliente
y comprueba que un contador que ya vale 417 sigue en 418 tras el arranque, que es el mecanismo, y
que una caída del cliente no propaga el error. La prueba de verdad, con el botón de reinicio de
Render, queda pendiente.

**Nadie llama a `invalidarContextoUsuario`.** Está exportada y funciona, pero no hay ninguna llamada
en `src/`: cambiar la despensa o las alergias no borra el contexto cacheado, solo se espera a que
caduque a los cinco minutos. Antes pasaba lo mismo con el `Map`, así que no es una regresión, pero
ahora que la clave se puede borrar desde fuera del proceso tiene arreglo barato.

**El ahorro sigue sin número.** Los contadores de aciertos y fallos están puestos, pero vacíos.
Hasta que haya días de uso real con Upstash conectado, cuánto baja la factura de Gemini es una
suposición.

---

## Lo que hay que comprobar a mano

Nada de esto se puede dar por bueno contra `mongodb-memory-server`. Está en
`docs/estado/pruebas-manuales.md`, apartado 5, con los pasos:

- Que los índices existan de verdad en Atlas y no se hayan quedado a medio construir.
- Que el `explain()` elija los mismos planes con los datos reales, que no están repartidos como los
  sintéticos de las mediciones.
- Que el `$sort` de la despensa aguante con las imágenes en base64 dentro de los documentos.
- **Lo que queda de F7.4.** La migración está aplicada y el navegador probado; falta
  `CLOUDINARY_URL` en Render, más una cuenta de Google real y un escaneo de ticket desde el móvil.
- **Todo F7.6 en producción.** Las variables de Upstash en Render, y después reiniciar el servicio
  y leer `ia:gemini:llamadas:AAAA-MM-DD` para ver que el contador no vuelve a 1. Apartado 6.

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
| `backend/src/lib/almacenIA.ts` | Nuevo. Upstash o memoria, con suelo si Redis se cae |
| `backend/src/services/chatService.ts` | Contador y cachés al almacén, más la caché semántica |
| `backend/tests/setup.ts` | `reiniciarAlmacenIA()` junto al `reiniciarLimitesAuth()` que ya estaba |
| `backend/tests/almacenIA.test.ts` | Nuevo. El almacén sin variables de Upstash |
| `backend/tests/almacenIA.redis.test.ts` | Nuevo. El camino de Redis con el cliente mockeado |
| `backend/tests/chat.cacheIA.test.ts` | Nuevo. La segunda pregunta idéntica no llama a Gemini |

Backend: 155 tests en verde (eran 102, 123 al cerrar F7.3 y 128 al cerrar F7.4). Los 128
anteriores siguen tal cual: no se ha editado ninguno para que pase F7.6. `npm run lint` y
`npx tsc --noEmit -p tsconfig.test.json` en verde. Frontend: `npm run lint` y `npx tsc --noEmit` en
verde, con los avisos de `no-img-element` que ya estaban antes.

`tests/feed.alergenos.test.ts` y `resolverAlergenos` no se han tocado: siguen en verde tal cual, que
es la prueba de que la agregación no se ha comido el filtro del perfil.
