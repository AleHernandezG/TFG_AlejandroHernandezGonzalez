/**
 * Limpieza de cuentas de prueba y todas sus referencias en MongoDB.
 *
 * Borra los usuarios indicados y, para cada uno: sus recetas, sus likes y
 * comentarios en recetas de otros, y su presencia en seguidos/seguidores.
 *
 * Uso:
 *   npx ts-node --transpile-only src/scripts/limpiarDatosTest.ts            (solo cuentas auto-generadas)
 *   npx ts-node --transpile-only src/scripts/limpiarDatosTest.ts --incluir-manuales   (añade loza@usal.es)
 */

import "dotenv/config";
import mongoose from "mongoose";
import { conectarDB } from "../lib/db";
import { Usuario } from "../models/usuarioMongo";
import { Receta } from "../models/recetaMongo";
import { Comentario } from "../models/comentarioMongo";

const INCLUIR_MANUALES = process.argv.includes("--incluir-manuales");

const PATRON_AUTO = /^test_.*@cookr(-test)?\.(com|dev)$/i;
const EMAILS_MANUALES = ["loza@usal.es"];

async function run(): Promise<void> {
  await conectarDB();

  const filtros: Record<string, unknown>[] = [{ correo: PATRON_AUTO }];
  if (INCLUIR_MANUALES) filtros.push({ correo: { $in: EMAILS_MANUALES } });

  const objetivo = await Usuario.find({ $or: filtros }).select("_id nombre correo").lean();

  if (objetivo.length === 0) {
    console.log("ℹ️  No hay cuentas de prueba que coincidan.");
    await mongoose.disconnect();
    return;
  }

  console.log(`🗑️  Cuentas a eliminar (${objetivo.length}):`);
  objetivo.forEach((u) => console.log(`   · ${u.nombre} <${u.correo}>`));

  const ids = objetivo.map((u) => u._id);

  const recetasSuyas = await Receta.find({ autorId: { $in: ids } }).select("_id").lean();
  const comentariosEnSusRecetas = await Comentario.deleteMany({
    recetaId: { $in: recetasSuyas.map((r) => r._id) },
  });
  const recetasBorradas = await Receta.deleteMany({ autorId: { $in: ids } });
  const likesLimpiados = await Receta.updateMany({}, { $pull: { likes: { $in: ids } } });

  const porReceta = await Comentario.aggregate<{ _id: mongoose.Types.ObjectId; n: number }>([
    { $match: { autorId: { $in: ids } } },
    { $group: { _id: "$recetaId", n: { $sum: 1 } } },
  ]);
  const comentariosLimpiados = await Comentario.deleteMany({ autorId: { $in: ids } });

  if (porReceta.length > 0) {
    await Receta.bulkWrite(
      porReceta.map((grupo) => ({
        updateOne: {
          filter: { _id: grupo._id },
          update: { $inc: { numComentarios: -grupo.n } },
        },
      })),
    );
  }
  const seguimientosLimpiados = await Usuario.updateMany(
    {},
    { $pull: { seguidos: { $in: ids }, seguidores: { $in: ids } } },
  );
  const usuariosBorrados = await Usuario.deleteMany({ _id: { $in: ids } });

  console.log("\n✅ Limpieza completada:");
  console.log(`   Usuarios borrados        : ${usuariosBorrados.deletedCount}`);
  console.log(`   Recetas suyas borradas   : ${recetasBorradas.deletedCount}`);
  console.log(`   Recetas con likes purgados    : ${likesLimpiados.modifiedCount}`);
  console.log(`   Comentarios en sus recetas    : ${comentariosEnSusRecetas.deletedCount}`);
  console.log(`   Comentarios suyos en otras    : ${comentariosLimpiados.deletedCount} (en ${porReceta.length} receta(s))`);
  console.log(`   Usuarios con follows purgados   : ${seguimientosLimpiados.modifiedCount}`);

  if (!INCLUIR_MANUALES) {
    console.log("\nℹ️  loza@usal.es no se ha tocado. Usa --incluir-manuales para borrarla también.");
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Error en la limpieza:", err);
  process.exit(1);
});
