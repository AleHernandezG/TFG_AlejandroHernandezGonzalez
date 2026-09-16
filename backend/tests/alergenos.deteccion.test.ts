import fs from "fs";
import path from "path";
import ts from "typescript";
import {
  alergenosDeReceta,
  detectarAlergenos,
  DatoIngrediente,
  INGREDIENTES_COMUNES,
} from "../src/lib/ingredientes";

type ModuloFrontend = {
  INGREDIENTES_COMUNES: DatoIngrediente[];
  detectarAlergenos: (nombres: string[]) => string[];
};

function cargarCatalogoDelFrontend(): ModuloFrontend {
  const ruta = path.resolve(__dirname, "../../frontend/src/config/ingredientes.ts");
  const { outputText } = ts.transpileModule(fs.readFileSync(ruta, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const modulo = { exports: {} as ModuloFrontend };
  new Function("module", "exports", outputText)(modulo, modulo.exports);
  return modulo.exports;
}

const ordenados = (alergenos: string[]) => [...alergenos].sort();

describe("detección de alérgenos por nombre de ingrediente", () => {
  it.each([
    ["Tortellini frescos", ["cereales", "huevo", "lacteos"]],
    ["Parmesano rallado", ["lacteos"]],
    ["Queso rallado", ["lacteos"]],
    ["Mantequilla de cacahuete", ["cacahuetes"]],
    ["Leche de soja", ["soja"]],
    ["Salmón ahumado", ["pescado"]],
    ["Tortillas integrales", ["cereales"]],
    ["Espaguetis", ["cereales"]],
    ["Langostinos cocidos", ["crustaceos"]],
  ])("%s lleva %j", (ingrediente, esperados) => {
    expect(ordenados(detectarAlergenos([ingrediente]))).toEqual(ordenados(esperados));
  });

  it.each([
    "Leche de coco",
    "Nuez moscada",
    "Harina de arroz",
    "Pasta de tomate",
    "Lechuga",
    "Garam masala",
    "Tortillas de maíz",
    "Queso vegano",
  ])("%s no lleva ninguno", (ingrediente) => {
    expect(detectarAlergenos([ingrediente])).toEqual([]);
  });

  it("junta los alérgenos de todos los ingredientes sin repetir", () => {
    const alergenos = detectarAlergenos(["Huevos", "Leche entera", "Harina de trigo", "Mantequilla"]);

    expect(ordenados(alergenos)).toEqual(["cereales", "huevo", "lacteos"]);
  });

  it("todo ingrediente del catálogo detecta al menos los alérgenos con los que está etiquetado", () => {
    const sinDetectar = INGREDIENTES_COMUNES.flatMap((ingrediente) =>
      [ingrediente.nombre, ...ingrediente.aliases]
        .map((texto) => ({ texto, detectados: detectarAlergenos([texto]) }))
        .filter(({ detectados }) => ingrediente.alergenos.some((a) => !detectados.includes(a)))
        .map(({ texto }) => texto),
    );

    expect(sinDetectar).toEqual([]);
  });
});

describe("alérgenos que se guardan con una receta", () => {
  it("une los declarados por el autor con los detectados", () => {
    const alergenos = alergenosDeReceta(["Tortellini frescos"], ["sulfitos"]);

    expect(ordenados(alergenos)).toEqual(["cereales", "huevo", "lacteos", "sulfitos"]);
  });

  it("descarta lo que no es un alérgeno conocido", () => {
    expect(alergenosDeReceta(["Lechuga"], ["veneno", "lacteos"])).toEqual(["lacteos"]);
  });

  it("no deja quitar un alérgeno que los ingredientes llevan", () => {
    expect(alergenosDeReceta(["Queso rallado"], [])).toEqual(["lacteos"]);
  });
});

describe("el catálogo del backend es copia del del frontend", () => {
  const frontend = cargarCatalogoDelFrontend();

  it("tiene los mismos ingredientes, alias y alérgenos", () => {
    const resumir = (catalogo: DatoIngrediente[]) =>
      catalogo.map(({ nombre, aliases, alergenos }) => ({ nombre, aliases, alergenos }));

    expect(resumir(INGREDIENTES_COMUNES)).toEqual(resumir(frontend.INGREDIENTES_COMUNES));
  });

  it("detecta lo mismo en los dos lados", () => {
    const muestras = [
      ...INGREDIENTES_COMUNES.map((ingrediente) => ingrediente.nombre),
      "Tortellini frescos",
      "Leche de coco",
      "Tortillas integrales",
      "Panecillos bao",
      "Trofie o fusilli",
      "Queso vegano",
    ];

    const distintos = muestras.filter(
      (nombre) =>
        ordenados(detectarAlergenos([nombre])).join() !==
        ordenados(frontend.detectarAlergenos([nombre])).join(),
    );

    expect(distintos).toEqual([]);
  });
});
