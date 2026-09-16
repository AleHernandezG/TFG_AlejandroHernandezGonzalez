# Pruebas manuales pendientes

Lo que los tests automáticos no pueden comprobar, con los pasos exactos para hacerlo en un rato
libre. Cada bloque dice qué ejecutar, qué tiene que pasar y cómo se ve el fallo.

Los 169 tests del backend mockean todos los servicios externos a propósito: ninguna prueba gasta
cuota de Google, Mailjet, Gemini, Pexels ni Cloudinary, y ninguna habla con Upstash de verdad. El
precio de esa regla es esta lista.

Cuando compruebes algo, marca la casilla y pon la fecha. Si falla, apunta el síntoma aquí mismo
antes de arreglarlo.

---

## 1. Login con Google en local · F6, SEC-001

Es lo más urgente: F6 reescribió entero el flujo y ningún test ha visto un `id_token` de verdad.

**Antes de empezar**, `GOOGLE_CLIENT_ID` tiene que valer exactamente lo mismo en
`backend/.env` y en `frontend/.env.local`. El backend lo usa como `audience` al verificar el
token; si no cuadran, el token verifica en el frontend y se cae en el backend.

```bash
bash scripts/dev.sh          # FE :3000, BE :4000
```

- [ ] **Cuenta nueva.** Entra con una cuenta de Google que no exista en la base. En `usuarios`
      tiene que aparecer con `proveedor: "google"`, `googleId` puesto y `cuentaVerificada: true`.
- [ ] **Segundo login con la misma cuenta.** No se crea un usuario nuevo: entra en el mismo `_id`.
- [ ] **Cuenta local con el mismo correo.** Regístrate a mano con un correo, y después entra con
      Google usando ese mismo correo. Tiene que vincularse: el usuario conserva su `_id` y su
      contraseña, y se le añade el `googleId`. Es la decisión de SEC-001, no un fallo.
- [ ] **La sesión sobrevive a un refresco.** Recarga la página y sigues dentro. Si te echa, mira
      si se ha colado una foto `data:` en el token de NextAuth.
- [ ] **El limitador no molesta.** Entrar y salir cinco veces seguidas no da 429. El límite son 10
      fallos por IP cada 15 minutos, y los aciertos no cuentan.

| Síntoma | Casi seguro que es |
|---|---|
| 503 en `POST /api/auth/google` | falta `GOOGLE_CLIENT_ID` en el backend |
| 401 con un token que parece bueno | los dos `GOOGLE_CLIENT_ID` no son el mismo, el `audience` no cuadra |
| «No se pudo iniciar sesión con Google» | Google no devolvió `id_token`; mira los scopes del cliente OAuth |
| Login en bucle o cookie enorme | una foto base64 se ha colado en el token de NextAuth |

---

## 2. Login con Google en producción · F6, SEC-001

Cuando F6 llegue a `main` y Render y Vercel hayan desplegado.

- [ ] `GOOGLE_CLIENT_ID` está en Render con el mismo valor que en Vercel. *(Puesta el 4 de
      septiembre de 2026; queda confirmar que el login funciona con ella.)*
- [ ] Entrar con Google desde la URL de producción, con una cuenta que no hayas usado en local.
- [ ] El `redirect_uri` de producción está autorizado en la consola de Google Cloud. Si no, el
      error sale antes de llegar a Cookr.

Render duerme el plan gratuito: la primera petición puede tardar medio minuto. Eso no es un fallo
del login. `scripts/keep-alive.sh` lo mantiene despierto si vas a enseñarlo.

---

## 3. El proxy de Gemini · F6, SEC-002

El worker cambió a fallar cerrado y solo reenvía `/v1beta/models/`. No hay tests: la carpeta no
tiene runner.

```bash
# 1. sin cabecera → 403
curl -i https://TU-WORKER.workers.dev/v1beta/models/gemini-2.5-flash

# 2. con cabecera, ruta que no toca → 404
curl -i -H "x-proxy-token: EL_TOKEN" https://TU-WORKER.workers.dev/v1/otra-cosa

# 3. con cabecera y ruta buena → 200 (o el error que devuelva Google, pero pasando)
curl -i -H "x-proxy-token: EL_TOKEN" "https://TU-WORKER.workers.dev/v1beta/models/gemini-2.5-flash?key=LA_API_KEY"
```

