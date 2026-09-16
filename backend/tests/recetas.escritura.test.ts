jest.mock("../src/services/imagenService", () => ({
  buscarFotoPexels: jest.fn(),
  buscarFotoPexelsCascada: jest.fn().mockResolvedValue(null),
}));

jest.mock("../src/services/nutritionService", () => ({
  calcularMacros: jest.fn().mockResolvedValue({ calorias: 0, proteinas: 0, carbos: 0, grasas: 0 }),
}));

jest.mock("../src/lib/cloudinary", () => ({
  cloudinaryConfigurado: jest.fn(() => true),
  firmarSubida: jest.fn(),
  subirImagen: jest.fn(),
  eliminarImagen: jest.fn().mockResolvedValue(true),
}));

import request from "supertest";
import { Types } from "mongoose";
import app from "../src/app";
import { Receta } from "../src/models/recetaMongo";
import { eliminarImagen } from "../src/lib/cloudinary";
import { crearReceta, crearUsuario, tokenDe } from "./helpers/factories";

const FOTO_VIEJA = "https://res.cloudinary.com/cookr/image/upload/v1/cookr/recetas/autor-1-aaaa.jpg";
const FOTO_NUEVA = "https://res.cloudinary.com/cookr/image/upload/v2/cookr/recetas/autor-2-bbbb.jpg";

const eliminarImagenMock = eliminarImagen as jest.MockedFunction<typeof eliminarImagen>;

function cuerpoReceta(extra: Record<string, unknown> = {}) {
  return {
    titulo: "Tortellini con salsa de tomate",
    descripcion: "Una descripción suficientemente larga para el esquema.",
    tiempo: 20,
    unidadTiempo: "min",
    porciones: 2,
    dificultad: "facil",
    dietas: [],
    alergenos: [],
    ingredientes: [
      { nombre: "Tortellini frescos", cantidad: "250", unidad: "g" },
      { nombre: "Tomate triturado", cantidad: "200", unidad: "g" },
    ],
    pasos: [{ texto: "Un paso lo bastante largo como para valer." }],
    ...extra,
  };
}

async function autorConToken(correo = "autor@cookr.dev") {
  const autor = await crearUsuario({ correo });
  return { autor, jwt: tokenDe(autor as never) };
}

async function alergenosGuardados(id: string) {
  const receta = await Receta.findById(id).lean();
  return [...(receta?.alergenos ?? [])].sort();
}

describe("alérgenos al crear una receta", () => {
  it("guarda los que llevan los ingredientes aunque el cliente mande una lista vacía", async () => {
    const { jwt } = await autorConToken();

    const res = await request(app)
      .post("/api/recetas")
      .set("Authorization", `Bearer ${jwt}`)
      .send(cuerpoReceta());

    expect(res.status).toBe(201);
    expect(await alergenosGuardados(res.body.id)).toEqual(["cereales", "huevo", "lacteos"]);
  });

  it("conserva los declarados válidos y tira los inventados", async () => {
    const { jwt } = await autorConToken();

    const res = await request(app)
      .post("/api/recetas")
      .set("Authorization", `Bearer ${jwt}`)
      .send(cuerpoReceta({ alergenos: ["sulfitos", "veneno"] }));

    expect(res.status).toBe(201);
    expect(await alergenosGuardados(res.body.id)).toEqual(["cereales", "huevo", "lacteos", "sulfitos"]);
  });

  it("la receta recién creada no aparece en el feed de un alérgico a los lácteos", async () => {
    const { jwt } = await autorConToken();
    const alergico = await crearUsuario({ correo: "alergico@cookr.dev", alergias: ["lacteos"] });

    await request(app)
      .post("/api/recetas")
      .set("Authorization", `Bearer ${jwt}`)
      .send(cuerpoReceta());

    const feed = await request(app)
      .get("/api/recetas")
      .set("Authorization", `Bearer ${tokenDe(alergico as never)}`);

    expect(feed.status).toBe(200);
    const titulos = (feed.body.recetas as { receta: { titulo: string } }[]).map((p) => p.receta.titulo);
    expect(titulos).not.toContain("Tortellini con salsa de tomate");
  });
});

