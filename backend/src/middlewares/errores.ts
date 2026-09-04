import { Request, Response, NextFunction } from "express";

type ErrorConStatus = Error & { status?: number };

const MENSAJE_GENERICO = "Error interno del servidor";

export function manejarError(res: Response, error: unknown): void {
  const err = error as ErrorConStatus;
  const status = err?.status ?? 500;
  const esFalloNoControlado = status >= 500 && err?.status === undefined;

  res.status(status).json({
    error: esFalloNoControlado ? MENSAJE_GENERICO : err?.message ?? MENSAJE_GENERICO,
  });
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
