# Por probar · sesión del 4 de octubre de 2026

Lo que salió de `prompt-2026-10.md`. Seis bloques, los seis cerrados, **todo sin commitear** en la
rama `feat/barreras-contrato-callback`. Aquí está qué se hizo en cada uno, cómo comprobarlo y, al
final, los textos de commit y de PR.

| Bloque | Estado |
|---|---|
| 1 · `callbackUrl` tras el login | Cerrado. Google sin probar con una cuenta real |
| 2 · Test del endpoint de seguir | Cerrado. Destapó un bug, arreglado |
| 3 · F9.2, tests barrera | Cerrado. Las cuatro vistas en rojo |
| 4 · F9.1, medir la cobertura | Cerrado como medición. F9.1 sigue abierto |
| 5 · F10.3, contrato de la API | Cerrado. 40 endpoints, no 37 |
| 6 · F10.4, fichas de decisiones | Cerrado. Seis fichas, 0002 a 0007 |

---

## Antes de nada, en el otro ordenador

En este equipo faltaban las dependencias de desarrollo de los dos paquetes y el navegador de
Playwright. Si en el otro pasa lo mismo:

```bash
cd backend  && npm ci
cd frontend && npm ci
cd frontend && npx playwright install chromium
```

Tres cosas que me pasaron y que te pueden pasar:

- **La primera vez, `mongodb-memory-server` descarga el binario de Mongo (unos 780 MB).** Si esa
  descarga coincide con los E2E, Playwright se cansa de esperar al servidor (`Timed out waiting
  180000ms from config.webServer`). Pasa primero `cd backend && npm test`, que lo descarga, y luego
  los E2E.
- **La primera pasada de Jest en Windows puede tirar una o dos suites** con
  `jest: failed to cache transform results ... UNKNOWN: unknown error, rename`. Son dos workers
  escribiendo a la vez la caché de transformación, no un test roto: la cuenta de tests sale más baja
  y ningún test aparece como fallido. La segunda pasada sale limpia. Me pasó en el primer
  `npm test` y en el primer `npm run test:cov`.
- **Los E2E necesitan los puertos 3000 y 4000 libres.** Cierra `npm run dev` antes.

---

## Validación completa

```bash
bash scripts/lint.sh
cd backend && npm test
cd backend && npx tsc --noEmit -p tsconfig.test.json
cd gemini-proxy && npm test
cd frontend && npx tsc --noEmit
cd frontend && npm run e2e
```

Lo que salió aquí al final de la sesión:

| Comando | Resultado |
|---|---|
| `bash scripts/lint.sh` | `✔ Lint OK`. Solo los tres avisos de `<img>` de siempre en el frontend |
| `cd backend && npm test` | 26 suites, **366 tests**, todos en verde |
| `cd backend && npx tsc --noEmit -p tsconfig.test.json` | Sin errores |
| `cd gemini-proxy && npm test` | 10 de 10 |
| `cd frontend && npx tsc --noEmit` | Sin errores |
| `cd frontend && npm run e2e` | **7 de 8.** Falla el primero, que no es de esta sesión. Ver abajo |

### El E2E que queda en rojo en local

`flujoPrincipal.spec.ts › un usuario nuevo se registra, verifica, entra y publica una receta`. Es el
primer test de la tanda. No lo he tocado.

```
Error: expect(page).toHaveURL(expected) failed
Expected pattern: /\/verificar-email\/pendiente/
Received string:  "http://localhost:3000/registro"
Timeout: 5000ms
```

En el momento del fallo el botón dice «Creando cuenta…»: el registro está en marcha y `next dev`
todavía está compilando la página siguiente. Lo comprobé con reintentos
(`npx playwright test flujoPrincipal --retries=6`): cada intento falla un paso más adelante
(`/verificar-email/pendiente`, luego `/completar-perfil`, luego `/home`), siempre a los 5 segundos y
siempre en una página que se pide por primera vez, y **el cuarto intento pasa entero**. Playwright lo
da como `1 flaky`.

