# Plan post-auditoría — Cookr

Trabajo pendiente derivado de la auditoría del 15-16 de julio de 2026. Cada fase indica **qué**, **por qué va en ese orden** y **cómo se comprueba que está hecha**.

Contexto del proyecto: `CLAUDE.md` en la raíz.
Skills disponibles: `/cookr-endpoint`, `/cookr-tests`, `/cookr-memoria`.

---

## Cómo usar este documento con Claude

**No pegues este fichero en el chat.** Está en el repo: Claude lo lee solo. Pegarlo duplica en contexto algo que ya está en disco y gasta tokens sin aportar nada.

El prompt correcto es apuntar a la ruta y decir qué fase quieres:

```
Lee PLAN_AUDITORIA.md y ejecuta la Fase 1 completa.
```

Una fase por sesión, o incluso una tarea por sesión si es larga. Al terminar cada fase:

```
Marca en PLAN_AUDITORIA.md las tareas de la Fase 1 como hechas y haz commit.
```

Reglas para que salga bien:

- **Una fase por conversación.** Mezclar fases llena el contexto y baja la calidad.
- **Invoca la skill que toque.** Si la tarea añade rutas o endpoints, `/cookr-endpoint`. Si son pruebas, `/cookr-tests`. Si tocas la memoria en LaTeX, `/cookr-memoria`.
- **No pidas "haz todo el plan".** Son semanas de trabajo, no cabe en una sesión.
- Si una sesión se alarga, `/compact` y sigue.

Comprobación tras el reinicio: escribe `/` y confirma que aparecen las tres skills `cookr-*`. Si no salen, revisa que existe `.claude/skills/<nombre>/SKILL.md`.

---

## Fase 0 — Solo puedes hacerla tú

> **A falta de decisión (16/07/2026).** Todo lo del dominio está parado a la espera de decidir si se compra. Mientras siga parado, la Fase 3 no se puede cerrar: los cambios de código sí se pueden hacer, la verificación de entrega no.
>
> Descartado ya: cambiar `SENDER_EMAIL` a un `@gmail.com` **no arregla nada** (es lo que hoy recomienda `.env.example` y es justo lo que produce el bug). Mailjet firma DKIM con su dominio, no con el tuyo, así que DMARC no alinea ni con `usal.es` ni con `gmail.com`. La diferencia es solo la política: `usal.es` publica `p=quarantine` (descarte seguro) y `gmail.com` `p=none` (sin acción obligatoria, pero los filtros de Microsoft lo mandan a spam igual por parecer spoofing). Cambiar de proveedor tampoco: Brevo, SendGrid y Postmark aplican las mismas reglas, porque son de SPF/DKIM/DMARC, no de Mailjet.
>
> Única alternativa gratuita que sí pasa DMARC: **Gmail API por HTTPS con OAuth2** (sale de Google como `gmail.com` auténtico, y al ser REST no le afecta el bloqueo SMTP de Render). Se descartó por el riesgo: con la pantalla de consentimiento en *Testing* los refresh tokens caducan a los 7 días y el envío moriría en silencio a mitad de curso.

- [x] **~~Cambiar la contraseña de `alejesP@gmail.com`~~ — descartado, no aplica.** No era la contraseña de un buzón: era un **usuario de prueba de la propia app** (`// Cuenta de prueba activa para login`), de una cuenta de correo inexistente usada solo en desarrollo local. No existe en la base de datos de producción, así que no hay nada que rotar. Queda pendiente borrar la línea de `.env.example` (Fase 1), que ya no es riesgo sino higiene: una credencial en claro en un fichero de ejemplo es una mancha gratuita si el tribunal lee el repo.
- [ ] **Comprar un dominio** (5-12 €/año en Cloudflare Registrar, Porkbun o Namecheap). Por ejemplo `cookr.app`.
- [ ] **Autenticar el dominio en Mailjet**: *Account → Senders & Domains → Add a domain*. Añade en tu DNS el registro DKIM (TXT) y el SPF que te dé.
- [ ] **Publicar DMARC propio**: TXT en `_dmarc.tudominio` con `v=DMARC1; p=none; rua=mailto:alejes@usal.es`. Empieza en `p=none` y endurece cuando lleguen los informes.
- [ ] **Definir `SENDER_EMAIL=noreply@tudominio` en las variables de entorno de Render.**

