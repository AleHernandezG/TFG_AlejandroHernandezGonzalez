import { Router } from "express";
import { despensaController } from "../controllers/despensaController";
import { requerirAuth } from "../middlewares/autenticacion";

const router = Router();

router.get("/", requerirAuth, despensaController.obtener);
router.post("/", requerirAuth, despensaController.añadir);
router.put("/:id", requerirAuth, despensaController.editar);
router.delete("/:id", requerirAuth, despensaController.eliminar);

export default router;