Es decir: el flujo funciona, y lo que no cabe es la compilación en frío de `next dev` en los 5
segundos que ese test da a cada paso en este equipo. En el CI se compila antes (`next build` y
`next start`) y hay dos reintentos. Los tres E2E nuevos pasan por las mismas pantallas con 30
segundos de margen y salen en verde.

Lo que **no** he podido comprobar es si este test ya fallaba en este equipo antes de mis cambios:
habría que volver al commit anterior y eso es git de escritura. Si en tu ordenador pasa a la primera,
era la máquina. Si falla igual, la solución es darle a `flujoPrincipal.spec.ts` el mismo margen que
tiene `loginCallbackUrl.spec.ts` (`ESPERA_NAVEGACION`).

---

## Bloque 1 · Respetar `callbackUrl` tras el login

**Qué se hizo.** Tras entrar, el usuario vuelve a la página de la que venía en vez de acabar siempre
en `/home`. El destino sale de `?callbackUrl=` y pasa por una sola función pura,
`destinoTrasLogin()`, que solo acepta rutas internas: empieza por `/`, no por `//` ni `/\`, y no
lleva tabuladores ni saltos de línea (el navegador los quita, y `/<tab>/web.com` acabaría siendo
`//web.com`). Cualquier otra cosa cae en `/home`.

**Decisión: el destino sobrevive a `/completar-perfil`.** Un usuario nuevo va a
`/completar-perfil?callbackUrl=<destino>` y, al pulsar «Listo», al destino. El motivo está en el
diario. Con Google, además, `/completar-perfil` es la parada obligada de todos (lo era ya: el botón
manda ahí y la página redirige a quien tiene el perfil completo), así que ese mismo parámetro es el
que hace que Google respete el destino.

**Efecto que no estaba en el enunciado.** `next-auth/middleware` también manda a
`/login?callbackUrl=<ruta>` cuando alguien sin sesión abre una página protegida. Antes se ignoraba;
ahora, si abres `/despensa` sin sesión y entras, vuelves a `/despensa`.

**Ficheros.**

- `frontend/src/lib/destinoTrasLogin.ts` (nuevo): `destinoTrasLogin()` y `rutaCompletarPerfil()`.
- `frontend/src/app/login/page.tsx`: lee `searchParams.callbackUrl` y se lo pasa al formulario.
- `frontend/src/features/auth/components/formularioLogin.tsx`: lo valida y se lo da a `useAuth` y al
  botón de Google.
- `frontend/src/features/auth/hooks/useAuth.ts`: `iniciarSesion` navega al destino.
- `frontend/src/app/completar-perfil/page.tsx` y
  `frontend/src/features/auth/components/formularioCompletarPerfil.tsx`: conservan el destino.
- `frontend/e2e/loginCallbackUrl.spec.ts` (nuevo) y `frontend/e2e/helpers/bd.ts`
  (`crearUsuarioVerificado`, que inserta el usuario en vez de registrarlo para no gastar el cupo de
  5 registros por hora).

**Cómo probarlo, automático.**

```bash
cd frontend && npx playwright test loginCallbackUrl
```

Tienes que ver `3 passed`:

- `un visitante pulsa me gusta, entra y vuelve a la receta`
- `el destino sobrevive a completar el perfil`
- `un callbackUrl externo acaba en /home`, que además prueba `//example.com`, `/\example.com`,
  `/<tab>/example.com`, `javascript:alert(1)`, `example.com` y vacío.

**Cómo probarlo, a mano.** Con `bash scripts/dev.sh`. Ojo: en local el backend usa el `MONGODB_URI`
de `backend/.env`, que puede ser Atlas. Usa una cuenta tuya; un me gusta de prueba se queda guardado.

Necesitas el id de una receta: entra con tu cuenta, abre cualquier receta y copia la URL
(`/recetas/<id>`). Luego cierra sesión o abre una ventana privada.

*Con credenciales:*

1. Sin sesión, abre `http://localhost:3000/recetas/<id>`. Se ve la receta.
2. Pulsa «Me gusta». La URL pasa a `/login?callbackUrl=%2Frecetas%2F<id>`.
3. Entra con correo y contraseña.
4. **Tienes que acabar en `/recetas/<id>`**, no en `/home`, y con sesión: abajo ya no pone «Inicia
   sesión para comentar».
