import { Router } from "express";
import { authController } from "../controllers/authController";
import { validarBody } from "../middlewares/validarBody";
import {
  esquemaRegistro,
  esquemaLogin,
  esquemaRecuperar,
  esquemaNuevaContrasena,
  esquemaVerificarEmail,
} from "../lib/validadores";

const router = Router();

router.post("/registro",             validarBody(esquemaRegistro),        authController.registro);
router.post("/login",                validarBody(esquemaLogin),           authController.login);
router.post("/verificar-email",      validarBody(esquemaVerificarEmail),  authController.verificarEmail);
router.post("/recuperar-contrasena", validarBody(esquemaRecuperar),       authController.recuperarContrasena);
router.post("/nueva-contrasena",     validarBody(esquemaNuevaContrasena), authController.nuevaContrasena);

export default router;
