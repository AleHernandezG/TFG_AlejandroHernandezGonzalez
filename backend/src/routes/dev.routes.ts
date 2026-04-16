/**
 * dev.routes.ts
 *
 * ⚠️  RUTAS SOLO PARA DESARROLLO — ELIMINAR ANTES DE PRODUCCIÓN ⚠️
 *
 * Estas rutas existen únicamente para facilitar las pruebas manuales
 * mientras Resend (envío de emails) no está integrado (Fase 6).
 * Se montan en app.ts solo cuando NODE_ENV === "development".
 *
 * TODO [Fase 6]: eliminar este archivo y su registro en app.ts una vez
 * que el flujo de verificación por email esté operativo con Resend.
 */

import { Router, Request, Response, NextFunction } from "express";
import { usuarioRepository } from "../repositories/usuarioRepository";

const router = Router();

/**
 * POST /api/dev/verificar-usuario
 *
 * Marca cuentaVerificada=true en el usuario indicado por correo.
 * Permite probar el login completo sin necesitar el email de verificación.
 *
 * Body: { "correo": "usuario@ejemplo.com" }
 */
router.post(
  "/verificar-usuario",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { correo } = req.body as { correo?: string };

    if (!correo || typeof correo !== "string") {
      res.status(400).json({ error: "El campo 'correo' es obligatorio" });
      return;
    }

    const usuario = await usuarioRepository.buscarPorCorreo(correo).catch(next);
    if (!usuario) {
      res.status(404).json({ error: `No existe ningún usuario con el correo ${correo}` });
      return;
    }

    if (usuario.cuentaVerificada) {
      res.json({ mensaje: `El usuario ${correo} ya estaba verificado` });
      return;
    }

    await usuarioRepository.actualizarVerificacion(String(usuario._id)).catch(next);
    res.json({ mensaje: `Usuario ${correo} verificado correctamente. Ya puede iniciar sesión.` });
  }
);

export default router;