5. El me gusta **no** se da solo: hay que volver a pulsar. Volver a la página estaba pedido; repetir
   la acción, no.

*Con Google* (necesita `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en `frontend/.env.local`):

1. Repite los pasos 1 y 2.
2. Pulsa «Continuar con Google» y elige una cuenta **que ya tenga el perfil completo**.
3. Tienes que acabar en `/recetas/<id>`. Por el camino pasa un instante por
   `/completar-perfil?callbackUrl=...`; es normal.
4. Con una cuenta de Google **nueva**: te quedas en «Cuéntanos sobre ti», con
   `?callbackUrl=%2Frecetas%2F<id>` en la URL. Pulsa «Listo» y tienes que acabar en la receta.

*Con un `callbackUrl` malicioso.* Sin sesión, abre cada una de estas, entra, y **en todas tienes que
acabar en `http://localhost:3000/home`**, nunca fuera de Cookr:

```
http://localhost:3000/login?callbackUrl=https://example.com
http://localhost:3000/login?callbackUrl=//example.com
http://localhost:3000/login?callbackUrl=/%5Cexample.com
http://localhost:3000/login?callbackUrl=javascript:alert(1)
http://localhost:3000/login?callbackUrl=
```

Y ya con sesión, esta tiene que llevarte también a `/home`:

```
http://localhost:3000/completar-perfil?callbackUrl=//example.com
```

Prueba las maliciosas también con el botón de Google, que es el camino que yo no he podido ejercitar.

*Una página protegida:* sin sesión, abre `http://localhost:3000/despensa`, entra, y tienes que
volver a `/despensa`.

---

## Bloque 2 · Test del endpoint de seguir

**Qué se hizo.** `backend/tests/usuarios.seguir.test.ts`, 16 tests sobre
`POST /api/usuarios/:id/seguir`: seguir, dejar de seguir, volver a seguir sin duplicar, seguirse
mutuamente, que dejar de seguir a uno no toque a los demás, 401 sin token y con token malo, usuario
inexistente (404), seguirse a uno mismo (400), tres ids malformados (404), cuenta del token borrada
(404) y tres casos de dos llamadas a la vez.

**El bug.** Los tres casos de concurrencia fallaban con 500. `toggleSeguir` leía los dos usuarios,
cambiaba los arrays en memoria y hacía `save()` de los dos. Dos llamadas a la vez (un doble clic, o
dos personas siguiendo al mismo usuario en el mismo instante) chocaban en la versión del documento de
Mongoose: una respondía 500 y, como eran dos `save()` sueltos, podía quedar escrito un lado de la
relación y el otro no.

**El arreglo**, en `backend/src/repositories/usuarioRepository.ts`, que es su capa. `seguidos` del
que sigue se alterna en una sola operación atómica, igual que los likes desde F7.3, y `seguidores`
del otro se copia de ahí con `$addToSet` o `$pull`, releyendo después por si otra llamada cambió la
verdad entre medias. La respuesta y los errores son los mismos de antes.

**Un detalle que dejo dicho y no he cambiado:** un id malformado responde 404 `Usuario no
encontrado`, no 400. Es lo mismo que hacen las rutas de recetas, así que el test lo fija como está.

**Ficheros.** `backend/tests/usuarios.seguir.test.ts` (nuevo) y
`backend/src/repositories/usuarioRepository.ts`.

**Cómo probarlo.**

```bash
cd backend && npm test -- tests/usuarios.seguir.test.ts
```

Tienes que ver `Tests: 16 passed, 16 total`. Lo pasé cuatro veces seguidas por los casos de
concurrencia y salió igual las cuatro.

A mano, en el navegador: sigue a alguien desde el detalle de una receta o desde los destacados, y
pulsa el botón dos veces muy rápido. No tiene que salir ningún error y el estado final tiene que ser
coherente al recargar.

---

## Bloque 3 · F9.2, tests barrera

**Qué se hizo.** Tres barreras nuevas en `backend/tests/barreras.test.ts` (13 tests) y una ampliada
en `backend/tests/alergenos.deteccion.test.ts` (1 test más). `backend/tests/helpers/rutas.ts` saca
los endpoints de los routers montados en Express, y lo usa también el test del contrato.

1. **Todo endpoint con cuerpo pasa por `validarBody`.** Recorre los routers de verdad, no el texto.
   Las cuatro rutas que escriben sin leer `req.body` están en una lista `SIN_CUERPO`, y el test
   también falla si una de esas excepciones deja de existir.
2. **Nadie fuera de `repositories/` importa de `models/`.** El plan pedía `services/`; vigila también
   `controllers/`, `routes/` y `middlewares/`, que hoy cumplen.
3. **Los alérgenos coinciden.** Ya existía para los dos catálogos y para `opcionesUsuario.ts`, así que
   no se ha duplicado. Se ha ampliado con una cuarta lista que nadie vigilaba: el mapa de
   `chipAlergeno.tsx`, que devuelve `null` con un id desconocido.
4. **Toda variable de `process.env` está en su `.env.example`**, en backend y en frontend, y en las
   dos direcciones.

**Cómo probarlo.**

```bash
cd backend && npm test -- tests/barreras.test.ts tests/alergenos.deteccion.test.ts
```

Tienes que ver `Tests: 39 passed, 39 total`.

**Qué romper para ver cada una en rojo.** Es lo que rompí yo. Después de cada una, deshaz el cambio
y comprueba con `git diff -- <fichero>` que no sale nada.

| Barrera | Qué romper | Qué test falla |
|---|---|---|
| 1 · `validarBody` | En `backend/src/routes/usuarios.routes.ts`, línea de `PUT /me/foto`: quita `validarBody(esquemaFotoUsuario), ` | `ningún POST, PUT o PATCH llega al controlador sin validar`, nombrando `PUT /api/usuarios/me/foto` |
| 2 · capas | En `backend/src/services/usuariosService.ts`, añade arriba `import { Usuario } from "../models/usuarioMongo";` | `ningún fichero de services/ importa de models/` |
| 3 · alérgenos, la que ya había | En `frontend/src/config/opcionesUsuario.ts`, cambia `id: 'altramuz'` por `id: 'altramuces'` | `el frontend ofrece exactamente los 14 ids que acepta el backend` |
| 3 · alérgenos, la ampliación | En `frontend/src/components/common/chipAlergeno.tsx`, comenta la línea de `altramuz` | `el chip del detalle de receta sabe pintar los 14` |
| 4 · entorno | En `backend/.env.example`, cambia `USDA_API_KEY=` por `USDA_KEY=` | `backend: lo que lee src/ está en backend/.env.example` y `backend: la plantilla no anuncia variables que ya nadie lee` |

Para la 3 no toqué `ingredientes.ts`, que está congelado: se rompe desde los otros dos ficheros.

Un aviso: hice las roturas con `sed -i` y en Windows eso me cambió los finales de línea de CRLF a LF.
`git diff` salía vacío igual, pero `git status` marcaba los cinco ficheros como modificados hasta que
los devolví a CRLF con `unix2dos`. Si lo repites, edita a mano en el editor y te lo ahorras. Los
cinco quedaron como estaban: no aparecen en el `git status` final.

---

## Bloque 4 · F9.1, medir la cobertura

**Qué se hizo.** Solo medir. `npm run test:cov` con 359 tests, antes de añadir el test del contrato,
que no ejecuta nada nuevo de `src/`.

**Cifra global: 72,01 % de sentencias.** 56,49 % de ramas, 71,16 % de funciones y 74,28 % de líneas.
La medida anterior era del 36 %, del 4 de septiembre. La cifra incluye `tests/helpers/` y no incluye
`src/scripts/` ni `server.ts`.

**Controladores por debajo del 40 %: ninguno.**

| Controlador | Sentencias |
|---|---|
| `subidasController.ts` | 42,85 % |
| `recetasController.ts` | 60,56 % |
| `despensaController.ts` | 64,28 % |
| `usuariosController.ts` | 70,96 % |
| `authController.ts` | 82,85 % |

**`services/` con menos cobertura** (52,52 % la carpeta):

| Servicio | Sentencias |
|---|---|
| `nutritionService.ts` | 7,93 % |
| `imagenService.ts` | 11,11 % |
| `ingredientesService.ts` | 30 % |
| `despensaService.ts` | 42,85 % |
| `chatService.ts` | 46,91 % |

**`repositories/` con menos cobertura** (70,64 % la carpeta):

| Repositorio | Sentencias |
|---|---|
| `despensaRepository.ts` | 20 % |
| `recetaRepository.ts` | 74,04 % |
| `usuarioRepository.ts` | 82,14 % |
| `tokenRepository.ts` | 83,33 % |

**Para que lo decidas tú.** Los dos números con los que el plan cierra F9.1 (60 % y ningún
controlador por debajo del 40 %) ya se cumplen. No lo he marcado como cerrado, porque me lo pediste
así y porque dos de las cuatro reglas que el bloque quería cubrir siguen casi sin tests: la despensa
(repositorio al 20 %) y el chat (por debajo del 50 %). Los tres servicios de más abajo están así en
parte a propósito: los tests los mockean para no gastar cuota.

**Ficheros.** Solo `docs/estado/plan-2026-09.md`.

**Cómo repetirlo.**

```bash
cd backend && npm run test:cov
```

Busca la fila `All files` de la tabla. Si la primera pasada tira suites por el error de caché de
arriba, la cifra sale más baja de lo que es (a mí me salió 69,98 %): repite.

---

## Bloque 5 · F10.3, contrato de la API

**Qué se hizo.** `docs/referencia/api.md` con los **40 endpoints** que hay montados: 39 en los siete
routers y `GET /api/health`. El plan decía 37. De cada uno: método, ruta, auth, limitador, cuerpo
(sacado de `lib/validadores.ts`), respuesta y errores (sacados de controladores, servicios y
repositorios). `backend/tests/contrato.api.test.ts`, 7 tests, lo compara con los routers.

**Ficheros.** `docs/referencia/api.md` y `backend/tests/contrato.api.test.ts` (nuevos). Usa
`backend/tests/helpers/rutas.ts`, del bloque 3.

**Cómo probarlo.**

```bash
cd backend && npm test -- tests/contrato.api.test.ts
```

Tienes que ver `Tests: 7 passed, 7 total`.

**Cómo verlo fallar.** En `backend/src/routes/ingredientes.routes.ts`, justo antes de
`export default router;`, añade:

```ts
router.get("/populares", (_req, res) => { res.json([]); });
```

Fallan tres tests: `no hay ningún endpoint sin documentar` (con `GET /api/ingredientes/populares`),
`la cifra total que da el documento es la real` y `la auth documentada es la del router`. Quita la
línea y vuelve a verde. Lo hice y `git diff -- backend/src/routes` quedó vacío.

**Lo que el test no vigila.** Que el cuerpo, la respuesta y los errores escritos sean los reales. Eso
lo leí del código una vez; si cambia un esquema, el documento se queda viejo sin que nada avise. Dos
respuestas no están fijadas porque el código no las tipa: la de `generar-desde-texto` (lo que
devuelva Gemini) y el mensaje exacto del 413.

---

## Bloque 6 · F10.4, fichas de decisiones

**Qué se hizo.** Seis fichas en `docs/decisiones/`, con el formato de la 0001:

| Ficha | Decisión |
|---|---|
| `0002-correo-por-http.md` | Mailjet por API REST porque Render bloquea SMTP |
| `0003-alergenos-como-suelo-en-el-backend.md` | Los alérgenos del perfil se aplican siempre, en el backend |
| `0004-doble-token.md` | La sesión de NextAuth lleva dentro el JWT del backend |
| `0005-e2e-fuera-del-bloqueo-del-deploy.md` | Los E2E corren pero no bloquean el deploy |
| `0006-redis-con-respaldo-en-memoria.md` | Upstash si está configurado, memoria si no |
| `0007-imagenes-en-cloudinary.md` | Cloudinary frente a R2, y subida directa desde el navegador |

Ninguna tiene las consecuencias negativas vacías. **Cuatro dicen expresamente que un motivo no está
escrito**, en vez de rellenarlo:

- La 0004: por qué se descartaron las alternativas al doble token no está en `CLAUDE.md` ni en
  `docs/cambios/`. Es la que más te conviene leer: si recuerdas el motivo, falta.
- La 0002: por qué Mailjet y no otro proveedor con API HTTP.
- La 0006: por qué el store de los limitadores tiene respaldo en memoria. El del almacén de IA sí
  está escrito, en F7.6.
- La 0007 dice lo que hay escrito sobre Cloudinary (plan gratuito y transformaciones por URL) y que
  sobre R2 no hay más detalle.

**Cómo probarlo.** Es leer. Lo que merece una segunda mirada tuya, porque son afirmaciones que saqué
del código y no de un documento:

- 0004: que nada renueva el JWT de 7 días ni acorta la sesión de NextAuth. Lo vi en
  `frontend/src/lib/auth.ts`, que no fija `maxAge` ni refresca `backendToken`.
- 0006: que `UpstashStore` no captura un fallo de Redis, así que el respaldo ante caídas es solo del
  almacén de IA. Lo vi en `lib/rateLimitStore.ts` y `lib/upstashRateLimitStore.ts`. No he probado qué
  responde el login con Upstash configurado y caído.
- 0002 y 0004: las fechas originales de esas dos decisiones no las conozco; las fichas dicen que son
  anteriores y ya estaban en `CLAUDE.md`.

---

## Lo que no he podido comprobar

- **El login con Google de verdad.** Ni con una cuenta existente ni con una nueva. El código pasa el
  destino por `rutaCompletarPerfil()` y la mitad de después de Google (`/completar-perfil` con sesión
  y perfil completo o incompleto) sí está cubierta por los E2E, pero el viaje por Google no.
- **Nada en producción.** Ni Vercel, ni Render, ni Atlas.
- **Si `flujoPrincipal.spec.ts` ya fallaba en este equipo antes de mis cambios.** Ver arriba.
- **Los E2E en el CI.** Solo los he pasado en local, con `next dev`. En el CI van con `next build`.
- **El arreglo de seguir contra Atlas.** Está probado contra el Mongo efímero de los tests. Usa una
  actualización con *pipeline*, la misma técnica que los likes de F7.3, que ya corre en Atlas.
- **Qué responde un limitador con Upstash configurado y caído** (ficha 0006).
- **Los logs de GitHub Actions.** `pendientes.md` conserva los del 30 de septiembre, marcados como
  viejos.

## Vistas de paso, sin tocar

No eran de esta sesión. Las dejo apuntadas para que no se pierdan:

- **El JWT del backend caduca a los 7 días y nada lo renueva** ni cierra la sesión de NextAuth. A
  partir de ahí el usuario parece logueado y todo le da 401. Está en la ficha 0004.
- **`GET /api/ingredientes/buscar` es público, no tiene limitador y llama a Open Food Facts.** Es el
  único endpoint así.
- **`CLAUDE.md`, en «Trampas conocidas», habla de `buscarIngredientesEdamam()`.** En el código ya se
  llama `buscarIngredientesOpenFoodFacts()`, así que la trampa que describe ya no existe. No lo he
  cambiado porque es texto que ya estaba y me pediste no reescribirlo.
- **La skill `/cookr-tests` dice 80 tests en 6 suites.** Son 366 en 26. Está en `.claude/skills/`,
  fuera de donde podía escribir.
- **El destino no sobrevive al registro con correo.** El enlace «Regístrate gratis» del login no
  arrastra el `callbackUrl`, y el correo de verificación tampoco. Está en `pendientes.md`.
- **`docs/README.md` decía 141 ficheros.** Hay 157 contando los de hoy; lo he puesto al día.

---

## Commits y PR

Un commit por bloque, en este orden. El orden importa en dos sitios: el 5 usa
`backend/tests/helpers/rutas.ts`, que entra en el 3; y el 6 lleva los documentos que hablan de todos.

Ficheros que tocan varios bloques y dónde van:

- `docs/estado/plan-2026-09.md` (bloques 3, 4, 5 y 6) → **commit 4**. Lleva la medición y también las
  tres marcas de cerrado.
- `CLAUDE.md` (bloques 1, 3 y 5) → **commit 6**.
- `docs/README.md`, `docs/estado/diario.md`, `docs/estado/pendientes.md` y este fichero → **commit 6**.
- `docs/estado/prompt-2026-10.md`, que escribiste tú y estaba sin añadir → **commit 6**, junto con la
  línea de `docs/README.md` que lo lista.

Nada se queda fuera de los seis commits. `backend/coverage/`, `frontend/test-results/` y
`frontend/.next/` existen en disco pero están en `.gitignore`.

Los mensajes acaban con la línea `Co-Authored-By` que añade Claude Code. Si no la quieres, bórrala.

### Commit 1

```bash
git add frontend/src/lib/destinoTrasLogin.ts \
        frontend/src/app/login/page.tsx \
        frontend/src/app/completar-perfil/page.tsx \
        frontend/src/features/auth/hooks/useAuth.ts \
        frontend/src/features/auth/components/formularioLogin.tsx \
        frontend/src/features/auth/components/formularioCompletarPerfil.tsx \
        frontend/e2e/loginCallbackUrl.spec.ts \
        frontend/e2e/helpers/bd.ts
```

```
Return to callbackUrl after login

After signing in, send the user back to the page they came from
instead of always landing on /home. The destination comes from the
URL, so it goes through a single pure function, destinoTrasLogin(),
which only accepts internal paths: it must start with "/" and not
with "//" or "/\", and must not contain tabs or line breaks. Anything
else falls back to /home, so the login cannot be used as an open
redirect.

All three login paths use it: credentials, Google and
/completar-perfil. The destination survives the profile step, carried
in that page's own ?callbackUrl=, so a new Google user who liked a
recipe ends up back on it.

Add three E2E tests: like, sign in and return to the recipe; the
destination surviving /completar-perfil; and external or malformed
callbackUrl values ending on /home.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

### Commit 2

```bash
git add backend/tests/usuarios.seguir.test.ts \
        backend/src/repositories/usuarioRepository.ts
```

```
Test the follow endpoint and make the toggle atomic

Add 16 tests for POST /api/usuarios/:id/seguir: follow, unfollow,
both sides of the relation staying consistent, 401 without a token,
unknown user, following yourself, malformed ids and concurrent calls.

The concurrent cases exposed a bug. toggleSeguir loaded both users,
changed the arrays in memory and saved each document, so two calls at
once hit a Mongoose version conflict: one answered 500 and the
relation could be written on one side only.

Toggle the follower's seguidos in a single atomic update, as likes
do since F7.3, and mirror it into the other user's seguidores with
$addToSet or $pull, re-reading afterwards in case another call
changed it in between. Responses and error codes are unchanged.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

### Commit 3

```bash
git add backend/tests/barreras.test.ts \
        backend/tests/helpers/rutas.ts \
        backend/tests/alergenos.deteccion.test.ts
```

```
Add barrier tests for the rules in CLAUDE.md (F9.2)

Add tests that fail when a rule is broken instead of when a function
misbehaves:

- Every POST, PUT or PATCH route goes through validarBody, checked by
  walking the mounted Express routers. Routes that do not read the
  body are listed explicitly, and a stale exception fails too.
- Nothing in services/, controllers/, routes/ or middlewares/ imports
  from models/.
- Every process.env variable read in src/ is in that package's
  .env.example, and the template lists nothing that is no longer
  read. Checked for backend and frontend.

The allergen barrier already existed in alergenos.deteccion.test.ts.
Extend it to the map in chipAlergeno.tsx, a fourth copy of the list
that nothing was checking and that renders nothing for an unknown id.

tests/helpers/rutas.ts lists the endpoints from the Express app.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

### Commit 4

```bash
git add docs/estado/plan-2026-09.md
```

```
Record the coverage measurement and close F9.2, F10.3 and F10.4

Measure coverage for F9.1: 72.01% of statements, with no controller
under 40% (the lowest is subidasController at 42.85%). List the
services and repositories with the least coverage. F9.1 stays open:
the two figures in its closing criterion are met, but the pantry and
the chat are still mostly untested.

Mark F9.2, F10.3 and F10.4 as done in the plan. The API has 40
endpoints, not the 37 the plan mentioned.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

### Commit 5

```bash
git add docs/referencia/api.md \
        backend/tests/contrato.api.test.ts
```

```
Document the API contract and test it against the routers (F10.3)

Add docs/referencia/api.md with the 40 mounted endpoints: method,
path, auth, rate limiter, body, response and errors. Bodies are taken
from lib/validadores.ts and errors from the controllers, services and
repositories.

Add a test that compares the document with the routers mounted in
Express. It fails if an endpoint is undocumented, if a documented one
no longer exists, if the documented auth is not the real middleware,
or if the total stated in the document is wrong.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

### Commit 6

```bash
git add docs/decisiones/0002-correo-por-http.md \
        docs/decisiones/0003-alergenos-como-suelo-en-el-backend.md \
        docs/decisiones/0004-doble-token.md \
        docs/decisiones/0005-e2e-fuera-del-bloqueo-del-deploy.md \
        docs/decisiones/0006-redis-con-respaldo-en-memoria.md \
        docs/decisiones/0007-imagenes-en-cloudinary.md \
        docs/README.md \
        docs/estado/diario.md \
        docs/estado/pendientes.md \
        docs/estado/por-probar.md \
        docs/estado/prompt-2026-10.md \
        CLAUDE.md
```

```
Write decision records 0002 to 0007 and update the docs (F10.4)

Add six decision records for choices that only lived in CLAUDE.md:
mail over HTTP, allergens as a floor enforced by the backend, the
double token, E2E tests outside the deploy gate, Redis with an
in-memory fallback, and Cloudinary as the image provider. Where the
reason for discarding an alternative was never written down, the
record says so instead of guessing.

Update CLAUDE.md with the real test counts (366 unit, 8 E2E) and the
new rules: the post-login destination is validated in one function,
and the barrier and contract tests.

Add por-probar.md with how to test each block, a diary entry, the
session prompt, and bring pendientes.md and the docs index up to
date.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

### PR contra `develop`

**Título**

```
Return to callbackUrl after login, barrier tests, API contract and decision records
```

**Descripción**

```
## What

Six blocks from the October 4th session.

- **Login returns to callbackUrl.** After signing in, the user goes
  back to the page they came from instead of /home. The destination
  is validated by one pure function, `destinoTrasLogin()`, which only
  accepts internal paths, so the login is not an open redirect. Used
  by credentials, Google and /completar-perfil.
- **Follow endpoint tested, and a bug fixed.** 16 tests for
  `POST /api/usuarios/:id/seguir`. Two concurrent calls answered 500
  and could leave the relation written on one side only; the toggle
  is now atomic.
- **Barrier tests (F9.2).** They fail when someone breaks a rule from
  CLAUDE.md: a body route without `validarBody`, a model imported
  outside `repositories/`, an env variable missing from
  `.env.example`, or the allergen lists drifting apart.
- **Coverage measured (F9.1).** 72.01% of statements, no controller
  under 40%. F9.1 stays open.
- **API contract (F10.3).** `docs/referencia/api.md` documents the 40
  endpoints, and a test compares it with the mounted routers.
- **Decision records (F10.4).** 0002 to 0007.

## Testing

- `bash scripts/lint.sh`: clean.
- `cd backend && npm test`: 366 tests in 26 suites, all passing
  (was 329 in 23).
- `cd backend && npx tsc --noEmit -p tsconfig.test.json`: clean.
- `cd gemini-proxy && npm test`: 10 of 10.
- `cd frontend && npm run e2e`: 7 of 8 locally. The three new tests
  pass. `flujoPrincipal.spec.ts` (registration, not touched here)
  times out on its 5 s steps while `next dev` compiles cold, and
  passes once the pages are compiled.
- Each barrier and the contract test were seen failing by breaking
  their rule on purpose, then restored.

## Not verified

- Google login with a real account.
- Anything in production.

Step-by-step checks are in `docs/estado/por-probar.md`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```
