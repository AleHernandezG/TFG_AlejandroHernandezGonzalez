jest.mock("../src/lib/email", () => ({
  enviarEmailVerificacion: jest.fn().mockResolvedValue(undefined),
  enviarEmailRecuperacion: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../src/lib/googleAuth", () => ({
  verificarIdTokenGoogle: jest.fn().mockRejectedValue(new Error("Invalid token signature")),
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

describe("limitador del login con Google", () => {
  it("corta al intento 11 tras 10 tokens invalidos desde la misma IP", async () => {
    for (let i = 0; i < 10; i++) {
      const res = await request(app).post("/api/auth/google").send({ idToken: `falso-${i}` });
      expect(res.status).toBe(401);
    }

    const bloqueado = await request(app).post("/api/auth/google").send({ idToken: "falso-11" });

    expect(bloqueado.status).toBe(429);
  });

  it("no comparte cupo con el limitador del login", async () => {
    await crearUsuario({ correo: "aparte@cookr.dev", cuentaVerificada: true });

    for (let i = 0; i < 10; i++) {
      await request(app).post("/api/auth/google").send({ idToken: `falso-${i}` });
    }

    const login = await request(app)
      .post("/api/auth/login")
      .send({ correo: "aparte@cookr.dev", contrasena: CONTRASENA_VALIDA });

    expect(login.status).toBe(200);
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

describe.each([
  ["/verificar-email", {}],
  ["/nueva-contrasena", { contrasena: "ClaveNueva123" }],
])("limitador de %s", (ruta, extra) => {
  const intentar = (i: number) =>
    request(app)
      .post(`/api/auth${ruta}`)
      .send({ token: `intento-${i}`, ...extra });

  it("corta al intento 21 tras 20 tokens inválidos desde la misma IP", async () => {
    for (let i = 0; i < 20; i++) {
      const res = await intentar(i);
      expect(res.status).toBe(400);
    }

    const bloqueado = await intentar(20);

    expect(bloqueado.status).toBe(429);
    expect(bloqueado.body.error).toMatch(/Vuelve a probar en una hora/);
  });

  it("empieza con el cupo entero aunque el test anterior lo agotara", async () => {
    const res = await intentar(0);

    expect(res.status).toBe(400);
    expect(Number(res.headers["ratelimit-remaining"])).toBe(19);
  });
});

describe("limitadores de las rutas de token", () => {
  it("no comparten cupo entre sí", async () => {
    for (let i = 0; i < 20; i++) {
      await request(app).post("/api/auth/verificar-email").send({ token: `intento-${i}` });
    }

    const res = await request(app)
      .post("/api/auth/nueva-contrasena")
      .send({ token: "intento-0", contrasena: "ClaveNueva123" });

    expect(res.status).toBe(400);
    expect(Number(res.headers["ratelimit-remaining"])).toBe(19);
  });
});
