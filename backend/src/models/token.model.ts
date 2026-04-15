import mongoose, { Schema, Document, Types } from "mongoose";

export interface IToken extends Document {
  userId: Types.ObjectId; //Para ver quien es el usuario a quien corresponde el token
  token: string;
  tipo: "verificacion" | "recuperacion"; //Cambia el tiempo que esta activo
  expira: Date;
  usado: boolean;
  creadoEn: Date;
}

const tokenSchema = new Schema<IToken>({
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

export const Token = mongoose.model<IToken>("Token", tokenSchema);
