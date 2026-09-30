import { Request, Response } from "express";
import { usuariosService } from "../services/usuariosService";
import { manejarError } from "../middlewares/errores";

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
        contrasenaActual: string;
        contrasenaNueva: string;
      };
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
      const { fotoUrl } = req.body as { fotoUrl: string };
      const resultado = await usuariosService.actualizarFoto(req.usuario!.id, fotoUrl);
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async actualizarPreferencias(req: Request, res: Response): Promise<void> {
    try {
      const { dietas, alergenos } = req.body as {
        dietas: string[];
        alergenos: string[];
      };
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
