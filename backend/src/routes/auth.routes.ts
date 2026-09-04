import { Router } from "express";
import { authController } from "../controllers/authController";
import { validarBody } from "../middlewares/validarBody";
import { requerirAuth } from "../middlewares/autenticacion";
import {
  limiteLogin,
  limiteGoogle,
  limiteRegistro,
  limiteRecuperacion,
  limiteReenvioVerificacion,
} from "../middlewares/rateLimitAuth";
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

router.post("/registro",             limiteRegistro, validarBody(esquemaRegistro),        authController.registro);
router.post("/login",                limiteLogin,    validarBody(esquemaLogin),           authController.login);
router.post("/verificar-email",          validarBody(esquemaVerificarEmail),        authController.verificarEmail);
router.post("/verificar-email/reenviar", limiteReenvioVerificacion, validarBody(esquemaReenviarVerificacion),  authController.reenviarVerificacion);
router.post("/recuperar-contrasena", limiteRecuperacion, validarBody(esquemaRecuperar),   authController.recuperarContrasena);
router.post("/nueva-contrasena",     validarBody(esquemaNuevaContrasena), authController.nuevaContrasena);
router.post("/google",               limiteGoogle,   validarBody(esquemaGoogleOAuth),     authController.googleOAuth);
router.post("/completar-perfil",     requerirAuth, validarBody(esquemaCompletarPerfil), authController.completarPerfil);

export default router;
