# F6 · Seguridad — Cookr

Registro de lo que se tocó en el bloque F6 de `docs/PLAN-2026-09.md`, con las decisiones que
costaron y lo que queda a medias.

---

## [SEC-001] Verificar el id_token de Google · C1

Fecha: 2026-09-04 | Estado: ✅ Completado | Afecta: BE + FE | Bloque: F6.1

### Qué estaba mal

`POST /api/auth/google` era público y aceptaba `{ googleId, correo, nombre, foto }` del cuerpo.
Devolvía un JWT de 7 días sin comprobar nada. Con el correo de otra persona se entraba en su
cuenta, y si esa cuenta era local con contraseña, además se quedaba vinculada al `googleId` del
atacante. La ruta tampoco tenía limitador.

### Qué se hizo

**Contrato nuevo de la ruta:**

```
POST /api/auth/google
Body: { idToken }            ← solo esto; el resto se descarta
200: { token, usuario, perfilCompleto }
400: falta el idToken
401: el token no verifica, o el correo de Google no está verificado
503: falta GOOGLE_CLIENT_ID en el backend
429: más de 10 fallos en 15 minutos desde la misma IP
```

**Ficheros:**

- `backend/src/lib/googleAuth.ts` (nuevo). Envuelve `OAuth2Client.verifyIdToken` de
  `google-auth-library` y devuelve `{ googleId, correo, correoVerificado, nombre, foto }`.
  Cachea el cliente por `GOOGLE_CLIENT_ID`, y si esa variable falta lanza un error con
  `status: 503`.
- `backend/src/services/authService.ts`. `iniciarSesionGoogle` recibe `{ idToken }`, verifica,
  exige `email_verified`, y saca la identidad del payload. El cuerpo ya no es fuente de nada.
- `backend/src/lib/validadores.ts`. `esquemaGoogleOAuth` pasa a `{ idToken: string }`. Zod hace
  strip de las claves de más, así que un `correo` colado en el cuerpo se cae antes del servicio.
- `backend/src/middlewares/rateLimitAuth.ts`. `limiteGoogle`, por IP, 10 intentos / 15 min,
  `skipSuccessfulRequests`. Store propio (`auth:google`), no comparte cupo con `/login`.
- `backend/src/routes/auth.routes.ts`. `limiteGoogle` delante de `validarBody`.
- `frontend/src/lib/auth.ts`. El callback `jwt` manda `account.id_token` en vez de
  `account.providerAccountId`, y aborta el login si Google no devuelve `id_token`.

### La decisión que costó

Qué hacer cuando el correo verificado de Google coincide con una cuenta local con contraseña.

Verificar el token cierra la suplantación directa, pero deja abierto el *pre-hijack*: alguien
registra una cuenta local con el correo de otra persona, no la verifica nunca y deja puesta su
contraseña. Cuando la víctima entra con Google, la vinculación automática le entrega la cuenta
al atacante, que conserva una contraseña válida sobre ella.

Se valoraron cuatro salidas: vincular solo si la cuenta local estaba verificada, vincular
siempre, vincular anulando la contraseña de las cuentas sin verificar, y no vincular nunca
(vinculación manual desde el perfil).

**Decisión: vincular siempre, como hasta ahora.** No rompe ningún flujo existente ni pide
pantallas nuevas, y el vector que queda exige que el atacante se adelante al registro de la
víctima con su correo exacto. Es un riesgo aceptado, no un descuido.

### Qué queda a medias

- **El pre-hijack sigue abierto.** La mitigación barata sería exigir `cuentaVerificada: true`
  antes de vincular. Está descartada a propósito, no pendiente.
- **El login con Google real no se ha probado contra Google.** Los tests mockean
  `lib/googleAuth`, que es lo que mandan las reglas de la casa. La comprobación manual, con los
  pasos y los síntomas de cada fallo, está en `docs/PRUEBAS-MANUALES.md`.

### Tests

`backend/tests/auth.test.ts`, describe `POST /api/auth/google`: token inválido → 401 sin crear
ni modificar usuarios; falta `idToken` → 400 sin llamar a Google; `email_verified: false` → 401;
la identidad sale del token y no del cuerpo; alta, vinculación y login repetido.
`backend/tests/rateLimitAuth.test.ts` cubre el limitador y que no comparte cupo con `/login`.
`backend/tests/validadores.test.ts` cubre el esquema nuevo.

---

## [SEC-002] Cerrar el proxy de Gemini · A1

Fecha: 2026-09-04 | Estado: ✅ Completado | Afecta: gemini-proxy | Bloque: F6.2

### Qué estaba mal

```js
if (env.PROXY_TOKEN && request.headers.get("x-proxy-token") !== env.PROXY_TOKEN) {
```

Sin `PROXY_TOKEN` definido la condición es falsa y pasa todo el mundo: el control de acceso
desaparecía justo cuando faltaba su configuración. Y el worker reenviaba cualquier ruta a
`generativelanguage.googleapis.com`, así que servía de relé anónimo hacia toda la API.

### Qué se hizo

`gemini-proxy/worker.js`, tres puertas en orden:

