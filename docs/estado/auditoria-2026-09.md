# Auditoría de Cookr — 4 de septiembre de 2026

Auditoría completa del repositorio: qué funciona, qué está roto, qué falta y qué no está
documentado. Cada hallazgo lleva la evidencia con fichero y línea, el impacto real y el arreglo
concreto.

El plan de ejecución sale a `docs/estado/plan-2026-09.md`. Este documento solo diagnostica.

Punto de partida: la auditoría anterior (`PLAN_AUDITORIA.md`, 15-17 de julio de 2026) cerró las
fases 1 a 4. Lo que sigue es lo que hay **ahora**, siete semanas después y con la Fase 5 sin
empezar.

---

## 1. Lo que funciona

Comprobado ejecutando, no leyendo.

| Comprobación | Orden | Resultado |
|---|---|---|
| ESLint backend | `npx eslint src` | limpio |
| Tipos backend | `npx tsc --noEmit` | limpio |
| ESLint frontend | `npx next lint` | limpio, 3 avisos de `<img>` |
| Tipos frontend | `npx tsc --noEmit` | limpio |
| Tests backend | `npx jest` | **80 de 80 en verde**, 6 suites, 41 s |

Además:

- `develop` y `main` apuntan al mismo commit. No hay divergencia ni trabajo sin desplegar.
- No hay ni un secreto en los ficheros trackeados ni en el historial completo. Búsquedas de
  claves de Google, de OpenAI y de cadenas de conexión de Mongo con credenciales: cero
  resultados. El `.gitignore` de la raíz (commit `90d97c6`) cubre `.env`, claves y certificados.
- La separación por capas del backend se respeta en lo estructural: los repositorios son los
  únicos que importan modelos de Mongoose, y ningún servicio importa `models/`.
- El filtro de alérgenos del perfil funciona como manda `CLAUDE.md` y tiene su test
  (`tests/feed.alergenos.test.ts`).
- El CI está bien pensado: `deploy` depende de `ci-backend`, así que un test rojo bloquea Render,
  y el job `e2e` queda fuera del `needs` a propósito.

La base es sana. Todo lo que viene a continuación se construye encima de algo que compila, pasa
sus pruebas y se despliega.

---

## 2. Hallazgos

Numerados y ordenados por gravedad. La letra indica el nivel: **C** crítico, **A** alto,
**M** medio, **B** bajo.

### C1 · Cualquiera puede entrar en cualquier cuenta sabiendo solo el correo

**Dónde:** `backend/src/services/authService.ts:204-248`, expuesto en
`backend/src/routes/auth.routes.ts:30`.

`POST /api/auth/google` es público y acepta un cuerpo con `googleId`, `correo`, `nombre` y `foto`.
Con eso busca al usuario y devuelve un JWT del backend de 7 días. **Nadie comprueba que quien
llama venga de verdad de Google.** El endpoint se fía de lo que le mandan.

Tres cosas lo empeoran:

1. La búsqueda cae a `buscarPorCorreo` si el `googleId` no existe. Eso alcanza también a las
   cuentas locales con contraseña, no solo a las de Google.
2. Cuando encuentra una cuenta local, la **vincula** al `googleId` recibido
   (`usuarioRepository.vincularGoogle`). La toma de control queda persistida.
3. Si el correo no existe, crea la cuenta con `cuentaVerificada: true`, saltándose la
   verificación por correo entera.

La ruta tampoco tiene limitador: `rateLimitAuth` cubre `/login`, `/registro`,
`/recuperar-contrasena` y el reenvío de verificación, pero no `/google`.

**Impacto:** con la dirección de correo de una persona se obtiene una sesión válida de 7 días en
su cuenta. Sin rastro y sin límite de intentos. Es la aplicación desplegada en Render, no un
entorno local.

**Arreglo.** El frontend ya tiene lo que hace falta y no lo usa: en el callback `jwt` de
`frontend/src/lib/auth.ts:93`, el objeto `account` de Google trae `account.id_token`. Hoy se
envía `account.providerAccountId` (línea 103), que es un identificador público sin ninguna prueba
detrás.

