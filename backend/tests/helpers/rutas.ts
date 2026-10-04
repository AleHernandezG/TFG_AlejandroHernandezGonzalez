import type { Express } from "express";

export type Endpoint = {
  metodo: string;
  ruta: string;
  clave: string;
  manejadores: Array<((...args: unknown[]) => unknown) & Record<string, unknown>>;
};

type Capa = {
  name: string;
  regexp: RegExp;
  handle: { stack?: Capa[] } & ((...args: unknown[]) => unknown);
  route?: { path: string; methods: Record<string, boolean>; stack: Capa[] };
};

// Express 4 guarda el prefijo de app.use("/api/x", router) solo como expresión regular.
function prefijoDe(capa: Capa): string {
  const texto = capa.regexp.source
    .replace(/^\^/, "")
    .replace("\\/?(?=\\/|$)", "")
    .replace(/\\\//g, "/");
  if (!/^(\/[\w-]+)*$/.test(texto)) {
    throw new Error(`No sé leer el prefijo del router montado en ${capa.regexp}`);
  }
  return texto;
}

function recorrer(capas: Capa[], prefijo: string): Endpoint[] {
  return capas.flatMap((capa) => {
    if (capa.route) {
      const ruta = (prefijo + capa.route.path).replace(/(.)\/$/, "$1");
      return Object.keys(capa.route.methods).map((metodo) => ({
        metodo: metodo.toUpperCase(),
        ruta,
        clave: `${metodo.toUpperCase()} ${ruta}`,
        manejadores: capa.route!.stack.map((c) => c.handle as Endpoint["manejadores"][number]),
      }));
    }
    if (capa.name === "router" && capa.handle.stack) {
      return recorrer(capa.handle.stack, prefijo + prefijoDe(capa));
    }
    return [];
  });
}

/** Todos los endpoints que hay montados en la app, leídos de los routers de Express y no de un listado a mano. */
export function endpointsDe(app: Express): Endpoint[] {
  const raiz = (app as unknown as { _router: { stack: Capa[] } })._router.stack;
  return recorrer(raiz, "");
}