describe("alérgenos al editar una receta", () => {
  it("si solo llegan alérgenos, los recalcula con los ingredientes que ya tenía", async () => {
    const { autor, jwt } = await autorConToken();
    const receta = await crearReceta({ autorId: autor._id as Types.ObjectId, alergenos: [] });
    await Receta.updateOne(
      { _id: receta._id },
      { $set: { ingredientes: [{ nombre: "Queso rallado", cantidad: 50, unidad: "g" }] } },
    );

    const res = await request(app)
      .put(`/api/recetas/${String(receta._id)}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ alergenos: [] });

    expect(res.status).toBe(204);
    expect(await alergenosGuardados(String(receta._id))).toEqual(["lacteos"]);
  });

  it("si cambian los ingredientes, los alérgenos salen de los nuevos", async () => {
    const { autor, jwt } = await autorConToken();
    const receta = await crearReceta({ autorId: autor._id as Types.ObjectId, alergenos: ["lacteos"] });

    const res = await request(app)
      .put(`/api/recetas/${String(receta._id)}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        alergenos: [],
        ingredientes: [{ nombre: "Salmón fresco", cantidad: "200", unidad: "g" }],
      });

    expect(res.status).toBe(204);
    expect(await alergenosGuardados(String(receta._id))).toEqual(["pescado"]);
  });

  it("si no llegan ni ingredientes ni alérgenos, no los toca", async () => {
    const { autor, jwt } = await autorConToken();
    const receta = await crearReceta({ autorId: autor._id as Types.ObjectId, alergenos: ["sulfitos"] });

    const res = await request(app)
      .put(`/api/recetas/${String(receta._id)}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ titulo: "Otro título para la receta" });

    expect(res.status).toBe(204);
    expect(await alergenosGuardados(String(receta._id))).toEqual(["sulfitos"]);
  });
});

describe("limpieza de fotos en Cloudinary", () => {
  it("al borrar una receta borra su foto", async () => {
    const { autor, jwt } = await autorConToken();
    const receta = await crearReceta({ autorId: autor._id as Types.ObjectId });
    await Receta.updateOne({ _id: receta._id }, { $set: { imagenUrl: FOTO_VIEJA } });

    const res = await request(app)
      .delete(`/api/recetas/${String(receta._id)}`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(204);
    expect(eliminarImagenMock).toHaveBeenCalledWith(FOTO_VIEJA);
  });

  it("no borra la foto si otra receta la sigue usando", async () => {
    const { autor, jwt } = await autorConToken();
    const receta = await crearReceta({ autorId: autor._id as Types.ObjectId });
    const otra = await crearReceta({ autorId: autor._id as Types.ObjectId });
    await Receta.updateMany({ _id: { $in: [receta._id, otra._id] } }, { $set: { imagenUrl: FOTO_VIEJA } });

    const res = await request(app)
      .delete(`/api/recetas/${String(receta._id)}`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(204);
    expect(eliminarImagenMock).not.toHaveBeenCalled();
  });

  it("al cambiar la foto borra la anterior", async () => {
    const { autor, jwt } = await autorConToken();
    const receta = await crearReceta({ autorId: autor._id as Types.ObjectId });
    await Receta.updateOne({ _id: receta._id }, { $set: { imagenUrl: FOTO_VIEJA } });

    const res = await request(app)
      .put(`/api/recetas/${String(receta._id)}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ imagenUrl: FOTO_NUEVA });

    expect(res.status).toBe(204);
    expect(eliminarImagenMock).toHaveBeenCalledTimes(1);
    expect(eliminarImagenMock).toHaveBeenCalledWith(FOTO_VIEJA);
  });

  it("editar sin cambiar la foto no borra nada", async () => {
    const { autor, jwt } = await autorConToken();
    const receta = await crearReceta({ autorId: autor._id as Types.ObjectId });
    await Receta.updateOne({ _id: receta._id }, { $set: { imagenUrl: FOTO_VIEJA } });

    const res = await request(app)
      .put(`/api/recetas/${String(receta._id)}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ titulo: "Título nuevo para la receta", imagenUrl: FOTO_VIEJA });

    expect(res.status).toBe(204);
    expect(eliminarImagenMock).not.toHaveBeenCalled();
  });

  it("si Cloudinary falla, la receta se borra igual", async () => {
    eliminarImagenMock.mockRejectedValueOnce(new Error("Cloudinary caído"));
    const errorConsola = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const { autor, jwt } = await autorConToken();
    const receta = await crearReceta({ autorId: autor._id as Types.ObjectId });
    await Receta.updateOne({ _id: receta._id }, { $set: { imagenUrl: FOTO_VIEJA } });

    const res = await request(app)
      .delete(`/api/recetas/${String(receta._id)}`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(204);
    expect(await Receta.countDocuments({ _id: receta._id })).toBe(0);
    errorConsola.mockRestore();
  });

  it("borrar la receta de otro no toca su foto", async () => {
    const { autor } = await autorConToken();
    const { jwt: jwtAjeno } = await autorConToken("ajeno@cookr.dev");
    const receta = await crearReceta({ autorId: autor._id as Types.ObjectId });
    await Receta.updateOne({ _id: receta._id }, { $set: { imagenUrl: FOTO_VIEJA } });

    const res = await request(app)
      .delete(`/api/recetas/${String(receta._id)}`)
      .set("Authorization", `Bearer ${jwtAjeno}`);

    expect(res.status).toBe(403);
    expect(eliminarImagenMock).not.toHaveBeenCalled();
  });
});
