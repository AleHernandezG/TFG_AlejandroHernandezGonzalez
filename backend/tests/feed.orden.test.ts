jest.mock("../src/services/imagenService", () => ({
  buscarFotoPexelsCascada: jest.fn().mockResolvedValue(null),
}));
jest.mock("../src/services/nutritionService", () => ({
  calcularMacros: jest.fn().mockResolvedValue({ calorias: 0, proteinas: 0, carbos: 0, grasas: 0 }),
}));

import request from "supertest";
import { Types } from "mongoose";
import app from "../src/app";
import { Receta } from "../src/models/recetaMongo";
import { crearUsuario, crearReceta, tokenDe } from "./helpers/factories";

type PostFeed = { receta: { titulo: string }; likes: number; comentarios: number };

async function feed(query: string, token?: string) {
  const req = request(app).get(`/api/recetas${query}`);
  if (token) req.set("Authorization", `Bearer ${token}`);
  const res = await req;
  expect(res.status).toBe(200);
  return res.body as { recetas: PostFeed[]; total: number };
}

const titulos = (body: { recetas: PostFeed[] }) => body.recetas.map((p) => p.receta.titulo);

type DocParaScore = {
  likes: unknown[];
  listaComentarios: unknown[];
  fechaPublicacion: Date;
  autorId: Types.ObjectId;
  categorias: string[];
};

function scoreDeReferencia(
  doc: DocParaScore,
  ahora: Date,
  seguidos: Set<string>,
  preferencias: string[],
): number {
  const diasAntiguo = (ahora.getTime() - doc.fechaPublicacion.getTime()) / (1000 * 60 * 60 * 24);
  const popularidad = doc.likes.length * 2 + doc.listaComentarios.length * 3;
  const decay = 1 / (1 + Math.sqrt(Math.max(0, diasAntiguo)));
  const followBoost = seguidos.has(doc.autorId.toString()) ? 1.5 : 0;
  const prefBoost = doc.categorias.filter((c) => preferencias.includes(c)).length * 0.5;

  return popularidad * decay + followBoost + prefBoost;
}

async function ordenEsperadoPorScore(seguidos: Set<string>, preferencias: string[]) {
  const docs = await Receta.find({}).lean().exec();
  const ahora = new Date();

  return docs
    .map((d) => ({
      titulo: d.titulo as string,
      fecha: d.fechaPublicacion as Date,
      score: scoreDeReferencia(d as unknown as DocParaScore, ahora, seguidos, preferencias),
    }))
    .sort((a, b) => b.score - a.score || b.fecha.getTime() - a.fecha.getTime())
    .map((d) => d.titulo);
}

const hace = (dias: number) => new Date(Date.now() - dias * 24 * 60 * 60 * 1000);

