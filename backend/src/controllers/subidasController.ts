import { Request, Response } from "express";
import { subidasService, TipoSubida } from "../services/subidasService";
import { manejarError } from "../middlewares/errores";

export const subidasController = {
  firmar(req: Request, res: Response): void {
    try {
      const { tipo } = req.body as { tipo: TipoSubida };
      res.json(subidasService.firmar(req.usuario!.id, tipo));
    } catch (error) {
      manejarError(res, error);
    }
  },
};
