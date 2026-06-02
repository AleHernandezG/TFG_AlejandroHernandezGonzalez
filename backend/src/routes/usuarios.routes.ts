import { Router } from "express";
import { usuariosController } from "../controllers/usuariosController";
import { requerirAuth, optionalAuth } from "../middlewares/autenticacion";

const router = Router();

router.get("/destacados", optionalAuth, usuariosController.obtenerDestacados);
router.get("/me", requerirAuth, usuariosController.obtenerPerfil);
router.put("/me/contrasena", requerirAuth, usuariosController.cambiarContrasena);
router.put("/me/foto", requerirAuth, usuariosController.actualizarFoto);
router.put("/me/preferencias", requerirAuth, usuariosController.actualizarPreferencias);
router.post("/:id/seguir", requerirAuth, usuariosController.toggleSeguir);

export default router;
