import { Router } from "express";
import { authController } from "../controllers/authController";
import { validarBody } from "../middlewares/validarBody";
import { requerirAuth } from "../middlewares/autenticacion";
import {
  esquemaRegistro,
  esquemaLogin,
  esquemaRecuperar,
  esquemaNuevaContrasena,
  esquemaVerificarEmail,
  esquemaGoogleOAuth,
  esquemaCompletarPerfil,
  esquemaReenviarVerificacion,
} from "../lib/validadores";

const router = Router();

router.post("/registro",             validarBody(esquemaRegistro),        authController.registro);
router.post("/login",                validarBody(esquemaLogin),           authController.login);
router.post("/verificar-email",          validarBody(esquemaVerificarEmail),        authController.verificarEmail);
router.post("/verificar-email/reenviar", validarBody(esquemaReenviarVerificacion),  authController.reenviarVerificacion);
router.post("/recuperar-contrasena", validarBody(esquemaRecuperar),       authController.recuperarContrasena);
router.post("/nueva-contrasena",     validarBody(esquemaNuevaContrasena), authController.nuevaContrasena);
router.post("/google",               validarBody(esquemaGoogleOAuth),     authController.googleOAuth);
router.post("/completar-perfil",     requerirAuth, validarBody(esquemaCompletarPerfil), authController.completarPerfil);

export default router;