- [ ] Los tres `curl` dan 403, 404 y 200.
- [ ] **El chat de la aplicación responde.** Es la única comprobación que prueba que
      `GEMINI_BASE_URL` y `GEMINI_PROXY_TOKEN` del backend siguen cuadrando con el worker. Si el
      chat da 503 después de este cambio, es el proxy, no Gemini.

---

## 4. La búsqueda del feed · F6, SEC-003

Hay test automático del retroceso catastrófico, pero el cambio de comportamiento se ve mejor a
ojo.

- [ ] Busca `a+` en el feed. Ahora solo encuentra recetas que lleven `a+` escrito, no cualquier
      título con una «a». Es lo correcto, aunque parezca que encuentra menos.
- [ ] Busca `(a+)+$`. Responde al momento y sin resultados. Antes se quedaba pensando.

---

## 5. Atlas, Cloudinary y las imágenes · F7, PERF-001, A5

Todas las mediciones de F7 se hicieron contra `mongodb-memory-server`, que es un Mongo de verdad
pero con datos sintéticos y una sola máquina. Nada de esto vale como comprobación de producción.

**Que los índices existan.** Se declaran en el esquema y Mongoose los crea al conectar porque nadie
toca `autoIndex`, pero en Atlas la construcción puede quedarse a medias sin que el proceso se entere.
Desde `mongosh` contra la base de producción:

```js
db.recetas.getIndexes()   // esperados: _id_, fechaPublicacion_-1,
                          // autorId_1_fechaPublicacion_-1,
                          // categorias_1_fechaPublicacion_-1,
                          // esEvento_1_fechaPublicacion_-1
db.usuarios.getIndexes()  // esperados: _id_, correo_1, googleId_1 (sparse: true)
db.recetas.stats().indexSizes
```

- [ ] Los cuatro índices de `recetas` están, con esos nombres exactos.
- [ ] `googleId_1` está en `usuarios` y es `sparse`.
- [ ] La suma de `indexSizes` cabe holgada en la RAM del plan de Atlas. Si no cabe, el índice se lee
      de disco y deja de ser una mejora.

**Que el planificador los elija con los datos reales.** El reparto de categorías en producción no es
el de las mediciones, y un índice poco selectivo se descarta. Con datos de verdad:

```js
db.recetas.find({}).sort({ fechaPublicacion: -1 }).limit(20).explain("executionStats")
db.recetas.find({ categorias: "postre" }).sort({ fechaPublicacion: -1 }).limit(20).explain("executionStats")
```

- [ ] `winningPlan` lleva `IXSCAN`, no `COLLSCAN`.
- [ ] No aparece una etapa `SORT`: el orden lo tiene que dar el índice.
- [ ] `totalDocsExamined` está cerca de 20, no cerca del total de la colección.

**Que la ordenación de la despensa no reviente.** `buscarCandidatasParaDespensa` ordena sin `$limit`
y lleva `allowDiskUse(true)`. En memoria el corpus de pruebas es pequeño; en producción los
documentos arrastran la imagen en base64 dentro (A5), así que el `$sort` mueve mucho más de lo que
parece.

- [ ] Pídele al chat una receta con la despensa llena, con la base de producción. Responde sin
      timeout.
- [ ] En Atlas, el *profiler* no marca esa agregación con `hasSortStage` volcando a disco de forma
      continua. Si vuelca siempre, hay que proyectar antes de ordenar o esperar a F7.4.

El `$sort` de la despensa deja de ser una duda en cuanto se aplique en producción la migración de
F7.4 que viene aquí abajo: hoy la agregación mueve documentos de hasta 1,9 MB y después moverá unos
3 KB. Repásala **después** de migrar, no antes.

**Sacar las imágenes de Mongo · F7.4, A5 — hecho el 04/09/2026.** La migración se aplicó contra el
Atlas de producción con el cloud `lphsxuxk`. Se movieron 6,47 MB en 8 subidas (once referencias, pero
los tres avatares de comentarios reutilizaron la URL del usuario ya migrado). Antes de aplicarla se
volcó `recetas`, `usuarios` y `tokens` a `4 Curso/backup-antes-de-f74/`, fuera del repositorio porque
lleva correos y hashes; al lado hay un `restaurar.js` que hace `replaceOne` con `upsert` por `_id`.

| | Antes | Después |
|---|---|---|
| `recetas` | 3,90 MB | **0,22 MB** |
| `usuarios` | 2,82 MB | **0,02 MB** |
| Receta más pesada | 1969,5 KB | **3,4 KB** |
| Usuario más pesado | 1967,6 KB | **2,7 KB** |

