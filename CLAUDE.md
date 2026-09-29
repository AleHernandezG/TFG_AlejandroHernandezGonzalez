# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Cookr: red social gastronómica con IA generativa y asistente de cocina. Proyecto personal de producción (defensa de TFG completada con éxito).

Monorepo con **tres unidades desplegables independientes**:

| Carpeta | Qué es | Dónde vive |
|---|---|---|
| `frontend/` | Cliente Next.js 14 (App Router) | Vercel |
| `backend/` | API REST Express + TypeScript | Render |
| `gemini-proxy/` | Cloudflare Worker que hace de proxy hacia la API de Gemini | Cloudflare |

`docs/` es la documentación de desarrollo. Empieza siempre por `docs/README.md`, que es el índice.

La memoria en LaTeX, la presentación de la defensa y los documentos oficiales del TFG **no están en este repositorio**: viven un nivel por encima, en `4 Curso/`. No son código de Cookr y el `.gitignore` de la raíz los bloquea por si vuelven a aparecer aquí dentro.

## Comandos

```bash
# Desarrollo (desde la raíz, arranca FE :3000 y BE :4000 y libera puertos)
bash scripts/dev.sh

# O por separado
cd frontend && npm run dev     # Next.js con --turbo
cd backend  && npm run dev     # ts-node-dev con respawn

# Lint / typecheck de ambos
bash scripts/lint.sh

# Frontend
cd frontend && npm run lint    # next lint (ESLint real)
cd frontend && npx tsc --noEmit

# Backend  ── "npm run lint" es ESLint (src/) + tsc --noEmit, en ese orden.
cd backend && npm run lint     # eslint src && tsc --noEmit (no toca los tests)
cd backend && npm run lint:fix # eslint src --fix
cd backend && npm run build    # tsc → dist/

# Tests (solo backend)
cd backend && npm test
cd backend && npm test -- tests/auth.test.ts        # un fichero
cd backend && npm test -- -t "rechaza un correo"    # un caso
cd backend && npm run test:cov

# Datos de prueba
cd backend && npm run seed:completo        # dataset completo
cd backend && npm run seed:masivo          # dataset grande (llama a Pexels)
cd backend && npm run seed:masivo:sin-imagenes
cd backend && npm run limpiar:test

# Backend de pruebas manuales: Mongo efímero + claves reales de Cloudinary, Pexels, Edamam, USDA y Gemini.
# Bloquea MONGODB_URI y MAILJET_*. Sirve dist/, así que build primero. Gasta cuota real.
cd backend && npm run build && npm run pruebas:ui

# Mantenimiento de datos. Van contra el MONGODB_URI de backend/.env, que puede ser Atlas.
# En seco por defecto; escriben solo con "-- --apply" (sin el --, npm se come el argumento)
cd backend && npm run migrar:comentarios
cd backend && npm run recalcular:alergenos
cd backend && npm run recalcular:alergenos -- --apply    # copia previa en backend/respaldos/
```

**Hay 286 tests unitarios en el backend** (Jest + ts-jest + Supertest + mongodb-memory-server, desde el 16/07/2026) y **2 E2E en el frontend** (Playwright, desde el 17/07/2026, en `frontend/e2e/`). El frontend no tiene tests unitarios. El CI ejecuta lint, typecheck y `npm test`; el job `deploy` depende de `ci-backend`, así que un test unitario en rojo bloquea el despliegue a Render. El job `e2e` corre aparte y **no** bloquea el deploy a propósito (los E2E son flaky).

Detalles en `/cookr-tests`. Lo que hay que saber antes de tocar nada:

- **`tsconfig.test.json` existe por un motivo.** `tsconfig.json` tiene `rootDir: ./src` e `include: ["src/**/*"]`, así que no puede compilar `tests/`. De ahí que `npm run lint` **no** typechequee los tests: de eso se encarga ts-jest al ejecutarlos, o `npx tsc --noEmit -p tsconfig.test.json` a mano.
- **Hay un solo Mongo efímero para toda la ejecución**, que arranca `tests/globalSetup.ts`. `tests/setup.ts` conecta cada fichero a su propia base de datos (`test-<uuid>`), vacía las colecciones en cada `afterEach`, **reinicia los limitadores de auth** y borra la base al acabar. Antes cada fichero levantaba su propio servidor y en el CI dos workers se pisaban el puerto (`Port already in use`). Nunca apuntes las pruebas a Atlas.
- **Importa `app` de `src/app.ts`, nunca `server.ts`**: el segundo abre el puerto y conecta a Mongo de verdad.
- **Mockea siempre los servicios externos** (`lib/email.ts`, `lib/cloudinary.ts`, `chatService.ts`, `imagenService.ts`, `nutritionService.ts`, `ingredientesService.ts`). Ninguna prueba debe gastar cuota real de Gemini, Mailjet ni Pexels, ni borrar nada en Cloudinary: crear, editar y borrar recetas llama a `eliminarImagen`.

