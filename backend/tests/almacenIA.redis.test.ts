const mockRedis = {
  fallar: false,
  valores: new Map<string, unknown>(),
  expiraciones: [] as Array<{ clave: string; segundos: number }>,

  async incr(clave: string): Promise<number> {
    if (mockRedis.fallar) throw new Error("ECONNRESET");
    const total = ((mockRedis.valores.get(clave) as number) ?? 0) + 1;
    mockRedis.valores.set(clave, total);
    return total;
  },

  async expire(clave: string, segundos: number): Promise<number> {
    if (mockRedis.fallar) throw new Error("ECONNRESET");
    mockRedis.expiraciones.push({ clave, segundos });
    return 1;
  },

  async get<T>(clave: string): Promise<T | null> {
    if (mockRedis.fallar) throw new Error("ECONNRESET");
    return (mockRedis.valores.get(clave) as T) ?? null;
  },

  async set(clave: string, valor: unknown): Promise<string> {
    if (mockRedis.fallar) throw new Error("ECONNRESET");
    mockRedis.valores.set(clave, valor);
    return "OK";
  },

  async del(clave: string): Promise<number> {
    if (mockRedis.fallar) throw new Error("ECONNRESET");
    return mockRedis.valores.delete(clave) ? 1 : 0;
  },
};

jest.mock("../src/lib/redis", () => ({
  get redis() {
    return mockRedis;
  },
}));

type ModuloAlmacenIA = typeof import("../src/lib/almacenIA");

let almacenIA: ModuloAlmacenIA["almacenIA"];
let almacenIAEnRedis: ModuloAlmacenIA["almacenIAEnRedis"];
let reiniciarAlmacenIA: ModuloAlmacenIA["reiniciarAlmacenIA"];

jest.isolateModules(() => {
  const modulo: ModuloAlmacenIA = require("../src/lib/almacenIA");
  almacenIA = modulo.almacenIA;
  almacenIAEnRedis = modulo.almacenIAEnRedis;
  reiniciarAlmacenIA = modulo.reiniciarAlmacenIA;
});

const CLAVE_CONTADOR = "ia:gemini:llamadas:2026-09-05";

describe("almacén de IA con Upstash delante", () => {
  beforeEach(() => {
    mockRedis.fallar = false;
    mockRedis.valores.clear();
    mockRedis.expiraciones = [];
    reiniciarAlmacenIA();
  });

  it("usa Redis cuando el cliente existe", () => {
    expect(almacenIAEnRedis()).toBe(true);
  });

  it("el contador vive en Redis y solo programa la expiración en el primer incremento", async () => {
    expect(await almacenIA.incrementar(CLAVE_CONTADOR, 172800)).toBe(1);
    expect(await almacenIA.incrementar(CLAVE_CONTADOR, 172800)).toBe(2);
    expect(await almacenIA.incrementar(CLAVE_CONTADOR, 172800)).toBe(3);

    expect(mockRedis.expiraciones).toEqual([{ clave: CLAVE_CONTADOR, segundos: 172800 }]);
  });

  it("el contador arranca donde lo dejó el proceso anterior, que es todo el objetivo de F7.6", async () => {
    mockRedis.valores.set(CLAVE_CONTADOR, 417);
    expect(await almacenIA.incrementar(CLAVE_CONTADOR, 172800)).toBe(418);
  });

  it("guarda envuelto y devuelve el valor desenvuelto", async () => {
    await almacenIA.guardar("ia:chat:v1:abc", "Diez minutos.", 604800);

    expect(mockRedis.valores.get("ia:chat:v1:abc")).toEqual({ v: "Diez minutos." });
    expect(await almacenIA.leer<string>("ia:chat:v1:abc")).toBe("Diez minutos.");
  });

  it("una respuesta que parece un número sigue siendo la cadena que se guardó", async () => {
    await almacenIA.guardar("ia:chat:v1:numero", "10", 604800);
    expect(await almacenIA.leer<string>("ia:chat:v1:numero")).toBe("10");
  });

  it("borrar quita la clave de Redis", async () => {
    await almacenIA.guardar("ia:contexto:xyz", "- Alergias: huevo", 300);
    await almacenIA.borrar("ia:contexto:xyz");
    expect(await almacenIA.leer<string>("ia:contexto:xyz")).toBeNull();
  });

  describe("cuando Upstash no responde", () => {
    it("el contador no revienta: cae al de memoria y deja pasar la llamada", async () => {
      mockRedis.fallar = true;
      expect(await almacenIA.incrementar(CLAVE_CONTADOR, 172800)).toBe(1);
      expect(await almacenIA.incrementar(CLAVE_CONTADOR, 172800)).toBe(2);
    });

    it("leer devuelve null en vez de propagar el fallo, así que se trata como un miss", async () => {
      mockRedis.fallar = true;
      expect(await almacenIA.leer<string>("ia:chat:v1:abc")).toBeNull();
    });

    it("guardar y borrar no propagan el fallo", async () => {
      mockRedis.fallar = true;
      await expect(almacenIA.guardar("ia:chat:v1:abc", "respuesta", 604800)).resolves.toBeUndefined();
      await expect(almacenIA.borrar("ia:chat:v1:abc")).resolves.toBeUndefined();
    });

    it("lo escrito durante la caída se lee de memoria hasta que Redis vuelve", async () => {
      mockRedis.fallar = true;
      await almacenIA.guardar("ia:chat:v1:abc", "respuesta de la caída", 604800);
      expect(await almacenIA.leer<string>("ia:chat:v1:abc")).toBe("respuesta de la caída");

      mockRedis.fallar = false;
      expect(await almacenIA.leer<string>("ia:chat:v1:abc")).toBeNull();
    });
  });
});