**Por qué:** enviar como `@usal.es` a través de Mailjet falla DMARC (la USAL publica `p=quarantine`) y Outlook lo descarta en silencio. No es un problema de código: sin un dominio propio con SPF y DKIM alineados no hay arreglo posible, con ninguna librería ni proveedor.

---

## Fase 1 — Seguridad

**Por qué primero:** es riesgo activo y son cambios pequeños que no dependen de nada más. Lo barato y urgente va antes que lo caro.

- [x] **Quitar la credencial de `backend/.env.example`.** Hecho. Eran las líneas 46-48 (`// alejesP@gmail.com - Alej1234.`), usuario de prueba local que no existe en producción (ver Fase 0).
- [x] **Limitar por IP el login.** Hecho en `middlewares/rateLimitAuth.ts` con `express-rate-limit` v8, enganchado en `auth.routes.ts` sobre `/login` (10 intentos / 15 min), `/registro`, `/recuperar-contrasena` y `/verificar-email/reenviar` (5 / hora cada una). El login usa `skipSuccessfulRequests`, así que solo cuentan los fallos y un usuario legítimo no se autobloquea.
- [x] **`app.set("trust proxy", 1)` en producción** (`app.ts`). **No estaba en el plan y sin esto lo anterior es peor que nada**: detrás del proxy de Render, `req.ip` sería la IP del proxy y los 10 intentos serían un cupo global compartido por todo el mundo. Los 10 primeros fallos de cualquiera dejarían a todos los demás fuera. Solo se activa en producción; en local no hay proxy y confiar en `X-Forwarded-For` lo haría falsificable.
- [x] **Arreglar `middlewares/rateLimitIA.ts`.** Hecho: purga de ventanas caducadas, como mucho una vez por minuto por limitador, sin timers. Sigue perdiéndose en cada redeploy, eso lo arregla Redis en la Fase 4.

**Ficheros:** `backend/.env.example`, `backend/src/routes/auth.routes.ts`, `backend/src/middlewares/rateLimitIA.ts`, `backend/src/middlewares/rateLimitAuth.ts` (nuevo), `backend/src/app.ts`.

**Comprobado (16/07/2026):** `npm run lint` en verde y las rutas ejercitadas de verdad contra la app levantada sin base de datos (`app.ts` no conecta a Mongo, la conexión vive en `server.ts`). Login: 400 con `RateLimit-Remaining` bajando de 9 a 0 y **429 en el intento 11**. Registro: **429 en el 6**. `/verificar-email` sin limitar tras 12 intentos, que es lo correcto. `trust proxy` = `1` con `NODE_ENV=production` y `false` sin él.

### Revisión de seguridad del cambio (16/07/2026)

Se pasó `/security-review` al diff. **Sin hallazgos** de severidad alta ni media. Lo que se trazó y descartó, por si vuelve la duda:

- **`trust proxy` no da alcance a nada más que al limitador.** El único consumidor de `req.ip` en `backend/src/` es el keyGenerator de `express-rate-limit`. No hay decisiones de auth por IP, ni sesión atada a IP, ni listas de permitidos. Tampoco hay cookies (`res.cookie` tiene cero usos: la auth es Bearer) ni redirecciones, así que `req.secure` y `req.protocol` no gobiernan nada que `trust proxy` pueda voltear.
- **`skipSuccessfulRequests` cuenta los fallos de verdad.** Era el único con potencial real de bypass: si un login fallido respondiera 200 con un cuerpo de error, el control no contaría nada y no protegería de nada. `authService.iniciarSesion` lanza `status = 401` tanto para usuario inexistente como para contraseña mala (`authService.ts:67` y `:79`) y `manejarError` lo respeta (`authController.ts:8`). Se cuentan. **Si algún día alguien "arregla" el login para devolver 200 con `{ ok: false }`, este control se vuelve inerte en silencio.** Es justo la clase de regresión que debe cazar un test de la Fase 2.
- **La purga de `rateLimitIA.ts` no permite saltarse la cuota.** El predicado de borrado es idéntico al que la ruta ya usa para dar la ventana por caducada, así que solo puede eliminar entradas que la siguiente petición habría reseteado igual. Nunca desaloja una ventana viva.

