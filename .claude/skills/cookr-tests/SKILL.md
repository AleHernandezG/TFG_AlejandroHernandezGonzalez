---
name: cookr-tests
description: Escribir y ejecutar pruebas en Cookr (Jest + Supertest + mongodb-memory-server en el backend, Playwright para E2E). Úsala al añadir tests, montar la infraestructura de pruebas o engancharlas al CI.
---

# Pruebas en Cookr

## Estado actual

**El proyecto no tiene pruebas.** No existe Jest, Vitest, Playwright ni Cypress, ni un solo `*.test.ts`. El CI solo ejecuta lint y typecheck.

Si la infraestructura aún no está, móntala con la sección «Bootstrap». Si ya está, ve directo a las convenciones.

## Bootstrap (solo la primera vez)

### Backend

```bash
cd backend
npm i -D jest ts-jest @types/jest supertest @types/supertest mongodb-memory-server
npx ts-jest config:init
```

`jest.config.js`:

```js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testMatch: ["**/tests/**/*.test.ts"],
};
```

`tests/setup.ts` levanta un Mongo efímero. **Nunca apuntes las pruebas a Atlas.**

```ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  for (const c of Object.values(mongoose.connection.collections)) await c.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
```

Scripts en `package.json`:

```json
"test": "jest",
"test:watch": "jest --watch",
"test:cov": "jest --coverage"
```

### E2E

```bash
cd frontend && npm i -D @playwright/test && npx playwright install --with-deps chromium
```

`baseURL: "http://localhost:3000"`. El E2E necesita el backend en `:4000`.

## Cómo escribir las pruebas

### API (Supertest)

Importa `app` desde `backend/src/app.ts`, **no** `server.ts` (ese abre el puerto).

```ts
import request from "supertest";
import app from "../src/app";

describe("POST /api/auth/registro", () => {
  it("rechaza un correo inválido", async () => {
    const res = await request(app)
      .post("/api/auth/registro")
      .send({ correo: "no-es-un-correo", contrasena: "Test1234." });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errores");
  });
});
```

`validarBody` devuelve `400 { error: "Datos inválidos", errores: [{ campo, mensaje }] }`. Los servicios lanzan `Object.assign(new Error(...), { status })` y el controlador lo convierte en ese status.

### Rutas autenticadas

Firma un JWT real con `firmarToken` de `src/lib/jwt.ts` y mándalo como `Bearer`. `JWT_SECRET` tiene que estar definida en el entorno de test.

```ts
const token = firmarToken({ id: usuario._id.toString(), rol: "usuario" });
await request(app).get("/api/despensa").set("Authorization", `Bearer ${token}`);
```

### Qué mockear siempre

Nunca dejes que una prueba llame a un servicio externo de verdad. Mockea con `jest.mock()`:

- `lib/email.ts` (Mailjet) — gasta cuota real.
- `services/chatService.ts` (Gemini) — gasta cuota y cuesta dinero.
- `services/imagenService.ts` (Pexels), `nutritionService.ts` (Edamam/USDA), `ingredientesService.ts` (Open Food Facts).

```ts
jest.mock("../src/lib/email", () => ({
  enviarEmailVerificacion: jest.fn().mockResolvedValue(undefined),
  enviarEmailRecuperacion: jest.fn().mockResolvedValue(undefined),
}));
```

Recuerda que `authService.registrarse` llama al envío de correo en modo *fire and forget* (`.catch()`), así que un fallo del mock no hace fallar el registro: aserta sobre la llamada al mock, no sobre la respuesta.

### Prioridad

Cubre primero lo que más duele si se rompe:

1. `authService` — registro, login, verificación de correo, tokens caducados.
2. `validadores.ts` — los esquemas Zod son baratos de probar y evitan regresiones.
3. Filtros del feed de recetas (alérgenos y dietas). Es la lógica con más reglas del proyecto.
4. Cálculo de raciones y macros.

Un usuario con alérgenos no debe ver recetas que los contengan: esa es la prueba con más valor de todo el proyecto, porque es un requisito de salud.

## Ejecutar

```bash
cd backend && npm test
cd backend && npm test -- tests/auth.test.ts          # un fichero
cd backend && npm test -- -t "rechaza un correo"      # un caso
cd frontend && npx playwright test
cd frontend && npx playwright test --ui
```

## CI

`.github/workflows/ci-cd.yml` **no ejecuta tests todavía**. Al añadirlos, mete el paso en el job `ci-backend` después del typecheck:

```yaml
      - name: Tests
        run: npm test
        env:
          JWT_SECRET: test-secret-solo-para-ci
```

El job `deploy` depende de `[ci-frontend, ci-backend]`, así que un test en rojo bloquea el despliegue a Render automáticamente.
