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

  const recetasBorradas = await Receta.deleteMany({ autorId: { $in: ids } });
  const likesLimpiados = await Receta.updateMany({}, { $pull: { likes: { $in: ids } } });
  const comentariosLimpiados = await Receta.updateMany(
    {},
    { $pull: { listaComentarios: { autorId: { $in: ids } } } },
  );
  const seguimientosLimpiados = await Usuario.updateMany(
    {},
    { $pull: { seguidos: { $in: ids }, seguidores: { $in: ids } } },
  );
  const usuariosBorrados = await Usuario.deleteMany({ _id: { $in: ids } });

  console.log("\n✅ Limpieza completada:");
  console.log(`   Usuarios borrados        : ${usuariosBorrados.deletedCount}`);
  console.log(`   Recetas suyas borradas   : ${recetasBorradas.deletedCount}`);
  console.log(`   Recetas con likes purgados    : ${likesLimpiados.modifiedCount}`);
  console.log(`   Recetas con comentarios purgados: ${comentariosLimpiados.modifiedCount}`);
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
