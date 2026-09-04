import { Router, Request, Response } from "express";
import { despensaController } from "../controllers/despensaController";
import { requerirAuth } from "../middlewares/autenticacion";
import { validarBody } from "../middlewares/validarBody";
import { esquemaEditarDespensa } from "../lib/validadores";
import { limitarPorUsuario } from "../middlewares/rateLimitIA";
import { escanearTicket } from "../services/chatService";

const MAX_BASE64_CHARS = 7_000_000;

const router = Router();

router.get("/", requerirAuth, despensaController.obtener);
router.post("/", requerirAuth, despensaController.añadir);
router.delete("/vaciar", requerirAuth, despensaController.vaciar);

router.post(
  "/escanear-ticket",
  requerirAuth,
  limitarPorUsuario(5),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { imagenBase64 } = req.body as { imagenBase64?: string };
      if (!imagenBase64 || typeof imagenBase64 !== "string") {
        res.status(400).json({ error: "imagenBase64 es obligatorio" });
        return;
      }
      if (imagenBase64.length > MAX_BASE64_CHARS) {
        res.status(400).json({ error: "La imagen es demasiado grande (máximo ~5 MB)" });
        return;
      }
      if (!imagenBase64.startsWith("data:image/")) {
        res.status(400).json({ error: "El archivo debe ser una imagen" });
        return;
      }
      const ingredientes = await escanearTicket(imagenBase64);
      res.json({ ingredientes });
    } catch (err) {
      const e = err as Error & { status?: number };
      res.status(e.status ?? 500).json({ error: e.message ?? "Error escaneando ticket" });
    }
  },
);
router.put("/:id", requerirAuth, validarBody(esquemaEditarDespensa), despensaController.editar);
router.delete("/:id", requerirAuth, despensaController.eliminar);

export default router;
