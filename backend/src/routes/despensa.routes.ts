import { Router, Request, Response } from "express";
import { despensaController } from "../controllers/despensaController";
import { requerirAuth } from "../middlewares/autenticacion";
import { validarBody } from "../middlewares/validarBody";
import { esquemaAnadirDespensa, esquemaEditarDespensa, esquemaEscanearTicket } from "../lib/validadores";
import { limitarPorUsuario } from "../middlewares/rateLimitIA";
import { escanearTicket } from "../services/chatService";
import { manejarError } from "../middlewares/errores";

const router = Router();

router.get("/", requerirAuth, despensaController.obtener);
router.post("/", requerirAuth, validarBody(esquemaAnadirDespensa), despensaController.añadir);
router.delete("/vaciar", requerirAuth, despensaController.vaciar);

router.post(
  "/escanear-ticket",
  requerirAuth,
  limitarPorUsuario(5),
  validarBody(esquemaEscanearTicket),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { imagenBase64 } = req.body as { imagenBase64: string };
      const ingredientes = await escanearTicket(imagenBase64);
      res.json({ ingredientes });
    } catch (err) {
      manejarError(res, err);
    }
  },
);
router.put("/:id", requerirAuth, validarBody(esquemaEditarDespensa), despensaController.editar);
router.delete("/:id", requerirAuth, despensaController.eliminar);

export default router;
