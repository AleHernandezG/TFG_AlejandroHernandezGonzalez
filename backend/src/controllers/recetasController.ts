import { Request, Response } from "express";
import { recetasService } from "../services/recetasService";

type ErrorConStatus = Error & { status?: number };

function manejarError(res: Response, error: unknown): void {
  const err = error as ErrorConStatus;
  const status = err.status ?? 500;
  const mensaje = err.message ?? "Error interno del servidor";
  res.status(status).json({ error: mensaje });
}

export const recetasController = {
  async obtenerFeed(req: Request, res: Response): Promise<void> {
    try {
      const { q, dificultad, alergenos, pagina, limite } = req.query;

      const filtros = {
        q: typeof q === "string" ? q : undefined,
        dificultad:
          typeof dificultad === "string" && dificultad
            ? dificultad.split(",")
            : undefined,
        alergenos:
          typeof alergenos === "string" && alergenos
            ? alergenos.split(",")
            : undefined,
        pagina: pagina ? Math.max(1, Number(pagina)) : 1,
        limite: limite ? Math.min(50, Number(limite)) : 20,
      };

      const resultado = await recetasService.obtenerFeed(
        filtros,
        req.usuario?.id
      );
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await recetasService.obtenerPorId(
        req.params.id,
        req.usuario?.id
      );
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async obtenerSimilares(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await recetasService.obtenerSimilares(
        req.params.id,
        req.usuario?.id
      );
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async toggleLike(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await recetasService.toggleLike(
        req.params.id,
        req.usuario!.id
      );
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async toggleGuardado(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await recetasService.toggleGuardado(
        req.params.id,
        req.usuario!.id
      );
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },
};
