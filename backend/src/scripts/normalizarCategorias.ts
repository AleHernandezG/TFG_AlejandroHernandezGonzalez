/**
 * Normaliza las categorías (dietas) de las recetas y las preferencias de los
 * usuarios a sus ids canónicos. Los distintos scripts de seed sembraron
 * variantes de la misma dieta ("Vegetariana", "vegetariana", "vegetariano";
 * "mediterranea", "mediterránea"), lo que hace que el boost por gustos del feed
 * no acierte. Este script las unifica.
 *
 * Solo toca variantes conocidas de dietas. Las categorías que no son dietas
 * (cocinas y tipos de plato: "italiana", "desayuno", "postres"...) se respetan.
 *
 * Por defecto va en seco (dry-run): enseña qué cambiaría sin escribir nada.
 * Para aplicar los cambios:
 *   npm run normalizar:categorias -- --apply
 */

import "dotenv/config";
import mongoose from "mongoose";
import { conectarDB } from "../lib/db";
import { Receta } from "../models/recetaMongo";
import { Usuario } from "../models/usuarioMongo";

const DIETAS_CANONICAS = [
  "vegetariano",
  "vegano",
  "keto",
  "mediterranea",
  "paleo",
  "halal",
  "kosher",
  "bajoEnCalorias",
  "altoEnProteinas",
  "lowCarb",
];

// Variantes de género/escritura que el deacento+minúsculas no resuelve solo.
const ALIAS: Record<string, string> = {
  vegetariana: "vegetariano",
  vegetariano: "vegetariano",
  vegana: "vegano",
  vegano: "vegano",
};

function quitarAcentos(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function normalizar(categoria: string): string {
  const base = quitarAcentos(categoria.trim().toLowerCase());
  if (ALIAS[base]) return ALIAS[base];
  const canonica = DIETAS_CANONICAS.find((d) => quitarAcentos(d.toLowerCase()) === base);
  if (canonica) return canonica;
  return categoria;
}

function normalizarLista(lista: string[]): { nueva: string[]; cambio: boolean } {
  const vistos = new Set<string>();
  const nueva: string[] = [];
  for (const item of lista) {
    const norm = normalizar(item);
    if (!vistos.has(norm)) {
      vistos.add(norm);
      nueva.push(norm);
    }
  }
  const cambio =
    nueva.length !== lista.length || nueva.some((v, i) => v !== lista[i]);
  return { nueva, cambio };
}

async function run(): Promise<void> {
  const aplicar = process.argv.includes("--apply");
  await conectarDB();

  console.log(aplicar ? "\n⚙️  Modo APLICAR (se escribirá en la BBDD)\n" : "\n🔎 Modo DRY-RUN (no se escribe nada, solo se muestra)\n");

  // ─── Recetas ───────────────────────────────────────────────
  const recetas = await Receta.find({}).select("titulo categorias").exec();
  let recetasTocadas = 0;
  for (const receta of recetas) {
    const actuales = (receta.categorias as string[]) ?? [];
    const { nueva, cambio } = normalizarLista(actuales);
    if (!cambio) continue;
    recetasTocadas++;
    console.log(`receta · ${receta.titulo}`);
    console.log(`   [${actuales.join(", ")}] → [${nueva.join(", ")}]`);
    if (aplicar) {
      receta.categorias = nueva;
      await receta.save();
    }
  }

  // ─── Preferencias de usuario ───────────────────────────────
  const usuarios = await Usuario.find({}).select("nombre preferencias").exec();
  let usuariosTocados = 0;
  for (const usuario of usuarios) {
    const actuales = (usuario.preferencias as string[]) ?? [];
    const { nueva, cambio } = normalizarLista(actuales);
    if (!cambio) continue;
    usuariosTocados++;
    console.log(`usuario · ${usuario.nombre}`);
    console.log(`   [${actuales.join(", ")}] → [${nueva.join(", ")}]`);
    if (aplicar) {
      usuario.preferencias = nueva;
      await usuario.save();
    }
  }

  console.log(`\n📊 Recetas con categorías a normalizar: ${recetasTocadas}`);
  console.log(`📊 Usuarios con preferencias a normalizar: ${usuariosTocados}`);
  console.log(
    aplicar
      ? "\n✅ Cambios aplicados."
      : "\nℹ️  No se ha escrito nada. Vuelve a ejecutar con --apply para aplicar.",
  );

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Error al normalizar categorías:", err);
  process.exit(1);
});