1. Enviar `account.id_token` en lugar de `providerAccountId`.
2. En el backend, verificar ese token contra Google antes de mirar la base de datos, con
   `google-auth-library`:

```ts
const cliente = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ticket = await cliente.verifyIdToken({
  idToken: datos.idToken,
  audience: process.env.GOOGLE_CLIENT_ID,
});
const payload = ticket.getPayload();
if (!payload?.email_verified) {
  throw Object.assign(new Error("Correo de Google sin verificar"), { status: 401 });
}
```

3. Usar `payload.sub` y `payload.email` del token verificado. El cuerpo de la petición deja de
   ser fuente de identidad.
4. Añadir `GOOGLE_CLIENT_ID` a las variables del backend y a `backend/.env.example`.
5. Poner un limitador por IP en `/google`, igual que en `/login`.
6. Decidir a propósito qué pasa cuando el correo verificado de Google coincide con una cuenta
   local: vincular es cómodo y es lo que hace hoy, pero conviene que sea una decisión escrita y
   no un efecto colateral.
7. Test de regresión: un `POST /api/auth/google` con un `idToken` inválido responde 401 y no crea
   ni modifica ningún usuario.

Es lo primero que hay que tocar, antes que nada.

---

### A1 · El proxy de Gemini se abre solo si falta la variable

**Dónde:** `gemini-proxy/worker.js:18`.

```js
if (env.PROXY_TOKEN && request.headers.get("x-proxy-token") !== env.PROXY_TOKEN) {
```

Si `PROXY_TOKEN` no está definido en el Worker, la condición es falsa y **pasa todo el mundo**.
El control de acceso desaparece justo cuando falta su configuración, que es exactamente cuando
más falta hace. Un despliegue nuevo, un `wrangler deploy` sin los secretos puestos o un borrado
accidental de la variable dejan el proxy abierto sin que nada avise.

El worker además reenvía cualquier ruta al dominio de Google sin filtrar, así que sirve como
relé anónimo hacia toda la API de `generativelanguage.googleapis.com`.

**Arreglo:** invertir la condición para que falle cerrado, y acotar la ruta.

```js
if (!env.PROXY_TOKEN) return new Response("Proxy mal configurado", { status: 500 });
if (request.headers.get("x-proxy-token") !== env.PROXY_TOKEN) {
  return new Response("Forbidden", { status: 403 });
}
if (!url.pathname.startsWith("/v1beta/models/")) {
  return new Response("Ruta no permitida", { status: 404 });
}
```

---

### A2 · La búsqueda del feed mete la entrada del usuario en una expresión regular

**Dónde:** `backend/src/repositories/recetaRepository.ts:156-157`.

```ts
{ titulo: { $regex: q, $options: "i" } },
{ descripcion: { $regex: q, $options: "i" } },
```

`q` viene del cliente sin escapar. Dos consecuencias:

- Una expresión con retroceso catastrófico tumba el proceso de Node. Es un ReDoS con una sola
  petición GET, sin autenticar, porque el feed acepta visitantes anónimos (`optionalAuth`).
- Aun con entradas normales, un `$regex` sin anclar impide usar índices. Cada búsqueda recorre la
  colección entera.

**Arreglo inmediato:** escapar los metacaracteres antes de construir la consulta.

```ts
const escaparRegex = (texto: string) => texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
```

**Arreglo bueno:** un índice de texto sobre `titulo` y `descripcion` y pasar a `$text`. Entra en
la misma tarea que A4.

---

### A3 · Ordenar por popularidad carga la colección entera en memoria

**Dónde:** `backend/src/repositories/recetaRepository.ts:203-235`.

Con `sort=score` y con `sort=likes`, el repositorio hace `Receta.find(query)` **sin `limit`**,
con `populate` del autor, ordena en JavaScript y luego corta la página. Cada petición del feed
ordenado trae todas las recetas al proceso.

Con el dataset de `npm run seed:masivo` esto ya se nota. Con recetas que llevan la imagen dentro
del documento (ver A5), un feed ordenado por score puede mover cientos de megas por petición.

