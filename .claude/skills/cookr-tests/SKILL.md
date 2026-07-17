---
name: cookr-tests
description: Escribir y ejecutar pruebas en Cookr (Jest + Supertest + mongodb-memory-server en el backend, Playwright para E2E en el frontend). Úsala al añadir tests, arreglarlos o engancharlos al CI.
---

# Pruebas en Cookr

## Estado actual (17/07/2026)

**La infraestructura ya está montada. No la vuelvas a crear.** 80 tests en 6 suites, solo en el backend.

| Fichero | Qué cubre |
|---|---|
| `tests/auth.test.ts` | Registro, login, verificación, recuperación, Google OAuth (27 casos) |
| `tests/validadores.test.ts` | Esquemas Zod de `lib/validadores.ts` (21 casos) |
| `tests/rateLimitAuth.test.ts` | Limitadores de la Fase 1 (8 casos) |
| `tests/feed.alergenos.test.ts` | Alérgenos del feed: query, perfil y la unión de ambos (12 casos) |
| `tests/feed.filtros.test.ts` | `dietas` × `categoria` y `excluirPropio` × `soloSiguiendo` (7 casos) |
| `tests/upstashStore.test.ts` | El store de Redis del rate limiting, contra un Redis falso (5 casos) |
| `tests/setup.ts` | Mongo efímero, limpieza, reinicio de limitadores |
| `tests/helpers/factories.ts` | `crearUsuario`, `crearReceta`, `tokenDe`, tokens de verificación y recuperación |

**El frontend no tiene tests unitarios**, pero **sí hay E2E con Playwright** desde el 17/07/2026: `frontend/e2e/`, dos casos (registro → verificación → login → crear receta, y el rechazo de login sin verificar). Detalle abajo.

## Ejecutar

```bash
cd backend && npm test
cd backend && npm test -- tests/auth.test.ts          # un fichero
cd backend && npm test -- -t "rechaza un correo"      # un caso
cd backend && npm run test:cov
cd backend && npx tsc --noEmit -p tsconfig.test.json  # typecheck de los tests
```

`npm run lint` **no** typechequea los tests: `tsconfig.json` tiene `rootDir: ./src`. De eso se encarga ts-jest al ejecutarlos, o el comando de arriba.

## Cómo escribir las pruebas

### Usa las factorías

`tests/helpers/factories.ts` crea usuarios y recetas ya válidos contra el esquema de Mongoose. Crear un usuario por HTTP para luego probar otra cosa es lento (bcrypt) y gasta cupo del limitador de registro sin necesidad.

```ts
import { crearUsuario, crearReceta, tokenDe, CONTRASENA_VALIDA } from "./helpers/factories";

const usuario = await crearUsuario({ correo: "a@cookr.dev", alergias: ["huevo"] });
await crearReceta({ titulo: "Tortilla", autorId: usuario._id as never, alergenos: ["huevo"] });
```

### API (Supertest)

Importa `app` desde `backend/src/app.ts`, **no** `server.ts` (ese abre el puerto y conecta a Mongo de verdad).

```ts
import request from "supertest";
import app from "../src/app";

const res = await request(app).post("/api/auth/registro").send({ correo: "no-es-un-correo" });
expect(res.status).toBe(400);
expect(res.body).toHaveProperty("errores");
```

`validarBody` devuelve `400 { error: "Datos inválidos", errores: [{ campo, mensaje }] }`. Los servicios lanzan `Object.assign(new Error(...), { status })` y el controlador lo convierte en ese status.

### Rutas autenticadas

`tokenDe(usuario)` firma un JWT real. `JWT_SECRET` la pone `tests/setup.ts`.

```ts
await request(app).get("/api/despensa").set("Authorization", `Bearer ${tokenDe(usuario as never)}`);
```

### Qué mockear siempre

Ninguna prueba debe gastar cuota real. Mockea **antes de los imports**, que `jest.mock` se hoistea pero los imports del módulo bajo prueba se evalúan al importarlo:

```ts
jest.mock("../src/lib/email", () => ({
  enviarEmailVerificacion: jest.fn().mockResolvedValue(undefined),
  enviarEmailRecuperacion: jest.fn().mockResolvedValue(undefined),
}));
```

- `lib/email.ts` (Mailjet) en cualquier test de auth.
- `services/imagenService.ts` (Pexels) y `nutritionService.ts` (Edamam/USDA) en cualquier test que **cree** recetas: `recetaRepository.crear` llama a los dos.
- `services/chatService.ts` (Gemini) y `ingredientesService.ts` (Open Food Facts) donde apliquen.

`authService.registrarse` manda el correo en *fire and forget* (`.catch()`), así que un fallo del mock no rompe el registro. Aserta sobre la llamada al mock, y espera al microtask antes:

```ts
await new Promise((r) => setImmediate(r));
expect(mockVerificacion).toHaveBeenCalledWith("nuevo@cookr.dev", "Alejandro", expect.any(String));
```

## Trampas de esta suite

