import { Router, Request, Response } from "express";
import { requerirAuth } from "../middlewares/autenticacion";
import { responderChat } from "../services/chatService";

const router = Router();

router.post("/", requerirAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { mensajes } = req.body as {
      mensajes?: Array<{ rol: "user" | "model"; texto: string }>;
    };

    if (!Array.isArray(mensajes) || mensajes.length === 0) {
      res.status(400).json({ error: "mensajes es obligatorio y debe ser un array no vacío" });
      return;
    }

    const respuesta = await responderChat(mensajes, req.usuario!.id);
    res.json({ respuesta });
  } catch (err) {
    const e = err as Error & { status?: number };
    res.status(e.status ?? 500).json({ error: e.message ?? "Error interno" });
  }
});

export default router;
