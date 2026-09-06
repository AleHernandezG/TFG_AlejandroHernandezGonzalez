import "dotenv/config";
import { createHash } from "crypto";
import mongoose, { Types } from "mongoose";
import { conectarDB } from "../lib/db";
import { Receta } from "../models/recetaMongo";
import { Comentario } from "../models/comentarioMongo";

const aplicar = process.argv.includes("--apply");

interface ComentarioEmbebido {
  autorId?: Types.ObjectId;
  autorNombre?: string;
  avatarUrl?: string | null;
  texto?: string;
  fecha?: Date;
}

interface RecetaConArray {
  _id: Types.ObjectId;
  titulo?: string;
  listaComentarios?: ComentarioEmbebido[];
}

interface Medida {
  documentos: number;
  bytes: number;
  mayor: number;
}

const descartados: string[] = [];

function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function mb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function idEstable(recetaId: Types.ObjectId, indice: number): Types.ObjectId {
  const huella = createHash("sha1").update(`${recetaId.toHexString()}:${indice}`).digest("hex");
  return new Types.ObjectId(huella.slice(0, 24));
}

async function medir(nombre: string): Promise<Medida> {
  const [medida] = await mongoose.connection
    .collection(nombre)
    .aggregate([
      {
        $group: {
          _id: null,
          documentos: { $sum: 1 },
          bytes: { $sum: { $bsonSize: "$$ROOT" } },
          mayor: { $max: { $bsonSize: "$$ROOT" } },
        },
      },
    ])
    .toArray();

  return {
    documentos: (medida?.documentos as number) ?? 0,
    bytes: (medida?.bytes as number) ?? 0,
    mayor: (medida?.mayor as number) ?? 0,
  };
}

function linea(titulo: string, medida: Medida): string {
  return `   ${titulo.padEnd(24)} ${medida.documentos} doc · ${mb(medida.bytes)} · mayor ${kb(medida.mayor)}`;
}

async function recetasConArray(): Promise<RecetaConArray[]> {
  const docs = await Receta.collection
    .find({ listaComentarios: { $exists: true, $ne: [] } })
    .project({ titulo: 1, listaComentarios: 1 })
    .toArray();

  return docs as unknown as RecetaConArray[];
}

async function moverALaColeccion(recetas: RecetaConArray[]): Promise<number> {
  let movidos = 0;

  for (const receta of recetas) {
    const embebidos = receta.listaComentarios ?? [];
    const validos = embebidos.filter((c) => c.autorId && c.texto);
    const nombre = receta.titulo ?? receta._id.toHexString();

    if (validos.length < embebidos.length) {
      descartados.push(`${nombre} · ${embebidos.length - validos.length} sin autor o sin texto`);
    }

    console.log(`  ${nombre} · ${validos.length} comentario(s)`);
    movidos += validos.length;

    if (!aplicar || validos.length === 0) continue;

    await Comentario.bulkWrite(
      validos.map((comentario, indice) => ({
        updateOne: {
          filter: { _id: idEstable(receta._id, indice) },
          update: {
            $setOnInsert: {
              recetaId: receta._id,
              autorId: comentario.autorId,
              autorNombre: comentario.autorNombre ?? "Cookr User",
              avatarUrl: comentario.avatarUrl ?? null,
              texto: comentario.texto,
              fecha: comentario.fecha ?? new Date(),
            },
          },
          upsert: true,
        },
      })),
    );
  }

  return movidos;
}

async function recontarYLimpiar(): Promise<number> {
  const grupos = await Comentario.aggregate<{ _id: Types.ObjectId; n: number }>([
    { $group: { _id: "$recetaId", n: { $sum: 1 } } },
  ]).exec();

  const porReceta = new Map(grupos.map((g) => [String(g._id), g.n]));
  const recetas = await Receta.find({}).select("_id").lean().exec();

  if (recetas.length === 0) return 0;

  const resultado = await Receta.collection.bulkWrite(
    recetas.map((receta) => ({
      updateOne: {
        filter: { _id: receta._id as Types.ObjectId },
        update: {
          $set: { numComentarios: porReceta.get(String(receta._id)) ?? 0 },
          $unset: { listaComentarios: "" },
        },
      },
    })),
  );

  return resultado.modifiedCount;
}

async function run(): Promise<void> {
  await conectarDB();

  console.log(
    aplicar
      ? "Modo escritura: los comentarios pasan a la colección `comentarios` y salen de la receta."
      : "Modo seco: no se escribe nada. Vuelve a ejecutar con --apply para aplicar.",
  );

  const recetasAntes = await medir("recetas");
  const comentariosAntes = await medir("comentarios");

  const pendientes = await recetasConArray();
  const embebidos = pendientes.reduce((n, r) => n + (r.listaComentarios?.length ?? 0), 0);

  console.log(`\n── Recetas con el array dentro: ${pendientes.length} (${embebidos} comentarios) ──`);
  if (pendientes.length === 0) {
    console.log("  ninguna: o ya está migrado o nunca hubo comentarios embebidos");
  }

  const movidos = await moverALaColeccion(pendientes);
  const recontadas = aplicar ? await recontarYLimpiar() : 0;

  const recetasDespues = aplicar ? await medir("recetas") : recetasAntes;
  const comentariosDespues = aplicar ? await medir("comentarios") : comentariosAntes;

  console.log("\n📊 Resumen");
  console.log(linea("recetas antes", recetasAntes));
  console.log(linea(aplicar ? "recetas después" : "recetas (sin tocar)", recetasDespues));
  console.log(linea("comentarios antes", comentariosAntes));
  console.log(linea(aplicar ? "comentarios después" : "comentarios (sin tocar)", comentariosDespues));
  console.log(`   ${aplicar ? "movidos" : "por mover"}: ${movidos} comentario(s)`);
  if (aplicar) {
    console.log(`   recetas con el contador reescrito: ${recontadas}`);
    console.log(`   liberado de \`recetas\`: ${mb(recetasAntes.bytes - recetasDespues.bytes)}`);
  }

  if (descartados.length > 0) {
    console.log(`\n⚠️  ${descartados.length} receta(s) con comentarios ilegibles, no se mueven:`);
    for (const aviso of descartados) console.log(`   ${aviso}`);
  }

  if (aplicar) {
    const quedan = await Receta.collection.countDocuments({ listaComentarios: { $exists: true } });
    console.log(
      quedan === 0
        ? "\n✅ Ninguna receta conserva `listaComentarios`."
        : `\n⚠️  Quedan ${quedan} receta(s) con \`listaComentarios\`. Vuelve a ejecutar el script.`,
    );
  } else {
    console.log("\nEl `_id` de cada comentario sale de la receta y su posición, así que repetir el script no duplica nada.");
  }

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("❌ Error migrando comentarios:", err);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
