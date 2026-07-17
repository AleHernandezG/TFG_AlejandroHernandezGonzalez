jest.mock("../src/lib/email", () => ({
  enviarEmailVerificacion: jest.fn().mockResolvedValue(undefined),
  enviarEmailRecuperacion: jest.fn().mockResolvedValue(undefined),
}));

import request from "supertest";
import app from "../src/app";
import { crearUsuario, CONTRASENA_VALIDA } from "./helpers/factories";

describe("limitador del login", () => {
  it("corta al intento 11 tras 10 fallos", async () => {
    await crearUsuario({ correo: "victima@cookr.dev", cuentaVerificada: true });

    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ correo: "victima@cookr.dev", contrasena: "ClaveMala123" });
      expect(res.status).toBe(401);
    }

    const bloqueado = await request(app)
      .post("/api/auth/login")
      .send({ correo: "victima@cookr.dev", contrasena: "ClaveMala123" });

    expect(bloqueado.status).toBe(429);
  });

  it("no gasta cupo con los logins correctos (skipSuccessfulRequests)", async () => {
    await crearUsuario({ correo: "legitimo@cookr.dev", cuentaVerificada: true });

    for (let i = 0; i < 15; i++) {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ correo: "legitimo@cookr.dev", contrasena: CONTRASENA_VALIDA });
      expect(res.status).toBe(200);
    }
  });

  it("un usuario legítimo entra aunque otro haya fallado 9 veces desde la misma IP", async () => {
    await crearUsuario({ correo: "legitimo2@cookr.dev", cuentaVerificada: true });

    for (let i = 0; i < 9; i++) {
      await request(app)
        .post("/api/auth/login")
        .send({ correo: "legitimo2@cookr.dev", contrasena: "ClaveMala123" });
    }

    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: "legitimo2@cookr.dev", contrasena: CONTRASENA_VALIDA });

    expect(res.status).toBe(200);
  });

  it("expone las cabeceras RateLimit estándar", async () => {
    await crearUsuario({ correo: "cabeceras@cookr.dev", cuentaVerificada: true });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: "cabeceras@cookr.dev", contrasena: "ClaveMala123" });

    expect(res.headers).toHaveProperty("ratelimit-remaining");
    expect(Number(res.headers["ratelimit-remaining"])).toBe(9);
  });
});

describe("limitador del registro", () => {
  it("corta al sexto registro desde la misma IP", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post("/api/auth/registro")
        .send({ nombre: "Alta", correo: `alta${i}@cookr.dev`, contrasena: CONTRASENA_VALIDA });
      expect(res.status).toBe(201);
    }

    const bloqueado = await request(app)
      .post("/api/auth/registro")
      .send({ nombre: "Alta", correo: "alta5@cookr.dev", contrasena: CONTRASENA_VALIDA });

    expect(bloqueado.status).toBe(429);
  });
});

describe("limitador de recuperación de contraseña", () => {
  it("corta a la sexta solicitud desde la misma IP", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post("/api/auth/recuperar-contrasena")
        .send({ correo: "quien-sea@cookr.dev" });
      expect(res.status).toBe(200);
    }

    const bloqueado = await request(app)
      .post("/api/auth/recuperar-contrasena")
      .send({ correo: "quien-sea@cookr.dev" });

    expect(bloqueado.status).toBe(429);
  });
});

// Flecos anotados al final de la Fase 1: estas dos rutas consumen token y se
// quedaron sin limitar. No es una vulnerabilidad (los tokens son de 256 bits),
// pero el test deja el hueco documentado en vez de en un comentario del plan.
describe("rutas de token sin limitar (pendiente de la Fase 1)", () => {
  it("/verificar-email sigue aceptando intentos más allá de cualquier cupo", async () => {
    for (let i = 0; i < 12; i++) {
      const res = await request(app)
        .post("/api/auth/verificar-email")
        .send({ token: `intento-${i}` });
      expect(res.status).toBe(400);
    }
  });

  it("/nueva-contrasena sigue aceptando intentos más allá de cualquier cupo", async () => {
    for (let i = 0; i < 12; i++) {
      const res = await request(app)
        .post("/api/auth/nueva-contrasena")
        .send({ token: `intento-${i}`, contrasena: "ClaveNueva123" });
      expect(res.status).toBe(400);
    }
  });
});
