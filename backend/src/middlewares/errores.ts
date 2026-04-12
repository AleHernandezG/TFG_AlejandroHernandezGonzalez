import { Request, Response, NextFunction } from "express";

export function manejadorErrores(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("❌ Error no controlado:", err.message);
  res.status(500).json({ error: "Error interno del servidor" });
}
