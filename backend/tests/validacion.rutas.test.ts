jest.mock("../src/services/chatService", () => ({
  responderChat: jest.fn().mockResolvedValue("Diez minutos desde que rompe a hervir."),
  recetaConDespensa: jest.fn(),
  generarRecetaDesdeTexto: jest.fn().mockResolvedValue({ titulo: "Tortilla de patatas" }),
  escanearTicket: jest.fn().mockResolvedValue([{ nombre: "Leche", cantidad: 1, unidad: "l" }]),
}));

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
import { Usuario } from "../src/models/usuarioMongo";
import { Receta } from "../src/models/recetaMongo";
import { responderChat, generarRecetaDesdeTexto, escanearTicket } from "../src/services/chatService";
import { CONTRASENA_VALIDA, crearReceta, crearUsuario, tokenDe } from "./helpers/factories";

const IMAGEN = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==";

async function usuarioConToken(datos: Parameters<typeof crearUsuario>[0] = {}) {
  const usuario = await crearUsuario(datos);
  return { usuario, jwt: tokenDe(usuario as never) };
}

function mensajesDeError(res: request.Response): string[] {
  return (res.body.errores ?? []).map((e: { mensaje: string }) => e.mensaje);
}

function cuerpoReceta(extra: Record<string, unknown> = {}) {
  return {
    titulo: "Tortilla de patatas",
    descripcion: "La de siempre, jugosa por dentro y con cebolla.",
    tiempo: 30,
    unidadTiempo: "min",
    porciones: 4,
    dificultad: "media",
    ingredientes: [{ nombre: "Patata", cantidad: "500", unidad: "g" }],
    pasos: [{ texto: "Pelar y cortar las patatas en láminas finas." }],
    ...extra,
  };
}

describe("POST /api/chat", () => {
  const enviar = (jwt: string, cuerpo: unknown) =>
    request(app).post("/api/chat").set("Authorization", `Bearer ${jwt}`).send(cuerpo as object);

  beforeEach(() => (responderChat as jest.Mock).mockClear());

  it("responde con un historial válido", async () => {
    const { jwt } = await usuarioConToken();

    const res = await enviar(jwt, {
      mensajes: [
        { rol: "user", texto: "¿Cuánto cuece un huevo duro?" },
        { rol: "model", texto: "Unos diez minutos." },
        { rol: "user", texto: "¿Y pasado por agua?" },
      ],
      imagenBase64: IMAGEN,
    });

    expect(res.status).toBe(200);
    expect(res.body.respuesta).toBe("Diez minutos desde que rompe a hervir.");
    expect(responderChat).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["sin mensajes", {}, "mensajes es obligatorio y debe ser un array no vacío"],
    ["con el historial vacío", { mensajes: [] }, "mensajes es obligatorio y debe ser un array no vacío"],
    [
      "con más de 50 mensajes",
      { mensajes: Array.from({ length: 51 }, () => ({ rol: "user", texto: "hola" })) },
      "El historial no puede superar 50 mensajes",
    ],
    ["con un rol inventado", { mensajes: [{ rol: "system", texto: "hola" }] }, "Rol de mensaje no válido"],
    ["con un mensaje en blanco", { mensajes: [{ rol: "user", texto: "   " }] }, "Todos los mensajes deben tener texto"],
    [
      "con un mensaje de más de 2000 caracteres",
      { mensajes: [{ rol: "user", texto: "a".repeat(2001) }] },
      "Cada mensaje no puede superar 2000 caracteres",
    ],
    [
      "si el último mensaje no es del usuario",
      { mensajes: [{ rol: "user", texto: "hola" }, { rol: "model", texto: "hola" }] },
      "El último mensaje debe ser del usuario",
    ],
    [
      "con una imagen que no es data:image/",
      { mensajes: [{ rol: "user", texto: "hola" }], imagenBase64: "https://example.com/foto.jpg" },
      "imagenBase64 no válida",
    ],
    [
      "con una imagen de más de 7 000 000 caracteres",
      { mensajes: [{ rol: "user", texto: "hola" }], imagenBase64: `data:image/png;base64,${"A".repeat(7_000_000)}` },
      "La imagen no puede superar 5 MB",
    ],
  ])("rechaza con 400 %s", async (_caso, cuerpo, mensaje) => {
    const { jwt } = await usuarioConToken();

    const res = await enviar(jwt, cuerpo);

    expect(res.status).toBe(400);
    expect(mensajesDeError(res)).toContain(mensaje);
    expect(responderChat).not.toHaveBeenCalled();
  });
});

