import { Types } from "mongoose";

export interface IToken {
  userId: Types.ObjectId;
  token: string;
  tipo: "verificacion" | "recuperacion";
  expira: Date;
  usado: boolean;
  creadoEn: Date;
}
