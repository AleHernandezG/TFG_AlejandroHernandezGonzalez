import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose, { Types } from "mongoose";
import { conectarDB } from "../lib/db";
import { Usuario } from "../models/usuarioMongo";
import { ALERGENOS, AlergenoId } from "../lib/ingredientes";

const aplicar = process.argv.includes("--apply");
const indiceRestaurar = process.argv.indexOf("--restaurar");
const ficheroRestaurar = indiceRestaurar !== -1 ? process.argv[indiceRestaurar + 1] : undefined;

const CARPETA_RESPALDOS = path.resolve(__dirname, "../../respaldos");

const VARIANTES: Record<AlergenoId, string[]> = {
  cereales: ["cereal", "cereales con gluten", "gluten", "trigo", "celiaco", "celiaquia", "wheat"],
  lacteos: ["lacteo", "leche", "lactosa", "intolerancia a la lactosa", "dairy", "milk"],
  huevo: ["huevos", "egg", "eggs"],
  pescado: ["pescados", "fish"],
  cacahuetes: ["cacahuete", "mani", "peanut", "peanuts"],
  soja: ["soya", "soy"],
  frutosSecos: ["frutos secos", "fruto seco", "frutos de cascara", "nueces", "tree nuts", "nuts"],
  crustaceos: ["crustaceo", "marisco", "mariscos", "shellfish"],
  moluscos: ["molusco", "molluscs"],
  apio: ["celery"],
  mostaza: ["mustard"],
  sesamo: ["ajonjoli", "sesame"],
  altramuz: ["altramuces", "lupino", "lupin"],
  sulfitos: ["sulfito", "dioxido de azufre", "anhidrido sulfuroso", "sulfites", "sulphites"],
};

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const sinEspacios = (texto: string) => texto.replace(/ /g, "");

const ID_POR_VARIANTE = new Map<string, AlergenoId>();
for (const id of ALERGENOS) {
  for (const variante of [id, ...VARIANTES[id]]) {
    ID_POR_VARIANTE.set(sinEspacios(normalizarTexto(variante)), id);
  }
}

function idDelCatalogo(valor: unknown): AlergenoId | null {
  if (typeof valor !== "string") return null;
  return ID_POR_VARIANTE.get(sinEspacios(normalizarTexto(valor))) ?? null;
}

interface UsuarioLeido {
  _id: Types.ObjectId;
  correo?: string;
  alergias?: unknown;
}

interface Copia {
  _id: string;
  alergias: unknown;
}

interface Revision {
  usuario: UsuarioLeido;
  nuevas: string[];
  sinMapear: string[];
  cambia: boolean;
}

function revisar(usuario: UsuarioLeido): Revision {
  const actuales: unknown[] = Array.isArray(usuario.alergias)
    ? usuario.alergias
    : usuario.alergias == null
      ? []
      : [usuario.alergias];
  const nuevas: string[] = [];
  const sinMapear: string[] = [];

  for (const valor of actuales) {
    const id = idDelCatalogo(valor);
    if (id) {
      if (!nuevas.includes(id)) nuevas.push(id);
      continue;
    }
    const original = String(valor);
    sinMapear.push(original);
    if (!nuevas.includes(original)) nuevas.push(original);
  }

  const cambia =
    !Array.isArray(usuario.alergias) ||
    nuevas.length !== actuales.length ||
    nuevas.some((valor, i) => valor !== actuales[i]);

  return { usuario, nuevas, sinMapear, cambia };
}

function guardarCopia(usuarios: UsuarioLeido[]): string {
  fs.mkdirSync(CARPETA_RESPALDOS, { recursive: true });
  const marca = new Date().toISOString().replace(/[:.]/g, "-");
  const fichero = path.join(CARPETA_RESPALDOS, `alergias-perfil-${marca}.json`);
  const copia: Copia[] = usuarios.map((u) => ({ _id: u._id.toHexString(), alergias: u.alergias ?? [] }));

  fs.writeFileSync(fichero, JSON.stringify(copia, null, 2));

  const releida = JSON.parse(fs.readFileSync(fichero, "utf8")) as Copia[];
  if (releida.length !== usuarios.length) {
    throw new Error(`La copia ${fichero} no tiene los ${usuarios.length} usuarios leídos`);
  }
  return fichero;
}

