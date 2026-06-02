import { Router, Request, Response } from "express";
import { despensaController } from "../controllers/despensaController";
import { requerirAuth } from "../middlewares/autenticacion";
import { escanearTicket } from "../services/chatService";

const router = Router();

router.get("/", requerirAuth, despensaController.obtener);
router.post("/", requerirAuth, despensaController.añadir);
router.delete("/vaciar", requerirAuth, despensaController.vaciar);

router.post("/escanear-ticket", requerirAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { imagenBase64 } = req.body as { imagenBase64?: string };
    if (!imagenBase64 || typeof imagenBase64 !== "string") {
      res.status(400).json({ error: "imagenBase64 es obligatorio" });
      return;
    }
    const ingredientes = await escanearTicket(imagenBase64);
    res.json({ ingredientes });
  } catch (err) {
    const e = err as Error & { status?: number };
    res.status(e.status ?? 500).json({ error: e.message ?? "Error escaneando ticket" });
  }
});
router.put("/:id", requerirAuth, despensaController.editar);
router.delete("/:id", requerirAuth, despensaController.eliminar);

export default router;
