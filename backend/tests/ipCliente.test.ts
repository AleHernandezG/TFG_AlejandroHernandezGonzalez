jest.mock("../src/lib/email", () => ({
  enviarEmailVerificacion: jest.fn().mockResolvedValue(undefined),
  enviarEmailRecuperacion: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../src/lib/googleAuth", () => ({
  verificarIdTokenGoogle: jest.fn().mockRejectedValue(new Error("Invalid token signature")),
}));

import type { Request } from "express";
import request from "supertest";
import app from "../src/app";
import { ipDelCliente } from "../src/lib/ipCliente";

const TOKEN = "token-de-pruebas-del-frontend";
const IP_VERCEL = "76.76.21.21";

const tokenOriginal = process.env.CLIENT_IP_TOKEN;

afterEach(() => {
  if (tokenOriginal === undefined) delete process.env.CLIENT_IP_TOKEN;
  else process.env.CLIENT_IP_TOKEN = tokenOriginal;
});

function peticionFalsa(cabeceras: Record<string, string>, ip = "10.0.0.1"): Request {
  return { headers: cabeceras, ip, socket: { remoteAddress: ip } } as unknown as Request;
}

function recuperar(cabeceras: Record<string, string>) {
  return request(app)
    .post("/api/auth/recuperar-contrasena")
    .set(cabeceras)
    .send({ correo: "quien-sea@cookr.dev" });
}

function restantes(res: request.Response): number {
  return Number(res.headers["ratelimit-remaining"]);
}

describe("ipDelCliente", () => {
  it("usa cf-connecting-ip antes que req.ip", () => {
    const req = peticionFalsa({ "cf-connecting-ip": "203.0.113.7" });

    expect(ipDelCliente(req)).toBe("203.0.113.7");
  });

  it("cae a req.ip si no hay cf-connecting-ip", () => {
    expect(ipDelCliente(peticionFalsa({}, "10.0.0.9"))).toBe("10.0.0.9");
  });

  it("ignora una cf-connecting-ip que no es una IP", () => {
    const req = peticionFalsa({ "cf-connecting-ip": "no-soy-una-ip" }, "10.0.0.9");

    expect(ipDelCliente(req)).toBe("10.0.0.9");
  });

  it("acepta la IP reenviada por el frontend si el token coincide", () => {
    process.env.CLIENT_IP_TOKEN = TOKEN;
    const req = peticionFalsa({
      "cf-connecting-ip": IP_VERCEL,
      "x-client-ip": "198.51.100.4",
      "x-client-ip-token": TOKEN,
    });

    expect(ipDelCliente(req)).toBe("198.51.100.4");
  });

  it("ignora la IP reenviada si el token no coincide", () => {
    process.env.CLIENT_IP_TOKEN = TOKEN;
    const req = peticionFalsa({
      "cf-connecting-ip": IP_VERCEL,
      "x-client-ip": "198.51.100.4",
      "x-client-ip-token": "otro-token",
    });

    expect(ipDelCliente(req)).toBe(IP_VERCEL);
  });

  it("ignora la IP reenviada si el backend no tiene token configurado", () => {
    delete process.env.CLIENT_IP_TOKEN;
    const req = peticionFalsa({
      "cf-connecting-ip": IP_VERCEL,
      "x-client-ip": "198.51.100.4",
      "x-client-ip-token": "",
    });

    expect(ipDelCliente(req)).toBe(IP_VERCEL);
  });

  it("ignora una IP reenviada inválida aunque el token sea bueno", () => {
    process.env.CLIENT_IP_TOKEN = TOKEN;
    const req = peticionFalsa({
      "cf-connecting-ip": IP_VERCEL,
      "x-client-ip": "1.2.3.4, 5.6.7.8",
      "x-client-ip-token": TOKEN,
    });

    expect(ipDelCliente(req)).toBe(IP_VERCEL);
  });
});

describe("cupo de los limitadores de auth por cliente", () => {
  it("dos cf-connecting-ip distintas no comparten cupo", async () => {
    await recuperar({ "cf-connecting-ip": "203.0.113.1" });
    await recuperar({ "cf-connecting-ip": "203.0.113.1" });

    const otra = await recuperar({ "cf-connecting-ip": "203.0.113.2" });

    expect(restantes(otra)).toBe(4);
  });

  it("la misma cf-connecting-ip sí comparte cupo y acaba bloqueada", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await recuperar({ "cf-connecting-ip": "203.0.113.3" });
      expect(res.status).toBe(200);
    }

    const bloqueado = await recuperar({ "cf-connecting-ip": "203.0.113.3" });
    const libre = await recuperar({ "cf-connecting-ip": "203.0.113.4" });

    expect(bloqueado.status).toBe(429);
    expect(libre.status).toBe(200);
  });

  it("dos IPv6 de la misma subred comparten cupo", async () => {
    await recuperar({ "cf-connecting-ip": "2001:db8:abcd:12::1" });

    const vecina = await recuperar({ "cf-connecting-ip": "2001:db8:abcd:12::2" });

    expect(restantes(vecina)).toBe(3);
  });

  it("separa a los usuarios que llegan desde el servidor de Vercel con token válido", async () => {
    process.env.CLIENT_IP_TOKEN = TOKEN;
    const desdeVercel = (ip: string) => ({
      "cf-connecting-ip": IP_VERCEL,
      "x-client-ip": ip,
      "x-client-ip-token": TOKEN,
    });

    for (let i = 0; i < 10; i++) {
      await request(app).post("/api/auth/google").set(desdeVercel("198.51.100.10")).send({ idToken: `falso-${i}` });
    }

    const atacante = await request(app).post("/api/auth/google").set(desdeVercel("198.51.100.10")).send({ idToken: "falso" });
    const otroUsuario = await request(app).post("/api/auth/google").set(desdeVercel("198.51.100.11")).send({ idToken: "falso" });

    expect(atacante.status).toBe(429);
    expect(otroUsuario.status).toBe(401);
  });

  it("con un token falso cuenta por la IP de Vercel, no por la que dice la cabecera", async () => {
    process.env.CLIENT_IP_TOKEN = TOKEN;
    const falso = (ip: string) => ({
      "cf-connecting-ip": IP_VERCEL,
      "x-client-ip": ip,
      "x-client-ip-token": "me-lo-invento",
    });

    await recuperar(falso("198.51.100.20"));
    const rotando = await recuperar(falso("198.51.100.21"));

    expect(restantes(rotando)).toBe(3);
  });
});
