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
import { Comentario } from "../src/models/comentarioMongo";
import { crearUsuario, crearReceta, tokenDe } from "./helpers/factories";

type Pagina = {
  comentarios: { autorNombre: string; avatarUrl: string | null; texto: string; fecha: string }[];
  total: number;
  hayMas: boolean;
};

function comentar(recetaId: string, token: string, texto: string) {
  return request(app)
    .post(`/api/recetas/${recetaId}/comentarios`)
    .set("Authorization", `Bearer ${token}`)
    .send({ texto });
}

async function pedirPagina(recetaId: string, query = ""): Promise<Pagina> {
  const res = await request(app).get(`/api/recetas/${recetaId}/comentarios${query}`);
  expect(res.status).toBe(200);
  return res.body as Pagina;
}

async function sembrarComentarios(
  recetaId: Types.ObjectId,
  autorId: Types.ObjectId,
  cuantos: number,
) {
  const base = Date.now();
  await Comentario.insertMany(
    Array.from({ length: cuantos }, (_, i) => ({
      recetaId,
      autorId,
      autorNombre: "Comentarista",
      avatarUrl: null,
      texto: `Comentario ${i}`,
      fecha: new Date(base - i * 60_000),
    })),
  );
  await Receta.updateOne({ _id: recetaId }, { $set: { numComentarios: cuantos } });
}

describe("los comentarios viven en su propia colección", () => {
  it("comentar inserta en comentarios y deja la receta sin array", async () => {
    const autor = await crearUsuario({ nombre: "Nuria Vela", correo: "nuria@cookr.dev" });
    const receta = await crearReceta({ titulo: "Sin array" });
    const id = String(receta._id);

    const res = await comentar(id, tokenDe(autor as never), "Riquísima");

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ autorNombre: "Nuria Vela", texto: "Riquísima" });

    const guardados = await Comentario.find({ recetaId: receta._id }).lean().exec();
    expect(guardados).toHaveLength(1);
    expect(guardados[0].recetaId.toString()).toBe(id);

    const crudo = await Receta.collection.findOne({ _id: receta._id });
    expect(crudo).not.toHaveProperty("listaComentarios");
    expect(crudo?.numComentarios).toBe(1);
  });

  it("cada comentario sube el contador de la receta", async () => {
    const uno = await crearUsuario({ correo: "uno@cookr.dev" });
    const dos = await crearUsuario({ correo: "dos@cookr.dev" });
    const receta = await crearReceta({ titulo: "Contada" });
    const id = String(receta._id);

    await comentar(id, tokenDe(uno as never), "El primero");
    await comentar(id, tokenDe(dos as never), "El segundo");

    const doc = await Receta.findById(id).select("numComentarios").lean().exec();
    expect(doc?.numComentarios).toBe(2);
  });

  it("el detalle ya no arrastra los comentarios", async () => {
    const autor = await crearUsuario({ correo: "detalle@cookr.dev" });
    const receta = await crearReceta({ titulo: "Detallada", autorId: autor._id as Types.ObjectId });
    await sembrarComentarios(receta._id as Types.ObjectId, autor._id as Types.ObjectId, 12);

    const res = await request(app).get(`/api/recetas/${String(receta._id)}`);

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("listaComentarios");
    expect(res.body.comentarios).toBe(12);
  });

  it("el contador del feed sale de numComentarios", async () => {
    const autor = await crearUsuario({ correo: "feed@cookr.dev" });
    await crearReceta({
      titulo: "Comentada de más",
      autorId: autor._id as Types.ObjectId,
      comentarios: 5,
    });

    const res = await request(app).get("/api/recetas");

    expect(res.status).toBe(200);
    expect(res.body.recetas[0].comentarios).toBe(5);
  });
});

