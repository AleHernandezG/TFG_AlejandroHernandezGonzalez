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
import { Usuario } from "../src/models/usuarioMongo";
import { crearUsuario, crearReceta, tokenDe } from "./helpers/factories";

function postear(ruta: string, token: string, cuerpo?: object) {
  const req = request(app).post(ruta).set("Authorization", `Bearer ${token}`);
  return cuerpo ? req.send(cuerpo) : req;
}

async function likesDe(recetaId: string) {
  const doc = await Receta.findById(recetaId).select("likes").lean().exec();
  return (doc?.likes as Types.ObjectId[]).map((id) => id.toString());
}

async function guardadasDe(usuarioId: string) {
  const doc = await Usuario.findById(usuarioId).select("recetasGuardadas").lean().exec();
  return (doc?.recetasGuardadas as Types.ObjectId[]).map((id) => id.toString());
}

describe("dos escrituras a la vez sobre el mismo array no se pisan", () => {
  it("dos likes simultaneos del mismo usuario dejan una sola entrada", async () => {
    const usuario = await crearUsuario({ correo: "doble@cookr.dev" });
    const receta = await crearReceta({ titulo: "Disputada" });
    const token = tokenDe(usuario as never);
    const id = String(receta._id);

    const [a, b] = await Promise.all([
      postear(`/api/recetas/${id}/like`, token),
      postear(`/api/recetas/${id}/like`, token),
    ]);

    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(await likesDe(id)).toEqual([String(usuario._id)]);
  });

  it("dos usuarios dando like a la vez no se borran el uno al otro", async () => {
    const ana = await crearUsuario({ correo: "ana@cookr.dev" });
    const bruno = await crearUsuario({ correo: "bruno@cookr.dev" });
    const receta = await crearReceta({ titulo: "Compartida" });
    const id = String(receta._id);

    await Promise.all([
      postear(`/api/recetas/${id}/like`, tokenDe(ana as never)),
      postear(`/api/recetas/${id}/like`, tokenDe(bruno as never)),
    ]);

    expect((await likesDe(id)).sort()).toEqual(
      [String(ana._id), String(bruno._id)].sort(),
    );
  });

  it("por muchos likes seguidos que lleguen, el usuario nunca aparece dos veces", async () => {
    const usuario = await crearUsuario({ correo: "insistente@cookr.dev" });
    const receta = await crearReceta({ titulo: "Machacada" });
    const token = tokenDe(usuario as never);
    const id = String(receta._id);

    await Promise.all(
      Array.from({ length: 8 }, () => postear(`/api/recetas/${id}/like`, token)),
    );

    const likes = await likesDe(id);

    expect(likes.length).toBeLessThanOrEqual(1);
    expect(new Set(likes).size).toBe(likes.length);
  });

  it("el like sigue siendo un interruptor: dar y quitar deja el array vacio", async () => {
    const usuario = await crearUsuario({ correo: "interruptor@cookr.dev" });
    const receta = await crearReceta({ titulo: "Ida y vuelta" });
    const token = tokenDe(usuario as never);
    const id = String(receta._id);

    const dado = await postear(`/api/recetas/${id}/like`, token);
    expect(dado.body).toMatchObject({ liked: true, totalLikes: 1 });

    const quitado = await postear(`/api/recetas/${id}/like`, token);
    expect(quitado.body).toMatchObject({ liked: false, totalLikes: 0 });
    expect(await likesDe(id)).toEqual([]);
  });

  it("dos guardados simultaneos del mismo usuario dejan una sola entrada", async () => {
    const usuario = await crearUsuario({ correo: "guardador@cookr.dev" });
    const receta = await crearReceta({ titulo: "Para luego" });
    const token = tokenDe(usuario as never);
    const id = String(receta._id);

    await Promise.all([
      postear(`/api/recetas/${id}/guardar`, token),
      postear(`/api/recetas/${id}/guardar`, token),
    ]);

    expect(await guardadasDe(String(usuario._id))).toEqual([id]);
  });

  it("guardar dos recetas a la vez no pierde ninguna", async () => {
    const usuario = await crearUsuario({ correo: "coleccionista@cookr.dev" });
    const una = await crearReceta({ titulo: "Una" });
    const otra = await crearReceta({ titulo: "Otra" });
    const token = tokenDe(usuario as never);

    await Promise.all([
      postear(`/api/recetas/${String(una._id)}/guardar`, token),
      postear(`/api/recetas/${String(otra._id)}/guardar`, token),
    ]);

    expect((await guardadasDe(String(usuario._id))).sort()).toEqual(
      [String(una._id), String(otra._id)].sort(),
    );
  });

  it("dos comentarios simultaneos se guardan los dos", async () => {
    const ana = await crearUsuario({ nombre: "Ana Ruiz", correo: "anac@cookr.dev" });
    const bruno = await crearUsuario({ nombre: "Bruno Gil", correo: "brunoc@cookr.dev" });
    const receta = await crearReceta({ titulo: "Comentada" });
    const id = String(receta._id);

    await Promise.all([
      postear(`/api/recetas/${id}/comentarios`, tokenDe(ana as never), { texto: "El de Ana" }),
      postear(`/api/recetas/${id}/comentarios`, tokenDe(bruno as never), { texto: "El de Bruno" }),
    ]);

    const guardados = await Comentario.find({ recetaId: receta._id }).lean().exec();
    const doc = await Receta.findById(id).select("numComentarios").lean().exec();

    expect(guardados.map((c) => c.texto).sort()).toEqual(["El de Ana", "El de Bruno"]);
    expect(doc?.numComentarios).toBe(2);
  });

  it("el comentario guardado conserva autor, texto y fecha", async () => {
    const usuario = await crearUsuario({ nombre: "Carla Soto", correo: "carla@cookr.dev" });
    const receta = await crearReceta({ titulo: "Con firma" });
    const id = String(receta._id);

    const res = await postear(`/api/recetas/${id}/comentarios`, tokenDe(usuario as never), {
      texto: "  Me ha salido buenísima  ",
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      autorNombre: "Carla Soto",
      texto: "Me ha salido buenísima",
    });

    const guardado = await Comentario.findOne({ recetaId: receta._id }).lean().exec();
    if (!guardado) throw new Error("no se guardó el comentario");

    expect(guardado.autorId.toString()).toBe(String(usuario._id));
    expect(guardado.autorNombre).toBe("Carla Soto");
    expect(guardado.texto).toBe("Me ha salido buenísima");
    expect(guardado.fecha).toBeInstanceOf(Date);
  });
});
