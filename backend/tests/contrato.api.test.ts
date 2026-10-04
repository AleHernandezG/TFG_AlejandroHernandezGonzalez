// Barrera del contrato (F10.3): docs/referencia/api.md tiene que describir los endpoints que hay
// montados de verdad. Un endpoint nuevo sin su apartado pone este fichero en rojo.

import fs from "fs";
import path from "path";
import app from "../src/app";
import { endpointsDe } from "./helpers/rutas";

const RUTA_CONTRATO = path.resolve(__dirname, "../../docs/referencia/api.md");

type Apartado = { clave: string; texto: string };

function apartadosDelContrato(): Apartado[] {
  const contrato = fs.readFileSync(RUTA_CONTRATO, "utf8").replace(/\r\n/g, "\n");
  const trozos = contrato.split(/^### /m).slice(1);
  return trozos
    .map((trozo) => {
      const [titulo, ...resto] = trozo.split("\n");
      return { clave: titulo.trim(), texto: resto.join("\n").split(/^## /m)[0] };
    })
    .filter(({ clave }) => /^(GET|POST|PUT|PATCH|DELETE) \/api\//.test(clave));
}

function authReal(nombres: string[]): string {
  if (nombres.includes("requerirAuth")) return "`requerirAuth`";
  if (nombres.includes("optionalAuth")) return "`optionalAuth`";
  return "pública";
}

describe("docs/referencia/api.md describe los endpoints que existen", () => {
  const reales = endpointsDe(app);
  const apartados = apartadosDelContrato();
  const documentados = apartados.map((a) => a.clave);

  it("el recorrido de los routers encuentra los endpoints", () => {
    expect(reales.length).toBeGreaterThanOrEqual(30);
  });

  it("no hay ningún endpoint sin documentar", () => {
    expect(reales.map((e) => e.clave).filter((clave) => !documentados.includes(clave))).toEqual([]);
  });

  it("no hay documentado ningún endpoint que ya no existe", () => {
    const claves = reales.map((e) => e.clave);

    expect(documentados.filter((clave) => !claves.includes(clave))).toEqual([]);
  });

  it("ningún endpoint está documentado dos veces", () => {
    expect(documentados.filter((clave, i) => documentados.indexOf(clave) !== i)).toEqual([]);
  });

  it("la cifra total que da el documento es la real", () => {
    const contrato = fs.readFileSync(RUTA_CONTRATO, "utf8");
    const cifra = Number(/\*\*Total: (\d+) endpoints\.\*\*/.exec(contrato)?.[1]);

    expect(cifra).toBe(reales.length);
  });

  it("cada apartado dice auth, limitador, respuesta y errores", () => {
    const incompletos = apartados
      .filter(({ texto }) =>
        ["- **Auth:**", "- **Limitador:**", "- **Respuesta:**", "- **Errores:**"].some(
          (campo) => !texto.includes(campo),
        ),
      )
      .map((a) => a.clave);

    expect(incompletos).toEqual([]);
  });

  it("la auth documentada es la del router", () => {
    const distintos = reales
      .map((endpoint) => {
        const apartado = apartados.find((a) => a.clave === endpoint.clave);
        const documentada = /- \*\*Auth:\*\* (.+)/.exec(apartado?.texto ?? "")?.[1].trim();
        const real = authReal(endpoint.manejadores.map((m) => m.name));
        return documentada === real ? null : `${endpoint.clave}: dice ${documentada}, es ${real}`;
      })
      .filter(Boolean);

    expect(distintos).toEqual([]);
  });
});