**Arreglo:** llevar el cálculo a un `aggregate` de MongoDB. El score de `calcularScoreFeed` es
aritmética sobre campos del documento y se expresa con `$addFields`, `$sort` y `$skip`/`$limit`;
el `followBoost` entra pasando el array de seguidos como parámetro. Para `likes` basta con
`$addFields: { numLikes: { $size: "$likes" } }` y ordenar por ahí.

Lo mismo aplica a `buscarCandidatasParaDespensa`, que también trae la colección completa.

---

### A4 · La colección de recetas no tiene ni un índice

**Dónde:** `backend/src/models/recetaMongo.ts`. Cero llamadas a `schema.index()`.

El feed filtra por `categorias`, `alergenos`, `dificultad`, `autorId` y `esEvento`, y ordena por
`fechaPublicacion`. Todo eso es un recorrido completo de la colección. En el nivel gratuito de
Atlas se paga en latencia y, cuando crece, en tiempo de espera.

**Arreglo:** los índices que piden las consultas que existen hoy.

```ts
recetaSchema.index({ fechaPublicacion: -1 });
recetaSchema.index({ autorId: 1, fechaPublicacion: -1 });
recetaSchema.index({ categorias: 1, fechaPublicacion: -1 });
recetaSchema.index({ alergenos: 1 });
recetaSchema.index({ titulo: "text", descripcion: "text" });
```

En `Usuario` falta `googleId` (con `sparse: true`, porque las cuentas locales no lo tienen).

Antes de fijarlos conviene mirar la salida de `explain()` sobre las consultas reales del feed en
lugar de añadir índices a ojo.

---

### A5 · Las imágenes viven dentro de MongoDB en base64

**Dónde:** `recetaRepository.crear` y `actualizar` guardan `datos.imagenBase64` en `imagenUrl`;
`usuariosService.actualizarFoto` guarda el `data:image/...` en el campo `foto` del usuario.

`app.ts` acepta hasta 10 MB en las rutas de recetas, usuarios, despensa y chat. Cada receta con
foto propia es un documento de varios megas, y el feed devuelve 20 por página con la imagen
dentro. El límite de documento de MongoDB son 16 MB, así que además hay un techo duro esperando.

Es la contradicción del proyecto: `CLAUDE.md` prohíbe con razón meter un `data:` URI en el token
de NextAuth, y `frontend/src/lib/auth.ts` filtra las fotos base64 antes de guardarlas en la
sesión. El mismo dato entra sin filtro en la base de datos.

**Arreglo:** subir la imagen a un almacenamiento de objetos y guardar la URL. `CLOUDINARY_URL` ya
está en `backend/.env.example` sin usarse, así que la intención estaba. El nivel gratuito de
Cloudinary cubre de sobra un TFG. La alternativa sin cuenta nueva es GridFS, más trabajo y peor
para servir imágenes.

La migración de los documentos existentes es un script de una tarde: recorrer, subir, sustituir.

---

### A6 · El tope diario de Gemini se reinicia en cada redeploy

**Dónde:** `backend/src/services/chatService.ts:35-51`.

`llamadasHoy` es una variable del proceso. Render reinicia el contenedor al desplegar y también
duerme el plan gratuito por inactividad. Cada arranque pone el contador a cero, así que el tope
de 1000 llamadas al día no es un tope: es un tope por vida del proceso.

Es el mismo problema que tenían los limitadores antes de la Fase 4, y la solución ya está
construida en el repositorio: `lib/rateLimitStore.ts` y el cliente REST de `lib/redis.ts`.

**Arreglo:** contador en Upstash con clave `gemini:llamadas:YYYY-MM-DD` y `INCR` + `EXPIRE` a 48
horas. Si no hay Redis configurado, se queda como está y se dice en el log al arrancar.

---

### M1 · La regla de validación de `CLAUDE.md` se cumple en un sitio de seis

`CLAUDE.md` dice, sin matices: «La validación Zod va en la ruta, con el middleware
`validarBody(esquema)`. Los controladores no validan».

La realidad:

| Router | Validación |
|---|---|
| `auth.routes.ts` | `validarBody` en los 8 endpoints. Como manda la regla |
| `recetas.routes.ts` | Ninguna en la ruta. `recetasController.ts:144` y `:158` hacen `safeParse` en el controlador |
| `usuarios.routes.ts` | Ninguna. Comprobaciones a mano en el controlador |
| `despensa.routes.ts` | Ninguna. Comprobaciones a mano en el controlador |
| `chat.routes.ts` | Ninguna. Comprobaciones a mano dentro del handler |
| `ingredientes.routes.ts` | Ninguna |