Dos cosas del código de producción que existen por los tests, para que nadie las borre pensando que sobran:

- `middlewares/rateLimitAuth.ts` exporta **`reiniciarLimitesAuth()`** y usa stores explícitos. Los limitadores son estado global en memoria: sin reiniciarlos, el cupo se agota entre tests y revientan tests que no tienen la culpa. No lo sustituyas por un `skip` con variable de entorno, que eso sí se puede apagar en producción por error.
- `app.ts` **calla a morgan cuando `NODE_ENV === "test"`**, o la salida de `npm test` es ilegible.

Ya **no** queda ningún test que fije comportamiento equivocado a propósito: los tres bugs que documentaban se arreglaron en la Fase 2b (17/07/2026) y los tests están del derecho.

## Arquitectura: lo que no se ve leyendo un solo fichero

### Doble token: NextAuth ≠ autenticación del backend

Esto es lo más importante de todo el proyecto y la fuente habitual de confusión.

Hay **dos sesiones distintas**:

1. La sesión de NextAuth (cookie del frontend), configurada en `frontend/src/lib/auth.ts`.
2. El JWT propio del backend Express (7 días), firmado en `backend/src/lib/jwt.ts`.

El JWT del backend viaja **dentro** del token de NextAuth como `session.user.backendToken`, y es el que autentica contra la API. Flujo:

- **Credenciales**: `authorize()` llama a `POST /api/auth/login` del backend, que devuelve el JWT → se guarda en el token de NextAuth.
- **Google**: el callback `jwt` llama a `POST /api/auth/google` con el `providerAccountId` para crear o recuperar el usuario y obtener el JWT del backend.

`frontend/src/services/apiClient.ts` es un axios pelado **sin interceptor**: cada llamada autenticada tiene que pasar la cabecera a mano.

```ts
apiClient.get("/recetas", { headers: { Authorization: `Bearer ${token}` } })
```

El `token` sale de `useSession()` → `session.user.backendToken`. Si añades un endpoint autenticado y olvidas la cabecera, el backend responde 401 aunque el usuario esté logueado en el frontend.

**Nunca metas un `data:` URI (base64) en el token de NextAuth.** Revienta la cookie de sesión y rompe el login. En `lib/auth.ts` hay filtros explícitos para esto: las fotos base64 viven en el perfil del backend, en la sesión solo van URLs `http(s)`.

Las rutas protegidas del cliente se declaran en el `matcher` de `frontend/src/middleware.ts` (`next-auth/middleware`). Una página nueva que requiera sesión hay que añadirla ahí.

### Backend: capas estrictas

```
routes/ → controllers/ → services/ → repositories/ → models/ (Mongoose)
```

Reglas que sigue el código actual:

- La **validación Zod va en la ruta**, con el middleware `validarBody(esquema)`. Los esquemas están en `lib/validadores.ts`. Los controladores no validan.
- La **autenticación va en la ruta**, con `requerirAuth` (`middlewares/autenticacion.ts`), que rellena `req.usuario`.
- Los **repositorios son los únicos que tocan Mongoose**. Los servicios no importan modelos.
- Los servicios lanzan errores con status embebido: `throw Object.assign(new Error("..."), { status: 503 })`.

### El filtro de alérgenos es un suelo, no un filtro de búsqueda

La regla, decidida en la Fase 2b y viva en `recetasService.resolverAlergenos()`:

```
alergenosEfectivos = union(perfil.alergias, query.alergenos)
```

Los alérgenos del perfil se aplican **siempre** al usuario autenticado, mande el cliente lo que mande. El drawer de filtros solo puede **sumar** por encima; la única forma de dejar de filtrar por uno es quitarlo del perfil. Un visitante anónimo no tiene perfil, así que solo se le aplica el query.

Es un requisito de salud, no una preferencia de navegación, y por eso vive en el backend: si dependiera de que el cliente se acuerde de mandar el parámetro, no sería una protección. **No lo muevas al frontend ni al controlador**, y no añadas un parámetro para "desactivar" el perfil.

Se aplica al feed y a los `similares` (los de `findById` y los de `findSimilares`). Si añades otra vía que devuelva recetas, pásale la unión también.

