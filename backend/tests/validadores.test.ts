import {
  esquemaRegistro,
  esquemaLogin,
  esquemaCrearRecetaBody,
  esquemaGoogleOAuth,
  esquemaCompletarPerfil,
} from "../src/lib/validadores";

describe("esquemaRegistro", () => {
  const valido = { nombre: "Alejandro", correo: "alejandro@cookr.dev", contrasena: "Test1234" };

  it("acepta un registro válido", () => {
    expect(esquemaRegistro.safeParse(valido).success).toBe(true);
  });

  it("normaliza el correo a minúsculas", () => {
    const res = esquemaRegistro.parse({ ...valido, correo: "ALEJANDRO@Cookr.DEV" });
    expect(res.correo).toBe("alejandro@cookr.dev");
  });

  it("recorta los espacios alrededor del correo en vez de rechazarlo", () => {
    const res = esquemaRegistro.parse({ ...valido, correo: " alejandro@cookr.dev " });
    expect(res.correo).toBe("alejandro@cookr.dev");
  });

  it("recorta y normaliza a la vez", () => {
    const res = esquemaRegistro.parse({ ...valido, correo: "  ALEJANDRO@Cookr.DEV\t" });
    expect(res.correo).toBe("alejandro@cookr.dev");
  });

  it("rechaza un correo sin formato", () => {
    expect(esquemaRegistro.safeParse({ ...valido, correo: "no-es-un-correo" }).success).toBe(false);
  });

  it("rechaza una contraseña de menos de 8 caracteres", () => {
    expect(esquemaRegistro.safeParse({ ...valido, contrasena: "Test123" }).success).toBe(false);
  });

  it("rechaza una contraseña sin números", () => {
    expect(esquemaRegistro.safeParse({ ...valido, contrasena: "SoloLetras" }).success).toBe(false);
  });

  it("rechaza una contraseña sin letras", () => {
    expect(esquemaRegistro.safeParse({ ...valido, contrasena: "12345678" }).success).toBe(false);
  });

  it("rechaza un nombre de un solo carácter", () => {
    expect(esquemaRegistro.safeParse({ ...valido, nombre: "A" }).success).toBe(false);
  });
});

describe("esquemaLogin", () => {
  it("acepta cualquier contraseña no vacía, sin exigir la política del registro", () => {
    const res = esquemaLogin.safeParse({ correo: "a@cookr.dev", contrasena: "x" });
    expect(res.success).toBe(true);
  });

  it("rechaza una contraseña vacía", () => {
    expect(esquemaLogin.safeParse({ correo: "a@cookr.dev", contrasena: "" }).success).toBe(false);
  });
});

describe("esquemaGoogleOAuth", () => {
  it("cae a «Usuario» cuando el nombre viene vacío", () => {
    const res = esquemaGoogleOAuth.parse({
      googleId: "123",
      correo: "a@cookr.dev",
      nombre: "",
    });
    expect(res.nombre).toBe("Usuario");
  });

  it("descarta una foto que no es una URL en vez de fallar", () => {
    const res = esquemaGoogleOAuth.parse({
      googleId: "123",
      correo: "a@cookr.dev",
      nombre: "Ana",
      foto: "no-es-una-url",
    });
    expect(res.foto).toBeUndefined();
  });
});

describe("esquemaCompletarPerfil", () => {
  it("rellena arrays vacíos cuando no se manda nada", () => {
    const res = esquemaCompletarPerfil.parse({});
    expect(res).toEqual({ alergias: [], preferencias: [] });
  });
});

describe("esquemaCrearRecetaBody", () => {
  const valida = {
    titulo: "Tortilla de patatas",
    descripcion: "La tortilla de siempre, con cebolla porque sí.",
    tiempo: 30,
    unidadTiempo: "min",
    porciones: 4,
    dificultad: "media",
    dietas: [],
    alergenos: ["huevo"],
    ingredientes: [{ nombre: "Huevo", cantidad: "4", unidad: "ud" }],
    pasos: [{ texto: "Bate los huevos con calma y reserva." }],
  };

  it("acepta una receta válida", () => {
    expect(esquemaCrearRecetaBody.safeParse(valida).success).toBe(true);
  });

  it("exige al menos un ingrediente", () => {
    expect(esquemaCrearRecetaBody.safeParse({ ...valida, ingredientes: [] }).success).toBe(false);
  });

  it("exige al menos un paso", () => {
    expect(esquemaCrearRecetaBody.safeParse({ ...valida, pasos: [] }).success).toBe(false);
  });

  it("rechaza una dificultad fuera del enum", () => {
    expect(esquemaCrearRecetaBody.safeParse({ ...valida, dificultad: "imposible" }).success).toBe(false);
  });

  it("rechaza un tiempo no entero", () => {
    expect(esquemaCrearRecetaBody.safeParse({ ...valida, tiempo: 2.5 }).success).toBe(false);
  });

  it("rechaza un paso demasiado corto", () => {
    expect(esquemaCrearRecetaBody.safeParse({ ...valida, pasos: [{ texto: "Bate" }] }).success).toBe(false);
  });

  it("deja dietas y alergenos vacíos por defecto", () => {
    const { dietas, alergenos, ...sinListas } = valida;
    const res = esquemaCrearRecetaBody.parse(sinListas);
    expect(res.dietas).toEqual([]);
    expect(res.alergenos).toEqual([]);
  });
});