Un router de seis sigue la regla. No es un descuido puntual: la regla no se aplicó nunca fuera de
`auth`.

Esto importa más allá del estilo. Sin esquema, cada campo depende de que alguien se acuerde de
comprobarlo, y `despensaController.ts:75-78` es el ejemplo (ver M10).

**Arreglo:** escribir los esquemas que faltan en `lib/validadores.ts` y engancharlos en las
rutas. Es mecánico y la skill `/cookr-endpoint` ya describe el orden. Después, quitar el
`safeParse` de `recetasController`.

---

### M2 · Los alérgenos del perfil son texto libre

**Dónde:** `backend/src/models/usuarioMongo.ts` (`alergias: { type: [String] }`) y
`usuariosService.actualizarPreferencias`, que guarda lo que llegue.

El filtro de alérgenos es, según `CLAUDE.md`, «un requisito de salud, no una preferencia de
navegación». Se compara por igualdad de cadena contra el array `alergenos` de la receta. Si el
perfil guarda `Lacteos` y las recetas dicen `lacteos`, el filtro no salta y el usuario ve recetas
con su alérgeno. Falla en silencio y hacia el lado peligroso.

Hoy no hay catálogo, ni `enum` en el esquema, ni validación en la entrada.

**Arreglo:** un catálogo único de alérgenos compartido entre backend y frontend, `enum` en el
esquema de Mongoose, `z.enum` en el validador de `PUT /me/preferencias` y un test que falle si
las dos listas se separan. Es el tipo de regla que conviene que vigile una prueba, no un
documento.

---

### M3 · Un clon nuevo del frontend no arranca siguiendo el `.env.example`

`frontend/src/services/apiClient.ts` y `frontend/src/lib/auth.ts` leen `NEXT_PUBLIC_API_URL`.
**No está en `frontend/.env.example`.** En su lugar hay `NEXT_PUBLIC_APP_URL`, que no se usa en
ningún sitio del código.

En local no se nota porque el valor por defecto es `http://localhost:4000/api`. En Vercel, sin esa
variable, el frontend apunta a localhost y no funciona nada.

**Arreglo:** añadir `NEXT_PUBLIC_API_URL` y quitar `NEXT_PUBLIC_APP_URL`.

---

### M4 · El `.env.example` del backend no cuadra con el código

Comparando lo que lee `process.env` en `backend/src/` con lo declarado:

| Variable | Estado |
|---|---|
| `PEXELS_API_KEY` | Se usa en `imagenService`. **No está declarada** |
| `USDA_API_KEY` | Se usa en `nutritionService`. **No está declarada** |
| `GMAIL_USER` | Se usa como respaldo en `lib/email.ts:5`. No está declarada. Resto de la etapa de nodemailer, debería desaparecer |
| `CLOUDINARY_URL` | Declarada. No se usa en ningún sitio |
| `GEMINI_MODEL` | El ejemplo dice `gemini-2.0-flash`; el código usa `gemini-2.5-flash` por defecto (`chatService.ts:28`) y desactiva el *thinking* precisamente porque es un 2.5 |

`CLAUDE.md` sí menciona `PEXELS_API_KEY` y `USDA_API_KEY`, así que la plantilla es lo que está
desactualizado.

---

### M5 · Dos páginas con sesión fuera del `matcher`

**Dónde:** `frontend/src/middleware.ts`.

El `matcher` no incluye `/editar-receta/:path*` ni `/completar-perfil`, y las dos existen como
páginas. La API responde 401, así que no se filtran datos, pero el usuario sin sesión llega a una
pantalla rota en vez de al login.

En sentido contrario, `/recetas/:path*` **sí** está protegida, mientras que el backend sirve el
detalle de receta con `optionalAuth` y `CLAUDE.md` describe explícitamente el caso del «visitante
anónimo». Cliente y servidor no dicen lo mismo sobre quién puede ver una receta. Conviene decidir
cuál de los dos tiene razón, porque hoy la parte pública de la aplicación no es alcanzable.

