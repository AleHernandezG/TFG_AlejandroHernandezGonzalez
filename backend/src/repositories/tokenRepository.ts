import { Token, IToken } from "../models/token.model";
import { Types } from "mongoose";

interface DatosCrearToken {
  userId: Types.ObjectId;
  token: string;
  tipo: "verificacion" | "recuperacion";
  expira: Date;
}

export const tokenRepository = {
  crear: (datos: DatosCrearToken): Promise<IToken> =>
    Token.create(datos),

  buscarPorToken: (token: string): Promise<IToken | null> =>
    Token.findOne({ token, usado: false }),

  invalidar: (id: string): Promise<IToken | null> =>
    Token.findByIdAndUpdate(id, { usado: true }, { new: true }),
};