describe("POST /api/recetas", () => {
  it("crea la receta con un cuerpo válido", async () => {
    const { jwt } = await usuarioConToken();

    const res = await request(app)
      .post("/api/recetas")
      .set("Authorization", `Bearer ${jwt}`)
      .send(cuerpoReceta());

    expect(res.status).toBe(201);
    expect(await Receta.countDocuments()).toBe(1);
  });

  it("rechaza con 400 una receta sin pasos y no guarda nada", async () => {
    const { jwt } = await usuarioConToken();

    const res = await request(app)
      .post("/api/recetas")
      .set("Authorization", `Bearer ${jwt}`)
      .send(cuerpoReceta({ pasos: [] }));

    expect(res.status).toBe(400);
    expect(mensajesDeError(res)).toContain("Añade al menos un paso");
    expect(await Receta.countDocuments()).toBe(0);
  });
});

describe("PUT /api/recetas/:id", () => {
  it("actualiza con un cuerpo parcial válido", async () => {
    const { usuario, jwt } = await usuarioConToken();
    const receta = await crearReceta({ autorId: usuario._id as Types.ObjectId });

    const res = await request(app)
      .put(`/api/recetas/${receta._id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ titulo: "Tortilla sin cebolla" });

    expect(res.status).toBe(204);
    expect((await Receta.findById(receta._id).lean())?.titulo).toBe("Tortilla sin cebolla");
  });

  it("rechaza con 400 un título demasiado corto y deja la receta como estaba", async () => {
    const { usuario, jwt } = await usuarioConToken();
    const receta = await crearReceta({ autorId: usuario._id as Types.ObjectId, titulo: "Receta original" });

    const res = await request(app)
      .put(`/api/recetas/${receta._id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ titulo: "No" });

    expect(res.status).toBe(400);
    expect(mensajesDeError(res)).toContain("El título debe tener al menos 3 caracteres");
    expect((await Receta.findById(receta._id).lean())?.titulo).toBe("Receta original");
  });
});

describe("POST /api/recetas/generar-desde-texto", () => {
  beforeEach(() => (generarRecetaDesdeTexto as jest.Mock).mockClear());

  it("pasa la descripción recortada al generador", async () => {
    const { jwt } = await usuarioConToken();

    const res = await request(app)
      .post("/api/recetas/generar-desde-texto")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ descripcion: "  Una tortilla de patatas jugosa  " });

    expect(res.status).toBe(200);
    expect(generarRecetaDesdeTexto).toHaveBeenCalledWith("Una tortilla de patatas jugosa");
  });

  it.each([
    ["sin descripción", {}, "descripcion es obligatoria"],
    ["con menos de 10 caracteres sin contar espacios", { descripcion: "  tortilla  " }, "descripcion debe tener al menos 10 caracteres"],
    ["con más de 1000 caracteres", { descripcion: "a".repeat(1001) }, "descripcion no puede superar 1000 caracteres"],
  ])("rechaza con 400 %s", async (_caso, cuerpo, mensaje) => {
    const { jwt } = await usuarioConToken();

    const res = await request(app)
      .post("/api/recetas/generar-desde-texto")
      .set("Authorization", `Bearer ${jwt}`)
      .send(cuerpo);

    expect(res.status).toBe(400);
    expect(mensajesDeError(res)).toContain(mensaje);
    expect(generarRecetaDesdeTexto).not.toHaveBeenCalled();
  });
});

