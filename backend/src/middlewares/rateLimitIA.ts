import rateLimit from "express-rate-limit";
import { crearStore } from "../lib/rateLimitStore";

let contador = 0;

export function limitarPorUsuario(maxPorMinuto: number) {
  const id = contador++;

  return rateLimit({
    windowMs: 60_000,
    limit: maxPorMinuto,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiadas peticiones. Espera un momento antes de continuar." },
    keyGenerator: (req) => req.usuario?.id ?? "sin-usuario",
    skip: (req) => !req.usuario,
    store: crearStore(`ia:${id}`),
  });
}
