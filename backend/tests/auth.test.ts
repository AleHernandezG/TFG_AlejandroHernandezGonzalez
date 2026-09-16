jest.mock("../src/lib/email", () => ({
  enviarEmailVerificacion: jest.fn().mockResolvedValue(undefined),
  enviarEmailRecuperacion: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../src/lib/googleAuth", () => ({
  verificarIdTokenGoogle: jest.fn(),
}));

import request from "supertest";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import app from "../src/app";
import { Usuario } from "../src/models/usuarioMongo";
import { Token } from "../src/models/tokenMongo";
import { enviarEmailVerificacion, enviarEmailRecuperacion } from "../src/lib/email";
import { verificarIdTokenGoogle } from "../src/lib/googleAuth";
import {
  crearUsuario,
  crearTokenVerificacion,
  crearTokenRecuperacion,
  CONTRASENA_VALIDA,
} from "./helpers/factories";

const mockVerificacion = enviarEmailVerificacion as jest.Mock;
const mockRecuperacion = enviarEmailRecuperacion as jest.Mock;
const mockVerificarGoogle = verificarIdTokenGoogle as jest.Mock;

const identidadGoogle = (parcial: Partial<{
  googleId: string;
  correo: string;
  correoVerificado: boolean;
  nombre: string;
  foto: string;
}> = {}) => ({
  googleId: "g-1",
  correo: "ana@gmail.com",
  correoVerificado: true,
  nombre: "Ana",
  ...parcial,
});

