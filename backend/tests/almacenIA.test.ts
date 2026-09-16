import { almacenIA, almacenIAEnRedis, reiniciarAlmacenIA } from "../src/lib/almacenIA";

describe("almacén de IA sin Upstash configurado", () => {
  beforeEach(() => {
    reiniciarAlmacenIA();
  });

  it("cae en memoria cuando no hay variables de Upstash", () => {
    expect(process.env.UPSTASH_REDIS_URL).toBeFalsy();
    expect(almacenIAEnRedis()).toBe(false);
  });

  it("incrementar cuenta desde 1 y sigue subiendo sobre la misma clave", async () => {
    expect(await almacenIA.incrementar("ia:prueba:contador", 60)).toBe(1);
    expect(await almacenIA.incrementar("ia:prueba:contador", 60)).toBe(2);
    expect(await almacenIA.incrementar("ia:prueba:contador", 60)).toBe(3);
  });

  it("aísla los contadores por clave, que es lo que separa un día del siguiente", async () => {
    await almacenIA.incrementar("ia:gemini:llamadas:2026-09-05", 60);
    await almacenIA.incrementar("ia:gemini:llamadas:2026-09-05", 60);
    expect(await almacenIA.incrementar("ia:gemini:llamadas:2026-09-06", 60)).toBe(1);
  });

  it("guarda y devuelve el valor tal cual, incluida la cadena vacía", async () => {
    await almacenIA.guardar("ia:prueba:texto", "una respuesta", 60);
    await almacenIA.guardar("ia:prueba:vacia", "", 60);

    expect(await almacenIA.leer<string>("ia:prueba:texto")).toBe("una respuesta");
    expect(await almacenIA.leer<string>("ia:prueba:vacia")).toBe("");
  });

  it("distingue una clave que no existe de una guardada con valor vacío", async () => {
    expect(await almacenIA.leer<string>("ia:prueba:no-existe")).toBeNull();
  });

  it("guarda objetos sin aplanarlos", async () => {
    await almacenIA.guardar("ia:prueba:receta", { titulo: "Tortilla", pasos: [{ texto: "Batir" }] }, 60);
    expect(await almacenIA.leer<{ titulo: string }>("ia:prueba:receta")).toEqual({
      titulo: "Tortilla",
      pasos: [{ texto: "Batir" }],
    });
  });

  it("una entrada con TTL agotado deja de leerse", async () => {
    await almacenIA.guardar("ia:prueba:caducada", "algo", 0);
    expect(await almacenIA.leer<string>("ia:prueba:caducada")).toBeNull();
  });

  it("borrar quita la entrada", async () => {
    await almacenIA.guardar("ia:contexto:abc", "- Alergias: huevo", 60);
    await almacenIA.borrar("ia:contexto:abc");
    expect(await almacenIA.leer<string>("ia:contexto:abc")).toBeNull();
  });

  it("reiniciarAlmacenIA vacía todo, que es de lo que vive tests/setup.ts", async () => {
    await almacenIA.incrementar("ia:gemini:llamadas:hoy", 60);
    await almacenIA.guardar("ia:chat:v1:abc", "respuesta", 60);

    reiniciarAlmacenIA();

    expect(await almacenIA.leer<string>("ia:chat:v1:abc")).toBeNull();
    expect(await almacenIA.incrementar("ia:gemini:llamadas:hoy", 60)).toBe(1);
  });
});