async function leerUsuariosConAlergias(): Promise<UsuarioLeido[]> {
  return (await Usuario.collection
    .find({ alergias: { $exists: true, $ne: [] } })
    .project({ correo: 1, alergias: 1 })
    .toArray()) as unknown as UsuarioLeido[];
}

async function restaurar(fichero: string): Promise<void> {
  const copia = JSON.parse(fs.readFileSync(path.resolve(fichero), "utf8")) as Copia[];
  console.log(`Restaurando las alergias de ${copia.length} usuario(s) desde ${fichero}`);

  if (copia.length > 0) {
    const resultado = await Usuario.collection.bulkWrite(
      copia.map((u) => ({
        updateOne: {
          filter: { _id: new Types.ObjectId(u._id) },
          update: { $set: { alergias: u.alergias } },
        },
      })),
    );
    console.log(`✅ ${resultado.matchedCount} encontrados, ${resultado.modifiedCount} cambiados`);
  }
}

async function run(): Promise<void> {
  await conectarDB();

  if (indiceRestaurar !== -1) {
    if (!ficheroRestaurar) throw new Error("Falta el fichero: --restaurar respaldos/alergias-perfil-XXXX.json");
    await restaurar(ficheroRestaurar);
    await mongoose.disconnect();
    return;
  }

  console.log(
    aplicar
      ? "Modo escritura: las alergias del perfil que se reconocen pasan al id del catálogo."
      : "Modo seco: no se escribe nada. Vuelve a ejecutar con --apply para aplicar.",
  );

  const usuarios = await leerUsuariosConAlergias();
  const revisiones = usuarios.map(revisar);
  const cambios = revisiones.filter((r) => r.cambia);
  const conSinMapear = revisiones.filter((r) => r.sinMapear.length > 0);

  console.log(`\n── Perfiles con alergias que cambian: ${cambios.length} de ${usuarios.length} ──`);
  for (const { usuario, nuevas } of cambios) {
    const antes = Array.isArray(usuario.alergias) ? usuario.alergias.join(", ") : JSON.stringify(usuario.alergias);
    console.log(`  ${usuario._id.toHexString()} · [${antes}] → [${nuevas.join(", ")}]`);
  }

  if (conSinMapear.length > 0) {
    console.log(`\n⚠️  ${conSinMapear.length} perfil(es) con alergias que no sé pasar a un id. Se quedan como están:`);
    for (const { usuario, sinMapear } of conSinMapear) {
      console.log(`  ${usuario._id.toHexString()} (${usuario.correo ?? "sin correo"}) · ${sinMapear.map((v) => `"${v}"`).join(", ")}`);
    }
    console.log(
      "   Mientras sigan ahí, ese usuario recibe un 400 al guardar sus preferencias. Hay que decidir a mano",
    );
    console.log("   a qué id corresponden o quitarlas, y avisar al usuario si es una alergia que Cookr no filtra.");
  }

  console.log("\n📊 Resumen");
  console.log(`   perfiles con alergias: ${usuarios.length}`);
  console.log(`   perfiles ${aplicar ? "normalizados" : "por normalizar"}: ${cambios.length}`);
  console.log(`   perfiles con valores sin mapear: ${conSinMapear.length}`);

  if (aplicar && cambios.length > 0) {
    const fichero = path.relative(process.cwd(), guardarCopia(usuarios));
    console.log(`\n💾 Copia de las alergias de antes en ${fichero}`);

    const resultado = await Usuario.collection.bulkWrite(
      cambios.map(({ usuario, nuevas }) => ({
        updateOne: {
          filter: { _id: usuario._id },
          update: { $set: { alergias: nuevas } },
        },
      })),
    );
    console.log(`✅ ${resultado.modifiedCount} perfil(es) actualizados`);

    const pendientes = (await leerUsuariosConAlergias()).map(revisar).filter((r) => r.cambia);
    console.log(
      pendientes.length === 0
        ? "✅ Todas las alergias reconocibles están ya como id del catálogo."
        : `⚠️  Quedan ${pendientes.length} perfil(es) por normalizar. Vuelve a ejecutar el script.`,
    );
    console.log(`\nPara deshacerlo: npm run normalizar:alergias -- --restaurar "${fichero}"`);
  } else if (!aplicar) {
    console.log("\nNunca borra una alergia: lo que no reconoce se queda tal cual y se lista arriba.");
  }

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("❌ Error normalizando las alergias del perfil:", err);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
