import { Router } from "express";
import { recetasController } from "../controllers/recetasController";
import { requerirAuth, optionalAuth } from "../middlewares/autenticacion";

const router = Router();

router.get("/", optionalAuth, recetasController.obtenerFeed);

// Rutas fijas ANTES de /:id para que Express no las capture como parámetro
router.get("/guardadas", requerirAuth, recetasController.obtenerGuardadas);
router.get("/mis-recetas", requerirAuth, recetasController.obtenerMisRecetas);
router.get("/foto-preview", recetasController.obtenerFotoPreview);

router.post("/", requerirAuth, recetasController.crear);

router.get("/:id", optionalAuth, recetasController.obtenerPorId);
router.get("/:id/similares", optionalAuth, recetasController.obtenerSimilares);
router.post("/:id/like", requerirAuth, recetasController.toggleLike);
router.post("/:id/guardar", requerirAuth, recetasController.toggleGuardado);
router.post("/:id/comentarios", requerirAuth, recetasController.agregarComentario);

router.delete("/:id", requerirAuth, recetasController.eliminar);

export default router;
