import rateLimit from "express-rate-limit";

type OpcionesLimite = {
  ventanaMinutos: number;
  maxIntentos: number;
  mensaje: string;
  soloContarFallos?: boolean;
};

function limitarPorIP({ ventanaMinutos, maxIntentos, mensaje, soloContarFallos = false }: OpcionesLimite) {
  return rateLimit({
    windowMs: ventanaMinutos * 60_000,
    limit: maxIntentos,
    message: { error: mensaje },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: soloContarFallos,
  });
}

export const limiteLogin = limitarPorIP({
  ventanaMinutos: 15,
  maxIntentos: 10,
  mensaje: "Demasiados intentos fallidos de inicio de sesión. Vuelve a probar en 15 minutos.",
  soloContarFallos: true,
});

export const limiteRegistro = limitarPorIP({
  ventanaMinutos: 60,
  maxIntentos: 5,
  mensaje: "Se han creado demasiadas cuentas desde esta conexión. Vuelve a probar en una hora.",
});

export const limiteRecuperacion = limitarPorIP({
  ventanaMinutos: 60,
  maxIntentos: 5,
  mensaje: "Demasiadas solicitudes de recuperación de contraseña. Vuelve a probar en una hora.",
});

export const limiteReenvioVerificacion = limitarPorIP({
  ventanaMinutos: 60,
  maxIntentos: 5,
  mensaje: "Demasiados reenvíos del correo de verificación. Vuelve a probar en una hora.",
});
