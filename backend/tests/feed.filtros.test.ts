jest.mock("../src/services/imagenService", () => ({
  buscarFotoPexelsCascada: jest.fn().mockResolvedValue(null),
}));
jest.mock("../src/services/nutritionService", () => ({
  calcularMacros: jest.fn().mockResolvedValue({ calorias: 0, proteinas: 0, carbos: 0, grasas: 0 }),
}));

import request from "supertest";
import app from "../src/app";
import { crearUsuario, crearReceta, tokenDe } from "./helpers/factories";

type PostFeed = { receta: { titulo: string } };

async function feed(query: string, token?: string) {
  const req = request(app).get(`/api/recetas${query}`);
  if (token) req.set("Authorization", `Bearer ${token}`);
  return req;
}

function titulosDe(res: { body: { recetas: PostFeed[] } }) {
  return res.body.recetas.map((p) => p.receta.titulo).sort();
}

describe("dietas y categoria se combinan en vez de pisarse", () => {
  beforeEach(async () => {
    const autor = await crearUsuario({ correo: "autor@cookr.dev" });
    const de = { autorId: autor._id as never };

    await crearReceta({ ...de, titulo: "Sorbete de limón", categorias: ["vegano", "postre"] });
    await crearReceta({ ...de, titulo: "Flan de huevo", categorias: ["postre"] });
    await crearReceta({ ...de, titulo: "Hummus", categorias: ["vegano", "entrante"] });
    await crearReceta({ ...de, titulo: "Tarta de queso", categorias: ["vegetariano", "postre"] });
  });

  it("cruzar dieta y categoría devuelve solo lo que cumple las dos", async () => {
    const res = await feed("?dietas=vegano&categoria=postre");
    expect(titulosDe(res)).toEqual(["Sorbete de limón"]);
  });

  it("un vegano en la categoría postres no ve postres no veganos", async () => {
    const res = await feed("?dietas=vegano&categoria=postre");
    expect(titulosDe(res)).not.toContain("Flan de huevo");
    expect(titulosDe(res)).not.toContain("Tarta de queso");
  });

  it("varias dietas siguen siendo alternativas entre sí", async () => {
    const res = await feed("?dietas=vegano,vegetariano&categoria=postre");
    expect(titulosDe(res)).toEqual(["Sorbete de limón", "Tarta de queso"]);
  });

  it("solo dieta filtra por dieta", async () => {
    const res = await feed("?dietas=vegano");
    expect(titulosDe(res)).toEqual(["Hummus", "Sorbete de limón"]);
  });

  it("solo categoría filtra por categoría", async () => {
    const res = await feed("?categoria=postre");
    expect(titulosDe(res)).toEqual(["Flan de huevo", "Sorbete de limón", "Tarta de queso"]);
  });
});

describe("excluirPropio y soloSiguiendo se combinan en vez de pisarse", () => {
  async function escenario(seguidos: unknown[]) {
    const lector = await crearUsuario({ correo: "lector@cookr.dev" });
    const seguido = await crearUsuario({ correo: "seguido@cookr.dev" });
    const desconocido = await crearUsuario({ correo: "desconocido@cookr.dev" });

    await crearReceta({ titulo: "Mía", autorId: lector._id as never });
    await crearReceta({ titulo: "De quien sigo", autorId: seguido._id as never });
    await crearReceta({ titulo: "De un desconocido", autorId: desconocido._id as never });

    lector.seguidos = seguidos.length > 0 ? (seguidos as never) : [seguido._id as never];
    await lector.save();

    return { lector, seguido };
  }

  it("pedir las dos cosas a la vez respeta las dos", async () => {
    const { lector } = await escenario([]);
    const res = await feed("?excluirPropio=true&soloSiguiendo=true", tokenDe(lector as never));

    expect(titulosDe(res)).toEqual(["De quien sigo"]);
  });

  it("excluirPropio sigue vigente aunque el usuario se siga a sí mismo", async () => {
    const { lector, seguido } = await escenario([]);
    lector.seguidos = [seguido._id as never, lector._id as never];
    await lector.save();

    const res = await feed("?excluirPropio=true&soloSiguiendo=true", tokenDe(lector as never));

    expect(titulosDe(res)).toEqual(["De quien sigo"]);
    expect(titulosDe(res)).not.toContain("Mía");
  });
});
