jest.mock("axios", () => ({ post: jest.fn() }));

import axios from "axios";
import { eliminarImagen, publicIdDeImagenDeReceta } from "../src/lib/cloudinary";

const postMock = axios.post as jest.Mock;
const URL_ANTERIOR = process.env.CLOUDINARY_URL;

beforeEach(() => {
  process.env.CLOUDINARY_URL = "cloudinary://clave:secreto@cookr";
});

afterAll(() => {
  if (URL_ANTERIOR === undefined) delete process.env.CLOUDINARY_URL;
  else process.env.CLOUDINARY_URL = URL_ANTERIOR;
});

describe("public_id de una foto de receta", () => {
  it("lo saca de una URL de nuestra nube, sin versión ni extensión", () => {
    const url = "https://res.cloudinary.com/cookr/image/upload/v1726000000/cookr/recetas/665f-1726-ab12cd34.jpg";

    expect(publicIdDeImagenDeReceta(url)).toBe("cookr/recetas/665f-1726-ab12cd34");
  });

  it.each([
    ["un avatar", "https://res.cloudinary.com/cookr/image/upload/v1/cookr/avatares/665f.jpg"],
    ["otra nube", "https://res.cloudinary.com/ajena/image/upload/v1/cookr/recetas/665f.jpg"],
    ["una foto de Pexels", "https://images.pexels.com/photos/1/pexels-photo-1.jpeg"],
  ])("devuelve null para %s", (_, url) => {
    expect(publicIdDeImagenDeReceta(url)).toBeNull();
  });

  it("devuelve null si Cloudinary no está configurado", () => {
    delete process.env.CLOUDINARY_URL;

    expect(
      publicIdDeImagenDeReceta("https://res.cloudinary.com/cookr/image/upload/v1/cookr/recetas/x.jpg"),
    ).toBeNull();
  });
});

describe("borrar una foto de Cloudinary", () => {
  it("pide el destroy firmado con el public_id", async () => {
    postMock.mockResolvedValueOnce({ data: { result: "ok" } });

    const borrada = await eliminarImagen(
      "https://res.cloudinary.com/cookr/image/upload/v1/cookr/recetas/665f-1-ab.png",
    );

    expect(borrada).toBe(true);
    const [endpoint, cuerpo] = postMock.mock.calls[0] as [string, string];
    const campos = new URLSearchParams(cuerpo);
    expect(endpoint).toBe("https://api.cloudinary.com/v1_1/cookr/image/destroy");
    expect(campos.get("public_id")).toBe("cookr/recetas/665f-1-ab");
    expect(campos.get("api_key")).toBe("clave");
    expect(campos.get("signature")).toMatch(/^[0-9a-f]{40}$/);
  });

  it("no llama a Cloudinary con una URL que no es de una receta nuestra", async () => {
    const borrada = await eliminarImagen("https://images.pexels.com/photos/1/pexels-photo-1.jpeg");

    expect(borrada).toBe(false);
    expect(postMock).not.toHaveBeenCalled();
  });
});
