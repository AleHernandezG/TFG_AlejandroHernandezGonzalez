import mongoose, { Schema, Document } from "mongoose";
import { IToken } from "../types/token";

export interface ITokenDoc extends IToken, Document {}

const tokenSchema = new Schema<ITokenDoc>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  tipo: {
    type: String,
    enum: ["verificacion", "recuperacion"],
    required: true,
  },
  expira: {
    type: Date,
    required: true,
  },
  usado: {
    type: Boolean,
    default: false,
  },
  creadoEn: {
    type: Date,
    default: Date.now,
  },
});

// TTL index — MongoDB elimina automáticamente el documento cuando expira
tokenSchema.index({ expira: 1 }, { expireAfterSeconds: 0 });

export const Token = mongoose.model<ITokenDoc>("Token", tokenSchema);
export type { IToken };
