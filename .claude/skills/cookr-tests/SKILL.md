---
name: cookr-tests
description: Escribir y ejecutar pruebas en Cookr (Jest + Supertest + mongodb-memory-server en el backend, Playwright para E2E aún pendiente). Úsala al añadir tests, arreglarlos o engancharlos al CI.
---

# Pruebas en Cookr

## Estado actual (16/07/2026)

**La infraestructura ya está montada. No la vuelvas a crear.** 63 tests en 4 suites, solo en el backend.

| Fichero | Qué cubre |
|---|---|
| `tests/auth.test.ts` | Registro, login, verificación, recuperación, Google OAuth (27 casos) |
| `tests/validadores.test.ts` | Esquemas Zod de `lib/validadores.ts` (20 casos) |
| `tests/rateLimitAuth.test.ts` | Limitadores de la Fase 1 (8 casos) |
| `tests/feed.alergenos.test.ts` | Filtros de alérgenos del feed (8 casos) |
| `tests/setup.ts` | Mongo efímero, limpieza, reinicio de limitadores |
| `tests/helpers/factories.ts` | `crearUsuario`, `crearReceta`, `tokenDe`, tokens de verificación y recuperación |

**El frontend no tiene ni un test, y no hay E2E.** Playwright sigue pendiente (Fase 2 de `PLAN_AUDITORIA.md`).

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

## Algunos tests fijan comportamiento que está MAL, a propósito

`feed.alergenos.test.ts` y un caso de `validadores.test.ts` documentan bugs reales en vez de comprobar que el código acierta. Llevan un bloque de comentario que lo explica y están descritos en la **Fase 2b de `PLAN_AUDITORIA.md`**.

Si arreglas el bug, **dale la vuelta al test**: no lo "arregles" para que vuelva a pasar en verde, que es justo lo contrario de lo que documenta.

## E2E con Playwright (pendiente, no existe todavía)

```bash
cd frontend && npm i -D @playwright/test && npx playwright install --with-deps chromium
```

`baseURL: "http://localhost:3000"`. Necesita el backend levantado en `:4000` y una base de datos de verdad, así que no se apoya en nada de lo de arriba: `mongodb-memory-server` solo sirve para el proceso de Jest del backend. Flujo objetivo: registro → login → crear receta.

Ojo con dos cosas del proyecto al montarlo: el registro exige verificar el correo antes de poder entrar (`authService.iniciarSesion` lanza 403 si no), así que el E2E tendrá que verificar la cuenta por la vía que sea (leer el token de la colección `tokens` o marcar `cuentaVerificada` a mano); y el limitador de registro corta a los 5 por IP y hora, que en local es la misma IP siempre.

## Prioridad de lo que falta

Por lo que más duele si se rompe:

1. Filtros del feed más allá de los alérgenos (dietas, dificultad, paginación, `sort`). Es la lógica con más reglas del proyecto y ahí ya apareció un bug de claves que se pisan.
2. Cálculo de raciones y macros.
3. Permisos de recetas: editar y borrar la de otro debe dar 403 (`recetaRepository.ts:599` y `:642`).
4. E2E con Playwright: registro → login → crear receta.

## CI

`.github/workflows/ci-cd.yml`, job `ci-backend`, ejecuta `npm test` tras el typecheck, con caché del binario de mongod. El job `deploy` depende de `ci-backend`, así que **un test en rojo bloquea el despliegue a Render**.
