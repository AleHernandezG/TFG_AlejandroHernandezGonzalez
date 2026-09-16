import { randomBytes } from "crypto";
import { firmarSubida, FirmaSubida } from "../lib/cloudinary";

export type TipoSubida = "receta" | "avatar";

export const subidasService = {
  firmar(usuarioId: string, tipo: TipoSubida): FirmaSubida {
    const publicId =
      tipo === "avatar"
        ? `cookr/avatares/${usuarioId}`
        : `cookr/recetas/${usuarioId}-${Date.now()}-${randomBytes(4).toString("hex")}`;

    return firmarSubida(publicId);
  },
};
