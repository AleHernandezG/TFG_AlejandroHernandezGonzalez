jest.mock("../src/services/nutritionService", () => ({
  calcularMacros: jest.fn(),
}));

import request from "supertest";
import app from "../src/app";
import { calcularMacros } from "../src/services/nutritionService";
import { crearUsuario, tokenDe } from "./helpers/factories";

const calcularMacrosMock = calcularMacros as jest.MockedFunction<typeof calcularMacros>;

const MACROS = { calorias: 512, proteinas: 21, carbos: 60, grasas: 18 };

const INGREDIENTES = [
  { nombre: "Tortellini frescos", cantidad: "250", unidad: "g" },
  { nombre: "Nata para cocinar", cantidad: "100", unidad: "ml" },
];

beforeEach(() => {
  calcularMacrosMock.mockReset();
  calcularMacrosMock.mockResolvedValue(MACROS);
});

async function tokenDeUsuario() {
  const usuario = await crearUsuario({ correo: "macros@cookr.dev" });
  return tokenDe(usuario as never);
}

describe("POST /api/recetas/macros-preview", () => {
  it("devuelve los macros de una receta que todavía no existe", async () => {
    const jwt = await tokenDeUsuario();

    const respuesta = await request(app)
      .post("/api/recetas/macros-preview")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ ingredientes: INGREDIENTES });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual(MACROS);
  });

  it("convierte la cantidad de texto a número antes de pedir los macros", async () => {
    const jwt = await tokenDeUsuario();

    await request(app)
      .post("/api/recetas/macros-preview")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        ingredientes: [
          { nombre: "Harina", cantidad: "250", unidad: "g" },
          { nombre: "Sal", cantidad: "al gusto", unidad: "" },
        ],
      });

    expect(calcularMacrosMock).toHaveBeenCalledWith([
      { nombre: "Harina", cantidad: 250, unidad: "g" },
      { nombre: "Sal", cantidad: 0, unidad: "" },
    ]);
  });

  it("responde 401 sin sesión", async () => {
    const respuesta = await request(app)
      .post("/api/recetas/macros-preview")
      .send({ ingredientes: INGREDIENTES });

    expect(respuesta.status).toBe(401);
    expect(calcularMacrosMock).not.toHaveBeenCalled();
  });

  it("responde 400 si no llega ningún ingrediente", async () => {
    const jwt = await tokenDeUsuario();

    const respuesta = await request(app)
      .post("/api/recetas/macros-preview")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ ingredientes: [] });

    expect(respuesta.status).toBe(400);
    expect(calcularMacrosMock).not.toHaveBeenCalled();
  });
});
