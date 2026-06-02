/**
 * updateSeedImages.ts — actualiza las imágenes del seed de picsum a Pexels.
 *
 * Uso:
 *   npx ts-node src/scripts/updateSeedImages.ts
 *
 * Solo modifica documentos cuya imagenUrl contenga "picsum".
 * Reutiliza buscarFotoPexels del imagenService.ts.
 * Sleep de 350ms entre llamadas para respetar el rate-limit de Pexels.
 */

import "dotenv/config";
import mongoose from "mongoose";
import { conectarDB } from "../lib/db";
import { Receta } from "../models/recetaMongo";
import { buscarFotoPexels } from "../services/imagenService";

const SLEEP_MS = 350;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run(): Promise<void> {
  await conectarDB();

  const recetas = await Receta.find({
    imagenUrl: { $regex: "picsum", $options: "i" },
  })
    .select("_id titulo imagenUrl")
    .lean()
    .exec();

  if (recetas.length === 0) {
    console.log("ℹ️  No hay recetas con imágenes de picsum.");
    await mongoose.disconnect();
    return;
  }

  console.log(`🔍 ${recetas.length} recetas con imágenes picsum encontradas.\n`);

  let actualizadas = 0;
  let fallidas = 0;

  for (const receta of recetas) {
    const titulo = receta.titulo as string;
    process.stdout.write(`  · ${titulo} ... `);

    const foto = await buscarFotoPexels(titulo);

    if (!foto) {
      console.log("sin resultado en Pexels, se mantiene picsum");
      fallidas++;
    } else {
      await Receta.updateOne(
        { _id: receta._id },
        {
          $set: {
            imagenUrl: foto.url,
            fotoFuente: "pexels",
            fotoCredito: {
              fotografo: foto.fotografo,
              urlFoto: foto.urlFoto,
              urlPerfil: foto.urlPerfil,
            },
          },
        }
      );
      console.log(`✅ ${foto.fotografo}`);
      actualizadas++;
    }

    await sleep(SLEEP_MS);
  }

  console.log(`\n🎉 Fin: ${actualizadas} actualizadas · ${fallidas} sin resultado`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