| Situación | Respuesta |
|---|---|
| falta `PROXY_TOKEN` en el Worker | 500 `Proxy mal configurado` |
| cabecera `x-proxy-token` ausente o distinta | 403 `Forbidden: invalid proxy token` |
| ruta que no empieza por `/v1beta/models/` | 404 `Ruta no permitida` |

`/v1beta/models/` es lo único que usa el backend: el SDK `@google/genai` construye
`{baseUrl}/v1beta/models/{modelo}:generateContent`.

`gemini-proxy/README.md` recoge el comportamiento nuevo y cambia el `curl` de comprobación, que
apuntaba a `/v1beta/models?key=…` y ahora daría 404 por no llevar la barra.

### Qué queda a medias

No hay test automático: la carpeta no tiene runner ni `package.json`, y montarlo para un fichero
de cuarenta líneas no compensa. Los cinco casos se comprobaron ejecutando `worker.fetch` a mano
con `Request`/`Response` de Node 22. Si el worker crece, esto se replantea.

---

## [SEC-003] Escapar la búsqueda del feed · A2

Fecha: 2026-09-04 | Estado: ✅ Completado | Afecta: BE | Bloque: F6.3

`recetaRepository.findAll` metía `q` tal cual en un `$regex` sobre `titulo` y `descripcion`. El
feed acepta visitantes anónimos, así que era un ReDoS con una sola petición GET sin autenticar.

Ahora `q` pasa por `escaparRegex`, que escapa los metacaracteres, y la búsqueda es literal. Como
efecto secundario cambia el comportamiento de cara al usuario: buscar `a+` ya no encuentra
cualquier título con una «a», encuentra los que llevan `a+` escrito. Es lo que espera quien
escribe en una caja de búsqueda.

### Qué queda a medias

El `$regex` sin anclar sigue sin poder usar índices: cada búsqueda recorre la colección entera.
El arreglo bueno es un índice de texto y pasar a `$text`, y eso es F7 (A4), no este bloque.

Test en `backend/tests/feed.filtros.test.ts`, describe «la busqueda del feed trata q como texto».
El caso del retroceso catastrófico siembra una descripción de 600 caracteres para que el motor
tenga con qué atragantarse, y exige respuesta por debajo del segundo.

---

## [SEC-004] Endurecer respuestas y entradas · M8, M9, M10

Fecha: 2026-09-04 | Estado: ✅ Completado | Afecta: BE | Bloque: F6.4

**M8 — 404 en JSON.** `backend/src/app.ts` cae en un middleware final que responde
`404 { error: "Ruta no encontrada" }` en vez del HTML por defecto de Express. No devuelve el
método ni la ruta pedida: no aporta nada al cliente legítimo y es entrada del usuario reflejada.

**M9 — los 500 no filtran el mensaje interno.** `manejarError` en
`backend/src/middlewares/errores.ts` distingue por la presencia de `err.status`:

- error lanzado a propósito (`throw Object.assign(new Error("…"), { status: 404 })`) → se
  responde su mensaje, que es lo que el frontend enseña.
- error sin `status` que acaba en 500 → `Error interno del servidor`. El mensaje real sigue
  saliendo por consola en `manejadorErrores`.

**M10 — esquema para `PUT /api/despensa/:id`.** `esquemaEditarDespensa` en
`lib/validadores.ts`, montado en la ruta con `validarBody`. Los cuatro campos son opcionales,
con un `refine` que exige al menos uno. Un `nombre: 123` da 400 en vez de reventar en `.trim()`
con un 500, y un `cantidad: "muchas"` da 400 en vez de guardar `NaN`.

El controlador `editar` se queda con tres líneas: Zod ya recorta los textos y garantiza que hay
algo que cambiar, así que se fue el bloque que armaba `cambios` a mano.

### Qué queda a medias

- Un `:id` que no es un ObjectId válido sigue dando 500 por el CastError de Mongoose. Con M9 ya
  no filtra nada, pero el status sigue siendo el que no toca.
- M1 sigue vivo: `POST /api/despensa` y `POST /api/despensa/escanear-ticket` siguen validando a
  mano dentro del controlador y de la ruta. Aquí solo se tocó el `PUT`, que es lo que pedía M10.
- `middlewares/errores.ts` sigue teniendo dos caminos (`manejarError` desde los controladores y
  `manejadorErrores` global). El global ahora sí se ejecuta para los fallos del parser de JSON,
  pero unificar los tres patrones de manejo de errores no entra en F6.

Tests en `backend/tests/errores.test.ts` (404 en JSON, 500 genérico, 400 por tipo) y en
`backend/tests/validadores.test.ts` (el esquema por su cuenta).

---

## Estado al cerrar el bloque

`npm run lint` y `npm test` en verde en el backend (102 tests, 7 suites). `npx tsc --noEmit` en
verde en el frontend.

`GOOGLE_CLIENT_ID` ya está puesta en Render, con el mismo valor que tiene el frontend. Es el
`audience` con el que se verifica el token: si alguien la borra o la cambia, `/api/auth/google`
responde 503 y el login con Google deja de funcionar en producción.