---

### M6 · Los contadores de likes y guardados pierden escrituras

**Dónde:** `recetaRepository.ts:372-396` (`toggleLike`), `:435-459` (`toggleGuardado`) y
`:405-433` (`agregarComentario`).

Los tres cargan el documento, lo modifican en memoria y hacen `save()`. Dos peticiones a la vez
sobre la misma receta se pisan: la segunda escribe el array que leyó antes de la primera.

**Arreglo:** operadores atómicos.

```ts
await Receta.updateOne({ _id: recetaId }, { $addToSet: { likes: uid } });
await Receta.updateOne({ _id: recetaId }, { $pull: { likes: uid } });
```

Para el comentario, `$push`. Como efecto secundario deja de leerse el documento entero, que en una
receta con la imagen dentro son varios megas por like (ver A5).

---

### M7 · Los comentarios crecen sin límite dentro de la receta

`listaComentarios` es un array embebido en el documento de receta y nadie lo acota.
`findComentarios` además carga todos los comentarios para devolver una página de diez.

Con el techo de 16 MB por documento y una imagen base64 dentro, el margen es menor de lo que
parece. Sacar los comentarios a su propia colección resuelve el crecimiento, la paginación y la
carga; es un cambio de modelo, así que va después de lo urgente.

---

### M8 · No hay manejador de 404

`backend/src/app.ts` registra las rutas y salta directo a `manejadorErrores`. Una petición a una
ruta que no existe cae en el 404 por defecto de Express, que devuelve HTML. El resto de la API
habla JSON.

**Arreglo:** cuatro líneas antes del manejador de errores.

---

### M9 · Los errores 500 devuelven el mensaje interno

**Dónde:** `backend/src/middlewares/errores.ts:7`.

```ts
res.status(err.status ?? 500).json({ error: err.message ?? "Error interno del servidor" });
```

Para los errores que el código lanza a propósito con su `status`, está bien y es lo que espera el
frontend. Para un error no controlado, `err.message` es lo que traiga Mongoose, axios o el
runtime, y eso puede incluir nombres de colección, fragmentos de consulta o URLs internas.

**Arreglo:** mensaje genérico cuando el status es 5xx y el error no trae `status` propio. El
mensaje real ya se registra en consola.

---

### M10 · `PUT /api/despensa/:id` se cae con un 500 si el tipo no es el esperado

**Dónde:** `backend/src/controllers/despensaController.ts:75-78`.

```ts
if (nombre !== undefined) cambios.nombre = nombre.trim();
if (cantidad !== undefined) cambios.cantidad = Number(cantidad);
```

El cuerpo se declara con un `as Partial<{...}>` que TypeScript no comprueba en tiempo de
ejecución. Un `nombre: 123` revienta en `.trim()` con un TypeError, que sale como 500 en vez de
400. Un `cantidad: "muchas"` guarda `NaN` en la base de datos.

Es un caso concreto de M1: la ruta no tiene esquema.

---

### B1 · Dependencias que no se usan

| Paquete | Dónde | Comentario |
|---|---|---|
| `nodemailer` + `@types/nodemailer` | `backend` | Ya no se importa. `CLAUDE.md` lo reconoce como resto |
| `resend` | `backend` | Igual |
| `next-pwa` | `frontend` | Cero referencias, y `next.config.mjs` no lo envuelve |

`mongodb` en las dependencias de desarrollo del frontend sí se usa: `e2e/helpers/bd.ts`.

---

### B2 · 69 `console.log` en el código de producción del backend

Varios incluyen fragmentos de identificadores de usuario (`chatService.ts`). No es una fuga grave,
pero mezcla depuración con los registros de `morgan("combined")` en producción y hace que los logs
de Render no sirvan para buscar nada. El frontend, en cambio, está limpio: cero.

---

### B3 · El `README.md` describe un proyecto que no es este

- Dice que es un monorepo con **dos** aplicaciones. Son tres: falta `gemini-proxy/`.
- Enlaza a `documentacion/`, carpeta que **no existe en este repositorio**. Está en
  `TFG-DOcumenatacion/`, que es otro repo (ver B6). El enlace del README lleva a un 404 en GitHub.
