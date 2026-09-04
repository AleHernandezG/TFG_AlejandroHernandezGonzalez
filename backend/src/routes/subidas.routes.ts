import { Router } from "express";
import { subidasController } from "../controllers/subidasController";
import { requerirAuth } from "../middlewares/autenticacion";
import { validarBody } from "../middlewares/validarBody";
import { esquemaFirmaSubida } from "../lib/validadores";

const router = Router();

router.post("/firma", requerirAuth, validarBody(esquemaFirmaSubida), subidasController.firmar);

export default router;
