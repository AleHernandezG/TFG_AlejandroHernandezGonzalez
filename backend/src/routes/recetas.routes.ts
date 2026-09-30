import { Router, Request, Response } from "express";
import { recetasController } from "../controllers/recetasController";
import { requerirAuth, optionalAuth } from "../middlewares/autenticacion";
import { validarBody } from "../middlewares/validarBody";
import {
  esquemaComentario,
  esquemaCrearRecetaBody,
  esquemaEditarRecetaBody,
  esquemaGenerarDesdeTexto,
  esquemaMacrosPreview,
} from "../lib/validadores";
import { limitarPorUsuario } from "../middlewares/rateLimitIA";
import { generarRecetaDesdeTexto } from "../services/chatService";
import { manejarError } from "../middlewares/errores";

const router = Router();

router.get("/", optionalAuth, recetasController.obtenerFeed);

// Rutas fijas ANTES de /:id para que Express no las capture como parámetro
router.get("/guardadas", requerirAuth, recetasController.obtenerGuardadas);
router.get("/mis-recetas", requerirAuth, recetasController.obtenerMisRecetas);
router.get("/foto-preview", requerirAuth, recetasController.obtenerFotoPreview);

router.post("/", requerirAuth, validarBody(esquemaCrearRecetaBody), recetasController.crear);

router.post(
  "/generar-desde-texto",
  requerirAuth,
  limitarPorUsuario(5),
  validarBody(esquemaGenerarDesdeTexto),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { descripcion } = req.body as { descripcion: string };
      const receta = await generarRecetaDesdeTexto(descripcion);
      res.json(receta);
    } catch (err) {
      manejarError(res, err);
    }
  },
);

router.post(
  "/macros-preview",
  requerirAuth,
  validarBody(esquemaMacrosPreview),
  limitarPorUsuario(20),
  recetasController.calcularMacrosPreview,
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

router.put("/:id", requerirAuth, validarBody(esquemaEditarRecetaBody), recetasController.actualizar);
router.delete("/:id", requerirAuth, recetasController.eliminar);

export default router;
