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

import fs from "fs";
import path from "path";
import ts from "typescript";
import request from "supertest";
import app from "../src/app";
import { Receta } from "../src/models/recetaMongo";
import {
  DIETAS,
  canonizarDieta,
  esRestriccionDeAlergeno,
  filtrarDietas,
  normalizarCategorias,
} from "../src/lib/dietas";
import { crearReceta, crearUsuario, tokenDe } from "./helpers/factories";

type ModuloFrontend = {
  DIETAS_OPCIONES: ReadonlyArray<{ id: string; label: string }>;
};

function cargarDietasDelFrontend(): ModuloFrontend {
  const ruta = path.resolve(__dirname, "../../frontend/src/config/opcionesUsuario.ts");
  const { outputText } = ts.transpileModule(fs.readFileSync(ruta, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const modulo = { exports: {} as ModuloFrontend };
  new Function("module", "exports", outputText)(modulo, modulo.exports);
  return modulo.exports;
}

function cuerpoReceta(extra: Record<string, unknown> = {}) {
  return {
    titulo: "Ensalada de garbanzos",
    descripcion: "Una descripción suficientemente larga para el esquema.",
    tiempo: 15,
    unidadTiempo: "min",
    porciones: 2,
    dificultad: "facil",
    dietas: [],
    alergenos: [],
    ingredientes: [{ nombre: "Garbanzos cocidos", cantidad: "400", unidad: "g" }],
    pasos: [{ texto: "Un paso lo bastante largo como para valer." }],
    ...extra,
  };
}

async function autorConToken(correo = "dietas@cookr.dev") {
  const autor = await crearUsuario({ correo });
  return { autor, jwt: tokenDe(autor as never) };
}

async function categoriasGuardadas(id: string) {
  const receta = await Receta.findById(id).lean();
  return [...(receta?.categorias ?? [])].sort();
}

describe("vocabulario de dietas", () => {
  it("es el mismo en el backend y en el frontend", () => {
    const { DIETAS_OPCIONES } = cargarDietasDelFrontend();

    expect(DIETAS_OPCIONES.map((dieta) => dieta.id)).toEqual(DIETAS);
  });

  it.each([
    ["vegetariana", "vegetariano"],
    ["Vegetariano", "vegetariano"],
    ["vegana", "vegano"],
    ["mediterránea", "mediterranea"],
    ["  Keto  ", "keto"],
    ["lowcarb", "lowCarb"],
  ])("canoniza %s como %s", (entrada, esperada) => {
    expect(canonizarDieta(entrada)).toBe(esperada);
  });

  it.each(["sin lactosa", "sin gluten (verificar ingredientes)", "italiana", "postres", ""])(
    "no reconoce %s como dieta",
    (entrada) => {
      expect(canonizarDieta(entrada)).toBeNull();
    },
  );

  it("descarta lo que no está en la lista y no repite", () => {
    expect(filtrarDietas(["vegetariana", "vegetariano", "sin lactosa", "italiana", "keto"])).toEqual([
      "vegetariano",
      "keto",
    ]);
  });

  it("aguanta una lista vacía o ausente", () => {
    expect(filtrarDietas([])).toEqual([]);
    expect(filtrarDietas()).toEqual([]);
  });
});

describe("normalización de categorías ya guardadas", () => {
  it("respeta las cocinas y los tipos de plato, que no son dietas", () => {
    expect(normalizarCategorias(["vegetariana", "italiana", "postres"])).toEqual([
      "vegetariano",
      "italiana",
      "postres",
    ]);
  });

  it("borra las restricciones de alérgeno coladas como categoría", () => {
    expect(
      normalizarCategorias(["sin lactosa", "sin gluten (verificar ingredientes)", "mediterranea"]),
    ).toEqual(["mediterranea"]);
  });

  it.each(["sin lactosa", "Sin Gluten", "sin frutos secos"])("%s es una restricción", (valor) => {
    expect(esRestriccionDeAlergeno(valor)).toBe(true);
  });

  it.each(["vegano", "sinatra", "single malt"])("%s no lo es", (valor) => {
    expect(esRestriccionDeAlergeno(valor)).toBe(false);
  });

  it("deja igual una lista que ya está bien", () => {
    const limpia = ["vegetariano", "keto", "italiana"];

    expect(normalizarCategorias(limpia)).toEqual(limpia);
  });
});

describe("dietas al crear y editar una receta", () => {
  it("guarda solo las dietas del vocabulario", async () => {
    const { jwt } = await autorConToken();

    const res = await request(app)
      .post("/api/recetas")
      .set("Authorization", `Bearer ${jwt}`)
      .send(cuerpoReceta({ dietas: ["vegetariana", "sin lactosa", "keto"] }));

    expect(res.status).toBe(201);
    expect(await categoriasGuardadas(res.body.id)).toEqual(["keto", "vegetariano"]);
  });

  it("no rechaza la petición porque venga una dieta inventada", async () => {
    const { jwt } = await autorConToken("otro@cookr.dev");

    const res = await request(app)
      .post("/api/recetas")
      .set("Authorization", `Bearer ${jwt}`)
      .send(cuerpoReceta({ dietas: ["dieta del astronauta"] }));

    expect(res.status).toBe(201);
    expect(await categoriasGuardadas(res.body.id)).toEqual([]);
  });

  it("también filtra al editar", async () => {
    const { jwt } = await autorConToken("editor@cookr.dev");

    const creada = await request(app)
      .post("/api/recetas")
      .set("Authorization", `Bearer ${jwt}`)
      .send(cuerpoReceta({ dietas: ["keto"] }));

    const res = await request(app)
      .put(`/api/recetas/${creada.body.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ dietas: ["vegana", "sin gluten (verificar ingredientes)"] });

    expect(res.status).toBe(204);
    expect(await categoriasGuardadas(creada.body.id)).toEqual(["vegano"]);
  });

  it("conserva las cocinas y tipos de plato que el formulario no sabe editar", async () => {
    const { autor, jwt } = await autorConToken("cocina@cookr.dev");
    const receta = await crearReceta({
      autorId: autor._id,
      categorias: ["vegetariana", "italiana", "postres", "sin lactosa"],
    });

    await request(app)
      .put(`/api/recetas/${receta._id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ dietas: ["keto"] });

    expect(await categoriasGuardadas(String(receta._id))).toEqual(["italiana", "keto", "postres"]);
  });

  it("no toca las categorías si la edición no manda dietas", async () => {
    const { jwt } = await autorConToken("titulo@cookr.dev");

    const creada = await request(app)
      .post("/api/recetas")
      .set("Authorization", `Bearer ${jwt}`)
      .send(cuerpoReceta({ dietas: ["vegano"] }));

    await request(app)
      .put(`/api/recetas/${creada.body.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ titulo: "Ensalada de garbanzos y pimiento" });

    expect(await categoriasGuardadas(creada.body.id)).toEqual(["vegano"]);
  });
});