- [x] 04/09/2026 · El `--apply` no lista ningún documento en el apartado de fallos.
- [x] 04/09/2026 · La segunda pasada en seco encuentra 0 avatares, 0 fotos y 0 comentarios. Ese es
      el criterio de que terminó, no el primer resumen.
- [x] 04/09/2026 · Las dos colecciones bajan a 0,22 MB y 0,02 MB, y no queda ningún `data:` en
      ninguna de las tres rutas. Ninguna receta se quedó sin `imagenUrl`.
- [x] 04/09/2026 · Las 8 URL responden 200 con su `content-type` correcto. Los bytes servidos son
      tres cuartas partes de lo que ocupaba el base64 (196,9 → 147,6 KB, 1967,6 → 1475,7 KB), que es
      justo el inflado de base64: la imagen es la misma, no se ha recodificado.
- [x] 05/09/2026 · Verlas en la web con los ojos, con Playwright contra el Atlas de producción.
      Las cuatro recetas migradas y los cuatro avatares se pintan donde toca. Las fotos pasan por
      `/_next/image` con 200: el `unoptimized={imagenUrl.startsWith('data:')}` de
      `tarjetaColeccion.tsx` y `formularioEditarReceta.tsx` ya evalúa a false, así que Next las
      optimiza en vez de servirlas crudas.

Si hace falta deshacerlo:

```bash
node "C:/Users/usuario/Desktop/Asuntos Generales/4 Curso/backup-antes-de-f74/restaurar.js"
```

**Que la subida desde el navegador funcione · F7.4 — hecho el 05/09/2026 con Playwright.** El
fichero va del navegador a Cloudinary directamente y el backend solo firma, así que esto no lo cubre
ningún test unitario. Se hizo contra los servidores locales, que apuntan al Atlas y al Cloudinary de
producción, con un usuario temporal (`prueba-f74@cookr.dev`) borrado al terminar junto con sus
recetas y sus ficheros de Cloudinary. El recuento de Cloudinary volvió a las 8 imágenes migradas.

- [x] 05/09/2026 · Crear una receta con foto propia. La subida ocurre al elegir el fichero, no al
      publicar: `POST /api/subidas/firma` → 200 y `POST api.cloudinary.com/v1_1/lphsxuxk/image/upload`
      → 200.
- [x] 05/09/2026 · La receta recién creada pesa **0,76 KB** en el Atlas de producción, su
      `imagenUrl` empieza por `https://res.cloudinary.com` y en el documento entero no aparece la
      cadena `data:`.
- [x] 05/09/2026 · Editar esa receta cambiando solo el título deja la `imagenUrl` idéntica, misma
      versión y mismo `public_id`, y no dispara ninguna petición de firma. En Cloudinary no aparece
      un segundo fichero.
- [x] 05/09/2026 · Cambiar el avatar en `/perfil` dos veces seguidas deja **un** fichero en
      `cookr/avatares/<id>`, con los bytes del segundo. El `public_id` determinista funciona: no
      acumula.
- [x] 05/09/2026 · Cerrar sesión y volver a entrar. La cookie `next-auth.session-token` mide
      **845 bytes**, una sola, sin trocear, y `session.user.image` llega con la URL de Cloudinary.
      Antes el filtro de `frontend/src/lib/auth.ts` tiraba la foto por ser `data:`; ahora la deja
      pasar y el avatar sale en la cabecera y en la caja de comentarios.
- [ ] Lo mismo con una cuenta de Google, que trae la foto de Google y no pasa por Cloudinary. Hace
      falta una cuenta real, no se puede automatizar.
- [ ] Escanear un ticket de verdad desde el móvil. El límite de cuerpo bajó de 10 MB a 8 MB y esa
      ruta sigue mandando base64: una foto de cámara tiene que entrar, y una demasiado grande dar el
      400 con mensaje, no un 413 seco. La frontera 413 la fija `tests/imagenes.test.ts`; lo que falta
      aquí es una foto de cámara de verdad.
- [ ] `CLOUDINARY_URL` en Render. En local ya está y por eso se pudo probar todo lo de arriba; en
      producción, sin ella, `POST /api/subidas/firma` responde 503 y no se puede subir ninguna foto.
      **Es lo único que queda para cerrar F7.4.**

---

