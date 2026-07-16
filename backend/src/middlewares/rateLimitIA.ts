import { Request, Response, NextFunction } from "express";

interface Ventana {
  count: number;
  inicio: number;
}

const VENTANA_MS = 60_000;

export function limitarPorUsuario(maxPorMinuto: number) {
  const ventanas = new Map<string, Ventana>();
  let ultimaPurga = Date.now();

  function purgarVentanasCaducadas(ahora: number): void {
    if (ahora - ultimaPurga < VENTANA_MS) return;

    for (const [id, ventana] of ventanas) {
      if (ahora - ventana.inicio > VENTANA_MS) ventanas.delete(id);
    }
    ultimaPurga = ahora;
  }

  return function (req: Request, res: Response, next: NextFunction): void {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) {
      next();
      return;
    }

    const ahora = Date.now();
    purgarVentanasCaducadas(ahora);

    const ventana = ventanas.get(usuarioId);

    if (!ventana || ahora - ventana.inicio > VENTANA_MS) {
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