describe("POST /api/auth/registro", () => {
  it("crea el usuario sin verificar y manda el correo de verificación", async () => {
    const res = await request(app).post("/api/auth/registro").send({
      nombre: "Alejandro",
      correo: "nuevo@cookr.dev",
      contrasena: CONTRASENA_VALIDA,
    });

    expect(res.status).toBe(201);

    const usuario = await Usuario.findOne({ correo: "nuevo@cookr.dev" });
    expect(usuario).not.toBeNull();
    expect(usuario!.cuentaVerificada).toBe(false);
    expect(usuario!.proveedor).toBe("local");

    // fire and forget: el envío no bloquea la respuesta, hay que esperar al microtask
    await new Promise((r) => setImmediate(r));
    expect(mockVerificacion).toHaveBeenCalledWith("nuevo@cookr.dev", "Alejandro", expect.any(String));
  });

  it("nunca guarda la contraseña en claro", async () => {
    await request(app).post("/api/auth/registro").send({
      nombre: "Alejandro",
      correo: "hash@cookr.dev",
      contrasena: CONTRASENA_VALIDA,
    });

    const usuario = await Usuario.findOne({ correo: "hash@cookr.dev" }).select("+contrasena");
    expect(usuario!.contrasena).not.toBe(CONTRASENA_VALIDA);
    expect(await bcrypt.compare(CONTRASENA_VALIDA, usuario!.contrasena!)).toBe(true);
  });

  it("rechaza un correo ya registrado con 409", async () => {
    await crearUsuario({ correo: "repe@cookr.dev" });

    const res = await request(app).post("/api/auth/registro").send({
      nombre: "Otro",
      correo: "repe@cookr.dev",
      contrasena: CONTRASENA_VALIDA,
    });

    expect(res.status).toBe(409);
  });

  it("rechaza datos inválidos con 400 y el detalle por campo", async () => {
    const res = await request(app).post("/api/auth/registro").send({
      nombre: "Alejandro",
      correo: "no-es-un-correo",
      contrasena: CONTRASENA_VALIDA,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errores");
    expect(res.body.errores[0]).toMatchObject({ campo: "correo" });
  });
});

describe("POST /api/auth/login", () => {
  it("devuelve token y usuario con credenciales correctas", async () => {
    await crearUsuario({ correo: "ok@cookr.dev", cuentaVerificada: true });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: "ok@cookr.dev", contrasena: CONTRASENA_VALIDA });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.usuario.correo).toBe("ok@cookr.dev");
  });

  it("nunca devuelve la contraseña en la respuesta", async () => {
    await crearUsuario({ correo: "ok2@cookr.dev", cuentaVerificada: true });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: "ok2@cookr.dev", contrasena: CONTRASENA_VALIDA });

    expect(JSON.stringify(res.body)).not.toContain("contrasena");
  });

  // Este 401 es lo que hace que `skipSuccessfulRequests` del limitador cuente los fallos.
  // Si alguien "arregla" el login para responder 200 con un cuerpo de error,
  // el rate limit de la Fase 1 se vuelve inerte en silencio.
  it("responde 401 con contraseña incorrecta", async () => {
    await crearUsuario({ correo: "mal@cookr.dev", cuentaVerificada: true });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: "mal@cookr.dev", contrasena: "OtraCosa123" });

    expect(res.status).toBe(401);
  });

  it("responde 401 con un usuario que no existe", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: "fantasma@cookr.dev", contrasena: CONTRASENA_VALIDA });

    expect(res.status).toBe(401);
  });

  it("no distingue usuario inexistente de contraseña mala", async () => {
    await crearUsuario({ correo: "existe@cookr.dev", cuentaVerificada: true });

    const malaContrasena = await request(app)
      .post("/api/auth/login")
      .send({ correo: "existe@cookr.dev", contrasena: "OtraCosa123" });
    const noExiste = await request(app)
      .post("/api/auth/login")
      .send({ correo: "fantasma2@cookr.dev", contrasena: "OtraCosa123" });

    expect(malaContrasena.body).toEqual(noExiste.body);
  });

  it("responde 403 si la cuenta no está verificada", async () => {
    await crearUsuario({ correo: "sinverificar@cookr.dev", cuentaVerificada: false });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: "sinverificar@cookr.dev", contrasena: CONTRASENA_VALIDA });

    expect(res.status).toBe(403);
  });

  it("responde 401 a una cuenta de Google que no tiene contraseña local", async () => {
    await Usuario.create({
      nombre: "Google User",
      correo: "google@cookr.dev",
      proveedor: "google",
      googleId: "g-1",
      cuentaVerificada: true,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: "google@cookr.dev", contrasena: CONTRASENA_VALIDA });

    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/verificar-email", () => {
  it("verifica la cuenta y marca el token como usado", async () => {
    const usuario = await crearUsuario({ cuentaVerificada: false });
    const token = await crearTokenVerificacion(usuario._id as Types.ObjectId);

    const res = await request(app).post("/api/auth/verificar-email").send({ token: token.token });

    expect(res.status).toBe(200);
    expect((await Usuario.findById(usuario._id))!.cuentaVerificada).toBe(true);
    expect((await Token.findById(token._id))!.usado).toBe(true);
  });

  it("rechaza un token caducado con 400 y no verifica la cuenta", async () => {
    const usuario = await crearUsuario({ cuentaVerificada: false });
    const token = await crearTokenVerificacion(usuario._id as Types.ObjectId, {
      expira: new Date(Date.now() - 1000),
    });

    const res = await request(app).post("/api/auth/verificar-email").send({ token: token.token });

    expect(res.status).toBe(400);
    expect((await Usuario.findById(usuario._id))!.cuentaVerificada).toBe(false);
  });

  it("rechaza un token inexistente con 400", async () => {
    const res = await request(app).post("/api/auth/verificar-email").send({ token: "no-existe" });
    expect(res.status).toBe(400);
  });

  it("no permite reutilizar un token ya usado", async () => {
    const usuario = await crearUsuario({ cuentaVerificada: false });
    const token = await crearTokenVerificacion(usuario._id as Types.ObjectId);

    await request(app).post("/api/auth/verificar-email").send({ token: token.token });
    const segundo = await request(app).post("/api/auth/verificar-email").send({ token: token.token });

    expect(segundo.status).toBe(400);
  });

  it("no acepta un token de recuperación para verificar el correo", async () => {
    const usuario = await crearUsuario({ cuentaVerificada: false });
    const token = await crearTokenRecuperacion(usuario._id as Types.ObjectId);

    const res = await request(app).post("/api/auth/verificar-email").send({ token: token.token });

    expect(res.status).toBe(400);
    expect((await Usuario.findById(usuario._id))!.cuentaVerificada).toBe(false);
  });
});

