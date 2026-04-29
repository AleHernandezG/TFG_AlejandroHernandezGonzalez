import { Request, Response, NextFunction } from "express";
import { verificarToken } from "../lib/jwt";

// Extender el tipo Request de Express para incluir el usuario autenticado
//Por que en Express no existe este campo por defecto
declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        correo: string;
        rol: string;
      };
    }
  }
}

//Funcion para que no se pueda acceder a ciertas rutas sin un token valido
//Vamos sin estar autenticado, por ejemplo las de llamadas api necesitan un token.
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      req.usuario = verificarToken(token);
    } catch {
      // token inválido → seguimos sin usuario
    }
  }
  next();
}

export function requerirAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  // Lo de Bearer es un estandar para indicar que el token es un token de autenticacion.
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token de autenticación requerido" });
    return;
  }

  const token = authHeader.split(" ")[1];
  // Tiene un formato de "Bearer ajbci34bkj3 <- (Token)" por eso ahora solo importa el token

  try {
    const payload = verificarToken(token);
    req.usuario = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}
