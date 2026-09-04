jest.mock("../src/services/imagenService", () => ({
  buscarFotoPexelsCascada: jest.fn().mockResolvedValue(null),
}));
jest.mock("../src/services/nutritionService", () => ({
  calcularMacros: jest.fn().mockResolvedValue({ calorias: 0, proteinas: 0, carbos: 0, grasas: 0 }),
}));

import request from "supertest";
import app from "../src/app";
import { Receta } from "../src/models/recetaMongo";
import { Usuario } from "../src/models/usuarioMongo";
import { crearUsuario } from "./helpers/factories";

const CATEGORIAS = ["postre", "vegano", "vegetariano", "entrante", "principal"];

async function sembrarRecetas(cuantas: number) {
  const autor = await crearUsuario({ correo: "indices@cookr.dev" });
  await Receta.insertMany(
    Array.from({ length: cuantas }, (_, i) => ({
      autorId: autor._id,
      titulo: `Receta ${i}`,
      descripcion: "Una descripción suficientemente larga para el esquema.",
      imagenUrl: "",
      tiempo: "20 min",
      dificultad: ["Fácil", "Media", "Difícil"][i % 3],
      porciones: 2,
      categorias: [CATEGORIAS[i % CATEGORIAS.length]],
      ingredientes: [{ nombre: "Sal", cantidad: 1, unidad: "g" }],
      pasos: ["Un paso lo bastante largo como para valer."],
      alergenos: [],
      macros: { calorias: 1, proteinas: 1, carbos: 1, grasas: 1 },
      likes: [],
      listaComentarios: [],
      fechaPublicacion: new Date(Date.now() - i * 3_600_000),
    })),
  );
  return autor;
}

type ConsultaEspiada = { filtro: Record<string, unknown>; opciones: Record<string, unknown> };

async function consultaDelFeed(query: string): Promise<ConsultaEspiada> {
  const espiadas: ConsultaEspiada[] = [];
  const coleccion = Receta.collection as unknown as {
    find: (filtro: unknown, opciones: unknown) => unknown;
  };
  const original = coleccion.find.bind(coleccion);

  coleccion.find = (filtro: unknown, opciones: unknown) => {
    espiadas.push({
      filtro: filtro as Record<string, unknown>,
      opciones: (opciones ?? {}) as Record<string, unknown>,
    });
    return original(filtro, opciones);
  };

  try {
    const res = await request(app).get(`/api/recetas${query}`);
    expect(res.status).toBe(200);
  } finally {
    coleccion.find = original;
  }

  expect(espiadas).toHaveLength(1);
  return espiadas[0];
}

function etapasDe(plan: Record<string, unknown>): string[] {
  const etapa = plan.stage as string;
  const hijo = plan.inputStage as Record<string, unknown> | undefined;
  return hijo ? [etapa, ...etapasDe(hijo)] : [etapa];
}

async function planDe({ filtro, opciones }: ConsultaEspiada) {
  const explicacion = (await Receta.find(filtro)
    .sort(opciones.sort as Record<string, 1 | -1>)
    .skip((opciones.skip as number) ?? 0)
    .limit((opciones.limit as number) ?? 0)
    .explain("executionStats")) as unknown as {
    queryPlanner: { winningPlan: Record<string, unknown> };
    executionStats: { totalDocsExamined: number; nReturned: number };
  };

  const ganador = (explicacion.queryPlanner.winningPlan.queryPlan ??
    explicacion.queryPlanner.winningPlan) as Record<string, unknown>;

  return {
    etapas: etapasDe(ganador),
    docsExaminados: explicacion.executionStats.totalDocsExamined,
    devueltos: explicacion.executionStats.nReturned,
  };
}

describe("los indices del esquema los crea Mongoose al arrancar", () => {
  it("la coleccion de recetas tiene los indices declarados sin crearlos a mano", async () => {
    await Receta.init();
    const nombres = (await Receta.collection.listIndexes().toArray()).map((i) => i.name);

    expect(nombres).toEqual(
      expect.arrayContaining([
        "fechaPublicacion_-1",
        "autorId_1_fechaPublicacion_-1",
        "categorias_1_fechaPublicacion_-1",
        "esEvento_1_fechaPublicacion_-1",
      ]),
    );
  });

  it("usuario indexa googleId como sparse, que las cuentas locales no lo tienen", async () => {
    await Usuario.init();
    const googleId = (await Usuario.collection.listIndexes().toArray()).find(
      (i) => i.name === "googleId_1",
    );

    expect(googleId).toBeDefined();
    expect(googleId?.sparse).toBe(true);
  });
});

describe("el feed no recorre la coleccion entera", () => {
  beforeEach(async () => {
    await sembrarRecetas(200);
    await Receta.init();
  });

  it("el feed sin filtros entra por el indice de fecha", async () => {
    const plan = await planDe(await consultaDelFeed(""));

    expect(plan.etapas).not.toContain("COLLSCAN");
    expect(plan.etapas).toContain("IXSCAN");
    expect(plan.docsExaminados).toBeLessThanOrEqual(20);
  });

  it("el feed filtrado por categoria entra por el indice de categoria", async () => {
    const plan = await planDe(await consultaDelFeed("?categoria=postre"));

    expect(plan.etapas).not.toContain("COLLSCAN");
    expect(plan.etapas).toContain("IXSCAN");
    expect(plan.docsExaminados).toBeLessThanOrEqual(20);
  });

  it("ninguno de los dos ordena en memoria: el indice ya trae el orden", async () => {
    const sinFiltros = await planDe(await consultaDelFeed(""));
    const porCategoria = await planDe(await consultaDelFeed("?categoria=postre"));

    expect(sinFiltros.etapas).not.toContain("SORT");
    expect(porCategoria.etapas).not.toContain("SORT");
  });
});
