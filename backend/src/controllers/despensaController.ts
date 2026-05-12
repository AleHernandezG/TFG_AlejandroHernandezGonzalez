import { Request, Response } from "express";
import { despensaService } from "../services/despensaService";

type ErrorConStatus = Error & { status?: number };

function manejarError(res: Response, error: unknown): void {
  const err = error as ErrorConStatus;
  res.status(err.status ?? 500).json({ error: err.message ?? "Error interno del servidor" });
}

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
      const { nombre, cantidad, unidad, emoji } = req.body as {
        nombre: string;
        cantidad: number;
        unidad: string;
        emoji: string;
      };

      if (!nombre?.trim() || !unidad?.trim() || !emoji?.trim() || cantidad == null) {
        res.status(400).json({ error: "nombre, cantidad, unidad y emoji son obligatorios" });
        return;
      }

      const items = await despensaService.añadir(req.usuario!.id, {
        nombre: nombre.trim(),
        cantidad: Number(cantidad),
        unidad: unidad.trim(),
        emoji: emoji.trim(),
        fechaAnadido: new Date(),
      });
      res.status(201).json(items);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async editar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nombre, cantidad, unidad, emoji } = req.body as Partial<{
        nombre: string;
        cantidad: number;
        unidad: string;
        emoji: string;
      }>;

      const cambios: Record<string, unknown> = {};
      if (nombre !== undefined) cambios.nombre = nombre.trim();
      if (cantidad !== undefined) cambios.cantidad = Number(cantidad);
      if (unidad !== undefined) cambios.unidad = unidad.trim();
      if (emoji !== undefined) cambios.emoji = emoji.trim();

      if (Object.keys(cambios).length === 0) {
        res.status(400).json({ error: "Sin campos a actualizar" });
        return;
      }

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
};
