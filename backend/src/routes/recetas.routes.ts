import { Router, Request, Response } from "express";
import { recetasController } from "../controllers/recetasController";
import { requerirAuth, optionalAuth } from "../middlewares/autenticacion";
import { validarBody } from "../middlewares/validarBody";
import { esquemaComentario } from "../lib/validadores";
import { limitarPorUsuario } from "../middlewares/rateLimitIA";
import { generarRecetaDesdeTexto } from "../services/chatService";

const router = Router();

router.get("/", optionalAuth, recetasController.obtenerFeed);

// Rutas fijas ANTES de /:id para que Express no las capture como parámetro
router.get("/guardadas", requerirAuth, recetasController.obtenerGuardadas);
router.get("/mis-recetas", requerirAuth, recetasController.obtenerMisRecetas);
router.get("/foto-preview", requerirAuth, recetasController.obtenerFotoPreview);

router.post("/", requerirAuth, recetasController.crear);

router.post(
  "/generar-desde-texto",
  requerirAuth,
  limitarPorUsuario(5),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { descripcion } = req.body as { descripcion?: string };
      if (!descripcion || typeof descripcion !== "string") {
        res.status(400).json({ error: "descripcion es obligatoria" });
        return;
      }
      const trimmed = descripcion.trim();
      if (trimmed.length < 10) {
        res.status(400).json({ error: "descripcion debe tener al menos 10 caracteres" });
        return;
      }
      if (trimmed.length > 1000) {
        res.status(400).json({ error: "descripcion no puede superar 1000 caracteres" });
        return;
      }
      const receta = await generarRecetaDesdeTexto(trimmed);
      res.json(receta);
    } catch (err) {
      const e = err as Error & { status?: number };
      res.status(e.status ?? 500).json({ error: e.message ?? "Error generando receta" });
    }
  },
);

router.get("/:id", optionalAuth, recetasController.obtenerPorId);
router.get("/:id/comentarios", optionalAuth, recetasController.obtenerComentarios);
router.get("/:id/similares", optionalAuth, recetasController.obtenerSimilares);
router.post("/:id/like", requerirAuth, recetasController.toggleLike);
router.post("/:id/guardar", requerirAuth, recetasController.toggleGuardado);
router.post(
  "/:id/comentarios",
  requerirAuth,
  validarBody(esquemaComentario),
  recetasController.agregarComentario,
);

router.put("/:id", requerirAuth, recetasController.actualizar);
router.delete("/:id", requerirAuth, recetasController.eliminar);

export default router;
