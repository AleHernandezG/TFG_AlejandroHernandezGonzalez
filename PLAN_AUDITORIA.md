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

Usa `/cookr-tests`, que lleva el bootstrap completo y qué mockear.

- [ ] **Montar la infraestructura**: Jest + ts-jest + Supertest + mongodb-memory-server. Nunca contra Atlas.
- [ ] **Mockear siempre los servicios externos**: `lib/email.ts`, `chatService.ts`, `imagenService.ts`, `nutritionService.ts`, `ingredientesService.ts`. Una prueba jamás debe gastar cuota real de Gemini ni de Mailjet.
- [ ] **Pruebas de `authService`**: registro, login, verificación de correo, token caducado.
- [ ] **Pruebas de los esquemas Zod** (`lib/validadores.ts`). Baratas y evitan regresiones.
- [ ] **Prueba de los filtros de alérgenos del feed.** La más importante del proyecto: un usuario con alérgenos no puede ver recetas que los contengan. Es un requisito de salud, no una preferencia.
- [ ] **Enganchar al CI** (`.github/workflows/ci-cd.yml`, job `ci-backend`, tras el typecheck). El job `deploy` depende de él, así que un test en rojo bloqueará el despliegue a Render.
- [ ] **Playwright para E2E** del flujo registro → login → crear receta. Después de lo anterior.

**Se comprueba:** `cd backend && npm test` en verde y el CI ejecutando tests en el PR.

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
3. **Fase 2** — **la siguiente**. Red de seguridad para todo lo demás. Va antes de tocar nada.
4. **Fase 3** — código menor, pero la verificación depende de la Fase 0.
5. **Fase 4** — refactors, ya cubiertos por las pruebas de la Fase 2.
6. **Fase 5** — mejoras, sobre una base sana.

La idea de fondo: **primero lo que sangra, luego la red de seguridad, luego lo que se apoya en ella.**
