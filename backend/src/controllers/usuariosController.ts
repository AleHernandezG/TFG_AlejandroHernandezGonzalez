import { Request, Response } from "express";
import { usuariosService } from "../services/usuariosService";

type ErrorConStatus = Error & { status?: number };

function manejarError(res: Response, error: unknown): void {
  const err = error as ErrorConStatus;
  res.status(err.status ?? 500).json({ error: err.message ?? "Error interno del servidor" });
}

export const usuariosController = {
  async obtenerDestacados(req: Request, res: Response): Promise<void> {
    try {
      const limite = req.query.limite ? Math.min(10, Number(req.query.limite)) : 5;
      const resultado = await usuariosService.obtenerDestacados(limite, req.usuario?.id);
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

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

  async obtenerPerfil(req: Request, res: Response): Promise<void> {
    try {
      const perfil = await usuariosService.obtenerPerfil(req.usuario!.id);
      res.status(200).json(perfil);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async cambiarContrasena(req: Request, res: Response): Promise<void> {
    try {
      const { contrasenaActual, contrasenaNueva } = req.body as {
        contrasenaActual?: string;
        contrasenaNueva?: string;
      };
      if (!contrasenaActual || !contrasenaNueva) {
        res.status(400).json({ error: "contrasenaActual y contrasenaNueva son obligatorios" });
        return;
      }
      if (contrasenaNueva.length < 8) {
        res.status(400).json({ error: "La nueva contraseña debe tener al menos 8 caracteres" });
        return;
      }
      await usuariosService.cambiarContrasena(
        req.usuario!.id,
        contrasenaActual,
        contrasenaNueva,
      );
      res.status(200).json({ mensaje: "Contraseña actualizada correctamente" });
    } catch (error) {
      manejarError(res, error);
    }
  },

  async actualizarFoto(req: Request, res: Response): Promise<void> {
    try {
      const { fotoBase64 } = req.body as { fotoBase64?: string };
      if (!fotoBase64 || typeof fotoBase64 !== "string") {
        res.status(400).json({ error: "fotoBase64 es obligatorio" });
        return;
      }
      const resultado = await usuariosService.actualizarFoto(req.usuario!.id, fotoBase64);
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async actualizarPreferencias(req: Request, res: Response): Promise<void> {
    try {
      const { dietas, alergenos } = req.body as {
        dietas?: string[];
        alergenos?: string[];
      };
      if (!Array.isArray(dietas) || !Array.isArray(alergenos)) {
        res.status(400).json({ error: "dietas y alergenos deben ser arrays" });
        return;
      }
      const resultado = await usuariosService.actualizarPreferencias(
        req.usuario!.id,
        dietas,
        alergenos,
      );
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },
};