### Pendiente de la Fase 1 (queda abierto)

- [ ] **Verificar `trust proxy = 1` en el primer deploy a Render.** Asume **exactamente un salto de proxy**. Si Render pusiera más por delante, `req.ip` pasaría a ser una IP interna (`10.x`, `172.16-31.x`) compartida por todos y los cupos se fusionarían: volveríamos al cupo global que este cambio venía a evitar, y encima sin avisar.

  *Cómo se comprueba:* añade temporalmente `req.ip` y `req.ips` a la respuesta de `/api/health`, despliega, y compara con tu IP pública real (`curl ifconfig.me`). Si coinciden, `1` es correcto. Si `req.ip` sale como IP privada, sube el número de saltos hasta que cuadre y quita el añadido temporal de `/api/health`. Ojo: `trust proxy: true` no es la salida fácil, porque hace `X-Forwarded-For` falsificable y `express-rate-limit` v8 lo rechaza con `ERR_ERL_PERMISSIVE_TRUST_PROXY`.

- [ ] **Limitador en `/nueva-contrasena` y `/verificar-email`.** Son las dos rutas de `auth.routes.ts` que consumen token y se quedaron sin limitar. **No es urgente y no es una vulnerabilidad**: los tokens son `crypto.randomBytes(32).toString("hex")` (`authService.ts:38`, `:153`, `:264`), 256 bits de entropía, adivinarlos por fuerza bruta es inviable aunque les dejes intentarlo un millón de veces. Lo que se gana es defensa en profundidad y no comerse una consulta a Mongo por cada intento basura.

  *Cómo se arregla:* dos exports más en `middlewares/rateLimitAuth.ts` reusando `limitarPorIP`, generosos (del orden de 20/hora, que son rutas que un usuario legítimo toca una o dos veces), y engancharlos en `auth.routes.ts` delante de `validarBody`. Diez minutos.

---

## Fase 2 — Pruebas

**Por qué aquí y no al final:** son la red de seguridad de todo lo que viene después. Los refactors de la Fase 4 (unificar el manejo de errores, meter Redis) tocan código que hoy no tiene ni una prueba: sin tests no sabrías si los rompes. **Tests antes de refactorizar, no después.**

Y al margen del orden técnico: un TFG de Ingeniería Informática sin una sola prueba es el hueco más visible que tiene el proyecto.

Usa `/cookr-tests`, que ya no lleva bootstrap: la infraestructura está montada y la skill describe las convenciones de la suite que existe.

- [x] **Montar la infraestructura**: Jest + ts-jest + Supertest + mongodb-memory-server. Hecho. `jest.config.js`, `tsconfig.test.json` (los tests viven fuera del `rootDir` de `tsconfig.json`, por eso necesitan el suyo) y `tests/setup.ts`, que levanta un Mongo efímero por fichero de test. Nunca toca Atlas.
- [x] **Mockear siempre los servicios externos.** Hecho con `jest.mock()` en cada fichero que lo necesita: `lib/email.ts` en los de auth, `imagenService.ts` y `nutritionService.ts` en los del feed. Ninguna prueba gasta cuota real de Gemini, Mailjet ni Pexels.
- [x] **Pruebas de `authService`** (`tests/auth.test.ts`, 27 casos): registro, hash de contraseña, correo duplicado, login, cuenta sin verificar, cuenta de Google sin contraseña local, verificación de correo, token caducado, token reutilizado, token del tipo equivocado, recuperación y vinculación de Google.
- [x] **Pruebas de los esquemas Zod** (`tests/validadores.test.ts`, 20 casos).
- [x] **Pruebas de los filtros de alérgenos del feed** (`tests/feed.alergenos.test.ts`, 8 casos). **Ojo: fijan el comportamiento actual, que no cumple el requisito.** Ver la Fase 2b, que es donde se arregla.
- [x] **Pruebas del rate limiting de la Fase 1** (`tests/rateLimitAuth.test.ts`, 8 casos). No estaban en el plan. Cierran la trampa que dejó anotada la revisión de seguridad: si alguien hace que el login responda 200 con un cuerpo de error, `skipSuccessfulRequests` deja de contar y el limitador se vuelve inerte **en silencio**. Ahora eso tumba 4 tests.
- [x] **Enganchar al CI** (`.github/workflows/ci-cd.yml`, job `ci-backend`, tras el typecheck). Hecho, con caché del binario de mongod (son ~80 MB por ejecución si no). El job `deploy` depende de `ci-backend`, así que un test en rojo bloquea el despliegue a Render.
- [ ] **Playwright para E2E** del flujo registro → login → crear receta. Lo único que queda de esta fase. Necesita frontend y backend levantados, así que es una sesión en sí mismo.

