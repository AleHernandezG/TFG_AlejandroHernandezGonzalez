const mockSendMessage = jest.fn(async () => ({ text: "Diez minutos desde que rompe a hervir." }));
const mockChatsCreate = jest.fn(() => ({ sendMessage: mockSendMessage }));
const mockGenerateContent = jest.fn();

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn(() => ({
    chats: { create: mockChatsCreate },
    models: { generateContent: mockGenerateContent },
  })),
}));

import request from "supertest";
import app from "../src/app";
import { almacenIA } from "../src/lib/almacenIA";
import { crearUsuario, tokenDe } from "./helpers/factories";

const PREGUNTA = "¿Cuánto tiempo cuece un huevo duro?";

function claveContadorDeHoy(): string {
  return `ia:gemini:llamadas:${new Date().toISOString().slice(0, 10)}`;
}

async function preguntar(token: string, texto: string, extra: Record<string, unknown> = {}) {
  return request(app)
    .post("/api/chat")
    .set("Authorization", `Bearer ${token}`)
    .send({ mensajes: [{ rol: "user", texto }], ...extra });
}

async function tokenDeUsuario(datos: Parameters<typeof crearUsuario>[0] = {}) {
  const usuario = await crearUsuario(datos);
  return tokenDe(usuario as never);
}

describe("caché semántica de las dudas de cocina", () => {
  beforeAll(() => {
    process.env.GEMINI_API_KEY = "clave-de-prueba";
  });

  afterAll(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it("la segunda pregunta idéntica se sirve de la caché y no llama a Gemini", async () => {
    const token = await tokenDeUsuario({ correo: "cache1@cookr.dev" });

    const primera = await preguntar(token, PREGUNTA);
    const segunda = await preguntar(token, PREGUNTA);

    expect(primera.status).toBe(200);
    expect(segunda.status).toBe(200);
    expect(segunda.body.respuesta).toBe(primera.body.respuesta);
    expect(mockSendMessage).toHaveBeenCalledTimes(1);
  });

  it("el acierto de caché tampoco gasta cupo del tope diario", async () => {
    const token = await tokenDeUsuario({ correo: "cache2@cookr.dev" });

    await preguntar(token, PREGUNTA);
    await preguntar(token, PREGUNTA);

    expect(await almacenIA.leer<number>(claveContadorDeHoy())).toBe(1);
  });

  it("la normalización iguala mayúsculas, tildes, signos y espacios de sobra", async () => {
    const token = await tokenDeUsuario({ correo: "cache3@cookr.dev" });

    await preguntar(token, PREGUNTA);
    await preguntar(token, "  cuanto tiempo   cuece un HUEVO duro ");

    expect(mockSendMessage).toHaveBeenCalledTimes(1);
  });

  it("no confunde dos preguntas que solo se diferencian en el orden de las palabras", async () => {
    const token = await tokenDeUsuario({ correo: "cache4@cookr.dev" });

    await preguntar(token, "¿Puedo sustituir mantequilla por aceite?");
    await preguntar(token, "¿Puedo sustituir aceite por mantequilla?");

    expect(mockSendMessage).toHaveBeenCalledTimes(2);
  });

  it("dos perfiles distintos no comparten respuesta aunque pregunten lo mismo", async () => {
    const conAlergia = await tokenDeUsuario({ correo: "alergico@cookr.dev", alergias: ["huevo"] });
    const sinAlergia = await tokenDeUsuario({ correo: "sinalergia@cookr.dev" });

    await preguntar(conAlergia, PREGUNTA);
    await preguntar(sinAlergia, PREGUNTA);

    expect(mockSendMessage).toHaveBeenCalledTimes(2);
  });

  it("una conversación con historial no se cachea: el contexto de la charla manda", async () => {
    const token = await tokenDeUsuario({ correo: "cache5@cookr.dev" });

    const conversacion = {
      mensajes: [
        { rol: "user", texto: "Tengo arroz y pollo" },
        { rol: "model", texto: "Puedes hacer un arroz con pollo" },
        { rol: "user", texto: PREGUNTA },
      ],
    };

    await request(app).post("/api/chat").set("Authorization", `Bearer ${token}`).send(conversacion);
    await request(app).post("/api/chat").set("Authorization", `Bearer ${token}`).send(conversacion);

    expect(mockSendMessage).toHaveBeenCalledTimes(2);
  });

  it("una pregunta muy larga no entra en la caché", async () => {
    const token = await tokenDeUsuario({ correo: "cache6@cookr.dev" });
    const larga = `${PREGUNTA} ${"y con qué lo acompaño ".repeat(12)}`.slice(0, 260);

    await preguntar(token, larga);
    await preguntar(token, larga);

    expect(mockSendMessage).toHaveBeenCalledTimes(2);
  });

  it("una pregunta con imagen nunca se cachea", async () => {
    const token = await tokenDeUsuario({ correo: "cache7@cookr.dev" });
    const imagenBase64 = "data:image/jpeg;base64,QUJD";

    await preguntar(token, PREGUNTA, { imagenBase64 });
    await preguntar(token, PREGUNTA, { imagenBase64 });

    expect(mockSendMessage).toHaveBeenCalledTimes(2);
  });
});
