# Pruebas manuales pendientes

Lo que los tests automáticos no pueden comprobar, con los pasos exactos para hacerlo en un rato
libre. Cada bloque dice qué ejecutar, qué tiene que pasar y cómo se ve el fallo.

Los 123 tests del backend mockean todos los servicios externos a propósito: ninguna prueba gasta
cuota de Google, Mailjet, Gemini ni Pexels. El precio de esa regla es esta lista.

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

## 5. Los índices y los planes de consulta en Atlas · F7, PERF-001

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

Esta comprobación se puede tachar entera cuando F7.4 saque las imágenes a Cloudinary: el motivo de
la duda desaparece con ellas.

---

## 6. Lo que no se va a poder automatizar nunca

Esto no es de F6: es la lista permanente de cosas que solo se comprueban con las manos.

- [ ] **El correo llega de verdad.** Registro y recuperación de contraseña, con una cuenta de
      Outlook o Hotmail, que son las que descartan en silencio. Mailjet devuelve 200 aunque el
      correo se pierda por DMARC, así que el 200 no prueba nada: hay que abrir la bandeja.
- [ ] **El tope diario de Gemini.** `GEMINI_MAX_LLAMADAS_DIA` es una variable en memoria del
      proceso y Render reinicia el contenedor al desplegar y al despertar. Es A6 en la auditoría.
- [ ] **Las imágenes de Pexels en el seed.** `npm run seed:masivo` gasta cuota real.

---

## Registro

| Fecha | Qué se probó | Resultado |
|---|---|---|
| | | |
