import { Router, Request, Response } from "express";
import { requerirAuth } from "../middlewares/autenticacion";
import { limitarPorUsuario } from "../middlewares/rateLimitIA";
import { responderChat, recetaConDespensa } from "../services/chatService";
import { manejarError } from "../middlewares/errores";

const router = Router();

const MAX_MENSAJES = 50;
const MAX_CHARS_MENSAJE = 2000;
const ROLES_VALIDOS = new Set(["user", "model"]);

router.post(
  "/",
  requerirAuth,
  limitarPorUsuario(30),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { mensajes, imagenBase64 } = req.body as {
        mensajes?: Array<{ rol: string; texto: string }>;
        imagenBase64?: string;
      };

      if (!Array.isArray(mensajes) || mensajes.length === 0) {
        res.status(400).json({ error: "mensajes es obligatorio y debe ser un array no vacío" });
        return;
      }

      if (mensajes.length > MAX_MENSAJES) {
        res.status(400).json({ error: `El historial no puede superar ${MAX_MENSAJES} mensajes` });
        return;
      }

      for (const m of mensajes) {
        if (!ROLES_VALIDOS.has(m.rol)) {
          res.status(400).json({ error: "Rol de mensaje no válido" });
          return;
        }
        if (typeof m.texto !== "string" || m.texto.trim().length === 0) {
          res.status(400).json({ error: "Todos los mensajes deben tener texto" });
          return;
        }
        if (m.texto.length > MAX_CHARS_MENSAJE) {
          res.status(400).json({ error: `Cada mensaje no puede superar ${MAX_CHARS_MENSAJE} caracteres` });
          return;
        }
      }

      const ultimo = mensajes[mensajes.length - 1];
      if (ultimo.rol !== "user") {
        res.status(400).json({ error: "El último mensaje debe ser del usuario" });
        return;
      }

      if (imagenBase64 !== undefined) {
        if (typeof imagenBase64 !== "string" || !imagenBase64.startsWith("data:image/")) {
          res.status(400).json({ error: "imagenBase64 no válida" });
          return;
        }
        if (imagenBase64.length > 7_000_000) {
          res.status(400).json({ error: "La imagen no puede superar 5 MB" });
          return;
        }
      }

      const respuesta = await responderChat(
        mensajes as Array<{ rol: "user" | "model"; texto: string }>,
        req.usuario!.id,
        imagenBase64,
      );
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
