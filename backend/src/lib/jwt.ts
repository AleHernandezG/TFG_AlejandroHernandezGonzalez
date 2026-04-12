import jwt from "jsonwebtoken";

interface PayloadToken {
  id: string;
  correo: string;
  rol: string;
}

export function firmarToken(
  payload: PayloadToken,
  expiresIn: string | number = "7d"
): string {
  const secreto = process.env.JWT_SECRET;
  if (!secreto) throw new Error("JWT_SECRET no está definida");

  return jwt.sign(payload, secreto, { expiresIn } as jwt.SignOptions);
}

export function verificarToken(token: string): PayloadToken {
  const secreto = process.env.JWT_SECRET;
  if (!secreto) throw new Error("JWT_SECRET no está definida");

  return jwt.verify(token, secreto) as PayloadToken;
}
