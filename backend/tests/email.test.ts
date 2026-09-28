jest.mock("axios", () => ({ post: jest.fn() }));

import axios from "axios";
import {
  avisarSiElRemitenteFallaDMARC,
  dominioQueFallaDMARC,
  enviarEmailRecuperacion,
  enviarEmailVerificacion,
} from "../src/lib/email";

const postMock = axios.post as jest.Mock;

const VARIABLES = [
  "MAILJET_API_KEY",
  "MAILJET_SECRET_KEY",
  "SENDER_EMAIL",
  "SENDER_NAME",
  "REPLY_TO_EMAIL",
  "NODE_ENV",
] as const;
const entornoOriginal = Object.fromEntries(VARIABLES.map((k) => [k, process.env[k]]));

function restaurarEntorno() {
  for (const k of VARIABLES) {
    const valor = entornoOriginal[k];
    if (valor === undefined) delete process.env[k];
    else process.env[k] = valor;
  }
}

beforeEach(() => {
  process.env.MAILJET_API_KEY = "clave-falsa";
  process.env.MAILJET_SECRET_KEY = "secreto-falso";
  process.env.SENDER_EMAIL = "noreply@cookr.dev";
  delete process.env.SENDER_NAME;
  delete process.env.REPLY_TO_EMAIL;
  postMock.mockResolvedValue({ data: {} });
});

afterEach(restaurarEntorno);

function mensajeEnviado() {
  expect(postMock).toHaveBeenCalledTimes(1);
  return postMock.mock.calls[0][1].Messages[0];
}

describe("envío por Mailjet", () => {
  it("falla con un error que nombra SENDER_EMAIL si falta, sin llamar a Mailjet", async () => {
    delete process.env.SENDER_EMAIL;

    await expect(enviarEmailVerificacion("ana@cookr.dev", "Ana", "tok")).rejects.toThrow(
      /SENDER_EMAIL no configurada/,
    );
    expect(postMock).not.toHaveBeenCalled();
  });

  it("no cae a GMAIL_USER ni a un remitente inventado", async () => {
    delete process.env.SENDER_EMAIL;
    process.env.GMAIL_USER = "alguien@gmail.com";

    try {
      await expect(enviarEmailRecuperacion("ana@cookr.dev", "Ana", "tok")).rejects.toThrow(/SENDER_EMAIL/);
      expect(postMock).not.toHaveBeenCalled();
    } finally {
      delete process.env.GMAIL_USER;
    }
  });

  it("sigue fallando antes si faltan las claves de Mailjet", async () => {
    delete process.env.MAILJET_API_KEY;

    await expect(enviarEmailVerificacion("ana@cookr.dev", "Ana", "tok")).rejects.toThrow(/MAILJET_API_KEY/);
    expect(postMock).not.toHaveBeenCalled();
  });

  it("sin REPLY_TO_EMAIL no manda ReplyTo", async () => {
    await enviarEmailVerificacion("ana@cookr.dev", "Ana", "tok");

    const mensaje = mensajeEnviado();
    expect(mensaje.From).toEqual({ Email: "noreply@cookr.dev", Name: "Cookr" });
    expect(mensaje).not.toHaveProperty("ReplyTo");
    expect(mensaje.To).toEqual([{ Email: "ana@cookr.dev", Name: "Ana" }]);
  });

  it("con REPLY_TO_EMAIL manda ReplyTo y deja el remitente intacto", async () => {
    process.env.REPLY_TO_EMAIL = "alejes@usal.es";

    await enviarEmailRecuperacion("ana@cookr.dev", "Ana", "tok");

    const mensaje = mensajeEnviado();
    expect(mensaje.ReplyTo).toEqual({ Email: "alejes@usal.es" });
    expect(mensaje.From.Email).toBe("noreply@cookr.dev");
  });

  it("envía desde un remitente que falla DMARC igual que desde cualquier otro", async () => {
    process.env.SENDER_EMAIL = "alejes@usal.es";

    await enviarEmailVerificacion("ana@hotmail.com", "Ana", "tok");

    expect(mensajeEnviado().From.Email).toBe("alejes@usal.es");
  });

  it("autentica contra Mailjet con las claves del entorno", async () => {
    await enviarEmailVerificacion("ana@cookr.dev", "Ana", "tok");

    expect(postMock.mock.calls[0][2].auth).toEqual({ username: "clave-falsa", password: "secreto-falso" });
  });
});

describe("dominios que no pasan DMARC", () => {
  it.each([
    ["alguien@gmail.com", "gmail.com"],
    ["alejes@usal.es", "usal.es"],
    ["Alguien@Hotmail.COM", "hotmail.com"],
    ["alguien@outlook.es", "outlook.es"],
    ["alumno@alumnos.usal.es", "usal.es"],
  ])("detecta %s", (correo, dominio) => {
    expect(dominioQueFallaDMARC(correo)).toBe(dominio);
  });

  it.each(["noreply@cookr.dev", "noreply@mail.cookr.app", "alguien@notgmail.com"])(
    "deja pasar %s",
    (correo) => {
      expect(dominioQueFallaDMARC(correo)).toBeNull();
    },
  );
});

describe("aviso de arranque sobre el remitente", () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => warn.mockRestore());

  it("avisa de DMARC con un remitente de usal.es y no lo cambia", () => {
    process.env.NODE_ENV = "production";
    process.env.SENDER_EMAIL = "alejes@usal.es";

    expect(() => avisarSiElRemitenteFallaDMARC()).not.toThrow();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/DMARC/);
    expect(warn.mock.calls[0][0]).toMatch(/Hotmail/);
    expect(process.env.SENDER_EMAIL).toBe("alejes@usal.es");
  });

  it("no avisa con un remitente de dominio propio", () => {
    process.env.NODE_ENV = "production";

    avisarSiElRemitenteFallaDMARC();

    expect(warn).not.toHaveBeenCalled();
  });

  it("avisa si falta SENDER_EMAIL", () => {
    process.env.NODE_ENV = "production";
    delete process.env.SENDER_EMAIL;

    avisarSiElRemitenteFallaDMARC();

    expect(warn.mock.calls[0][0]).toMatch(/SENDER_EMAIL no está definida/);
  });

  it("se calla en NODE_ENV=test", () => {
    process.env.NODE_ENV = "test";
    process.env.SENDER_EMAIL = "alguien@gmail.com";

    avisarSiElRemitenteFallaDMARC();

    expect(warn).not.toHaveBeenCalled();
  });
});