## 6. Lo que no se va a poder automatizar nunca

Esto no es de F6: es la lista permanente de cosas que solo se comprueban con las manos.

- [ ] **El correo llega de verdad.** Registro y recuperación de contraseña, con una cuenta de
      Outlook o Hotmail, que son las que descartan en silencio. Mailjet devuelve 200 aunque el
      correo se pierda por DMARC, así que el 200 no prueba nada: hay que abrir la bandeja.
- [ ] **`UPSTASH_REDIS_URL` y `UPSTASH_REDIS_TOKEN` en Render.** Sin ellas, F7.6 no arregla nada en
      producción: el contador y las cachés siguen en memoria y se pierden en cada reinicio,
      exactamente igual que antes. Es lo único que queda para cerrar F7.6. La URL que hay que copiar
      es la **REST**, la que empieza por `https://`, no la `rediss://`.
- [ ] **El tope diario de Gemini sobrevive a un reinicio · F7.6, A6.** Esto es lo que no se puede
      demostrar con un test, porque hace falta matar el proceso de verdad. Con las variables ya
      puestas en Render, en este orden: pregúntale algo al chat, abre el *data browser* de Upstash y
      apunta `ia:gemini:llamadas:AAAA-MM-DD`, reinicia el servicio a mano (**Manual Deploy** →
      **Restart service**), vuelve a preguntar y mira el número otra vez. Tiene que **seguir donde
      estaba** y subir de uno en uno, no volver a 1. La clave caduca sola a las 48 h.
- [ ] **El log dice de dónde sale el contador.** En los logs de Render, cada llamada imprime
      `[Gemini guard] llamada N/1000 de hoy (redis)`. Si pone `(memoria)` con las variables puestas,
      no están llegando al proceso; míralas antes de dar por buena la comprobación de arriba.
- [ ] **La caché de preguntas acierta con usuarios de verdad.** `ia:cache:aciertos:AAAA-MM-DD` y
      `ia:cache:fallos:AAAA-MM-DD` en Upstash. Es el dato que no existía cuando se hizo F7.6: cuántas
      preguntas se repiten era una suposición y ahora se puede contar. Hasta que haya varios días de
      uso real, el ahorro de cuota de Gemini es una estimación, no una medición.
- [ ] **Que una caída de Upstash no tumbe el chat.** Cambia el token a uno inválido y pregunta algo:
      el chat tiene que responder igual, con `⚠️  Upstash no respondió a ...` una sola vez en el log.
      La decisión es dejar pasar la llamada con suelo en memoria, no bloquearla.
- [ ] **Las imágenes de Pexels en el seed.** `npm run seed:masivo` gasta cuota real.

---

## 7. La migración de comentarios · F7.5, PERF-006, M7

Los comentarios ya no van dentro de la receta: viven en la colección `comentarios` y la receta solo
guarda `numComentarios`. El código nuevo escribe así desde el primer despliegue, pero **los
comentarios que ya están guardados en Atlas siguen dentro del array hasta que se ejecute la
migración**, y mientras tanto no se ven en ninguna parte: `findComentarios` consulta la colección
nueva, que está vacía, así que el detalle enseñará 0 comentarios en recetas que sí los tienen.

Nada de esto lo he ejecutado yo. Está probado contra un Mongo local efímero y contra el seed
completo, sin tocar producción.

**Antes de nada, la copia.** El script hace `$unset` del array: si algo sale mal, lo que había
dentro no se recupera del propio documento. El volcado de `recetas` de F7.4 vale como plantilla:

```bash
mongodump --uri="<MONGODB_URI de producción>" --collection=recetas --out="C:/Users/usuario/Desktop/Asuntos Generales/4 Curso/backup-antes-de-f75"
```

**El comando exacto.** Desde `backend/`, con el `.env` de producción cargado (el script lee
`MONGODB_URI` igual que el resto de scripts). Primero en seco, que es lo que hace por defecto:

```bash
cd backend
npm run migrar:comentarios
```

Léelo entero antes de seguir. Dice cuántas recetas llevan el array, cuántos comentarios hay dentro,
cuánto ocupa `recetas` ahora mismo y, si hay comentarios ilegibles (sin `autorId` o sin `texto`),
los lista uno a uno bajo un `⚠️`. Esos no se mueven: **si aparece alguno, míralo en Atlas antes de
aplicar**, porque al aplicar se pierde.

Y después, a escribir:

