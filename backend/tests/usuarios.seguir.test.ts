import request from "supertest";
import { Types } from "mongoose";
import app from "../src/app";
import { Usuario } from "../src/models/usuarioMongo";
import { crearUsuario, tokenDe } from "./helpers/factories";

function seguir(id: string, token?: string) {
  const req = request(app).post(`/api/usuarios/${id}/seguir`);
  return token ? req.set("Authorization", `Bearer ${token}`) : req;
}

async function relacionesDe(usuarioId: unknown) {
  const doc = await Usuario.findById(usuarioId).select("seguidos seguidores").lean().exec();
  const aTexto = (ids?: Types.ObjectId[]) => (ids ?? []).map((id) => id.toString());
  return { seguidos: aTexto(doc?.seguidos), seguidores: aTexto(doc?.seguidores) };
}

async function anaYBruno() {
  const ana = await crearUsuario({ correo: "ana@cookr.dev" });
  const bruno = await crearUsuario({ correo: "bruno@cookr.dev" });
  return { ana, bruno, idAna: String(ana._id), idBruno: String(bruno._id), tokenAna: tokenDe(ana as never) };
}

describe("POST /api/usuarios/:id/seguir", () => {
  it("seguir a alguien lo apunta en los seguidos de uno y en los seguidores del otro", async () => {
    const { idAna, idBruno, tokenAna } = await anaYBruno();

    const res = await seguir(idBruno, tokenAna);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ siguiendo: true });
    expect(await relacionesDe(idAna)).toEqual({ seguidos: [idBruno], seguidores: [] });
    expect(await relacionesDe(idBruno)).toEqual({ seguidos: [], seguidores: [idAna] });
  });

  it("la segunda llamada deja de seguir y limpia los dos lados", async () => {
    const { idAna, idBruno, tokenAna } = await anaYBruno();
    await seguir(idBruno, tokenAna);

    const res = await seguir(idBruno, tokenAna);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ siguiendo: false });
    expect(await relacionesDe(idAna)).toEqual({ seguidos: [], seguidores: [] });
    expect(await relacionesDe(idBruno)).toEqual({ seguidos: [], seguidores: [] });
  });

  it("la tercera llamada vuelve a seguir sin duplicar", async () => {
    const { idAna, idBruno, tokenAna } = await anaYBruno();
    await seguir(idBruno, tokenAna);
    await seguir(idBruno, tokenAna);

    const res = await seguir(idBruno, tokenAna);

    expect(res.body).toEqual({ siguiendo: true });
    expect(await relacionesDe(idAna)).toEqual({ seguidos: [idBruno], seguidores: [] });
    expect(await relacionesDe(idBruno)).toEqual({ seguidos: [], seguidores: [idAna] });
  });

  it("seguirse mutuamente no mezcla seguidos con seguidores", async () => {
    const { bruno, idAna, idBruno, tokenAna } = await anaYBruno();

    await seguir(idBruno, tokenAna);
    await seguir(idAna, tokenDe(bruno as never));

    expect(await relacionesDe(idAna)).toEqual({ seguidos: [idBruno], seguidores: [idBruno] });
    expect(await relacionesDe(idBruno)).toEqual({ seguidos: [idAna], seguidores: [idAna] });
  });

  it("dejar de seguir a uno no toca a los demás", async () => {
    const { idAna, idBruno, tokenAna } = await anaYBruno();
    const carla = await crearUsuario({ correo: "carla@cookr.dev" });
    const idCarla = String(carla._id);
    await seguir(idBruno, tokenAna);
    await seguir(idCarla, tokenAna);
    await seguir(idBruno, tokenDe(carla as never));

    await seguir(idBruno, tokenAna);

    expect(await relacionesDe(idAna)).toEqual({ seguidos: [idCarla], seguidores: [] });
    expect(await relacionesDe(idBruno)).toEqual({ seguidos: [], seguidores: [idCarla] });
    expect(await relacionesDe(idCarla)).toEqual({ seguidos: [idBruno], seguidores: [idAna] });
  });

  it("sin token responde 401 y no apunta nada", async () => {
    const { idBruno } = await anaYBruno();

    const res = await seguir(idBruno);

    expect(res.status).toBe(401);
    expect(await relacionesDe(idBruno)).toEqual({ seguidos: [], seguidores: [] });
  });

  it("con un token que no es válido responde 401", async () => {
    const { idBruno } = await anaYBruno();

    const res = await seguir(idBruno, "no-es-un-jwt");

    expect(res.status).toBe(401);
  });

  it("seguir a un usuario que no existe responde 404 y no deja el id colgado", async () => {
    const { idAna, tokenAna } = await anaYBruno();

    const res = await seguir(new Types.ObjectId().toString(), tokenAna);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Usuario no encontrado" });
    expect(await relacionesDe(idAna)).toEqual({ seguidos: [], seguidores: [] });
  });

  it("seguirse a uno mismo responde 400 y no apunta nada", async () => {
    const { idAna, tokenAna } = await anaYBruno();

    const res = await seguir(idAna, tokenAna);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "No puedes seguirte a ti mismo" });
    expect(await relacionesDe(idAna)).toEqual({ seguidos: [], seguidores: [] });
  });

  it.each(["no-es-un-id", "123", "64f0c0ffee"])("con el id malformado %s responde 404, no 500", async (id) => {
    const { idAna, tokenAna } = await anaYBruno();

    const res = await seguir(id, tokenAna);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Usuario no encontrado" });
    expect(await relacionesDe(idAna)).toEqual({ seguidos: [], seguidores: [] });
  });

  it("si la cuenta del token ya no existe responde 404", async () => {
    const { ana, idBruno, tokenAna } = await anaYBruno();
    await Usuario.deleteOne({ _id: ana._id });

    const res = await seguir(idBruno, tokenAna);

    expect(res.status).toBe(404);
    expect(await relacionesDe(idBruno)).toEqual({ seguidos: [], seguidores: [] });
  });
});

describe("dos llamadas a seguir a la vez", () => {
  it("del mismo usuario valen lo mismo que dos seguidas", async () => {
    const { idAna, idBruno, tokenAna } = await anaYBruno();

    const [a, b] = await Promise.all([seguir(idBruno, tokenAna), seguir(idBruno, tokenAna)]);

    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect([a.body.siguiendo, b.body.siguiendo].sort()).toEqual([false, true]);
    expect(await relacionesDe(idAna)).toEqual({ seguidos: [], seguidores: [] });
    expect(await relacionesDe(idBruno)).toEqual({ seguidos: [], seguidores: [] });
  });

  it("de dos usuarios al mismo no se borran el uno al otro", async () => {
    const { idAna, idBruno, tokenAna } = await anaYBruno();
    const carla = await crearUsuario({ correo: "carla@cookr.dev" });
    const idCarla = String(carla._id);

    const [a, b] = await Promise.all([seguir(idBruno, tokenAna), seguir(idBruno, tokenDe(carla as never))]);

    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect((await relacionesDe(idBruno)).seguidores.sort()).toEqual([idAna, idCarla].sort());
  });

  it("seguir a alguien mientras él te sigue a ti no pierde ninguna de las dos relaciones", async () => {
    const { bruno, idAna, idBruno, tokenAna } = await anaYBruno();

    const [a, b] = await Promise.all([seguir(idBruno, tokenAna), seguir(idAna, tokenDe(bruno as never))]);

    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(await relacionesDe(idAna)).toEqual({ seguidos: [idBruno], seguidores: [idBruno] });
    expect(await relacionesDe(idBruno)).toEqual({ seguidos: [idAna], seguidores: [idAna] });
  });
});
