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

describe("filtro de alérgenos del feed", () => {
  beforeEach(async () => {
    const autor = await crearUsuario({ correo: "autor@cookr.dev" });
    await crearReceta({ titulo: "Tortilla", autorId: autor._id as never, alergenos: ["huevo"] });
    await crearReceta({ titulo: "Tarta de queso", autorId: autor._id as never, alergenos: ["lacteos", "huevo"] });
    await crearReceta({ titulo: "Pan con tomate", autorId: autor._id as never, alergenos: ["cereales"] });
    await crearReceta({ titulo: "Ensalada", autorId: autor._id as never, alergenos: [] });
  });

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

// ─────────────────────────────────────────────────────────────────────────────
// HALLAZGO (16/07/2026). El plan pide asegurar que «un usuario con alérgenos no
// puede ver recetas que los contengan». Eso HOY NO SE CUMPLE: el filtro sale
// solo del query string (`recetasController.ts:32`), nunca de `usuario.alergias`.
// El feed no consulta el perfil, así que las alergias registradas no protegen
// nada por sí solas: solo filtran si el cliente las manda a mano, y el frontend
// únicamente manda lo que el usuario marca en el drawer de filtros.
//
// La ruta de la despensa sí lee el perfil (`chatService.ts:450`), lo que hace
// la incoherencia más visible.
//
// Estos tests fijan el comportamiento REAL para que el cambio sea deliberado
// y se vea en el diff. No validan que esté bien.
//
// Ya está decidido cómo se arregla (Fase 2b de PLAN_AUDITORIA.md):
//   alergenosEfectivos = union(perfil.alergias, query.alergenos)
// El perfil es un suelo y el drawer solo suma por encima; la única forma de
// dejar de filtrar por un alérgeno es quitarlo del perfil. Al implementarlo hay
// que DARLE LA VUELTA a este test, no borrarlo, y añadir el de la unión.
// ─────────────────────────────────────────────────────────────────────────────
describe("alergias del perfil (comportamiento actual, no el deseado)", () => {
  it("el feed NO filtra por las alergias del perfil si el cliente no las manda", async () => {
    const autor = await crearUsuario({ correo: "autor2@cookr.dev" });
    await crearReceta({ titulo: "Tortilla", autorId: autor._id as never, alergenos: ["huevo"] });
    await crearReceta({ titulo: "Ensalada", autorId: autor._id as never, alergenos: [] });

    const alergico = await crearUsuario({ correo: "alergico@cookr.dev", alergias: ["huevo"] });
    const res = await feed("", tokenDe(alergico as never));

    const titulos = (res.body.recetas as PostFeed[]).map((p) => p.receta.titulo);
    expect(titulos).toContain("Tortilla");
  });
});