- **Los limitadores son estado global en memoria.** `tests/setup.ts` llama a `reiniciarLimitesAuth()` en cada `afterEach`. Si escribes un test que hace muchos logins o registros y ves 429 inesperados, es eso. No borres esa llamada ni el export de `rateLimitAuth.ts`.
- **Jest aísla los módulos por fichero**, así que los limitadores y sus cupos no se filtran entre ficheros, pero sí entre tests del mismo fichero sin el reinicio.
- **morgan está callado** con `NODE_ENV === "test"` (`app.ts`). Si lo quitas, la salida de `npm test` se vuelve ilegible.
- **Mongo se levanta por fichero de test**, no por proceso. Añadir ficheros cuesta segundos, no décimas.

## Lo que fija `feed.alergenos.test.ts`, y por qué no se toca a la ligera

Los alérgenos del perfil son un **suelo**: `alergenosEfectivos = union(perfil.alergias, query.alergenos)`. El query solo suma, nunca resta. Vive en `recetasService.resolverAlergenos()` y es un requisito de salud, no una preferencia de navegación.

Si un caso de ese fichero se pone en rojo, la sospecha por defecto es que has rebajado la protección, no que el test esté anticuado. El caso `"el query no puede rebajar el suelo del perfil"` existe justo para eso.

Ya **no** queda ningún test que fije comportamiento equivocado a propósito: los tres bugs que documentaban se arreglaron en la Fase 2b (17/07/2026) y los tests están del derecho.

## E2E con Playwright

```bash
cd frontend && npm run e2e            # todo el flujo, headless
cd frontend && npm run e2e:ui         # modo interactivo
cd frontend && npm run e2e:report     # abre el último informe HTML
```

No hace falta arrancar nada a mano: `playwright.config.ts` levanta los dos servidores con `webServer` y los tumba al acabar.

**Cómo está montado, y por qué así:**

- **La base de datos es `mongodb-memory-server`, no Atlas.** `backend/scripts/servidorE2E.js` arranca un Mongo efímero en el puerto 27018 y carga **`dist/app.js`**, no `server.ts`. Esto es deliberado: `app.ts` no importa `dotenv`, así que el proceso E2E **nunca ve** `backend/.env` con las credenciales reales. Encima el script aborta al arrancar si detecta `MONGODB_URI`, `PEXELS_API_KEY`, `EDAMAM_*`, `USDA_API_KEY`, `GEMINI_API_KEY` o `MAILJET_*` en el entorno. Verificado que rechaza tanto Atlas como una clave real de Pexels.
- **`reuseExistingServer: false` a propósito, también en local.** Si tienes `npm run dev` corriendo, su backend está conectado a Atlas. Reutilizarlo lanzaría el E2E contra producción. Prefiero que Playwright falle por puerto ocupado. Si te pasa, cierra el `dev` antes de correr el E2E.
- **Los servicios externos no se mockean, se dejan sin clave.** Pexels, Edamam y USDA devuelven `null` si les falta la suya, así que crear una receta funciona sin foto ni macros y sin gastar cuota. El correo de Mailjet lanza, pero `registrarse` lo captura (fire and forget) y el token de verificación queda igualmente en la base.

**La verificación del correo se hace de verdad, no por atajo.** `e2e/helpers/bd.ts` se conecta al Mongo efímero, lee el token de la colección `tokens` y el test navega a `/verificar-email?token=...` como haría el enlace del email. Nada de marcar `cuentaVerificada` a mano.

**Trampas al escribir selectores** (las tres las pisé montándolo):

- El campo de contraseña y su botón de "Mostrar contraseña" comparten nombre accesible. Usa `getByLabel('Contraseña', { exact: true })`.
- La unidad del ingrediente es un `<select>`, no un input: `selectOption`, no `fill`.
- `coleccion/page.tsx` monta `ContenidoColeccion` **dos veces** (una `lg:hidden`, otra `hidden lg:flex`). `getByText(titulo)` casa con la copia oculta también; filtra con `{ visible: true }`.

El limitador de registro corta a los 5 por IP y hora, y en local siempre es la misma IP. Con dos tests por corrida no molesta, pero si añades muchos casos que registran, tenlo en cuenta: el limitador se reinicia solo al rearrancar el servidor E2E, que Playwright hace en cada `npm run e2e`.

## Prioridad de lo que falta

Por lo que más duele si se rompe:

1. Lo que queda de los filtros del feed: `dificultad`, paginación y `sort` (`reciente`, `likes`, `score`). `dietas` y `categoria` ya están cubiertos en `feed.filtros.test.ts`, pero el resto no, y es la lógica con más reglas del proyecto: ahí ya aparecieron dos bugs de claves que se pisaban.
2. Cálculo de raciones y macros.
3. Permisos de recetas: editar y borrar la de otro debe dar 403 (`recetaRepository.ts:599` y `:642`).

## CI

`.github/workflows/ci-cd.yml`:

- **`ci-backend`** ejecuta `npm test` tras el typecheck, con caché del binario de mongod. El job `deploy` depende de él, así que **un test unitario en rojo bloquea el despliegue a Render**.
- **`e2e`** ejecuta Playwright con caché del binario de mongod y de los navegadores, y sube el informe HTML como artifact si falla. **No** está en el `needs` de `deploy`: un E2E flaky no debe cortarte un hotfix. Si aguanta en verde una temporada, se promueve a bloqueante metiéndolo en ese `needs`.
