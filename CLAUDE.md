# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Cookr: red social gastronómica con IA generativa. TFG del Grado en Ingeniería Informática (Universidad de Salamanca).

Monorepo con **tres unidades desplegables independientes**:

| Carpeta | Qué es | Dónde vive |
|---|---|---|
| `frontend/` | Cliente Next.js 14 (App Router) | Vercel |
| `backend/` | API REST Express + TypeScript | Render |
| `gemini-proxy/` | Cloudflare Worker que hace de proxy hacia la API de Gemini | Cloudflare |

`documentacion/` y `overleaf/` son la memoria en LaTeX. `presentacion/` es la defensa. `docs/` es documentación de desarrollo.

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
```

**Hay 80 tests unitarios en el backend** (Jest + ts-jest + Supertest + mongodb-memory-server, desde el 16/07/2026) y **2 E2E en el frontend** (Playwright, desde el 17/07/2026, en `frontend/e2e/`). El frontend no tiene tests unitarios. El CI ejecuta lint, typecheck y `npm test`; el job `deploy` depende de `ci-backend`, así que un test unitario en rojo bloquea el despliegue a Render. El job `e2e` corre aparte y **no** bloquea el deploy a propósito (los E2E son flaky).

Detalles en `/cookr-tests`. Lo que hay que saber antes de tocar nada:

- **`tsconfig.test.json` existe por un motivo.** `tsconfig.json` tiene `rootDir: ./src` e `include: ["src/**/*"]`, así que no puede compilar `tests/`. De ahí que `npm run lint` **no** typechequee los tests: de eso se encarga ts-jest al ejecutarlos, o `npx tsc --noEmit -p tsconfig.test.json` a mano.
- **`tests/setup.ts` levanta un Mongo efímero** por fichero, vacía las colecciones en cada `afterEach` y **reinicia los limitadores de auth**. Nunca apuntes las pruebas a Atlas.
- **Importa `app` de `src/app.ts`, nunca `server.ts`**: el segundo abre el puerto y conecta a Mongo de verdad.
- **Mockea siempre los servicios externos** (`lib/email.ts`, `chatService.ts`, `imagenService.ts`, `nutritionService.ts`, `ingredientesService.ts`). Ninguna prueba debe gastar cuota real de Gemini, Mailjet ni Pexels.

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

En el frontend, `drawerFiltros.tsx` enseña los alérgenos del perfil marcados y deshabilitados, con candado y enlace a `/perfil`. Si los dejas togglear, el control miente: el backend los aplica igual. `tests/feed.alergenos.test.ts` fija todo esto.

### Manejo de errores: tres patrones conviviendo

Conviene saberlo antes de tocar nada:

- Los controladores usan `manejarError(res, error)`.
- `routes/chat.routes.ts` hace try/catch inline y respeta `err.status`.
- `middlewares/errores.ts` (`manejadorErrores`, registrado en `app.ts`) **nunca llega a ejecutarse** porque todo se captura antes, y además descarta `err.status` devolviendo siempre 500.

Si unificas esto, hazlo a conciencia: el middleware global es el que está mal, no los otros dos.

### Gemini pasa por un proxy propio

`backend/src/services/chatService.ts` no llama a Google directamente si `GEMINI_BASE_URL` está definida: enruta por el Worker de `gemini-proxy/`, que reenvía a `generativelanguage.googleapis.com` autenticando con la cabecera `x-proxy-token`.

El servicio tiene dos protecciones propias: un tope diario de llamadas (`GEMINI_MAX_LLAMADAS_DIA`, por defecto 1000) y una caché en memoria del contexto de usuario. Modelo por defecto: `gemini-2.5-flash`.

### El correo va por HTTP, no por SMTP

`backend/src/lib/email.ts` usa la **API REST de Mailjet** (`https://api.mailjet.com/v3.1/send`) vía axios. Es deliberado: **Render bloquea los puertos de SMTP saliente**. No lo "arregles" migrando a nodemailer o SMTP, no funcionará en producción.

`nodemailer` y `resend` siguen en `package.json` pero **no se importan en `src/`**: son restos.

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
- Las insignias del `README.md` mienten: dicen Next 15 / React 19 / Express 5. Lo real es **Next 14.2.35, React 18, Express 4.19, Node ≥20**.

## Entorno

Plantillas en `backend/.env.example` y `frontend/.env.example`.

Backend: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `MAILJET_API_KEY`, `MAILJET_SECRET_KEY`, `SENDER_EMAIL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_BASE_URL`, `GEMINI_PROXY_TOKEN`, `PEXELS_API_KEY`, `EDAMAM_APP_ID`, `EDAMAM_APP_KEY`, `USDA_API_KEY`,
`GOOGLE_CLIENT_ID`.

`GOOGLE_CLIENT_ID` tiene que valer **lo mismo** en el backend y en el frontend: el backend lo usa
como `audience` al verificar el `id_token` de Google en `lib/googleAuth.ts`. Si falta, `POST /api/auth/google` responde 503 en vez de dejar pasar a nadie.

Frontend: `NEXT_PUBLIC_API_URL` (apunta a `/api` del backend), `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

## Despliegue

`push` a `main` → GitHub Actions comprueba FE y BE (lint + tipos) y, si pasa, dispara el deploy hook de Render. Vercel despliega el frontend por su propia integración con Git, al margen del workflow. `develop` solo ejecuta CI.

`scripts/keep-alive.sh` mantiene despierto el plan gratuito de Render antes de una demo.
