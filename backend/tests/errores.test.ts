jest.mock("../src/services/despensaService", () => ({
  despensaService: {
    obtener: jest.fn(),
    editar: jest.fn(),
  },
}));

import request from "supertest";
import app from "../src/app";
import { despensaService } from "../src/services/despensaService";
import { crearUsuario, tokenDe } from "./helpers/factories";

const mockObtener = despensaService.obtener as jest.Mock;
const mockEditar = despensaService.editar as jest.Mock;

async function token() {
  const usuario = await crearUsuario({ correo: "duenno@cookr.dev" });
  return tokenDe(usuario as never);
}

beforeEach(() => {
  mockObtener.mockReset();
  mockEditar.mockReset();
});

describe("rutas que no existen", () => {
  it("responde 404 en JSON, no en HTML", async () => {
    const res = await request(app).get("/api/no-existe-esta-ruta");

    expect(res.status).toBe(404);
    expect(res.type).toBe("application/json");
    expect(res.body).toEqual({ error: "Ruta no encontrada" });
  });

  it("responde igual con cualquier verbo y fuera de /api", async () => {
    const post = await request(app).post("/api/recetas/inventado/inventado");
    const raiz = await request(app).get("/otra-cosa");

    expect(post.status).toBe(404);
    expect(post.type).toBe("application/json");
    expect(raiz.status).toBe(404);
    expect(raiz.type).toBe("application/json");
  });
});

describe("errores 500 no controlados", () => {
  it("no filtra el mensaje interno al cliente", async () => {
    mockObtener.mockRejectedValue(
      new Error('E11000 duplicate key error collection: cookr.usuarios index: correo_1'),
    );

    const res = await request(app)
      .get("/api/despensa")
      .set("Authorization", `Bearer ${await token()}`);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Error interno del servidor" });
    expect(JSON.stringify(res.body)).not.toContain("cookr.usuarios");
  });

  it("respeta el mensaje de los errores lanzados a proposito con su status", async () => {
    mockEditar.mockRejectedValue(
      Object.assign(new Error("Ese ingrediente no esta en tu despensa"), { status: 404 }),
    );

    const res = await request(app)
      .put("/api/despensa/6512c0d5e1a2b3c4d5e6f7a8")
      .set("Authorization", `Bearer ${await token()}`)
      .send({ nombre: "Sal" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Ese ingrediente no esta en tu despensa");
  });
});

describe("PUT /api/despensa/:id valida el cuerpo", () => {
  const id = "6512c0d5e1a2b3c4d5e6f7a8";

  it("un nombre que no es texto da 400 y no llega al servicio", async () => {
    const res = await request(app)
      .put(`/api/despensa/${id}`)
      .set("Authorization", `Bearer ${await token()}`)
      .send({ nombre: 123 });

    expect(res.status).toBe(400);
    expect(res.body.errores[0]).toMatchObject({ campo: "nombre" });
    expect(mockEditar).not.toHaveBeenCalled();
  });

  it("una cantidad que no es numero da 400 en vez de guardar NaN", async () => {
    const res = await request(app)
      .put(`/api/despensa/${id}`)
      .set("Authorization", `Bearer ${await token()}`)
      .send({ cantidad: "muchas" });

    expect(res.status).toBe(400);
    expect(res.body.errores[0]).toMatchObject({ campo: "cantidad" });
    expect(mockEditar).not.toHaveBeenCalled();
  });

  it("un cuerpo vacio da 400", async () => {
    const res = await request(app)
      .put(`/api/despensa/${id}`)
      .set("Authorization", `Bearer ${await token()}`)
      .send({});

    expect(res.status).toBe(400);
    expect(mockEditar).not.toHaveBeenCalled();
  });

  it("un cambio valido llega al servicio ya recortado", async () => {
    mockEditar.mockResolvedValue([]);

    const res = await request(app)
      .put(`/api/despensa/${id}`)
      .set("Authorization", `Bearer ${await token()}`)
      .send({ nombre: "  Sal gorda  ", cantidad: 2 });

    expect(res.status).toBe(200);
    expect(mockEditar).toHaveBeenCalledWith(expect.any(String), id, {
      nombre: "Sal gorda",
      cantidad: 2,
    });
  });
});
