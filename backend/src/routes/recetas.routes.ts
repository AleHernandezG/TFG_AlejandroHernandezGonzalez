import { Router, Request, Response } from "express";
import { recetasController } from "../controllers/recetasController";
import { requerirAuth, optionalAuth } from "../middlewares/autenticacion";
import { generarRecetaDesdeTexto } from "../services/chatService";

const router = Router();

router.get("/", optionalAuth, recetasController.obtenerFeed);

// Rutas fijas ANTES de /:id para que Express no las capture como parámetro
router.get("/guardadas", requerirAuth, recetasController.obtenerGuardadas);
router.get("/mis-recetas", requerirAuth, recetasController.obtenerMisRecetas);
router.get("/foto-preview", recetasController.obtenerFotoPreview);

router.post("/", requerirAuth, recetasController.crear);

router.post("/generar-desde-texto", requerirAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { descripcion } = req.body as { descripcion?: string };
    if (!descripcion || descripcion.trim().length < 10) {
      res.status(400).json({ error: "descripcion debe tener al menos 10 caracteres" });
      return;
    }
    const receta = await generarRecetaDesdeTexto(descripcion.trim());
    res.json(receta);
  } catch (err) {
    const e = err as Error & { status?: number };
    res.status(e.status ?? 500).json({ error: e.message ?? "Error generando receta" });
  }
});

router.get("/:id", optionalAuth, recetasController.obtenerPorId);
router.get("/:id/comentarios", optionalAuth, recetasController.obtenerComentarios);
router.get("/:id/similares", optionalAuth, recetasController.obtenerSimilares);
router.post("/:id/like", requerirAuth, recetasController.toggleLike);
router.post("/:id/guardar", requerirAuth, recetasController.toggleGuardado);
router.post("/:id/comentarios", requerirAuth, recetasController.agregarComentario);

router.put("/:id", requerirAuth, recetasController.actualizar);
router.delete("/:id", requerirAuth, recetasController.eliminar);

export default router;