describe("POST /api/despensa", () => {
  const item = { nombre: " Leche ", cantidad: 1, unidad: "l", emoji: "🥛" };

  it("añade un ingrediente suelto recortando los espacios", async () => {
    const { jwt } = await usuarioConToken();

    const res = await request(app).post("/api/despensa").set("Authorization", `Bearer ${jwt}`).send(item);

    expect(res.status).toBe(201);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ nombre: "Leche", cantidad: 1, unidad: "l", emoji: "🥛" });
  });

  it("añade un lote", async () => {
    const { jwt } = await usuarioConToken();

    const res = await request(app)
      .post("/api/despensa")
      .set("Authorization", `Bearer ${jwt}`)
      .send([item, { nombre: "Huevos", cantidad: 6, unidad: "unidad", emoji: "🥚" }]);

    expect(res.status).toBe(201);
    expect(res.body.map((i: { nombre: string }) => i.nombre)).toEqual(["Leche", "Huevos"]);
  });

  it.each([
    ["sin emoji", { nombre: "Leche", cantidad: 1, unidad: "l" }, "nombre, cantidad, unidad y emoji son obligatorios"],
    ["con el nombre en blanco", { ...item, nombre: "   " }, "El nombre no puede estar vacío"],
    ["con una cantidad que no es un número", { ...item, cantidad: "muchas" }, "La cantidad tiene que ser un número"],
    ["con una cantidad negativa", { ...item, cantidad: -1 }, "La cantidad no puede ser negativa"],
    ["con un lote que trae un elemento incompleto", [item, { nombre: "Huevos" }], "nombre, cantidad, unidad y emoji son obligatorios"],
  ])("rechaza con 400 %s y no toca la despensa", async (_caso, cuerpo, mensaje) => {
    const { usuario, jwt } = await usuarioConToken();

    const res = await request(app)
      .post("/api/despensa")
      .set("Authorization", `Bearer ${jwt}`)
      .send(cuerpo as object);

    expect(res.status).toBe(400);
    expect(mensajesDeError(res)).toContain(mensaje);
    expect((await Usuario.findById(usuario._id).lean())?.despensa).toEqual([]);
  });
});

describe("POST /api/despensa/escanear-ticket", () => {
  beforeEach(() => (escanearTicket as jest.Mock).mockClear());

  it("devuelve los ingredientes con una imagen válida", async () => {
    const { jwt } = await usuarioConToken();

    const res = await request(app)
      .post("/api/despensa/escanear-ticket")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ imagenBase64: IMAGEN });

    expect(res.status).toBe(200);
    expect(res.body.ingredientes).toEqual([{ nombre: "Leche", cantidad: 1, unidad: "l" }]);
  });

  it.each([
    ["sin imagen", {}, "imagenBase64 es obligatorio"],
    ["con algo que no es una imagen", { imagenBase64: "data:application/pdf;base64,JVBERi0=" }, "El archivo debe ser una imagen"],
    ["con una imagen de más de 7 000 000 caracteres", { imagenBase64: `data:image/png;base64,${"A".repeat(7_000_000)}` }, "La imagen es demasiado grande (máximo ~5 MB)"],
  ])("rechaza con 400 %s", async (_caso, cuerpo, mensaje) => {
    const { jwt } = await usuarioConToken();

    const res = await request(app)
      .post("/api/despensa/escanear-ticket")
      .set("Authorization", `Bearer ${jwt}`)
      .send(cuerpo);

    expect(res.status).toBe(400);
    expect(mensajesDeError(res)).toContain(mensaje);
    expect(escanearTicket).not.toHaveBeenCalled();
  });

  it("un fallo de Gemini sale por manejarError con su status", async () => {
    const { jwt } = await usuarioConToken();
    (escanearTicket as jest.Mock).mockRejectedValueOnce(
      Object.assign(new Error("No se pudo procesar el ticket"), { status: 503 }),
    );

    const res = await request(app)
      .post("/api/despensa/escanear-ticket")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ imagenBase64: IMAGEN });

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: "No se pudo procesar el ticket" });
  });
});

