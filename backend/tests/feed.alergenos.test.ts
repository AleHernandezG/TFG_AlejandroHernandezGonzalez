jest.mock("../src/services/imagenService", () => ({
  buscarFotoPexelsCascada: jest.fn().mockResolvedValue(null),
}));
jest.mock("../src/services/nutritionService", () => ({
  calcularMacros: jest.fn().mockResolvedValue({ calorias: 0, proteinas: 0, carbos: 0, grasas: 0 }),
}));

import request from "supertest";
import app from "../src/app";
import { crearUsuario, crearReceta, tokenDe } from "./helpers/factories";

type PostFeed = { receta: { titulo: string; alergenos: string[] } };

async function feed(query: string, token?: string) {
  const req = request(app).get(`/api/recetas${query}`);
  if (token) req.set("Authorization", `Bearer ${token}`);
  return req;
}

beforeEach(async () => {
  const autor = await crearUsuario({ correo: "autor@cookr.dev" });
  await crearReceta({ titulo: "Tortilla", autorId: autor._id as never, alergenos: ["huevo"] });
  await crearReceta({ titulo: "Tarta de queso", autorId: autor._id as never, alergenos: ["lacteos", "huevo"] });
  await crearReceta({ titulo: "Pan con tomate", autorId: autor._id as never, alergenos: ["cereales"] });
  await crearReceta({ titulo: "Ensalada", autorId: autor._id as never, alergenos: [] });
});

describe("filtro de alérgenos del feed", () => {
  it("excluye del feed toda receta que contenga el alérgeno pedido", async () => {
    const res = await feed("?alergenos=huevo");

    expect(res.status).toBe(200);
    const titulos = (res.body.recetas as PostFeed[]).map((p) => p.receta.titulo);

    expect(titulos).not.toContain("Tortilla");
    expect(titulos).not.toContain("Tarta de queso");
    expect(titulos).toEqual(expect.arrayContaining(["Pan con tomate", "Ensalada"]));
  });

  it("ninguna receta devuelta contiene el alérgeno excluido", async () => {
    const res = await feed("?alergenos=huevo");

    for (const post of res.body.recetas as PostFeed[]) {
      expect(post.receta.alergenos).not.toContain("huevo");
    }
  });

  it("excluye recetas que tengan cualquiera de varios alérgenos", async () => {
    const res = await feed("?alergenos=huevo,cereales");
    const titulos = (res.body.recetas as PostFeed[]).map((p) => p.receta.titulo);

    expect(titulos).toEqual(["Ensalada"]);
  });

  it("el total refleja el filtro, no el catálogo entero", async () => {
    const res = await feed("?alergenos=huevo");
    expect(res.body.total).toBe(2);
  });

  it("sin filtro devuelve todo el catálogo", async () => {
    const res = await feed("");
    expect(res.body.total).toBe(4);
  });

  it("un alérgeno que no usa ninguna receta no descarta nada", async () => {
    const res = await feed("?alergenos=altramuz");
    expect(res.body.total).toBe(4);
  });

  it("el filtro también se aplica al usuario autenticado", async () => {
    const usuario = await crearUsuario({ correo: "lector@cookr.dev", alergias: ["huevo"] });
    const res = await feed("?alergenos=huevo", tokenDe(usuario as never));

    const titulos = (res.body.recetas as PostFeed[]).map((p) => p.receta.titulo);
    expect(titulos).not.toContain("Tortilla");
    expect(res.body.total).toBe(2);
  });
});

describe("alergias del perfil", () => {
  it("el feed filtra por las alergias del perfil aunque el cliente no las mande", async () => {
    const alergico = await crearUsuario({ correo: "alergico@cookr.dev", alergias: ["huevo"] });
    const res = await feed("", tokenDe(alergico as never));

    const titulos = (res.body.recetas as PostFeed[]).map((p) => p.receta.titulo);
    expect(titulos).not.toContain("Tortilla");
    expect(titulos).not.toContain("Tarta de queso");
    expect(res.body.total).toBe(2);
  });

  it("los alérgenos del query se suman a los del perfil", async () => {
    const alergico = await crearUsuario({ correo: "alergico2@cookr.dev", alergias: ["huevo"] });
    const res = await feed("?alergenos=cereales", tokenDe(alergico as never));

    const titulos = (res.body.recetas as PostFeed[]).map((p) => p.receta.titulo);
    expect(titulos).toEqual(["Ensalada"]);
  });

  it("el query no puede rebajar el suelo del perfil", async () => {
    const alergico = await crearUsuario({ correo: "alergico3@cookr.dev", alergias: ["huevo"] });
    const res = await feed("?alergenos=lacteos", tokenDe(alergico as never));

    for (const post of res.body.recetas as PostFeed[]) {
      expect(post.receta.alergenos).not.toContain("huevo");
    }
    expect(res.body.total).toBe(2);
  });

  it("un perfil sin alergias no filtra nada por sí solo", async () => {
    const usuario = await crearUsuario({ correo: "sinalergias@cookr.dev", alergias: [] });
    const res = await feed("", tokenDe(usuario as never));

    expect(res.body.total).toBe(4);
  });

  it("el visitante anónimo no tiene perfil, así que solo filtra por query", async () => {
    const res = await feed("");
    expect(res.body.total).toBe(4);
  });
});