- No menciona en ningún sitio los 80 tests, el E2E ni el CI. Para un tribunal que abra el
  repositorio, eso es justo lo que conviene que se vea.

Las insignias, en cambio, ya están bien: se arreglaron en la Fase 4.

---

### B4 · `CLAUDE.md` apunta a tres carpetas que no existen

> `documentacion/` y `overleaf/` son la memoria en LaTeX. `presentacion/` es la defensa.

Ninguna de las tres está en el repositorio. La skill `/cookr-memoria` arrastra el mismo error en
su `description`: «Úsala al tocar `documentacion/` u `overleaf/`».

Es el peor tipo de documentación equivocada: la que se lee en cada sesión y manda buscar en un
sitio donde no hay nada.

---

### B5 · `docs/` es un vertedero

44 documentos `.md`, 59 `.html`, 4 PDF y 19 MB. Sin índice, sin orden y sin nada que diga cuál
sigue vigente. `docs/referencia/ (pendiente, tarea F10.3)` está **vacía**. La mayoría de los `.md` son de marzo a junio:
informes de sprint, planes cerrados y notas de fases que ya pasaron.

Nada de eso está mal por existir. El problema es que no hay forma de saber qué mirar, así que en
la práctica no se mira nada y se vuelve a preguntar lo que ya estaba escrito.

---

### B6 · Tres cosas grandes fuera del control de versiones

`git status` lleva semanas enseñando lo mismo:

```
?? Cookr_TFG_Presentacion.pptx
?? ODCUTGF/
?? TFG-DOcumenatacion/
```

- **`TFG-DOcumenatacion/`** es un repositorio de git independiente metido dentro de este. Git no
  lo trackea y no avisa. Ahí está la memoria en LaTeX, `overleaf/`, `presentacion/` y los anexos
  finales.
- **`ODCUTGF/`** son los documentos oficiales del TFG: autorizaciones de biblioteca y Gredos, la
  defensa y las entregas E1, E2, E3.
- El **`.pptx`** de 3,4 MB de la presentación.

Cada `git status` obliga a reconocer estas tres líneas y descartarlas. Y lo peor: el último commit
del repositorio es del **4 de agosto**. Un mes de trabajo de documentación que no está en ningún
historial que este repositorio conozca.

**Arreglo:** decidir a propósito. Lo razonable es un submódulo o un enlace en el README para
`TFG-DOcumenatacion`, `.gitignore` para `ODCUTGF/` (documentos personales firmados, no código) y
Git LFS o `.gitignore` para el `.pptx`.

**Cerrado el 4 de septiembre de 2026.** Los tres se movieron un nivel por encima, a `4 Curso/`,
sin borrar nada. `TFG-DOcumenatacion/` sigue siendo su propio repositorio, con su historial
intacto (`e9849a1`, rama `main`) y sus cambios sin commitear tal y como estaban.

No se hizo ni submódulo ni Git LFS. La memoria en LaTeX, los documentos oficiales firmados y el
`.pptx` no son código de Cookr: no tienen por qué vivir dentro de este repositorio ni versionarse
con él, y un submódulo solo habría cambiado tres líneas de ruido por una más difícil de explicar.
El `.gitignore` de la raíz lleva las tres rutas como red de seguridad, por si alguna vuelve a
aparecer aquí dentro.

Queda un cabo suelto que no es de este hallazgo: `README.md:73` sigue enlazando a
`documentacion/`, que ya no existe aquí y no va a volver. Es B3 y se arregla en F10.1.

---

### B7 · `REVISION_DESPLIEGUE.md` sin verificar

El checklist de la revisión en producción está entero sin marcar, con todas las casillas vacías.
`develop` y `main` son el mismo commit, así que el despliegue ocurrió: lo que no consta es que
alguien comprobara el filtro de alérgenos, el rate limiting o los saltos de proxy en producción.

Dos puntos de ese documento siguen abiertos y no son cosméticos: si Render mete más de un proxy
por delante, el `trust proxy = 1` de `app.ts:17` hace que el limitador por IP corte a todos los
usuarios a la vez o a ninguno.

