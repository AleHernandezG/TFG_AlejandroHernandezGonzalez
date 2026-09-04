import "dotenv/config";
import mongoose from "mongoose";
import { conectarDB } from "../lib/db";
import { Receta } from "../models/recetaMongo";
import { Usuario } from "../models/usuarioMongo";
import { cloudinaryConfigurado, subirImagen } from "../lib/cloudinary";

const aplicar = process.argv.includes("--apply");

interface Fallo {
  donde: string;
  id: string;
  motivo: string;
}

const fallos: Fallo[] = [];

function esIncrustada(valor: unknown): valor is string {
  return typeof valor === "string" && valor.startsWith("data:");
}

function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function mb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function migrarAvatares(): Promise<{ urlPorUsuario: Map<string, string>; bytes: number }> {
  const usuarios = await Usuario.find({ foto: /^data:/ }).select("nombre foto").exec();
  const urlPorUsuario = new Map<string, string>();
  let bytes = 0;

  console.log(`\n── Avatares en usuarios: ${usuarios.length} ──`);

  for (const usuario of usuarios) {
    const foto = usuario.foto as string;
    const id = usuario._id.toString();
    const peso = Buffer.byteLength(foto, "utf8");
    console.log(`  ${usuario.nombre} · ${kb(peso)}`);

    if (!aplicar) {
      bytes += peso;
      continue;
    }

    try {
      const url = await subirImagen(foto, `cookr/avatares/${id}`);
      await Usuario.updateOne({ _id: usuario._id }, { $set: { foto: url } });
      urlPorUsuario.set(id, url);
      bytes += peso;
      console.log(`    → ${url}`);
    } catch (error) {
      fallos.push({ donde: "usuarios.foto", id, motivo: (error as Error).message });
      console.log(`    ✗ ${(error as Error).message}`);
    }
  }

  return { urlPorUsuario, bytes };
}

async function migrarFotosDeRecetas(): Promise<number> {
  const recetas = await Receta.find({ imagenUrl: /^data:/ }).select("titulo imagenUrl").exec();
  let bytes = 0;

  console.log(`\n── Fotos en recetas: ${recetas.length} ──`);

  for (const receta of recetas) {
    const imagen = receta.imagenUrl;
    const id = receta._id.toString();
    const peso = Buffer.byteLength(imagen, "utf8");
    console.log(`  ${receta.titulo} · ${kb(peso)}`);

    if (!aplicar) {
      bytes += peso;
      continue;
    }

    try {
      const url = await subirImagen(imagen, `cookr/recetas/${id}`);
      await Receta.updateOne({ _id: receta._id }, { $set: { imagenUrl: url } });
      bytes += peso;
      console.log(`    → ${url}`);
    } catch (error) {
      fallos.push({ donde: "recetas.imagenUrl", id, motivo: (error as Error).message });
      console.log(`    ✗ ${(error as Error).message}`);
    }
  }

  return bytes;
}

async function migrarAvataresDeComentarios(urlPorUsuario: Map<string, string>): Promise<number> {
  const recetas = await Receta.find({ "listaComentarios.avatarUrl": /^data:/ })
    .select("titulo listaComentarios")
    .exec();
  let bytes = 0;
  let total = 0;

  console.log(`\n── Avatares dentro de comentarios: en ${recetas.length} receta(s) ──`);

  for (const receta of recetas) {
    const comentarios = receta.listaComentarios as {
      autorId: mongoose.Types.ObjectId;
      autorNombre: string;
      avatarUrl: string | null;
    }[];

    for (const [indice, comentario] of comentarios.entries()) {
      if (!esIncrustada(comentario.avatarUrl)) continue;

      total++;
      const recetaId = receta._id.toString();
      const autorId = comentario.autorId?.toString() ?? "";
      const peso = Buffer.byteLength(comentario.avatarUrl, "utf8");
      console.log(`  ${receta.titulo} · comentario de ${comentario.autorNombre} · ${kb(peso)}`);

      if (!aplicar) {
        bytes += peso;
        continue;
      }

      try {
        const url =
          urlPorUsuario.get(autorId) ??
          (await subirImagen(comentario.avatarUrl, `cookr/avatares-comentarios/${recetaId}-${indice}`));

        await Receta.updateOne(
          { _id: receta._id },
          { $set: { [`listaComentarios.${indice}.avatarUrl`]: url } },
        );
        bytes += peso;
        console.log(`    → ${url}`);
      } catch (error) {
        fallos.push({
          donde: `recetas.listaComentarios.${indice}.avatarUrl`,
          id: recetaId,
          motivo: (error as Error).message,
        });
        console.log(`    ✗ ${(error as Error).message}`);
      }
    }
  }

  console.log(`  total: ${total} comentario(s)`);
  return bytes;
}

async function run(): Promise<void> {
  if (aplicar && !cloudinaryConfigurado()) {
    console.error("❌ CLOUDINARY_URL no está definida. Sin ella no se puede subir nada.");
    process.exit(1);
  }

  await conectarDB();

  console.log(
    aplicar
      ? "Modo escritura: se sube a Cloudinary y se reemplaza en Mongo."
      : "Modo seco: no se escribe nada. Vuelve a ejecutar con --apply para aplicar.",
  );

  const avatares = await migrarAvatares();
  const fotos = await migrarFotosDeRecetas();
  const comentarios = await migrarAvataresDeComentarios(avatares.urlPorUsuario);

  const liberado = avatares.bytes + fotos + comentarios;

  console.log("\n📊 Resumen");
  console.log(`   usuarios.foto                  ${mb(avatares.bytes)}`);
  console.log(`   recetas.imagenUrl              ${mb(fotos)}`);
  console.log(`   recetas.listaComentarios       ${mb(comentarios)}`);
  console.log(`   ${aplicar ? "sacado de Mongo" : "pendiente de sacar"}                ${mb(liberado)}`);

  if (fallos.length > 0) {
    console.log(`\n⚠️  ${fallos.length} documento(s) sin migrar:`);
    for (const fallo of fallos) {
      console.log(`   ${fallo.donde} · ${fallo.id} · ${fallo.motivo}`);
    }
    console.log("   Vuelve a ejecutar el script: los ya migrados se saltan solos.");
  } else if (aplicar) {
    console.log("\n✅ No queda ninguna imagen incrustada.");
  }

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("❌ Error migrando imágenes:", err);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