En el frontend, `drawerFiltros.tsx` enseña los alérgenos del perfil marcados y bloqueados, con candado y enlace a `/perfil`. Si los dejas togglear, el control miente: el backend los aplica igual. Van con `aria-disabled` y `aria-describedby`, no con `disabled`: un botón `disabled` sale del orden de tabulación y el lector de pantalla nunca llega a leer por qué está bloqueado. `tests/feed.alergenos.test.ts` fija todo esto.

El suelo solo protege si las recetas están bien etiquetadas, así que **el backend no se fía de los `alergenos` que manda el cliente**: al crear y editar guarda `alergenosDeReceta()`, que es lo declarado (filtrado a los 14 conocidos) más lo que detecta en los ingredientes. Solo suma, nunca quita. Para las recetas ya guardadas está `npm run recalcular:alergenos`.

El catálogo de ingredientes y el detector están **copiados** en `backend/src/lib/ingredientes.ts` y `frontend/src/config/ingredientes.ts`, porque los dos paquetes no comparten código. Si tocas uno, toca el otro: `tests/alergenos.deteccion.test.ts` transpila el del frontend y falla si detectan cosas distintas.

### Manejo de errores: un solo camino

Todo acaba en `manejarError(res, error)` de `middlewares/errores.ts`: los controladores, el try/catch de `routes/chat.routes.ts` y el middleware global `manejadorErrores`, registrado al final de `app.ts`, que delega en él.

- Respeta `err.status`. Un error con status devuelve su propio mensaje; uno sin status es un fallo no controlado y responde 500 con un mensaje genérico, sin filtrar el interno.
- El middleware global solo recibe lo que no pasa por un controlador, como los errores de `express.json` (cuerpo por encima del límite: 413).

`tests/errores.test.ts` y `tests/imagenes.test.ts` fijan este comportamiento. Si añades una ruta, lanza errores con status embebido y deja que `manejarError` responda; no montes otro formato de error.

### Gemini pasa por un proxy propio

`backend/src/services/chatService.ts` no llama a Google directamente si `GEMINI_BASE_URL` está definida: enruta por el Worker de `gemini-proxy/`, que reenvía a `generativelanguage.googleapis.com` autenticando con la cabecera `x-proxy-token`.

El servicio tiene dos protecciones propias: un tope diario de llamadas (`GEMINI_MAX_LLAMADAS_DIA`, por defecto 1000) y una caché en memoria del contexto de usuario. Modelo por defecto: `gemini-3.6-flash`. El `gemini-2.5-flash` de antes dejó de admitir claves nuevas en septiembre de 2026 y responde 404: si el chat falla con `no longer available`, lo primero es `GEMINI_MODEL`.

### El correo va por HTTP, no por SMTP

`backend/src/lib/email.ts` usa la **API REST de Mailjet** (`https://api.mailjet.com/v3.1/send`) vía axios. Es deliberado: **Render bloquea los puertos de SMTP saliente**. No lo "arregles" migrando a nodemailer o SMTP, no funcionará en producción.

`SENDER_EMAIL` es obligatoria: sin ella `enviarEmail` lanza un error que la nombra, y `server.ts` avisa al arrancar. También avisa (sin bloquear) si el remitente es de un dominio que no se puede autenticar, como `gmail.com` o `usal.es`. `REPLY_TO_EMAIL` es opcional: si está, el payload lleva `ReplyTo`.

Aviso de entrega: el remitente debe estar en un dominio con SPF y DKIM alineados en Mailjet. Enviar desde `@usal.es` o `@gmail.com` falla DMARC y Outlook/Hotmail lo descarta en silencio (Mailjet devuelve 200 igualmente).

### Frontend: organizado por features

```
src/features/<feature>/
  components/    Componentes de esa feature
  hooks/         Hooks de TanStack Query (useRecetasFeed, useCrearReceta...)
src/services/    Llamadas HTTP por dominio (recetasService, despensaService...)
src/stores/      Estado de UI con Zustand (chatStore...)
src/components/  UI compartida (shadcn/ui)
```

Separación de estado: **TanStack Query para estado de servidor, Zustand solo para UI**. Los hooks de `features/*/hooks/` envuelven a `services/*`; los componentes no llaman a `apiClient` directamente.

## Convenciones

**El dominio se nombra en español.** `recetas`, `despensa`, `usuarios`, `alergenos`, `enviarEmailVerificacion`, `buscarIngredientes`. Es la convención establecida en todo el repo: mantenla y no traduzcas identificadores existentes a inglés.

Los mensajes de commit sí van en inglés e imperativo.

