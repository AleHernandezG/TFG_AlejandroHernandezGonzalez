import { Request, Response, NextFunction } from "express";

type ErrorConStatus = Error & { status?: number };

export function manejarError(res: Response, error: unknown): void {
  const err = error as ErrorConStatus;
  res.status(err.status ?? 500).json({ error: err.message ?? "Error interno del servidor" });
}

export function manejadorErrores(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }
  const status = (err as ErrorConStatus).status ?? 500;
  if (status >= 500) console.error("❌ Error no controlado:", err.message);
  manejarError(res, err);
}