**Comprobado (17/07/2026):** `cd backend && npm test` → **75 tests en verde**, 5 suites, ~15 s. `npm run lint` y `tsc --noEmit -p tsconfig.test.json` también en verde.

Y, más importante, se comprobó que **fallan cuando deben**, que es lo único que convierte una suite en una red de seguridad:

- Invertir el `$nin` del filtro de alérgenos (`recetaRepository.ts:167`) tumba 5 de los 8 tests del feed.
- Hacer que el login devuelva 200 en vez de 401 con credenciales malas tumba 4 tests, incluido el del limitador. Es exactamente la regresión que la Fase 1 dejó anotada como peligrosa.

### Dos cambios en código de producción que hizo falta hacer

Ninguno cambia el comportamiento en producción, pero conviene saber por qué están:

- **`middlewares/rateLimitAuth.ts`: stores explícitos y `reiniciarLimitesAuth()`.** Los limitadores son estado global en memoria y agotaban el cupo entre tests, haciendo fallar tests que no tenían la culpa. `tests/setup.ts` los reinicia en cada `afterEach`. Se descartó la alternativa habitual (un `skip` por variable de entorno tipo `DISABLE_RATE_LIMIT`): un control de seguridad que se apaga con una variable es un pie de banco, porque basta con ponerla mal en Render para matar la protección sin que nadie se entere. Esta costura no desactiva nada, solo permite reiniciar.
- **`app.ts`: morgan callado cuando `NODE_ENV === "test"`.** Los logs de cada petición hacían ilegible la salida de `npm test`. La Fase 4 tiene su propia tarea sobre morgan (`"combined"` en producción); esto no la pisa.

---

## Fase 2b — Bugs que destaparon las pruebas

**Hecha el 17/07/2026.** Los tres arreglados y cubiertos por pruebas. La suite pasó de 63 a 75 casos: los 12 nuevos fallan contra el código anterior, comprobado revirtiendo `src/` y ejecutándolos.

**Por qué aquí:** los tres salieron al escribir la Fase 2 y ninguno es deuda técnica ni mejora, son cosas que hacen lo contrario de lo que dicen hacer. El primero incumple un requisito de salud. Van antes de la Fase 4 porque ahora ya hay pruebas que cubren la zona, que era justo el motivo de poner la Fase 2 antes que los refactors.

Los tres estaban verificados contra la app, no deducidos leyendo el código.

### 1. El feed no filtra por los alérgenos del perfil — [x] HECHO

**El bug.** El filtro de alérgenos sale **solo del query string** (`recetasController.ts:32-35`). `usuario.alergias` no se consulta en ninguna parte del feed, aunque el modelo lo tenga (`usuarioMongo.ts:60`) y el usuario lo haya rellenado al completar el perfil. Un celíaco registrado abre la home y ve recetas con cereales. Solo se filtra si el cliente manda el parámetro a mano, y el frontend únicamente manda lo que el usuario marca en el drawer (`recetasService.ts:29`).

Lo que hay hoy es un filtro de búsqueda, no una protección. La diferencia importa: el requisito es de salud, no una preferencia de navegación.

