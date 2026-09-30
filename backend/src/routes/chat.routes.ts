import { Router, Request, Response } from "express";
import { requerirAuth } from "../middlewares/autenticacion";
import { limitarPorUsuario } from "../middlewares/rateLimitIA";
import { validarBody } from "../middlewares/validarBody";
import { esquemaChat, type CuerpoChat } from "../lib/validadores";
import { responderChat, recetaConDespensa } from "../services/chatService";
import { manejarError } from "../middlewares/errores";

const router = Router();

router.post(
  "/",
  requerirAuth,
  limitarPorUsuario(30),
  validarBody(esquemaChat),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { mensajes, imagenBase64 } = req.body as CuerpoChat;
      const respuesta = await responderChat(mensajes, req.usuario!.id, imagenBase64);
      res.json({ respuesta });
    } catch (err) {
      manejarError(res, err);
    }
  },
);

router.post(
  "/receta-despensa",
  requerirAuth,
  limitarPorUsuario(30),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const resultado = await recetaConDespensa(req.usuario!.id);
      res.json(resultado);
    } catch (err) {
      manejarError(res, err);
    }
  },
);

export default router;
