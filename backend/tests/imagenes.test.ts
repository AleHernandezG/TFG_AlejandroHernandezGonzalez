jest.mock("../src/services/imagenService", () => ({
  buscarFotoPexels: jest.fn(),
  buscarFotoPexelsCascada: jest.fn(),
}));

jest.mock("../src/services/nutritionService", () => ({
  calcularMacros: jest.fn(async () => ({ calorias: 100, proteinas: 1, carbos: 1, grasas: 1 })),
}));

jest.mock("../src/services/chatService", () => ({
  escanearTicket: jest.fn(async () => []),
  generarRecetaDesdeTexto: jest.fn(),
  responderChat: jest.fn(),
  recetaConDespensa: jest.fn(),
  invalidarContextoUsuario: jest.fn(),
}));

jest.mock("../src/lib/cloudinary", () => ({
  cloudinaryConfigurado: jest.fn(() => true),
  firmarSubida: jest.fn(() => ({
    url: "https://api.cloudinary.com/v1_1/cookr-test/image/upload",
    campos: { api_key: "clave", signature: "firma", timestamp: "1", public_id: "id", overwrite: "true" },
  })),
  subirImagen: jest.fn(),
}));

import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import { Receta } from "../src/models/recetaMongo";
import { buscarFotoPexelsCascada } from "../src/services/imagenService";
import { escanearTicket } from "../src/services/chatService";
import { crearUsuario, tokenDe } from "./helpers/factories";

const URL_CLOUDINARY =
  "https://res.cloudinary.com/cookr/image/upload/v1/cookr/recetas/665f-1a2b3c4d.jpg";

function cuerpoReceta(extra: Record<string, unknown> = {}) {
  return {
    titulo: "Tarta de queso de prueba",
    descripcion: "Una descripción suficientemente larga para el esquema.",
    tiempo: 20,
    unidadTiempo: "min",
    porciones: 2,
    dificultad: "facil",
    dietas: [],
    alergenos: [],
    ingredientes: [{ nombre: "Queso", cantidad: "200", unidad: "g" }],
    pasos: [{ texto: "Un paso lo bastante largo como para valer." }],
    ...extra,
  };
}

async function token() {
  const usuario = await crearUsuario({ correo: "autor@cookr.dev" });
  return tokenDe(usuario as never);
}

describe("límite del cuerpo de las peticiones", () => {
  it("un cuerpo por encima del límite en /api/recetas responde 413 y no 500", async () => {
    const jwt = await token();

    const res = await request(app)
      .post("/api/recetas")
      .set("Authorization", `Bearer ${jwt}`)
      .set("Content-Type", "application/json")
      .send(JSON.stringify(cuerpoReceta({ descripcion: "x".repeat(200 * 1024) })));

    expect(res.status).toBe(413);
    expect(res.body.error).toBeTruthy();
  });

  it("/api/despensa sigue admitiendo la foto del ticket, que es mayor que ese límite", async () => {
    const jwt = await token();
    const imagenBase64 = `data:image/jpeg;base64,${"A".repeat(300 * 1024)}`;

    const res = await request(app)
      .post("/api/despensa/escanear-ticket")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ imagenBase64 });

    expect(res.status).not.toBe(413);
    expect(res.status).toBe(200);
    expect(escanearTicket).toHaveBeenCalled();
  });
});

describe("las recetas guardan la URL de la imagen, no la imagen", () => {
  it("acepta una URL https y la guarda tal cual", async () => {
    const jwt = await token();

    const res = await request(app)
      .post("/api/recetas")
      .set("Authorization", `Bearer ${jwt}`)
      .send(cuerpoReceta({ imagenUrl: URL_CLOUDINARY }));

    expect(res.status).toBe(201);

    const receta = await Receta.findById(res.body.id).lean();
    expect(receta?.imagenUrl).toBe(URL_CLOUDINARY);
    expect(buscarFotoPexelsCascada).not.toHaveBeenCalled();
  });

  it("rechaza una imagen incrustada con 400", async () => {
    const jwt = await token();

    const res = await request(app)
      .post("/api/recetas")
      .set("Authorization", `Bearer ${jwt}`)
      .send(cuerpoReceta({ imagenUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==" }));

    expect(res.status).toBe(400);
    expect(res.body.detalle.fieldErrors.imagenUrl?.[0]).toMatch(/URL https/);

    expect(await Receta.countDocuments()).toBe(0);
  });

  it("una receta nueva con foto ocupa menos de 5 KB en Mongo", async () => {
    const jwt = await token();

    const res = await request(app)
      .post("/api/recetas")
      .set("Authorization", `Bearer ${jwt}`)
      .send(cuerpoReceta({ imagenUrl: URL_CLOUDINARY }));

    expect(res.status).toBe(201);

    const [medida] = await Receta.aggregate<{ bytes: number }>([
      { $match: { _id: new mongoose.Types.ObjectId(res.body.id as string) } },
      { $project: { bytes: { $bsonSize: "$$ROOT" } } },
    ]);

    console.log(`receta nueva con foto: ${(medida.bytes / 1024).toFixed(2)} KB`);
    expect(medida.bytes).toBeLessThan(5 * 1024);
  });
});