---

### B8 · Restos menores

- `frontend/src/features/auth/components/formularioLogin.tsx:148`: un `TODO Fase 4` sobre un
  enlace que ya es real y funciona. La Fase 4 se cerró en julio.
- `gemini-proxy/` no pasa por el CI: sin lint, sin tests, sin despliegue automático. Es la tercera
  unidad desplegable y la única sin ninguna comprobación.
- Los scripts de `scripts/` son bash con llamadas a `powershell.exe` y `taskkill`. Funcionan en
  esta máquina y en ningún otro sitio. Para un TFG que alguien puede querer reproducir, conviene
  al menos decirlo en el README.

---

## 3. Lo que falta

No son fallos de lo que hay, sino huecos.

### Pruebas

Cobertura real del backend, medida con `npm run test:cov`:

| Métrica | Valor |
|---|---|
| Sentencias | **35,95 %** |
| Ramas | **22,43 %** |
| Funciones | 25,95 % |
| Líneas | 38,10 % |

El reparto explica más que el total. Lo que se probó en la Fase 2 fue el camino de autenticación,
y ahí la cobertura es buena: `authService` 81 %, `validadores` 100 %, `rateLimitAuth` 100 %,
`upstashRateLimitStore` 100 %.

Lo que no se tocó está prácticamente sin probar:

| Fichero | Sentencias |
|---|---|
| `despensaController.ts` | 5,88 % |
| `usuariosController.ts` | 6,97 % |
| `nutritionService.ts` | 7,93 % |
| `despensaRepository.ts` | 8,82 % |
| `chatService.ts` | 10,58 % |
| `imagenService.ts` | 11,11 % |
| `recetasController.ts` | 11,84 % |
| `usuariosService.ts` | 13,33 % |

Los 80 tests son buenos tests. Cubren una sexta parte de los 37 endpoints.

El frontend no tiene pruebas unitarias, solo los 2 E2E de Playwright.

### Documentación técnica

- **No hay contrato de API.** `docs/referencia/ (pendiente, tarea F10.3)` existe y está vacía. Los 37 endpoints solo se
  conocen leyendo los routers. Para la memoria del TFG hace falta igualmente.
- **No hay registro de decisiones.** Por qué Mailjet por HTTP y no SMTP, por qué el filtro de
  alérgenos vive en el backend, por qué el E2E no bloquea el deploy, por qué el JWT del backend
  viaja dentro del token de NextAuth: todo eso está explicado en `CLAUDE.md`, que es un contrato,
  no un historial. Cuando una de esas decisiones cambie, no quedará constancia de qué resolvía la
  anterior.
- **No hay diario de trabajo.** El único relato del proyecto es el `git log` y unos informes de
  sprint que se cortan en junio.

### Producto

Lo de la Fase 5 de `PLAN_AUDITORIA.md` sigue entero sin empezar: refresh tokens, webhooks de
Mailjet, observabilidad, búsqueda full-text, y las cuatro funciones de producto (grupos por
afinidad, subrecetas, planificador semanal, despensa compartida). Dos de ellas están en el guion
de la defensa.

### El bloqueo de la Fase 0, resuelto por decisión

Estaba abierto desde el 16 de julio: sin dominio propio con SPF y DKIM alineados en Mailjet, el
correo a Outlook y Hotmail se descarta en silencio.

**El 4 de septiembre se decidió no comprar dominio** y enviar desde Gmail asumiendo la limitación.
Deja de ser un pendiente y pasa a ser una restricción conocida del proyecto, con dos consecuencias
que hay que respetar: la demostración de la defensa se hace con una cuenta de Gmail, y la decisión
se escribe como ADR con su alternativa descartada. Detalle en `docs/estado/plan-2026-09.md`, bloque F0.

---

## 4. Resumen

| Nivel | Cuántos | Cuáles |
|---|---|---|
| Crítico | 1 | C1 |
| Alto | 6 | A1-A6 |
| Medio | 10 | M1-M10 |
| Bajo | 8 | B1-B8 |

C1 se arregla esta semana. A1 y A2 son cambios de menos de una hora cada uno. El resto tiene su
sitio en `docs/estado/plan-2026-09.md`.
