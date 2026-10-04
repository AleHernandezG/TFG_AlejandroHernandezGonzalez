// Tests barrera (F9.2): no prueban una función, vigilan que nadie se salte una regla de CLAUDE.md.
// La de los alérgenos (frontend y backend con el mismo catálogo) vive en alergenos.deteccion.test.ts.

// validarBody se sustituye por un middleware marcado para poder reconocerlo al recorrer los routers.
jest.mock("../src/middlewares/validarBody", () => ({
  validarBody: (esquema: unknown) =>
    Object.assign((_req: unknown, _res: unknown, next: () => void) => next(), {
      esValidarBody: true,
      esquema,
    }),
}));

import fs from "fs";
import path from "path";
import app from "../src/app";
import { endpointsDe } from "./helpers/rutas";

const RAIZ_BACKEND = path.resolve(__dirname, "..");
const RAIZ_FRONTEND = path.resolve(__dirname, "../../frontend");

function ficherosDe(carpeta: string, extensiones = [".ts", ".tsx"]): string[] {
  return fs.readdirSync(carpeta, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = path.join(carpeta, entrada.name);
    if (entrada.isDirectory()) return ficherosDe(ruta, extensiones);
    return extensiones.includes(path.extname(entrada.name)) ? [ruta] : [];
  });
}

const relativa = (ruta: string) => path.relative(path.resolve(RAIZ_BACKEND, ".."), ruta).replace(/\\/g, "/");

describe("todo endpoint con cuerpo pasa por validarBody", () => {
  // Rutas que escriben pero no leen req.body: alternan un estado o trabajan con lo que ya hay guardado.
  // Si una empieza a leer el cuerpo, sale de aquí y gana su esquema en lib/validadores.ts.
  const SIN_CUERPO = [
    "POST /api/recetas/:id/like",
    "POST /api/recetas/:id/guardar",
    "POST /api/usuarios/:id/seguir",
    "POST /api/chat/receta-despensa",
  ];

  const endpoints = endpointsDe(app);
  const conCuerpo = endpoints.filter((e) => ["POST", "PUT", "PATCH"].includes(e.metodo));
  const posicionValidador = (e: (typeof endpoints)[number]) =>
    e.manejadores.findIndex((m) => m.esValidarBody === true);

  it("el recorrido de los routers encuentra los endpoints", () => {
    expect(endpoints.length).toBeGreaterThanOrEqual(30);
    expect(conCuerpo.length).toBeGreaterThanOrEqual(20);
  });

  it("ningún POST, PUT o PATCH llega al controlador sin validar", () => {
    const sinValidar = conCuerpo
      .filter((e) => !SIN_CUERPO.includes(e.clave))
      .filter((e) => posicionValidador(e) === -1)
      .map((e) => e.clave);

    expect(sinValidar).toEqual([]);
  });

  it("validarBody va antes que el manejador final", () => {
    const malColocados = conCuerpo
      .filter((e) => posicionValidador(e) !== -1)
      .filter((e) => posicionValidador(e) === e.manejadores.length - 1)
      .map((e) => e.clave);

    expect(malColocados).toEqual([]);
  });

  it("las excepciones siguen existiendo y siguen sin validador", () => {
    const sobrantes = SIN_CUERPO.filter((clave) => {
      const endpoint = endpoints.find((e) => e.clave === clave);
      return !endpoint || posicionValidador(endpoint) !== -1;
    });

    expect(sobrantes).toEqual([]);
  });

  it("las excepciones no leen req.body en su router", () => {
    const leenCuerpo = ["recetas", "usuarios", "chat"].filter((nombre) => {
      const codigo = fs.readFileSync(path.join(RAIZ_BACKEND, "src/routes", `${nombre}.routes.ts`), "utf8");
      // Cada lectura de req.body en un router tiene que estar en una ruta que declare validarBody.
      const lecturas = (codigo.match(/req\.body/g) ?? []).length;
      const validadores = (codigo.match(/validarBody\(/g) ?? []).length;
      return lecturas > validadores;
    });

    expect(leenCuerpo).toEqual([]);
  });
});

describe("solo los repositorios tocan los modelos de Mongoose", () => {
  const IMPORTA_MODELO = /(?:from\s+|require\(\s*|import\(\s*)["'][^"']*\/models\/[^"']*["']/;

  it.each(["services", "controllers", "routes", "middlewares"])(
    "ningún fichero de %s/ importa de models/",
    (carpeta) => {
      const ficheros = ficherosDe(path.join(RAIZ_BACKEND, "src", carpeta));
      const infractores = ficheros
        .filter((fichero) => IMPORTA_MODELO.test(fs.readFileSync(fichero, "utf8")))
        .map(relativa);

      expect(ficheros.length).toBeGreaterThan(0);
      expect(infractores).toEqual([]);
    },
  );
});

describe("toda variable de entorno que lee el código está en su .env.example", () => {
  function variablesLeidas(carpetaSrc: string): string[] {
    const nombres = new Set<string>();
    for (const fichero of ficherosDe(carpetaSrc)) {
      const codigo = fs.readFileSync(fichero, "utf8");
      for (const m of codigo.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g)) nombres.add(m[1]);
      for (const m of codigo.matchAll(/process\.env\[\s*["']([A-Z][A-Z0-9_]*)["']\s*\]/g)) nombres.add(m[1]);
    }
    return [...nombres].sort();
  }

  // Cuenta también las líneas comentadas ("# VARIABLE=valor"): son opcionales, pero están documentadas.
  function variablesDeLaPlantilla(rutaPlantilla: string): string[] {
    const texto = fs.readFileSync(rutaPlantilla, "utf8");
    return [...texto.matchAll(/^\s*#?\s*([A-Z][A-Z0-9_]*)=/gm)].map((m) => m[1]).sort();
  }

  const backend = {
    leidas: variablesLeidas(path.join(RAIZ_BACKEND, "src")),
    plantilla: variablesDeLaPlantilla(path.join(RAIZ_BACKEND, ".env.example")),
  };
  const frontend = {
    leidas: variablesLeidas(path.join(RAIZ_FRONTEND, "src")),
    plantilla: variablesDeLaPlantilla(path.join(RAIZ_FRONTEND, ".env.example")),
  };

  // Las lee NextAuth por su cuenta, no el código de Cookr.
  const SOLO_EN_PLANTILLA_FRONTEND = ["NEXTAUTH_SECRET", "NEXTAUTH_URL"];

  it("backend: lo que lee src/ está en backend/.env.example", () => {
    expect(backend.leidas.length).toBeGreaterThan(10);
    expect(backend.leidas.filter((v) => !backend.plantilla.includes(v))).toEqual([]);
  });

  it("backend: la plantilla no anuncia variables que ya nadie lee", () => {
    expect(backend.plantilla.filter((v) => !backend.leidas.includes(v))).toEqual([]);
  });

  it("frontend: lo que lee src/ está en frontend/.env.example", () => {
    expect(frontend.leidas.length).toBeGreaterThan(0);
    expect(frontend.leidas.filter((v) => !frontend.plantilla.includes(v))).toEqual([]);
  });

  it("frontend: la plantilla solo añade lo que lee NextAuth", () => {
    expect(frontend.plantilla.filter((v) => !frontend.leidas.includes(v))).toEqual(
      SOLO_EN_PLANTILLA_FRONTEND,
    );
  });
});