describe("sort=score ordena en la base de datos igual que ordenaba en JavaScript", () => {
  it("la lista coincide con la formula de referencia, termino a termino", async () => {
    const lector = await crearUsuario({
      correo: "lector@cookr.dev",
      preferencias: ["vegano", "postre"],
    });
    const seguido = await crearUsuario({ correo: "seguido@cookr.dev" });
    const ajeno = await crearUsuario({ correo: "ajeno@cookr.dev" });

    lector.seguidos = [seguido._id as never];
    await lector.save();

    const votantes = Array.from({ length: 12 }, () => new Types.ObjectId());
    const deAjeno = { autorId: ajeno._id as never };

    await crearReceta({
      ...deAjeno, titulo: "Vieja y muy votada",
      likes: votantes, comentarios: 4, fechaPublicacion: hace(120),
    });
    await crearReceta({
      ...deAjeno, titulo: "Reciente y sin nada", fechaPublicacion: hace(0.1),
    });
    await crearReceta({
      ...deAjeno, titulo: "Reciente y votada",
      likes: votantes.slice(0, 5), comentarios: 1, fechaPublicacion: hace(1),
    });
    await crearReceta({
      ...deAjeno, titulo: "Con dos preferencias",
      categorias: ["vegano", "postre"], fechaPublicacion: hace(30),
    });
    await crearReceta({
      titulo: "De quien sigo", autorId: seguido._id as never, fechaPublicacion: hace(60),
    });
    await crearReceta({
      ...deAjeno, titulo: "Comentada sin likes", comentarios: 7, fechaPublicacion: hace(3),
    });

    const esperado = await ordenEsperadoPorScore(
      new Set([String(seguido._id)]),
      ["vegano", "postre"],
    );

    const body = await feed("?sort=score&limite=10", tokenDe(lector as never));

    expect(titulos(body)).toEqual(esperado);
    expect(body.total).toBe(6);
  });

  it("seguir al autor pesa mas que coincidir en dos preferencias", async () => {
    const lector = await crearUsuario({
      correo: "lector2@cookr.dev",
      preferencias: ["vegano", "postre"],
    });
    const seguido = await crearUsuario({ correo: "seguido2@cookr.dev" });
    const ajeno = await crearUsuario({ correo: "ajeno2@cookr.dev" });

    lector.seguidos = [seguido._id as never];
    await lector.save();

    const fecha = hace(10);
    await crearReceta({ titulo: "Del montón", autorId: ajeno._id as never, fechaPublicacion: fecha });
    await crearReceta({ titulo: "De quien sigo", autorId: seguido._id as never, fechaPublicacion: fecha });
    await crearReceta({
      titulo: "Dos preferencias", autorId: ajeno._id as never,
      categorias: ["vegano", "postre"], fechaPublicacion: fecha,
    });
    await crearReceta({
      titulo: "Una preferencia", autorId: ajeno._id as never,
      categorias: ["vegano"], fechaPublicacion: fecha,
    });

    const body = await feed("?sort=score", tokenDe(lector as never));

    expect(titulos(body)).toEqual([
      "De quien sigo",
      "Dos preferencias",
      "Una preferencia",
      "Del montón",
    ]);
  });

  it("un like vale dos y un comentario tres, a igualdad de fecha", async () => {
    const autor = await crearUsuario({ correo: "pesos@cookr.dev" });
    const de = { autorId: autor._id as never, fechaPublicacion: hace(5) };
    const votantes = Array.from({ length: 3 }, () => new Types.ObjectId());

    await crearReceta({ ...de, titulo: "Tres comentarios", comentarios: 3 });
    await crearReceta({ ...de, titulo: "Tres likes", likes: votantes });
    await crearReceta({ ...de, titulo: "Dos likes", likes: votantes.slice(0, 2) });
    await crearReceta({ ...de, titulo: "Un comentario", comentarios: 1 });

    expect(titulos(await feed("?sort=score"))).toEqual([
      "Tres comentarios",
      "Tres likes",
      "Dos likes",
      "Un comentario",
    ]);
  });

  it("dos preferencias suman uno, por encima de un like de hace cuatro dias", async () => {
    const lector = await crearUsuario({
      correo: "prefs@cookr.dev",
      preferencias: ["vegano", "postre"],
    });
    const autor = await crearUsuario({ correo: "autorprefs@cookr.dev" });
    const de = { autorId: autor._id as never };

    await crearReceta({
      ...de, titulo: "Dos preferencias",
      categorias: ["vegano", "postre"], fechaPublicacion: hace(20),
    });
    await crearReceta({
      ...de, titulo: "Un like de hace cuatro días",
      likes: [new Types.ObjectId()], fechaPublicacion: hace(4),
    });
    await crearReceta({
      ...de, titulo: "Una preferencia", categorias: ["vegano"], fechaPublicacion: hace(20),
    });

    const body = await feed("?sort=score", tokenDe(lector as never));

    expect(titulos(body)).toEqual([
      "Dos preferencias",
      "Un like de hace cuatro días",
      "Una preferencia",
    ]);
  });

  it("a igualdad de score manda la fecha, y el desempate no depende del azar", async () => {
    const autor = await crearUsuario({ correo: "empate@cookr.dev" });
    const de = { autorId: autor._id as never };

    await crearReceta({ ...de, titulo: "Empate antigua", fechaPublicacion: hace(9) });
    await crearReceta({ ...de, titulo: "Empate reciente", fechaPublicacion: hace(3) });
    await crearReceta({ ...de, titulo: "Empate intermedia", fechaPublicacion: hace(6) });

    const primera = titulos(await feed("?sort=score"));
    const segunda = titulos(await feed("?sort=score"));

    expect(primera).toEqual(["Empate reciente", "Empate intermedia", "Empate antigua"]);
    expect(segunda).toEqual(primera);
  });

  it("la pagina trae solo su pagina y el total sigue siendo el de la consulta", async () => {
    const autor = await crearUsuario({ correo: "paginado@cookr.dev" });
    for (let i = 0; i < 25; i++) {
      await crearReceta({
        autorId: autor._id as never,
        titulo: `Receta ${String(i).padStart(2, "0")}`,
        fechaPublicacion: hace(i),
      });
    }

    const primera = await feed("?sort=score&pagina=1&limite=10");
    const tercera = await feed("?sort=score&pagina=3&limite=10");

    expect(primera.recetas).toHaveLength(10);
    expect(primera.total).toBe(25);
    expect(tercera.recetas).toHaveLength(5);
    expect(tercera.total).toBe(25);
    expect(titulos(tercera)).toEqual(expect.not.arrayContaining(titulos(primera)));
  });
});

describe("sort=likes ordena por likes y desempata por fecha", () => {
  it("manda el numero de likes, no la fecha", async () => {
    const autor = await crearUsuario({ correo: "likes@cookr.dev" });
    const de = { autorId: autor._id as never };
    const votantes = Array.from({ length: 3 }, () => new Types.ObjectId());

    await crearReceta({ ...de, titulo: "Nueva sin likes", fechaPublicacion: hace(0.1) });
    await crearReceta({ ...de, titulo: "Vieja con tres", likes: votantes, fechaPublicacion: hace(90) });
    await crearReceta({
      ...de, titulo: "Media con uno", likes: votantes.slice(0, 1), fechaPublicacion: hace(30),
    });

    const body = await feed("?sort=likes");

    expect(titulos(body)).toEqual(["Vieja con tres", "Media con uno", "Nueva sin likes"]);
    expect(body.recetas.map((p) => p.likes)).toEqual([3, 1, 0]);
  });

  it("con los mismos likes gana la mas reciente", async () => {
    const autor = await crearUsuario({ correo: "likes2@cookr.dev" });
    const de = { autorId: autor._id as never };
    const votante = [new Types.ObjectId()];

    await crearReceta({ ...de, titulo: "Antigua", likes: votante, fechaPublicacion: hace(40) });
    await crearReceta({ ...de, titulo: "Reciente", likes: votante, fechaPublicacion: hace(2) });
    await crearReceta({ ...de, titulo: "Intermedia", likes: votante, fechaPublicacion: hace(20) });

    expect(titulos(await feed("?sort=likes"))).toEqual(["Reciente", "Intermedia", "Antigua"]);
  });
});