describe("POST /api/auth/nueva-contrasena", () => {
  it("cambia la contraseña, invalida el token y permite entrar con la nueva", async () => {
    const usuario = await crearUsuario({ correo: "reset@cookr.dev", cuentaVerificada: true });
    const token = await crearTokenRecuperacion(usuario._id as Types.ObjectId);

    const res = await request(app)
      .post("/api/auth/nueva-contrasena")
      .send({ token: token.token, contrasena: "NuevaClave99" });

    expect(res.status).toBe(200);
    expect((await Token.findById(token._id))!.usado).toBe(true);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ correo: "reset@cookr.dev", contrasena: "NuevaClave99" });
    expect(login.status).toBe(200);
  });

  it("rechaza un token de recuperación caducado y deja la contraseña vieja", async () => {
    const usuario = await crearUsuario({ correo: "reset2@cookr.dev", cuentaVerificada: true });
    const token = await crearTokenRecuperacion(usuario._id as Types.ObjectId, {
      expira: new Date(Date.now() - 1000),
    });

    const res = await request(app)
      .post("/api/auth/nueva-contrasena")
      .send({ token: token.token, contrasena: "NuevaClave99" });

    expect(res.status).toBe(400);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ correo: "reset2@cookr.dev", contrasena: CONTRASENA_VALIDA });
    expect(login.status).toBe(200);
  });

  it("no acepta un token de verificación para cambiar la contraseña", async () => {
    const usuario = await crearUsuario({ cuentaVerificada: true });
    const token = await crearTokenVerificacion(usuario._id as Types.ObjectId);

    const res = await request(app)
      .post("/api/auth/nueva-contrasena")
      .send({ token: token.token, contrasena: "NuevaClave99" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/recuperar-contrasena", () => {
  it("responde igual exista o no la cuenta, para no filtrar quién está registrado", async () => {
    await crearUsuario({ correo: "existe3@cookr.dev" });

    const conCuenta = await request(app)
      .post("/api/auth/recuperar-contrasena")
      .send({ correo: "existe3@cookr.dev" });
    const sinCuenta = await request(app)
      .post("/api/auth/recuperar-contrasena")
      .send({ correo: "fantasma3@cookr.dev" });

    expect(conCuenta.status).toBe(200);
    expect(sinCuenta.status).toBe(200);
    expect(conCuenta.body).toEqual(sinCuenta.body);
  });

  it("solo manda el correo cuando la cuenta existe", async () => {
    await request(app).post("/api/auth/recuperar-contrasena").send({ correo: "fantasma4@cookr.dev" });
    await new Promise((r) => setImmediate(r));
    expect(mockRecuperacion).not.toHaveBeenCalled();
  });

  it("no genera token de recuperación para una cuenta de Google sin contraseña", async () => {
    await Usuario.create({
      nombre: "Google User",
      correo: "google2@cookr.dev",
      proveedor: "google",
      googleId: "g-2",
      cuentaVerificada: true,
    });

    const res = await request(app)
      .post("/api/auth/recuperar-contrasena")
      .send({ correo: "google2@cookr.dev" });

    expect(res.status).toBe(200);
    expect(await Token.countDocuments({ tipo: "recuperacion" })).toBe(0);
  });
});

describe("POST /api/auth/google", () => {
  beforeEach(() => {
    mockVerificarGoogle.mockReset();
  });

  it("responde 401 con un idToken invalido y no crea ni modifica ningun usuario", async () => {
    await crearUsuario({ correo: "victima@cookr.dev" });
    mockVerificarGoogle.mockRejectedValue(new Error("Invalid token signature"));

    const res = await request(app).post("/api/auth/google").send({ idToken: "esto-no-es-un-token" });

    expect(res.status).toBe(401);
    expect(res.body.token).toBeUndefined();

    expect(await Usuario.countDocuments()).toBe(1);
    const victima = await Usuario.findOne({ correo: "victima@cookr.dev" });
    expect(victima!.googleId).toBeUndefined();
    expect(victima!.proveedor).toBe("local");
  });

  it("responde 400 si no llega idToken, sin llamar a Google", async () => {
    const res = await request(app).post("/api/auth/google").send({
      googleId: "g-suplantador",
      correo: "victima@cookr.dev",
    });

    expect(res.status).toBe(400);
    expect(mockVerificarGoogle).not.toHaveBeenCalled();
  });

  it("responde 401 si Google dice que el correo no esta verificado", async () => {
    mockVerificarGoogle.mockResolvedValue(
      identidadGoogle({ correo: "sinverificar@gmail.com", correoVerificado: false }),
    );

    const res = await request(app).post("/api/auth/google").send({ idToken: "token-sin-verificar" });

    expect(res.status).toBe(401);
    expect(await Usuario.countDocuments()).toBe(0);
  });

  it("saca la identidad del token verificado y no del cuerpo de la peticion", async () => {
    await crearUsuario({ correo: "victima@cookr.dev" });
    mockVerificarGoogle.mockResolvedValue(
      identidadGoogle({ googleId: "g-real", correo: "ana@gmail.com" }),
    );

    const res = await request(app).post("/api/auth/google").send({
      idToken: "token-de-ana",
      googleId: "g-suplantador",
      correo: "victima@cookr.dev",
      nombre: "Suplantador",
    });

    expect(res.status).toBe(200);
    expect(res.body.usuario.correo).toBe("ana@gmail.com");

    const victima = await Usuario.findOne({ correo: "victima@cookr.dev" });
    expect(victima!.googleId).toBeUndefined();
    expect(victima!.nombre).not.toBe("Suplantador");
  });

  it("crea la cuenta ya verificada la primera vez", async () => {
    mockVerificarGoogle.mockResolvedValue(
      identidadGoogle({ googleId: "g-nuevo", correo: "nuevo-google@gmail.com", nombre: "Ana" }),
    );

    const res = await request(app).post("/api/auth/google").send({ idToken: "token-nuevo" });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");

    const usuario = await Usuario.findOne({ correo: "nuevo-google@gmail.com" });
    expect(usuario!.cuentaVerificada).toBe(true);
    expect(usuario!.proveedor).toBe("google");
    expect(usuario!.nombre).toBe("Ana");
  });

  it("vincula el googleId a una cuenta local con el mismo correo, sin duplicarla", async () => {
    await crearUsuario({ correo: "local@cookr.dev" });
    mockVerificarGoogle.mockResolvedValue(
      identidadGoogle({ googleId: "g-vinculado", correo: "local@cookr.dev" }),
    );

    const res = await request(app).post("/api/auth/google").send({ idToken: "token-local" });

    expect(res.status).toBe(200);
    expect(await Usuario.countDocuments({ correo: "local@cookr.dev" })).toBe(1);
    expect((await Usuario.findOne({ correo: "local@cookr.dev" }))!.googleId).toBe("g-vinculado");
  });

  it("reutiliza la misma cuenta al repetir el login", async () => {
    mockVerificarGoogle.mockResolvedValue(
      identidadGoogle({ googleId: "g-repe", correo: "repe-google@gmail.com" }),
    );

    await request(app).post("/api/auth/google").send({ idToken: "token-repe" });
    await request(app).post("/api/auth/google").send({ idToken: "token-repe" });

    expect(await Usuario.countDocuments({ googleId: "g-repe" })).toBe(1);
  });
});

describe("POST /api/auth/completar-perfil", () => {
  it("rechaza sin token con 401", async () => {
    const res = await request(app)
      .post("/api/auth/completar-perfil")
      .send({ alergias: ["lacteos"], preferencias: [] });

    expect(res.status).toBe(401);
  });

  it("rechaza un token inválido con 401", async () => {
    const res = await request(app)
      .post("/api/auth/completar-perfil")
      .set("Authorization", "Bearer no-es-un-jwt")
      .send({ alergias: [], preferencias: [] });

    expect(res.status).toBe(401);
  });
});
