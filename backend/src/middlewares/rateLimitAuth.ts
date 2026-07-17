import rateLimit from "express-rate-limit";
import { crearStore, reiniciarStores } from "../lib/rateLimitStore";

type OpcionesLimite = {
  ventanaMinutos: number;
  maxIntentos: number;
  mensaje: string;
  prefijo: string;
  soloContarFallos?: boolean;
};

function limitarPorIP({ ventanaMinutos, maxIntentos, mensaje, prefijo, soloContarFallos = false }: OpcionesLimite) {
  return rateLimit({
    windowMs: ventanaMinutos * 60_000,
    limit: maxIntentos,
    message: { error: mensaje },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: soloContarFallos,
    store: crearStore(`auth:${prefijo}`),
  });
}

export function reiniciarLimitesAuth(): void {
  reiniciarStores();
}

export const limiteLogin = limitarPorIP({
  ventanaMinutos: 15,
  maxIntentos: 10,
  mensaje: "Demasiados intentos fallidos de inicio de sesión. Vuelve a probar en 15 minutos.",
  prefijo: "login",
  soloContarFallos: true,
});

export const limiteRegistro = limitarPorIP({
  ventanaMinutos: 60,
  maxIntentos: 5,
  mensaje: "Se han creado demasiadas cuentas desde esta conexión. Vuelve a probar en una hora.",
  prefijo: "registro",
});

export const limiteRecuperacion = limitarPorIP({
  ventanaMinutos: 60,
  maxIntentos: 5,
  mensaje: "Demasiadas solicitudes de recuperación de contraseña. Vuelve a probar en una hora.",
  prefijo: "recuperacion",
});

export const limiteReenvioVerificacion = limitarPorIP({
  ventanaMinutos: 60,
  maxIntentos: 5,
  mensaje: "Demasiados reenvíos del correo de verificación. Vuelve a probar en una hora.",
  prefijo: "reenvio",
});