```bash
npm run migrar:comentarios -- --apply
```

El `--` es obligatorio, o npm se come el argumento y vuelve a hacer la pasada en seco sin avisar.

- [ ] La pasada en seco lista las recetas con array y **no escribe nada**. Compruébalo:
      `db.comentarios.countDocuments({})` sigue en 0 después de ejecutarla.
- [ ] El `--apply` termina con `✅ Ninguna receta conserva listaComentarios.` Si sale el aviso de
      que quedan N recetas, vuelve a ejecutarlo: es repetible a propósito.
- [ ] «movidos» coincide con los comentarios que decía la pasada en seco, menos los descartados.
- [ ] Los contadores cuadran con los documentos. Es la comprobación que importa, porque si estos dos
      números no coinciden el feed miente:

```js
db.recetas.aggregate([{ $group: { _id: null, n: { $sum: "$numComentarios" } } }])
db.comentarios.countDocuments({})
```

- [ ] No queda ni un array y ningún comentario se quedó sin receta:

```js
db.recetas.countDocuments({ listaComentarios: { $exists: true } })   // 0
db.comentarios.getIndexes()   // _id_ y recetaId_1_fecha_-1__id_-1
```

- [ ] **Ejecutarlo dos veces seguidas con `--apply`.** La segunda pasada tiene que decir 0 movidos y
      dejar los mismos números. En local se comprobó; en Atlas es la prueba de que el `_id`
      determinista funciona también con los `_id` reales de las recetas.
- [ ] Abrir una receta que tuviera comentarios y verlos con los ojos: los tres de la vista previa,
      el total al lado del icono, y el *sheet* trayendo más al bajar. Comentar algo nuevo y que
      aparezca arriba del todo sin recargar.
- [ ] El feed enseña el mismo número de comentarios en la tarjeta que el detalle. Si una tarjeta
      dice 0 y el detalle dice 4, el contador no se reescribió: vuelve a pasar el `--apply`, que
      recalcula todos los contadores desde la colección aunque ya no quede ningún array.

Si hay que deshacerlo, el volcado de arriba se restaura con `mongorestore --drop`, y hay que
**borrar también la colección nueva** o al volver atrás quedan duplicados:

```bash
mongorestore --uri="<MONGODB_URI>" --drop --nsInclude="cookr.recetas" "C:/Users/usuario/Desktop/Asuntos Generales/4 Curso/backup-antes-de-f75"
# y en mongosh: db.comentarios.drop()
```

---

## Registro

| Fecha | Qué se probó | Resultado |
|---|---|---|
| 04/09/2026 | Credenciales de Cloudinary (`ping` de la Admin API) | `{"status":"ok"}` contra el cloud `lphsxuxk` |
| 04/09/2026 | Migración F7.4 aplicada contra Atlas | 6,47 MB fuera, 0 fallos, segunda pasada en seco vacía |
| 04/09/2026 | Las 8 imágenes migradas se sirven | 200 en todas, bytes coherentes con el base64 original |
| 05/09/2026 | Las recetas y avatares migrados se ven en la web | Se pintan bien; las fotos pasan por `/_next/image` con 200 |
| 05/09/2026 | Subida directa al crear receta (Playwright) | Firma 200 + Cloudinary 200; documento de 0,76 KB en Atlas |
| 05/09/2026 | Editar sin tocar la foto | `imagenUrl` idéntica, sin petición de firma, sin fichero duplicado |
| 05/09/2026 | Avatar cambiado dos veces seguidas | Un solo fichero en `cookr/avatares/<id>`, el segundo sobrescribe |
| 05/09/2026 | Cierre y reapertura de sesión con avatar de Cloudinary | Cookie de 845 bytes sin trocear, `session.user.image` con la URL |
| 05/09/2026 | F7.6 sin variables de Upstash (`npm test`) | 155 en verde; `almacenIAEnRedis()` es `false` y todo tira de memoria |
| 05/09/2026 | Migración de comentarios en local, seco y `--apply` | 44 de 45 movidos (1 ilegible), 5 recetas sin array, receta de 40: 5,2 → 0,5 KB |
| 05/09/2026 | Segunda pasada con `--apply` en local | 0 movidos, 0 contadores reescritos, mismos números: no duplica |
| 05/09/2026 | Seeds y `limpiarDatosTest` con la colección nueva | Contadores = documentos en los tres, 0 arrays y 0 huérfanos |
| | | |
