import { Request, Response } from "express";
import { despensaService } from "../services/despensaService";
import { manejarError } from "../middlewares/errores";
import type { ItemsDespensaNuevos } from "../lib/validadores";

export const despensaController = {
  async obtener(req: Request, res: Response): Promise<void> {
    try {
      const items = await despensaService.obtener(req.usuario!.id);
      res.status(200).json(items);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async añadir(req: Request, res: Response): Promise<void> {
    try {
      const nuevos = req.body as ItemsDespensaNuevos;
      const fechaAnadido = new Date();
      const items = await despensaService.añadirLote(
        req.usuario!.id,
        nuevos.map((item) => ({ ...item, fechaAnadido })),
      );
      res.status(201).json(items);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async editar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cambios = req.body as Partial<{
        nombre: string;
        cantidad: number;
        unidad: string;
        emoji: string;
      }>;

      const items = await despensaService.editar(req.usuario!.id, id, cambios);
      res.status(200).json(items);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const items = await despensaService.eliminar(req.usuario!.id, req.params.id);
      res.status(200).json(items);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async vaciar(req: Request, res: Response): Promise<void> {
    try {
      await despensaService.vaciar(req.usuario!.id);
      res.status(204).send();
    } catch (error) {
      manejarError(res, error);
    }
  },
};