describe("PUT /api/usuarios/me/contrasena", () => {
  it("cambia la contraseña con un cuerpo válido", async () => {
    const { jwt } = await usuarioConToken();

    const res = await request(app)
      .put("/api/usuarios/me/contrasena")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ contrasenaActual: CONTRASENA_VALIDA, contrasenaNueva: "Nueva1234" });

    expect(res.status).toBe(200);
  });

  it.each([
    ["sin la contraseña actual", { contrasenaNueva: "Nueva1234" }, "contrasenaActual y contrasenaNueva son obligatorios"],
    ["con la nueva vacía", { contrasenaActual: CONTRASENA_VALIDA, contrasenaNueva: "" }, "contrasenaActual y contrasenaNueva son obligatorios"],
    ["con la nueva de menos de 8 caracteres", { contrasenaActual: CONTRASENA_VALIDA, contrasenaNueva: "corta1" }, "La nueva contraseña debe tener al menos 8 caracteres"],
  ])("rechaza con 400 %s", async (_caso, cuerpo, mensaje) => {
    const { jwt } = await usuarioConToken();

    const res = await request(app)
      .put("/api/usuarios/me/contrasena")
      .set("Authorization", `Bearer ${jwt}`)
      .send(cuerpo);

    expect(res.status).toBe(400);
    expect(mensajesDeError(res)).toContain(mensaje);
  });
});

describe("PUT /api/usuarios/me/preferencias", () => {
  it("guarda dietas y alérgenos del catálogo", async () => {
    const { jwt } = await usuarioConToken();

    const res = await request(app)
      .put("/api/usuarios/me/preferencias")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ dietas: ["vegetariano"], alergenos: ["lacteos", "frutosSecos"] });

    expect(res.status).toBe(200);
    expect(res.body.alergias).toEqual(["lacteos", "frutosSecos"]);
  });

  it("rechaza con 400 si falta uno de los dos arrays", async () => {
    const { jwt } = await usuarioConToken();

    const res = await request(app)
      .put("/api/usuarios/me/preferencias")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ dietas: [] });

    expect(res.status).toBe(400);
    expect(mensajesDeError(res)).toContain("dietas y alergenos deben ser arrays");
  });

  it.each([["Lácteos"], ["gluten"], ["LACTEOS"]])(
    "rechaza con 400 el alérgeno %s, que no es un id del catálogo, y no toca el perfil",
    async (alergeno) => {
      const { usuario, jwt } = await usuarioConToken({ alergias: ["huevo"] });

      const res = await request(app)
        .put("/api/usuarios/me/preferencias")
        .set("Authorization", `Bearer ${jwt}`)
        .send({ dietas: [], alergenos: ["lacteos", alergeno] });

      expect(res.status).toBe(400);
      expect(mensajesDeError(res)).toContain(`"${alergeno}" no es un alérgeno del catálogo`);
      expect((await Usuario.findById(usuario._id).lean())?.alergias).toEqual(["huevo"]);
    },
  );
});

describe("POST /api/auth/completar-perfil con el catálogo cerrado", () => {
  it("guarda alergias que están en el catálogo", async () => {
    const { usuario, jwt } = await usuarioConToken();

    const res = await request(app)
      .post("/api/auth/completar-perfil")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ alergias: ["lacteos", "sesamo"], preferencias: ["vegano"] });

    expect(res.status).toBe(200);
    expect((await Usuario.findById(usuario._id).lean())?.alergias).toEqual(["lacteos", "sesamo"]);
  });

  it("rechaza con 400 una alergia fuera del catálogo", async () => {
    const { usuario, jwt } = await usuarioConToken();

    const res = await request(app)
      .post("/api/auth/completar-perfil")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ alergias: ["Lácteos"], preferencias: [] });

    expect(res.status).toBe(400);
    expect(mensajesDeError(res)).toContain('"Lácteos" no es un alérgeno del catálogo');
    expect((await Usuario.findById(usuario._id).lean())?.alergias).toEqual([]);
  });
});

describe("perfiles guardados antes del catálogo cerrado", () => {
  it("un usuario con alergias en texto libre sigue cargando su perfil", async () => {
    const { jwt } = await usuarioConToken({ alergias: ["Lácteos", "marisco"] });

    const res = await request(app).get("/api/usuarios/me").set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.alergias).toEqual(["Lácteos", "marisco"]);
  });
});
