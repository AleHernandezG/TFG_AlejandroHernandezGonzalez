import { Request, Response, NextFunction } from "express";

//Este Middleware es una funcion para capturar cualquier error que no se controle para indicarlo como 500 y evitar que se caiga el servidor.
export function manejadorErrores(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error("❌ Error no controlado:", err.message);
  res.status(500).json({ error: "Error interno del servidor" });
}
