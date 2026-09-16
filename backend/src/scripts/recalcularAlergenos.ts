import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose, { Types } from "mongoose";
import { conectarDB } from "../lib/db";
import { Receta } from "../models/recetaMongo";
import { ALERGENOS, AlergenoId, detectarAlergenos } from "../lib/ingredientes";

const aplicar = process.argv.includes("--apply");
const indiceRestaurar = process.argv.indexOf("--restaurar");
const ficheroRestaurar = indiceRestaurar !== -1 ? process.argv[indiceRestaurar + 1] : undefined;

const CARPETA_RESPALDOS = path.resolve(__dirname, "../../respaldos");

interface RecetaLeida {
  _id: Types.ObjectId;
  titulo?: string;
  ingredientes?: { nombre?: string }[];
  alergenos?: string[];
}

interface Copia {
  _id: string;
  alergenos: string[];
}

interface Cambio {
  receta: RecetaLeida;
  nuevos: AlergenoId[];
}

function guardarCopia(recetas: RecetaLeida[]): string {
  fs.mkdirSync(CARPETA_RESPALDOS, { recursive: true });
  const marca = new Date().toISOString().replace(/[:.]/g, "-");
  const fichero = path.join(CARPETA_RESPALDOS, `alergenos-${marca}.json`);
  const copia: Copia[] = recetas.map((r) => ({ _id: r._id.toHexString(), alergenos: r.alergenos ?? [] }));

  fs.writeFileSync(fichero, JSON.stringify(copia, null, 2));

  const releida = JSON.parse(fs.readFileSync(fichero, "utf8")) as Copia[];
  if (releida.length !== recetas.length) {
    throw new Error(`La copia ${fichero} no tiene las ${recetas.length} recetas leídas`);
  }
  return fichero;
}

function calcularCambios(recetas: RecetaLeida[]): Cambio[] {
  return recetas
    .map((receta) => {
      const actuales = receta.alergenos ?? [];
      const nombres = (receta.ingredientes ?? []).map((ing) => ing.nombre ?? "").filter(Boolean);
      const nuevos = detectarAlergenos(nombres).filter((alergeno) => !actuales.includes(alergeno));
      return { receta, nuevos };
    })
    .filter((cambio) => cambio.nuevos.length > 0);
}

async function restaurar(fichero: string): Promise<void> {
  const copia = JSON.parse(fs.readFileSync(path.resolve(fichero), "utf8")) as Copia[];
  console.log(`Restaurando los alérgenos de ${copia.length} receta(s) desde ${fichero}`);

  if (copia.length > 0) {
    const resultado = await Receta.collection.bulkWrite(
      copia.map((r) => ({
        updateOne: {
          filter: { _id: new Types.ObjectId(r._id) },
          update: { $set: { alergenos: r.alergenos } },
        },
      })),
    );
    console.log(`✅ ${resultado.matchedCount} encontradas, ${resultado.modifiedCount} cambiadas`);
  }
}

async function run(): Promise<void> {
  await conectarDB();

  if (indiceRestaurar !== -1) {
    if (!ficheroRestaurar) throw new Error("Falta el fichero: --restaurar respaldos/alergenos-XXXX.json");
    await restaurar(ficheroRestaurar);
    await mongoose.disconnect();
    return;
  }

  console.log(
    aplicar
      ? "Modo escritura: se añaden a cada receta los alérgenos que llevan sus ingredientes."
      : "Modo seco: no se escribe nada. Vuelve a ejecutar con --apply para aplicar.",
  );

  const recetas = (await Receta.collection
    .find({})
    .project({ titulo: 1, ingredientes: 1, alergenos: 1 })
    .toArray()) as unknown as RecetaLeida[];

  const cambios = calcularCambios(recetas);

  console.log(`\n── Recetas a las que les faltan alérgenos: ${cambios.length} de ${recetas.length} ──`);
  for (const { receta, nuevos } of cambios) {
    const nombre = receta.titulo ?? receta._id.toHexString();
    console.log(`  ${nombre} · [${(receta.alergenos ?? []).join(", ")}] + ${nuevos.join(", ")}`);
  }

  const porAlergeno = new Map<string, number>();
  for (const { nuevos } of cambios) {
    for (const alergeno of nuevos) porAlergeno.set(alergeno, (porAlergeno.get(alergeno) ?? 0) + 1);
  }

  const desconocidos = recetas.filter((r) =>
    (r.alergenos ?? []).some((a) => !ALERGENOS.includes(a as AlergenoId)),
  );

  console.log("\n📊 Resumen");
  console.log(`   recetas revisadas: ${recetas.length}`);
  console.log(`   recetas ${aplicar ? "corregidas" : "por corregir"}: ${cambios.length}`);
  for (const [alergeno, veces] of [...porAlergeno].sort((a, b) => b[1] - a[1])) {
    console.log(`   + ${alergeno.padEnd(12)} en ${veces} receta(s)`);
  }

  if (desconocidos.length > 0) {
    console.log(`\n⚠️  ${desconocidos.length} receta(s) guardan alérgenos que no están en la lista de 14. No se tocan.`);
  }

  if (aplicar && cambios.length > 0) {
    const fichero = path.relative(process.cwd(), guardarCopia(recetas));
    console.log(`\n💾 Copia de los alérgenos de antes en ${fichero}`);

    const resultado = await Receta.collection.bulkWrite(
      cambios.map(({ receta, nuevos }) => ({
        updateOne: {
          filter: { _id: receta._id },
          update: { $addToSet: { alergenos: { $each: nuevos } } },
        },
      })),
    );
    console.log(`✅ ${resultado.modifiedCount} receta(s) actualizadas`);

    const pendientes = calcularCambios(
      (await Receta.collection
        .find({})
        .project({ titulo: 1, ingredientes: 1, alergenos: 1 })
        .toArray()) as unknown as RecetaLeida[],
    );
    console.log(
      pendientes.length === 0
        ? "✅ Ninguna receta tiene ya alérgenos sin declarar."
        : `⚠️  Quedan ${pendientes.length} receta(s) con alérgenos sin declarar. Vuelve a ejecutar el script.`,
    );
    console.log(`\nPara deshacerlo: npm run recalcular:alergenos -- --restaurar "${fichero}"`);
  } else if (!aplicar) {
    console.log("\nSolo añade alérgenos, nunca quita. Repetirlo no cambia nada que ya esté bien.");
  }

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("❌ Error recalculando alérgenos:", err);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