La incoherencia se ve mejor al lado de la despensa, que **sí** lee el perfil: `chatService.ts:450` saca `alergias` del perfil y se las pasa a Gemini como restricción dura. La app te protege cuando le pides una receta con lo que tienes en la nevera, pero no cuando haces scroll.

**El comportamiento que se quiere** (decidido el 16/07/2026). La regla, en una frase: **los alérgenos del perfil son un suelo, y el drawer solo puede añadir por encima.**

- Por defecto, en cada sesión, el feed filtra por los alérgenos del perfil que hay en la base de datos. Sin que el cliente tenga que pedirlo.
- Si el usuario toca el drawer de home o discover, esos alérgenos **se suman** a los del perfil para esa sesión. Nunca los sustituyen ni los quitan.
- La **única** forma de dejar de filtrar por un alérgeno es que el usuario lo quite de su perfil, y eso persiste en la base de datos y pasa a ser la nueva base por defecto.

O sea: `alergenosEfectivos = union(perfil.alergias, query.alergenos)`. Ningún control de la interfaz puede rebajar la protección; para eso hay que ir al perfil a propósito.

Esto tiene una consecuencia buena y gratis: **un drawer vacío deja de ser ambiguo.** Daba igual que `serializarFiltros` omita el parámetro cuando la lista está vacía (`recetasService.ts:29`), porque unir con el conjunto vacío devuelve el perfil. No hace falta ningún parámetro nuevo para distinguir «he desmarcado todo» de «no he tocado nada»: las dos cosas significan lo mismo, que se aplica el perfil.

**Dónde se toca.** El sitio correcto es el backend, no el frontend: si la protección depende de que el cliente se acuerde de mandar el parámetro, no es una protección. Con la regla actual del proyecto (la autenticación va en la ruta, y `optionalAuth` ya rellena `req.usuario` en `GET /recetas`), el feed resuelve los alérgenos así:

- Hay usuario autenticado → se filtra por la **unión** de sus alergias del perfil y las que venga en `alergenos`.
- No hay usuario → se filtra solo por lo que venga en `alergenos`, que es lo que hace hoy. Un visitante sin cuenta no tiene perfil del que tirar.

Ojo con dónde va esa lógica: `recetasController.ts` solo traduce el query string, y `recetaRepository` es quien toca Mongoose. Leer el perfil para decidir el filtro es una decisión de negocio, así que va en `recetasService.obtenerFeed`, que hoy es un passthrough al repositorio. Eso obliga a que el servicio consulte el usuario, cosa que hoy no hace ningún servicio de recetas. El repositorio ya sabe aplicar la lista (`$nin`), así que no hay que tocarlo: recibe la unión ya resuelta.

Aplícalo también a `GET /recetas/:id/similares` y a los `similares` que devuelve el detalle (`recetaRepository.findById` los calcula sin mirar alérgenos). No tiene sentido blindar el feed y luego colar la misma receta por el carrusel de «recetas parecidas».

**Consecuencia en el frontend que hay que resolver, no ignorar.** El drawer de filtros lista los alérgenos con toggles independientes (`drawerFiltros.tsx:55`). Con la regla de unión, si el perfil tiene `huevo` y el usuario lo desmarca en el drawer, **no pasa nada**: sigue filtrado. Un control que no hace lo que aparenta es peor que no tenerlo, así que el drawer tiene que enseñar los alérgenos del perfil como fijos (marcados y deshabilitados, con una pista del tipo «lo tienes en tu perfil» y un enlace a editarlo) y dejar togglear solo los demás. Si no, el usuario pensará que la app está rota.

Lo de «para esa sesión» sale gratis y no hay que construirlo: el backend es stateless (JWT, sin sesión de servidor) y el estado del drawer ya vive en el componente (`contenidoDiscover.tsx:42`), así que se pierde al recargar por sí solo. No inventes almacenamiento de sesión en el servidor para esto.

**Se comprueba:** `tests/feed.alergenos.test.ts` ya tiene el caso escrito y hoy **fija el comportamiento equivocado a propósito**, con un bloque de comentario que lo explica. Al arreglarlo:

