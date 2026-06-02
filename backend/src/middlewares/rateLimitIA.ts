import { Request, Response, NextFunction } from "express";

interface Ventana {
  count: number;
  inicio: number;
}

export function limitarPorUsuario(maxPorMinuto: number) {
  const ventanas = new Map<string, Ventana>();

  return function (req: Request, res: Response, next: NextFunction): void {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) {
      next();
      return;
    }

    const ahora = Date.now();
    const ventana = ventanas.get(usuarioId);

    if (!ventana || ahora - ventana.inicio > 60_000) {
      ventanas.set(usuarioId, { count: 1, inicio: ahora });
      next();
      return;
    }

    if (ventana.count >= maxPorMinuto) {
      res.status(429).json({ error: "Demasiadas peticiones. Espera un momento antes de continuar." });
      return;
    }

    ventana.count++;
    next();
  };
}
