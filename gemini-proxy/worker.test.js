import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import worker from "./worker.js";

const TOKEN = "token-de-pruebas";
const env = { PROXY_TOKEN: TOKEN };
const fetchOriginal = globalThis.fetch;

let llamadas;

beforeEach(() => {
  llamadas = [];
  globalThis.fetch = async (url, opciones) => {
    llamadas.push({ url, opciones });
    return new Response("respuesta de google", { status: 200 });
  };
});

afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

function peticion(ruta, { cabeceras = {}, method = "GET", body } = {}) {
  return new Request(`https://gemini-proxy.ejemplo.workers.dev${ruta}`, {
    method,
    headers: cabeceras,
    body,
  });
}

const RUTA_MODELO = "/v1beta/models/gemini-3.6-flash:generateContent";

describe("gemini-proxy", () => {
  it("responde 500 sin salir a Google si falta PROXY_TOKEN", async () => {
    const res = await worker.fetch(peticion(RUTA_MODELO, { cabeceras: { "x-proxy-token": TOKEN } }), {});

    assert.equal(res.status, 500);
    assert.equal(llamadas.length, 0);
  });

  it("responde 403 sin cabecera x-proxy-token", async () => {
    const res = await worker.fetch(peticion(RUTA_MODELO), env);

    assert.equal(res.status, 403);
    assert.equal(llamadas.length, 0);
  });

  it("responde 403 con un token que no coincide", async () => {
    const res = await worker.fetch(peticion(RUTA_MODELO, { cabeceras: { "x-proxy-token": "otro" } }), env);

    assert.equal(res.status, 403);
    assert.equal(llamadas.length, 0);
  });

  for (const ruta of ["/v1/otra-cosa", "/v1beta/models", "/v1beta/files/abc"]) {
    it(`responde 404 a ${ruta} sin salir a Google`, async () => {
      const res = await worker.fetch(peticion(ruta, { cabeceras: { "x-proxy-token": TOKEN } }), env);

      assert.equal(res.status, 404);
      assert.equal(llamadas.length, 0);
    });
  }

  it("reenvía a Google con la ruta y la query intactas", async () => {
    const res = await worker.fetch(
      peticion(`${RUTA_MODELO}?alt=sse`, { cabeceras: { "x-proxy-token": TOKEN } }),
      env,
    );

    assert.equal(res.status, 200);
    assert.equal(llamadas.length, 1);
    assert.equal(llamadas[0].url, `https://generativelanguage.googleapis.com${RUTA_MODELO}?alt=sse`);
  });

  it("no le pasa a Google ni el token del proxy ni la IP del cliente", async () => {
    await worker.fetch(
      peticion(RUTA_MODELO, {
        cabeceras: {
          "x-proxy-token": TOKEN,
          "x-goog-api-key": "clave-de-gemini",
          "cf-connecting-ip": "203.0.113.9",
          "x-forwarded-for": "203.0.113.9",
          "x-real-ip": "203.0.113.9",
        },
      }),
      env,
    );

    const cabeceras = llamadas[0].opciones.headers;
    assert.equal(cabeceras.get("x-proxy-token"), null);
    assert.equal(cabeceras.get("cf-connecting-ip"), null);
    assert.equal(cabeceras.get("x-forwarded-for"), null);
    assert.equal(cabeceras.get("x-real-ip"), null);
    assert.equal(cabeceras.get("x-goog-api-key"), "clave-de-gemini");
  });

  it("reenvía el cuerpo de un POST tal cual", async () => {
    const cuerpo = JSON.stringify({ contents: [{ parts: [{ text: "hola" }] }] });

    await worker.fetch(
      peticion(RUTA_MODELO, { method: "POST", cabeceras: { "x-proxy-token": TOKEN }, body: cuerpo }),
      env,
    );

    const { method, body } = llamadas[0].opciones;
    assert.equal(method, "POST");
    assert.equal(new TextDecoder().decode(body), cuerpo);
  });

  it("no manda cuerpo en un GET", async () => {
    await worker.fetch(peticion(RUTA_MODELO, { cabeceras: { "x-proxy-token": TOKEN } }), env);

    assert.equal(llamadas[0].opciones.body, undefined);
  });
});