- Dale la vuelta a `"el feed NO filtra por las alergias del perfil si el cliente no las manda"` y quita el bloque de comentario.
- Añade el caso de la unión, que es el que define la decisión: perfil `["huevo"]` + query `["lacteos"]` → no salen ni las de huevo ni las de lácteos.
- Añade el caso que impide la regresión peligrosa: perfil `["huevo"]` + query `["lacteos"]` **no** puede devolver recetas con huevo. Es la prueba de que el drawer no rebaja el suelo.
- Añade el del visitante anónimo, que no tiene perfil y solo filtra por query.
- Los 8 casos actuales del fichero deben seguir en verde: prueban el filtro por query, que sigue existiendo igual.

**Cómo quedó.** `recetasService` resuelve la unión en `resolverAlergenos()` y se la pasa ya hecha a `recetaRepository`, que no ha cambiado su forma de aplicarla (`$nin`). Lee el perfil por `usuarioRepository.obtenerAlergias()`, que es un `select("alergias").lean()`: el servicio no toca Mongoose, se respeta la capa. Los `similares` de `findById` y de `findSimilares` reciben el mismo filtro, así que el carrusel del detalle ya no cuela lo que el feed esconde.

En el frontend, `drawerFiltros.tsx` enseña los alérgenos del perfil marcados, con candado y deshabilitados, y un enlace a `/perfil` para cambiarlos.

Y un efecto secundario que no estaba previsto: `useHomeFeed.ts` mandaba `perfil?.alergias` a mano, pero **solo en el feed de recomendados**, no en el de «a quien sigues» ni al buscar. O sea que el filtro existía a medias y encima dependía de que `useMiPerfil()` hubiera cargado ya; mientras el perfil estaba en vuelo, mandaba la lista vacía. Ahora que el suelo lo pone el backend, ese parámetro sobra y se ha quitado: se acabó la ventana en la que un alérgico veía recetas con su alérgeno mientras cargaba el perfil.

**No olvides la memoria.** El Anexo I dice que el sistema filtra por alérgenos. Ahora el código lo cumple, pero conviene releer cómo está redactado el requisito para que describa la regla de unión.

### 2. `dietas` y `categoria` se pisan en el feed — [x] HECHO

**El bug.** `recetaRepository.findAll` escribe la misma clave dos veces sin `else`: `query["categorias"] = { $in: dietas }` en la línea 161 y `query["categorias"] = { $in: [categoria] }` en la 172. La segunda machaca a la primera.

**Verificado:** `?dietas=vegano&categoria=postre` devuelve una receta **no vegana**. El filtro de dieta desaparece sin error ni aviso. Para un vegano que navega por la categoría «postres», el resultado es que le aparecen postres con huevo y leche.

**El mismo patrón, dos líneas más abajo:** `excluirPropio` escribe `query["autorId"]` (línea 170) y `soloSiguiendo` lo vuelve a escribir (línea 182). Pedir las dos cosas a la vez pierde `excluirPropio`.

**Cómo quedó.** Componiendo en vez de asignando: se construye un objeto por campo y se escribe una sola vez.

Para `categorias` había que decidir entre `$in` y `$all`, y la respuesta no es la misma para los dos filtros. Dentro de `dietas` la relación es **O** (`?dietas=vegano,vegetariano` = cualquiera de las dos), pero entre `dietas` y `categoria` es **Y** (un vegano en «postres» quiere postres veganos, no todo lo vegano más todo lo dulce). Fundirlo todo en un `$in` daría la unión, que es más ancha que cualquiera de los dos filtros por separado: peor que el bug. Quedó `{ $in: dietas, $all: [categoria] }`, que Mongo evalúa como Y entre los dos operadores y O dentro del `$in`. Cada filtro por separado se comporta exactamente igual que antes.

Para `autorId`, `{ $ne: propio, $in: seguidos }` en el mismo objeto.

Cubre `tests/feed.filtros.test.ts` (fichero nuevo, 7 casos).

