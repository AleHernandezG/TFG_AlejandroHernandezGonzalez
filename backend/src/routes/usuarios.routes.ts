import { Router } from "express";
import { usuariosController } from "../controllers/usuariosController";
import { requerirAuth } from "../middlewares/autenticacion";

const router = Router();

router.post("/:id/seguir", requerirAuth, usuariosController.toggleSeguir);

export default router;
