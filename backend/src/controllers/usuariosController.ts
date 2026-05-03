import { Request, Response } from "express";
import { usuariosService } from "../services/usuariosService";

type ErrorConStatus = Error & { status?: number };

function manejarError(res: Response, error: unknown): void {
  const err = error as ErrorConStatus;
  res.status(err.status ?? 500).json({ error: err.message ?? "Error interno del servidor" });
}

export const usuariosController = {
  async toggleSeguir(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await usuariosService.toggleSeguir(
        req.usuario!.id,
        req.params.id,
      );
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },
};
