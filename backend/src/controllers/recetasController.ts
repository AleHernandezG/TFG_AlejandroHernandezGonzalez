import { Request, Response } from "express";
import { recetasService } from "../services/recetasService";
import { esquemaCrearRecetaBody } from "../lib/validadores";
import { manejarError } from "../middlewares/errores";

export const recetasController = {
  async obtenerFeed(req: Request, res: Response): Promise<void> {
    try {
      const {
        q, dietas, dificultad, alergenos, pagina, limite, excluirPropio,
        soloSiguiendo, sort, soloEvento, categoria,
      } = req.query;

      const filtros = {
        q: typeof q === "string" ? q : undefined,
        dietas:
          typeof dietas === "string" && dietas
            ? dietas.split(",")
            : undefined,
        dificultad:
          typeof dificultad === "string" && dificultad
            ? dificultad.split(",")
            : undefined,
        alergenos:
          typeof alergenos === "string" && alergenos
            ? alergenos.split(",")
            : undefined,
        pagina: pagina ? Math.max(1, Number(pagina)) : 1,
        limite: limite ? Math.min(50, Number(limite)) : 20,
        excluirPropio: excluirPropio === "true",
        soloSiguiendo: soloSiguiendo === "true",
        sort: (sort === "likes" || sort === "reciente" || sort === "score") ? (sort as 'likes' | 'reciente' | 'score') : undefined,
        soloEvento: soloEvento === "true",
        categoria: typeof categoria === "string" && categoria ? categoria : undefined,
      };

      const resultado = await recetasService.obtenerFeed(
        filtros,
        req.usuario?.id
      );
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await recetasService.obtenerPorId(
        req.params.id,
        req.usuario?.id
      );
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async obtenerSimilares(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await recetasService.obtenerSimilares(
        req.params.id,
        req.usuario?.id
      );
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async toggleLike(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await recetasService.toggleLike(
        req.params.id,
        req.usuario!.id
      );
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async toggleGuardado(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await recetasService.toggleGuardado(
        req.params.id,
        req.usuario!.id
      );
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async obtenerComentarios(req: Request, res: Response): Promise<void> {
    try {
      const pagina = req.query.pagina ? Math.max(1, Number(req.query.pagina)) : 1;
      const limite = req.query.limite ? Math.min(20, Number(req.query.limite)) : 8;
      const resultado = await recetasService.obtenerComentarios(req.params.id, pagina, limite);
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async agregarComentario(req: Request, res: Response): Promise<void> {
    try {
      const { texto } = req.body as { texto?: string };
      if (typeof texto !== "string") {
        res.status(400).json({ error: "El campo texto es obligatorio" });
        return;
      }
      const resultado = await recetasService.agregarComentario(
        req.params.id,
        req.usuario!.id,
        texto
      );
      res.status(201).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async obtenerGuardadas(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await recetasService.obtenerGuardadas(req.usuario!.id);
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async obtenerMisRecetas(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await recetasService.obtenerMisRecetas(req.usuario!.id);
      res.status(200).json(resultado);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async crear(req: Request, res: Response): Promise<void> {
    try {
      const resultado = esquemaCrearRecetaBody.safeParse(req.body);
      if (!resultado.success) {
        res.status(400).json({ error: "Datos inválidos", detalle: resultado.error.flatten() });
        return;
      }
      const { id } = await recetasService.crear(resultado.data, req.usuario!.id);
      res.status(201).json({ id });
    } catch (error) {
      manejarError(res, error);
    }
  },

  async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const resultado = esquemaCrearRecetaBody.partial().safeParse(req.body);
      if (!resultado.success) {
        res.status(400).json({ error: "Datos inválidos", detalle: resultado.error.flatten() });
        return;
      }
      await recetasService.actualizar(req.params.id, req.usuario!.id, resultado.data);
      res.status(204).send();
    } catch (error) {
      manejarError(res, error);
    }
  },

  async eliminar(req: Request, res: Response): Promise<void> {
    try {
      await recetasService.eliminar(req.params.id, req.usuario!.id);
      res.status(204).send();
    } catch (error) {
      manejarError(res, error);
    }
  },

  async obtenerFotoPreview(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      if (typeof query !== "string" || !query.trim()) {
        res.status(400).json({ error: "El parámetro query es obligatorio" });
        return;
      }
      const resultado = await recetasService.obtenerFotoPreview(query.trim());
      res.status(200).json(resultado ?? null);
    } catch (error) {
      manejarError(res, error);
    }
  },
};
