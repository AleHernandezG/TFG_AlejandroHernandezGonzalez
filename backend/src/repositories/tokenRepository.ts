import { Types } from "mongoose";
import { IToken } from "../types/token";
import { ITokenDoc, Token } from "../models/tokenMongo";

interface DatosCrearToken {
  userId: Types.ObjectId;
  token: string;
  tipo: "verificacion" | "recuperacion";
  expira: Date;
}

export const tokenRepository = {
  crear: (datos: DatosCrearToken): Promise<ITokenDoc> =>
    Token.create(datos),

  buscarPorToken: (token: string): Promise<ITokenDoc | null> =>
    Token.findOne({ token, usado: false }),

  invalidar: (id: string): Promise<ITokenDoc | null> =>
    Token.findByIdAndUpdate(id, { usado: true }, { new: true }),
};

export type { IToken };