**Matiz honesto sobre `autorId`:** este medio bug no era alcanzable desde la API. `toggleSeguir` prohíbe seguirse a uno mismo, así que `$in: seguidos` ya excluía las recetas propias y perder el `$ne` no cambiaba nada de cara al usuario. Se ha arreglado igual porque la corrección es la misma y depender de un invariante que nada obliga a nivel de datos es frágil. El test que lo fija tiene que forzar el auto-seguimiento escribiendo en la base de datos.

### 3. El `.trim()` de los correos no hace nada — [x] HECHO

**El bug.** En `lib/validadores.ts`, todos los esquemas de correo son `z.string().email("Correo no válido").trim().toLowerCase()`. Zod aplica las comprobaciones en el orden en que se encadenan, así que **`.email()` valida antes de que `.trim()` recorte**. Un correo con espacios alrededor se rechaza en vez de limpiarse.

**Verificado:** `" alejandro@cookr.dev "` → `RECHAZADO` con «Correo no válido». El `.trim()` no llega a ejecutarse nunca para ese caso, así que está ahí sin hacer nada. El `.toLowerCase()` sí funciona, porque solo actúa sobre los correos que ya han pasado la validación.

Es menor pero se lo come el usuario final: copiar y pegar, y el autocompletado del teclado del móvil, meten espacios al final constantemente. Afecta al registro, al login, a la recuperación de contraseña y al reenvío de verificación, o sea a las cuatro puertas de entrada.

**Cómo quedó.** Reordenado a `.trim().toLowerCase().email("Correo no válido")` en los cinco esquemas. Sigue rechazando `"no-es-correo"`.

**Se comprueba:** en `tests/validadores.test.ts`, el test que documentaba el bug ahora afirma lo contrario (`"recorta los espacios alrededor del correo en vez de rechazarlo"`), y hay otro que comprueba que recorta y normaliza a minúsculas a la vez.

---

## Fase 3 — Correo

> **Bloqueada por la decisión del dominio (Fase 0).** No empezar hasta que esté decidido. Redactar `.env.example` o el `ReplyTo` sin saber el dominio final es escribir dos veces lo mismo. Lo único que se puede sacar de aquí sin dominio es borrar las dependencias muertas, y para eso no hace falta abrir esta fase.

**Por qué después de la 1 y la 2:** el código de aquí es menor. Lo que arregla el bug de verdad es la Fase 0, que depende de ti. Los cambios de código se pueden hacer ya, pero **la verificación final necesita el dominio comprado y con DNS propagado**.

- [ ] **Añadir `ReplyTo`** al payload de `lib/email.ts`: envías desde `noreply@tudominio` (pasa DMARC) y las respuestas van a `alejes@usal.es`. Mantiene el aspecto institucional sin romper nada.
- [ ] **Quitar el fallback `noreply@cookr.app`** de `SENDER_EMAIL`. Es un dominio que no controlas: si la variable falta, hoy falla en silencio. Mejor que reviente al arrancar con un error claro.
- [ ] **Actualizar `backend/.env.example`.** Ahora recomienda `SENDER_EMAIL=tucuenta@gmail.com`, que reproduce exactamente el bug. Debe pedir un dominio propio autenticado y explicar por qué.
- [ ] **Borrar las dependencias muertas**: `nodemailer`, `resend`, `@types/nodemailer`. No se importan en `src/`. Deja el comentario de que Render bloquea SMTP, para que nadie intente volver a ese camino.
- [ ] **Verificar de punta a punta**: registro con una cuenta `@hotmail.com` real y comprobar que llega a la bandeja de entrada. Contrasta en Mailjet (*Statistics → Message events*) que sale como `delivered` y no como `blocked`.

**Ficheros:** `backend/src/lib/email.ts`, `backend/.env.example`, `backend/package.json`.

---

## Fase 4 — Deuda técnica

**Por qué ahora:** son refactors sobre código sin pruebas hasta la Fase 2. Con los tests puestos, se pueden hacer sin miedo.

