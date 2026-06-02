import { Router, Request, Response } from "express";
import { buscarIngredientesEdamam } from "../services/ingredientesService";

const router = Router();

router.get("/buscar", async (req: Request, res: Response): Promise<void> => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (q.length < 2) {
    res.json([]);
    return;
  }
  const resultados = await buscarIngredientesEdamam(q);
  res.json(resultados);
});

export default router;
