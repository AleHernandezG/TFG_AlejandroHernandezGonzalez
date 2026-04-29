import { Router } from "express";
import { recetasController } from "../controllers/recetasController";
import { requerirAuth, optionalAuth } from "../middlewares/autenticacion";

const router = Router();

router.get("/", optionalAuth, recetasController.obtenerFeed);
router.get("/:id", optionalAuth, recetasController.obtenerPorId);
router.get("/:id/similares", optionalAuth, recetasController.obtenerSimilares);
router.post("/:id/like", requerirAuth, recetasController.toggleLike);
router.post("/:id/guardar", requerirAuth, recetasController.toggleGuardado);

export default router;
