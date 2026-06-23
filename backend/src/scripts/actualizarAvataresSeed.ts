/**
 * Cambia los avatares de los chefs del seed masivo a avatares de iniciales
 * (ui-avatars) sobre el color de marca. Solo afecta a usuarios cuya foto sea
 * de pravatar, es decir los creados por seedMasivo. No toca usuarios reales.
 *
 * Uso:
 *   npx ts-node --transpile-only src/scripts/actualizarAvataresSeed.ts
 */

import "dotenv/config";
import mongoose from "mongoose";
import { conectarDB } from "../lib/db";
import { Usuario } from "../models/usuarioMongo";

const avatarIniciales = (nombre: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=9a5a2d&color=fff&bold=true&size=200`;

async function run(): Promise<void> {
  await conectarDB();

  const usuarios = await Usuario.find({ foto: /pravatar/i }).select("_id nombre foto");

  if (usuarios.length === 0) {
    console.log("ℹ️  No hay chefs del seed masivo con avatar de pravatar.");
    await mongoose.disconnect();
    return;
  }

  console.log(`🖼️  Actualizando ${usuarios.length} avatares...`);
  for (const u of usuarios) {
    u.foto = avatarIniciales(u.nombre);
    await u.save();
    console.log(`   · ${u.nombre}`);
  }

  console.log("\n✅ Avatares actualizados.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Error al actualizar avatares:", err);
  process.exit(1);
});