describe("la paginación de comentarios es de verdad", () => {
  it("200 comentarios devuelven una página, no 200", async () => {
    const autor = await crearUsuario({ correo: "masiva@cookr.dev" });
    const receta = await crearReceta({ titulo: "Viral" });
    await sembrarComentarios(receta._id as Types.ObjectId, autor._id as Types.ObjectId, 200);

    const pagina = await pedirPagina(String(receta._id));

    expect(pagina.comentarios).toHaveLength(8);
    expect(pagina.total).toBe(200);
    expect(pagina.hayMas).toBe(true);
  });

  it("la última página cierra con hayMas en false", async () => {
    const autor = await crearUsuario({ correo: "ultima@cookr.dev" });
    const receta = await crearReceta({ titulo: "Justa" });
    await sembrarComentarios(receta._id as Types.ObjectId, autor._id as Types.ObjectId, 20);

    const pagina = await pedirPagina(String(receta._id), "?pagina=3&limite=8");

    expect(pagina.comentarios).toHaveLength(4);
    expect(pagina.hayMas).toBe(false);
  });

  it("las páginas no repiten ni se saltan comentarios", async () => {
    const autor = await crearUsuario({ correo: "sinsolapes@cookr.dev" });
    const receta = await crearReceta({ titulo: "Ordenada" });
    await sembrarComentarios(receta._id as Types.ObjectId, autor._id as Types.ObjectId, 24);

    const id = String(receta._id);
    const paginas = await Promise.all([
      pedirPagina(id, "?pagina=1&limite=8"),
      pedirPagina(id, "?pagina=2&limite=8"),
      pedirPagina(id, "?pagina=3&limite=8"),
    ]);

    const textos = paginas.flatMap((p) => p.comentarios.map((c) => c.texto));
    expect(new Set(textos).size).toBe(24);
    expect(textos[0]).toBe("Comentario 0");
    expect(textos[23]).toBe("Comentario 23");
  });

  it("los más nuevos van primero", async () => {
    const autor = await crearUsuario({ correo: "recientes@cookr.dev" });
    const receta = await crearReceta({ titulo: "Cronológica" });
    await sembrarComentarios(receta._id as Types.ObjectId, autor._id as Types.ObjectId, 5);

    const pagina = await pedirPagina(String(receta._id));
    const fechas = pagina.comentarios.map((c) => new Date(c.fecha).getTime());

    expect([...fechas].sort((a, b) => b - a)).toEqual(fechas);
  });

  it("un limite absurdo no rompe la consulta", async () => {
    const autor = await crearUsuario({ correo: "absurdo@cookr.dev" });
    const receta = await crearReceta({ titulo: "Con basura en la query" });
    await sembrarComentarios(receta._id as Types.ObjectId, autor._id as Types.ObjectId, 30);

    const roto = await pedirPagina(String(receta._id), "?pagina=abc&limite=abc");
    expect(roto.comentarios).toHaveLength(8);

    const pasado = await pedirPagina(String(receta._id), "?limite=500");
    expect(pasado.comentarios).toHaveLength(20);
  });
});

describe("borrar una receta no deja comentarios huérfanos", () => {
  it("los de la receta borrada desaparecen y los de otra siguen", async () => {
    const autor = await crearUsuario({ correo: "duena@cookr.dev" });
    const otra = await crearReceta({ titulo: "La que sobrevive" });
    const receta = await crearReceta({
      titulo: "La que se borra",
      autorId: autor._id as Types.ObjectId,
    });

    await sembrarComentarios(receta._id as Types.ObjectId, autor._id as Types.ObjectId, 6);
    await sembrarComentarios(otra._id as Types.ObjectId, autor._id as Types.ObjectId, 3);

    const res = await request(app)
      .delete(`/api/recetas/${String(receta._id)}`)
      .set("Authorization", `Bearer ${tokenDe(autor as never)}`);

    expect(res.status).toBe(204);
    expect(await Comentario.countDocuments({ recetaId: receta._id })).toBe(0);
    expect(await Comentario.countDocuments({})).toBe(3);
  });
});

describe("validación al comentar", () => {
  it("un comentario vacío se rechaza en la ruta", async () => {
    const usuario = await crearUsuario({ correo: "vacio@cookr.dev" });
    const receta = await crearReceta({ titulo: "Sin texto" });

    const res = await comentar(String(receta._id), tokenDe(usuario as never), "   ");

    expect(res.status).toBe(400);
    expect(await Comentario.countDocuments({})).toBe(0);
  });

  it("un comentario de más de 500 caracteres se rechaza", async () => {
    const usuario = await crearUsuario({ correo: "largo@cookr.dev" });
    const receta = await crearReceta({ titulo: "Demasiado" });

    const res = await comentar(String(receta._id), tokenDe(usuario as never), "a".repeat(501));

    expect(res.status).toBe(400);
  });

  it("comentar en una receta que no existe no crea nada", async () => {
    const usuario = await crearUsuario({ correo: "fantasma@cookr.dev" });
    const inexistente = new Types.ObjectId().toString();

    const res = await comentar(inexistente, tokenDe(usuario as never), "Hola");

    expect(res.status).toBe(404);
    expect(await Comentario.countDocuments({})).toBe(0);
  });

  it("comentar sin sesión responde 401", async () => {
    const receta = await crearReceta({ titulo: "Cerrada" });

    const res = await request(app)
      .post(`/api/recetas/${String(receta._id)}/comentarios`)
      .send({ texto: "Anónimo" });

    expect(res.status).toBe(401);
  });
});