## Trampas conocidas

- `services/ingredientesService.ts`: `buscarIngredientesEdamam()` **no llama a Edamam**, llama a Open Food Facts. Edamam se usa en `nutritionService.ts` (junto con USDA). El nombre es engañoso.
- `middlewares/rateLimitIA.ts` limita por usuario (`express-rate-limit`, ventana de 60 s) y hace `next()` cuando no hay `req.usuario`, así que **no protege rutas sin autenticar** (todas sus rutas llevan `requerirAuth` delante, así que en la práctica siempre hay usuario). El login se limita por otro middleware distinto, `rateLimitAuth.ts`, por IP; no los confundas.
- Los dos limitadores comparten store vía `lib/rateLimitStore.ts`: **Redis (Upstash) si `UPSTASH_REDIS_URL` y `UPSTASH_REDIS_TOKEN` están definidas, memoria si no.** El fallback en memoria se reinicia en cada redeploy; el de Redis sobrevive. `reiniciarLimitesAuth()` (que usa `tests/setup.ts`) reinicia todos los stores registrados.
- **`req.ip` no es la IP del usuario en Render.** Por delante hay Cloudflare y un balanceador interno, y con `trust proxy 1` `req.ip` sale `10.x`, que toma unos tres valores para toda la web (comprobado en producción el 29/09/2026). Por eso `rateLimitAuth.ts` cuenta con `ipDelCliente()` de `lib/ipCliente.ts`. Primero mira `x-client-ip`, pero solo si llega con `x-client-ip-token` igual a `CLIENT_IP_TOKEN`: lo manda NextAuth (`frontend/src/lib/ipCliente.ts`) en el login y en el de Google, que salen del servidor de Vercel y no del navegador. Si no, usa `cf-connecting-ip`, que es de fiar porque Cloudflare bloquea una falsa (error 1000); si Render deja de ir detrás de Cloudflare, deja de serlo y cualquiera puede rotarla. `req.ip` queda como último recurso. `trust proxy 1` se queda en `app.ts` para el paso 3; no lo subas pensando que arregla esto. Una llamada nueva a una ruta limitada que salga del servidor de Next tiene que llevar `...cabecerasIpCliente()` o todos sus usuarios compartirán cupo.
- Con `npm run dev`, abrir cualquier diálogo, *sheet* o *drawer* saca `Function components cannot be given refs` en `DialogOverlay` y compañía. Los componentes de `components/ui/` son de shadcn v4, pensados para React 19, y Cookr va con React 18. Solo sale en desarrollo y no rompe nada; quitarlo es pasar `components/ui/` a `forwardRef` o subir a React 19.
- Versiones reales: **Next 14.2.35, React 18, Express 4.19, Tailwind 4, Node ≥20**. Muchos ejemplos de shadcn y de la doc de Next ya asumen Next 15 y React 19: no los copies tal cual.

## Entorno

Plantillas en `backend/.env.example` y `frontend/.env.example`.

Backend: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `MAILJET_API_KEY`, `MAILJET_SECRET_KEY`, `SENDER_EMAIL` (obligatoria), `REPLY_TO_EMAIL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_BASE_URL`, `GEMINI_PROXY_TOKEN`, `PEXELS_API_KEY`, `EDAMAM_APP_ID`, `EDAMAM_APP_KEY`, `USDA_API_KEY`,
`GOOGLE_CLIENT_ID`, `CLIENT_IP_TOKEN`.

`GOOGLE_CLIENT_ID` tiene que valer **lo mismo** en el backend y en el frontend: el backend lo usa
como `audience` al verificar el `id_token` de Google en `lib/googleAuth.ts`. Si falta, `POST /api/auth/google` responde 503 en vez de dejar pasar a nadie.

`CLIENT_IP_TOKEN` también tiene que valer lo mismo en los dos lados. Si falta en cualquiera, nada se rompe, pero el login y el de Google vuelven a contar por la IP de Vercel (ver trampas). El backend avisa al arrancar en producción si no la tiene.

Frontend: `NEXT_PUBLIC_API_URL` (apunta a `/api` del backend), `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `CLIENT_IP_TOKEN` (solo servidor, nunca con `NEXT_PUBLIC_`).

## Despliegue

`push` a `main` → GitHub Actions comprueba FE y BE (lint + tipos) y, si pasa, dispara el deploy hook de Render. Vercel despliega el frontend por su propia integración con Git, al margen del workflow. `develop` solo ejecuta CI.

`scripts/keep-alive.sh` mantiene despierto el plan gratuito de Render antes de una demo.
