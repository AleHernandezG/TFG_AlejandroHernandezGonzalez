import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validarBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      const errores = (resultado.error as ZodError).errors.map((e) => ({
        campo: e.path.join("."),
        mensaje: e.message,
      }));
      res.status(400).json({ error: "Datos inválidos", errores });
      return;
    }

    req.body = resultado.data;
    next();
  };
}
