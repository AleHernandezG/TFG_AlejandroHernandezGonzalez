import { Router } from "express";
import { usuariosController } from "../controllers/usuariosController";
import { requerirAuth, optionalAuth } from "../middlewares/autenticacion";
import { validarBody } from "../middlewares/validarBody";
import { esquemaFotoUsuario } from "../lib/validadores";

const router = Router();

router.get("/destacados", optionalAuth, usuariosController.obtenerDestacados);
router.get("/me", requerirAuth, usuariosController.obtenerPerfil);
router.put("/me/contrasena", requerirAuth, usuariosController.cambiarContrasena);
router.put("/me/foto", requerirAuth, validarBody(esquemaFotoUsuario), usuariosController.actualizarFoto);
router.put("/me/preferencias", requerirAuth, usuariosController.actualizarPreferencias);
router.post("/:id/seguir", requerirAuth, usuariosController.toggleSeguir);

export default router;
