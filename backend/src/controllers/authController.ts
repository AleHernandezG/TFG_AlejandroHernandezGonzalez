import { Request, Response } from "express";
import { authService } from "../services/authService";
import { manejarError } from "../middlewares/errores";

export const authController = {
  async registro(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await authService.registrarse(req.body);
      res.status(201).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await authService.iniciarSesion(req.body);
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async verificarEmail(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await authService.verificarEmail(req.body);
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async recuperarContrasena(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await authService.solicitarRecuperacion(req.body);
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async nuevaContrasena(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await authService.restablecerContrasena(req.body);
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async googleOAuth(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await authService.iniciarSesionGoogle(req.body);
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async reenviarVerificacion(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await authService.reenviarVerificacion(req.body);
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async completarPerfil(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await authService.completarPerfil(req.usuario!.id, req.body);
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },
};