- [ ] **Unificar el manejo de errores.** Hoy hay tres patrones: `manejarError` **duplicado literalmente en los cuatro controladores**, try/catch inline en `chat.routes.ts`, y `manejadorErrores` global en `app.ts` que **nunca se ejecuta** y que además descarta `err.status` devolviendo siempre 500. El que está mal es el middleware global. Extrae `manejarError` a un módulo compartido y arregla o elimina el global.
- [ ] **Rate limit con Redis.** `UPSTASH_REDIS_URL` y `UPSTASH_REDIS_TOKEN` llevan en `.env` desde siempre **sin usarse en ninguna parte**. Era justo para esto: sobrevive a los redeploys y funciona con varias instancias.
- [ ] **Acotar `express.json({ limit: '10mb' })`.** Es global. Solo lo necesitas donde se sube imagen o ticket; en el resto es superficie de ataque gratis.
- [ ] **ESLint en el backend.** `npm run lint` del backend es `tsc --noEmit`, que es typecheck, no linting. El frontend sí tiene ESLint + Prettier + Husky.
- [ ] **Renombrar `buscarIngredientesEdamam` → `buscarIngredientesOpenFoodFacts`.** No llama a Edamam, llama a Open Food Facts. Edamam se usa en `nutritionService.ts`. El nombre engaña a cualquiera que lea el código, incluido un tribunal.
- [ ] **`morgan("combined")` en producción.** `"dev"` mete códigos de color ANSI en los logs de Render.
- [ ] **Arreglar las insignias del `README.md`.** Dicen Next 15 / React 19 / Express 5. Lo real es Next 14.2.35, React 18, Express 4.19. Si el tribunal las lee, es una inconsistencia gratuita.
- [ ] **Neutralizar los comentarios coloquiales** de `app.ts` ("Esto es pa mas seguridad", "Pa parsear").

---

## Fase 5 — Mejoras

**Por qué al final:** nada de esto está roto. Es valor añadido, y solo tiene sentido sobre una base con pruebas y sin deuda.

Técnicas, por retorno:

- [ ] **Índices en MongoDB** para el feed con filtros de alérgenos y dietas, y paginación por cursor en vez de offset.
- [ ] **Refresh tokens.** Hoy el JWT dura 7 días y no se puede revocar: si te roban uno, son 7 días de barra libre.
- [ ] **Webhooks de Mailjet** para registrar entregas y rebotes. Es lo que te habría avisado del problema de Hotmail meses antes.
- [ ] **Observabilidad**: Sentry o logs estructurados con `pino`.
- [ ] **Atlas Search** para búsqueda full-text de recetas.

Producto (las dos primeras ya están en el guion de la defensa):

- [ ] **Grupos por afinidad**: relacionar usuarios por alérgenos, dietas y gustos.
- [ ] **Subrecetas**: una receta que requiere varias preparaciones se divide (pizza casera = masa + pizza).
- [ ] **Planificador semanal de menús** y lista de la compra generada desde el menú y la despensa.
- [ ] **Despensa compartida** entre convivientes. Encaja con los grupos.

---

## Resumen del orden y su porqué

1. **Fase 0** (tú) — *a falta de decisión sobre el dominio.* Bloquea la Fase 3.
2. **Fase 1** — *hecha el 16/07/2026*, salvo dos flecos anotados al final de la fase: verificar los saltos de proxy en el primer deploy y limitar las dos rutas de token que faltan.
3. **Fase 2** — *hecha el 16/07/2026* salvo Playwright, que es lo único que queda. Red de seguridad para todo lo demás.
4. **Fase 2b** — *hecha el 17/07/2026*. Los tres bugs arreglados. 75 tests en verde y CI ejecutándolos.
5. **Fase 3** — **la siguiente**, aunque la verificación depende de la Fase 0.
6. **Fase 4** — refactors, ya cubiertos por las pruebas de la Fase 2.
7. **Fase 5** — mejoras, sobre una base sana.

La idea de fondo: **primero lo que sangra, luego la red de seguridad, luego lo que se apoya en ella.**

La Fase 2b es la prueba de que el orden funcionaba: los tres bugs llevaban meses en el repo y ninguno se vio en la auditoría leyendo código. Aparecieron al escribir pruebas que ejercitaban el comportamiento de verdad.
