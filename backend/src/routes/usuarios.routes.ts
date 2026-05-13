import { Router } from "express";
import { usuariosController } from "../controllers/usuariosController";
import { requerirAuth } from "../middlewares/autenticacion";

const router = Router();

router.get("/me", requerirAuth, usuariosController.obtenerPerfil);
router.put("/me/contrasena", requerirAuth, usuariosController.cambiarContrasena);
router.put("/me/preferencias", requerirAuth, usuariosController.actualizarPreferencias);
router.post("/:id/seguir", requerirAuth, usuariosController.toggleSeguir);

export default router;
