/**
 * Seed script — inserta usuarios y recetas de prueba en MongoDB.
 *
 * Uso:
 *   npm run seed          → inserta solo si la colección está vacía
 *   npm run seed -- --force → borra todo y vuelve a insertar
 *
 * Las recetas cubren todas las dificultades, alérgenos y categorías
 * para poder probar filtros, búsqueda y similares en desarrollo.
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { conectarDB } from "../lib/db";
import { Usuario } from "../models/usuarioMongo";
import { Receta } from "../models/recetaMongo";

const FORCE = process.argv.includes("--force");

// ── Imágenes de comida estables (picsum con seeds fijos) ─────────────────────
const IMG = (seed: string) =>
  `https://picsum.photos/seed/${seed}/800/600`;

// ── Datos de los usuarios seed ───────────────────────────────────────────────
const USUARIOS_SEED = [
  {
    nombre: "María García",
    correo: "maria@cookr.dev",
    contrasena: "Seed1234.",
    foto: "https://picsum.photos/seed/avatar-maria/200/200",
    rol: "usuario" as const,
    proveedor: "local" as const,
    cuentaVerificada: true,
    perfilCompleto: true,
    alergias: [] as string[],
    preferencias: ["mediterránea", "vegetariano"],
  },
  {
    nombre: "Carlos Ruiz",
    correo: "carlos@cookr.dev",
    contrasena: "Seed1234.",
    foto: "https://picsum.photos/seed/avatar-carlos/200/200",
    rol: "usuario" as const,
    proveedor: "local" as const,
    cuentaVerificada: true,
    perfilCompleto: true,
    alergias: ["lacteos"] as string[],
    preferencias: ["keto", "altoEnProteinas"],
  },
];

// ── Recetas seed ─────────────────────────────────────────────────────────────
// autorIndex hace referencia al índice en USUARIOS_SEED
const RECETAS_SEED = [
  {
    autorIndex: 0,
    titulo: "Pasta Carbonara",
    descripcion:
      "La auténtica carbonara italiana: sin nata, solo huevo, queso pecorino, guanciale crujiente y pimienta negra recién molida. El truco está en la temperatura — el huevo no debe cuajar.",
    imagenUrl: IMG("food-carbonara"),
    tiempo: "30 min",
    dificultad: "Media" as const,
    porciones: 2,
    categorias: ["mediterránea", "pasta"],
    alergenos: ["cereales", "lacteos", "huevo"],
    macros: { calorias: 620, proteinas: 28, carbos: 72, grasas: 24 },
    ingredientes: [
      { nombre: "Espaguetis", cantidad: 200, unidad: "g" },
      { nombre: "Guanciale", cantidad: 100, unidad: "g" },
      { nombre: "Yemas de huevo", cantidad: 4, unidad: "uds" },
      { nombre: "Queso pecorino rallado", cantidad: 60, unidad: "g" },
      { nombre: "Pimienta negra", cantidad: 1, unidad: "cdta" },
      { nombre: "Sal", cantidad: 1, unidad: "cdta" },
    ],
    pasos: [
      "Cocer la pasta en agua con mucha sal hasta al dente (guarda 1 vaso del agua de cocción).",
      "Dorar el guanciale en sartén sin aceite hasta que esté crujiente. Reservar la grasa.",
      "Mezclar en un bol las yemas con el pecorino rallado y pimienta negra abundante.",
      "Retirar la sartén del fuego. Añadir la pasta escurrida y mezclar con la grasa del guanciale.",
      "Añadir la mezcla de yemas fuera del fuego, moviendo rápido y añadiendo agua de cocción poco a poco hasta obtener una crema sedosa.",
      "Servir inmediatamente con más pecorino y pimienta.",
    ],
    listaComentarios: [
      { autorIndex: 1, texto: "¡La mejor carbonara que he probado! El truco del fuego apagado es clave." },
    ],
  },
  {
    autorIndex: 1,
    titulo: "Salmón Teriyaki con Arroz",
    descripcion:
      "Filete de salmón lacado con salsa teriyaki casera, servido sobre arroz jazmín y sésamo. Listo en 30 minutos, sabor de restaurante japonés.",
    imagenUrl: IMG("food-salmon"),
    tiempo: "30 min",
    dificultad: "Fácil" as const,
    porciones: 2,
    categorias: ["altoEnProteinas", "asiática"],
    alergenos: ["pescado", "soja", "sesamo"],
    macros: { calorias: 510, proteinas: 38, carbos: 48, grasas: 16 },
    ingredientes: [
      { nombre: "Filetes de salmón", cantidad: 2, unidad: "uds" },
      { nombre: "Arroz jazmín", cantidad: 180, unidad: "g" },
      { nombre: "Salsa de soja", cantidad: 3, unidad: "cdas" },
      { nombre: "Mirin", cantidad: 2, unidad: "cdas" },
      { nombre: "Azúcar moreno", cantidad: 1, unidad: "cda" },
      { nombre: "Ajo", cantidad: 2, unidad: "dientes" },
      { nombre: "Jengibre fresco", cantidad: 1, unidad: "cm" },
      { nombre: "Sésamo tostado", cantidad: 1, unidad: "cda" },
      { nombre: "Cebolleta", cantidad: 2, unidad: "uds" },
    ],
    pasos: [
      "Cocer el arroz según instrucciones. Reservar.",
      "Mezclar soja, mirin, azúcar, ajo y jengibre rallados para hacer la salsa teriyaki.",
      "Marinar el salmón en la mitad de la salsa durante 10 minutos.",
      "Sellar el salmón en sartén caliente 3 min por cada lado.",
      "Añadir el resto de la salsa y lacear el salmón a fuego medio hasta que caramelice.",
      "Servir sobre el arroz, espolvorear sésamo y cebolleta cortada en diagonal.",
    ],
    listaComentarios: [],
  },
  {
    autorIndex: 0,
    titulo: "Buddha Bowl Vegano",
    descripcion:
      "Bowl colorido y nutritivo con quinoa, garbanzos asados, aguacate, edamame y aliño de tahini y limón. Vegano, sin gluten y lleno de proteína vegetal.",
    imagenUrl: IMG("food-buddha-bowl"),
    tiempo: "25 min",
    dificultad: "Fácil" as const,
    porciones: 1,
    categorias: ["vegano", "vegetariano", "bajoEnCalorias", "altoEnProteinas"],
    alergenos: ["sesamo", "soja"],
    macros: { calorias: 440, proteinas: 22, carbos: 52, grasas: 18 },
    ingredientes: [
      { nombre: "Quinoa", cantidad: 80, unidad: "g" },
      { nombre: "Garbanzos cocidos", cantidad: 120, unidad: "g" },
      { nombre: "Aguacate", cantidad: 1, unidad: "ud" },
      { nombre: "Edamame congelado", cantidad: 60, unidad: "g" },
      { nombre: "Zanahoria rallada", cantidad: 1, unidad: "ud" },
      { nombre: "Remolacha cocida", cantidad: 80, unidad: "g" },
      { nombre: "Tahini", cantidad: 2, unidad: "cdas" },
      { nombre: "Limón", cantidad: 1, unidad: "ud" },
      { nombre: "Aceite de oliva", cantidad: 1, unidad: "cda" },
      { nombre: "Semillas de sésamo", cantidad: 1, unidad: "cdta" },
    ],
    pasos: [
      "Cocer la quinoa en agua salada 15 min. Escurrir y enfriar.",
      "Asar los garbanzos con aceite, sal, comino y pimentón a 200°C durante 20 min.",
      "Preparar el aliño: tahini + zumo de limón + agua + sal hasta conseguir consistencia cremosa.",
      "Montar el bowl: quinoa de base, secciones de aguacate, edamame, zanahoria, remolacha y garbanzos.",
      "Aliñar con la salsa de tahini y espolvorear sésamo.",
    ],
    listaComentarios: [
      { autorIndex: 1, texto: "Me encanta este bowl, lo hago todas las semanas. El aliño de tahini es adictivo." },
    ],
  },
  {
    autorIndex: 1,
    titulo: "Pollo al Ajillo",
    descripcion:
      "Receta clásica española de muslos de pollo dorados con ajo, vino blanco y romero. Solo 6 ingredientes, 35 minutos y el resultado es espectacular.",
    imagenUrl: IMG("food-pollo-ajillo"),
    tiempo: "35 min",
    dificultad: "Fácil" as const,
    porciones: 4,
    categorias: ["mediterránea", "española"],
    alergenos: ["sulfitos"],
    macros: { calorias: 390, proteinas: 42, carbos: 4, grasas: 22 },
    ingredientes: [
      { nombre: "Muslos de pollo", cantidad: 8, unidad: "uds" },
      { nombre: "Ajo", cantidad: 1, unidad: "cabeza" },
      { nombre: "Vino blanco", cantidad: 150, unidad: "ml" },
      { nombre: "Aceite de oliva virgen", cantidad: 3, unidad: "cdas" },
      { nombre: "Romero fresco", cantidad: 2, unidad: "ramas" },
      { nombre: "Sal y pimienta", cantidad: 1, unidad: "al gusto" },
    ],
    pasos: [
      "Salpimentar los muslos de pollo generosamente por ambos lados.",
      "Dorar el pollo en aceite caliente a fuego alto, piel hacia abajo, 5 min. Dar la vuelta y dorar 3 min más. Retirar.",
      "En el mismo aceite, dorar los ajos enteros con piel a fuego medio hasta que estén dorados.",
      "Añadir el vino blanco y dejar evaporar el alcohol 2 min a fuego alto.",
      "Incorporar el pollo, el romero y 100 ml de agua. Tapar y cocer a fuego medio-bajo 20 min.",
      "Destapar, subir el fuego y reducir la salsa hasta que esté brillante.",
    ],
    listaComentarios: [],
  },
  {
    autorIndex: 0,
    titulo: "Risotto de Setas",
    descripcion:
      "Risotto cremoso con mezcla de setas silvestres, vino blanco y parmesano. El secreto: añadir el caldo caliente poco a poco y no parar de remover.",
    imagenUrl: IMG("food-risotto"),
    tiempo: "40 min",
    dificultad: "Media" as const,
    porciones: 3,
    categorias: ["vegetariano", "italiana"],
    alergenos: ["lacteos", "cereales", "sulfitos"],
    macros: { calorias: 480, proteinas: 14, carbos: 68, grasas: 16 },
    ingredientes: [
      { nombre: "Arroz arborio", cantidad: 300, unidad: "g" },
      { nombre: "Setas variadas", cantidad: 250, unidad: "g" },
      { nombre: "Caldo de verduras caliente", cantidad: 1, unidad: "litro" },
      { nombre: "Vino blanco seco", cantidad: 100, unidad: "ml" },
      { nombre: "Cebolla", cantidad: 1, unidad: "ud" },
      { nombre: "Ajo", cantidad: 2, unidad: "dientes" },
      { nombre: "Parmesano rallado", cantidad: 60, unidad: "g" },
      { nombre: "Mantequilla", cantidad: 30, unidad: "g" },
      { nombre: "Aceite de oliva", cantidad: 2, unidad: "cdas" },
      { nombre: "Perejil fresco", cantidad: 1, unidad: "manojo" },
    ],
    pasos: [
      "Sofreír la cebolla y el ajo picados en aceite + mantequilla a fuego medio 5 min.",
      "Añadir las setas limpias y saltear 5 min hasta que pierdan el agua.",
      "Incorporar el arroz y tostar 2 min removiendo constantemente.",
      "Añadir el vino blanco y remover hasta que se absorba completamente.",
      "Ir añadiendo el caldo caliente cazo a cazo, esperando a que se absorba antes de añadir el siguiente. Proceso: 18-20 min.",
      "Fuera del fuego, añadir la mantequilla fría y el parmesano. Mantecato: mezclar enérgicamente para emulsionar.",
      "Servir inmediatamente con perejil picado.",
    ],
    listaComentarios: [
      { autorIndex: 1, texto: "Perfecto para una cena especial. Seguí los pasos al pie de la letra y quedó cremosísimo." },
    ],
  },
  {
    autorIndex: 1,
    titulo: "Gazpacho Andaluz",
    descripcion:
      "El gazpacho más refrescante del verano. Tomates maduros, pepino, pimiento y un buen chorro de aceite de oliva virgen extra. Sin cocción, sin gluten, vegano.",
    imagenUrl: IMG("food-gazpacho"),
    tiempo: "15 min",
    dificultad: "Fácil" as const,
    porciones: 4,
    categorias: ["vegano", "vegetariano", "bajoEnCalorias", "mediterránea", "española"],
    alergenos: [],
    macros: { calorias: 120, proteinas: 2, carbos: 12, grasas: 7 },
    ingredientes: [
      { nombre: "Tomates maduros", cantidad: 1, unidad: "kg" },
      { nombre: "Pepino", cantidad: 1, unidad: "ud" },
      { nombre: "Pimiento verde", cantidad: 0.5, unidad: "ud" },
      { nombre: "Ajo", cantidad: 1, unidad: "diente" },
      { nombre: "Pan de molde (opcional)", cantidad: 1, unidad: "rebanada" },
      { nombre: "Aceite de oliva virgen extra", cantidad: 60, unidad: "ml" },
      { nombre: "Vinagre de jerez", cantidad: 1, unidad: "cda" },
      { nombre: "Sal", cantidad: 1, unidad: "al gusto" },
    ],
    pasos: [
      "Lavar y trocear todos los ingredientes sin necesidad de pelarlos.",
      "Triturar en batidora potente: tomates, pepino, pimiento, ajo, pan y vinagre. Triturar 2 minutos.",
      "Con la batidora en marcha, añadir el aceite en hilo fino para emulsionar.",
      "Colar por un colador fino para eliminar pieles y semillas.",
      "Salpimentar al gusto. Refrigerar mínimo 2 horas antes de servir.",
      "Servir muy frío con guarnición de daditos de tomate, pepino y cebolleta.",
    ],
    listaComentarios: [],
  },
  {
    autorIndex: 0,
    titulo: "Paella Valenciana",
    descripcion:
      "La auténtica paella de Valencia: pollo, conejo, judía verde, garrofón, tomate, pimentón y azafrán. Cocción en paellera al fuego con caldo casero.",
    imagenUrl: IMG("food-paella"),
    tiempo: "90 min",
    dificultad: "Difícil" as const,
    porciones: 6,
    categorias: ["mediterránea", "española"],
    alergenos: ["crustaceos"],
    macros: { calorias: 540, proteinas: 35, carbos: 62, grasas: 16 },
    ingredientes: [
      { nombre: "Arroz bomba", cantidad: 500, unidad: "g" },
      { nombre: "Pollo troceado", cantidad: 500, unidad: "g" },
      { nombre: "Conejo troceado", cantidad: 300, unidad: "g" },
      { nombre: "Judía verde plana", cantidad: 200, unidad: "g" },
      { nombre: "Garrofón (o judía blanca)", cantidad: 100, unidad: "g" },
      { nombre: "Tomate rallado", cantidad: 2, unidad: "uds" },
      { nombre: "Pimentón dulce", cantidad: 1, unidad: "cda" },
      { nombre: "Hebras de azafrán", cantidad: 1, unidad: "pizca" },
      { nombre: "Caldo de pollo", cantidad: 1.5, unidad: "litros" },
      { nombre: "Aceite de oliva", cantidad: 80, unidad: "ml" },
      { nombre: "Romero fresco", cantidad: 2, unidad: "ramas" },
    ],
    pasos: [
      "Calentar el aceite en la paellera a fuego fuerte. Dorar el pollo y el conejo salpimentados hasta que estén bien dorados. Apartar a los lados.",
      "En el centro, sofreír la judía verde y el garrofón 5 min.",
      "Añadir el tomate rallado y sofreír hasta que se reduzca y caramelice (5 min).",
      "Añadir el pimentón, remover 30 segundos con cuidado de que no se queme.",
      "Añadir el caldo caliente con el azafrán disuelto. Probar de sal. Llevar a ebullición fuerte.",
      "Añadir el arroz distribuyéndolo uniformemente. Cocer a fuego fuerte 8 min, luego medio-bajo 10 min más SIN remover.",
      "Los últimos 2 min, subir el fuego para crear el socarrat (fondo crujiente). Reposar 5 min tapado con papel de periódico.",
    ],
    listaComentarios: [
      { autorIndex: 1, texto: "¡Menuda paella! El socarrat quedó perfecto." },
    ],
  },
  {
    autorIndex: 1,
    titulo: "Curry de Garbanzos y Espinacas",
    descripcion:
      "Curry vegano lleno de sabor: garbanzos cremosos con leche de coco, espinacas frescas y especias indias. Listo en 35 minutos y mejor al día siguiente.",
    imagenUrl: IMG("food-curry"),
    tiempo: "35 min",
    dificultad: "Fácil" as const,
    porciones: 3,
    categorias: ["vegano", "vegetariano", "altoEnProteinas"],
    alergenos: [],
    macros: { calorias: 360, proteinas: 16, carbos: 44, grasas: 14 },
    ingredientes: [
      { nombre: "Garbanzos cocidos", cantidad: 400, unidad: "g" },
      { nombre: "Espinacas frescas", cantidad: 150, unidad: "g" },
      { nombre: "Leche de coco", cantidad: 200, unidad: "ml" },
      { nombre: "Tomate triturado", cantidad: 300, unidad: "g" },
      { nombre: "Cebolla", cantidad: 1, unidad: "ud" },
      { nombre: "Ajo", cantidad: 3, unidad: "dientes" },
      { nombre: "Jengibre fresco", cantidad: 2, unidad: "cm" },
      { nombre: "Curry en polvo", cantidad: 2, unidad: "cdas" },
      { nombre: "Garam masala", cantidad: 1, unidad: "cdta" },
      { nombre: "Comino", cantidad: 1, unidad: "cdta" },
      { nombre: "Aceite de coco", cantidad: 2, unidad: "cdas" },
    ],
    pasos: [
      "Sofreír la cebolla picada en aceite de coco 8 min hasta que esté dorada.",
      "Añadir el ajo y el jengibre rallados. Sofreír 2 min.",
      "Incorporar el curry, el garam masala y el comino. Tostar 1 min removiendo.",
      "Añadir el tomate triturado y cocer 5 min hasta que se reduzca.",
      "Incorporar los garbanzos y la leche de coco. Cocer 10 min a fuego medio.",
      "Añadir las espinacas, remover hasta que se integren (2 min).",
      "Ajustar de sal. Servir con arroz basmati y naan.",
    ],
    listaComentarios: [],
  },
  {
    autorIndex: 0,
    titulo: "Tarta de Queso New York",
    descripcion:
      "La tarta de queso más cremosa y densa: Philadelphia, huevos, azúcar y base de galleta. Sin baño maría, horneado lento y reposo en nevera toda la noche.",
    imagenUrl: IMG("food-cheesecake"),
    tiempo: "70 min",
    dificultad: "Difícil" as const,
    porciones: 10,
    categorias: ["vegetariano", "postres"],
    alergenos: ["lacteos", "huevo", "cereales", "frutosSecos"],
    macros: { calorias: 380, proteinas: 8, carbos: 28, grasas: 26 },
    ingredientes: [
      { nombre: "Queso Philadelphia", cantidad: 800, unidad: "g" },
      { nombre: "Azúcar", cantidad: 200, unidad: "g" },
      { nombre: "Huevos", cantidad: 4, unidad: "uds" },
      { nombre: "Nata líquida 35%", cantidad: 100, unidad: "ml" },
      { nombre: "Extracto de vainilla", cantidad: 1, unidad: "cdta" },
      { nombre: "Galletas tipo Digestive", cantidad: 200, unidad: "g" },
      { nombre: "Mantequilla fundida", cantidad: 80, unidad: "g" },
      { nombre: "Pizca de sal", cantidad: 1, unidad: "pizca" },
    ],
    pasos: [
      "Triturar las galletas y mezclar con la mantequilla fundida. Presionar sobre el fondo de un molde desmontable de 24 cm. Refrigerar 30 min.",
      "Precalentar el horno a 160°C (calor arriba y abajo, sin ventilador).",
      "Batir el Philadelphia con el azúcar a velocidad media hasta que esté cremoso.",
      "Añadir los huevos de uno en uno, batiendo lo justo para integrar (no sobrebatir).",
      "Incorporar la nata, la vainilla y la sal. Mezclar suavemente.",
      "Verter sobre la base de galleta. Hornear 55-60 min — el centro debe temblar ligeramente.",
      "Apagar el horno, entreabrirlo y dejar la tarta dentro 1 hora. Refrigerar mínimo 8 horas antes de desmoldar.",
    ],
    listaComentarios: [
      { autorIndex: 1, texto: "Bestial. El truco del horno apagado es lo que marca la diferencia, sin grietas." },
    ],
  },
  {
    autorIndex: 1,
    titulo: "Ensalada César con Pollo",
    descripcion:
      "La clásica César con pollo a la plancha, crutones caseros de ajo, lechuga romana, parmesano laminado y el aderezo César auténtico con anchoa.",
    imagenUrl: IMG("food-cesar"),
    tiempo: "20 min",
    dificultad: "Fácil" as const,
    porciones: 2,
    categorias: ["bajoEnCalorias", "altoEnProteinas"],
    alergenos: ["lacteos", "huevo", "cereales", "pescado"],
    macros: { calorias: 340, proteinas: 34, carbos: 18, grasas: 16 },
    ingredientes: [
      { nombre: "Pechugas de pollo", cantidad: 2, unidad: "uds" },
      { nombre: "Lechuga romana", cantidad: 1, unidad: "ud" },
      { nombre: "Parmesano laminado", cantidad: 40, unidad: "g" },
      { nombre: "Pan de barra", cantidad: 2, unidad: "rebanadas" },
      { nombre: "Mayonesa", cantidad: 3, unidad: "cdas" },
      { nombre: "Anchoas en aceite", cantidad: 3, unidad: "filetes" },
      { nombre: "Zumo de limón", cantidad: 1, unidad: "cda" },
      { nombre: "Mostaza de Dijon", cantidad: 1, unidad: "cdta" },
      { nombre: "Ajo", cantidad: 1, unidad: "diente" },
    ],
    pasos: [
      "Preparar el aderezo: triturar anchoas con ajo, añadir mayonesa, limón y mostaza. Mezclar bien.",
      "Cortar el pan en dados y tostar con aceite y ajo en sartén hasta que estén crujientes.",
      "Cocinar el pollo a la plancha salpimentado 4 min por lado. Cortar en tiras.",
      "Trocear la lechuga romana y mezclar con la mitad del aderezo.",
      "Montar el plato: lechuga, pollo, crutones y parmesano. Aliñar con el resto del aderezo.",
    ],
    listaComentarios: [],
  },
];

// ── Main ─────────────────────────────────────────────────────────────────────
async function seed(): Promise<void> {
  await conectarDB();

  // Comprobar si ya hay datos
  const totalRecetas = await Receta.countDocuments();
  if (totalRecetas > 0 && !FORCE) {
    console.log(
      `ℹ️  Ya existen ${totalRecetas} recetas en la BD. Usa --force para reinsertar.`
    );
    await mongoose.disconnect();
    return;
  }

  if (FORCE) {
    console.log("🗑️  Borrando datos existentes...");
    await Promise.all([
      Receta.deleteMany({}),
      Usuario.deleteMany({ correo: { $in: USUARIOS_SEED.map((u) => u.correo) } }),
    ]);
  }

  // ── Crear usuarios seed ───────────────────────────────────────────────────
  console.log("👤 Creando usuarios seed...");
  const usuariosCreados = await Promise.all(
    USUARIOS_SEED.map(async (u) => {
      const existing = await Usuario.findOne({ correo: u.correo });
      if (existing) return existing;

      const hashContrasena = await bcrypt.hash(u.contrasena, 10);
      return Usuario.create({ ...u, contrasena: hashContrasena });
    })
  );

  console.log(`   ✅ ${usuariosCreados.length} usuarios listos`);
  usuariosCreados.forEach((u) =>
    console.log(`      · ${u.nombre} (${u.correo})`)
  );

  // ── Crear recetas seed ────────────────────────────────────────────────────
  console.log("\n🍳 Creando recetas seed...");

  const recetasParaInsertar = RECETAS_SEED.map(
    ({ autorIndex, listaComentarios, ...receta }) => {
      const autor = usuariosCreados[autorIndex];
      return {
        ...receta,
        autorId: autor._id,
        likes: [],
        listaComentarios: listaComentarios.map(({ autorIndex: ci, texto }) => ({
          autorId: usuariosCreados[ci]._id,
          autorNombre: usuariosCreados[ci].nombre,
          avatarUrl: (usuariosCreados[ci] as any).foto ?? null,
          texto,
          fecha: new Date(),
        })),
        fechaPublicacion: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
      };
    }
  );

  const recetasCreadas = await Receta.insertMany(recetasParaInsertar);
  console.log(`   ✅ ${recetasCreadas.length} recetas insertadas`);
  recetasCreadas.forEach((r) => console.log(`      · ${r.titulo}`));

  // ── Resumen ───────────────────────────────────────────────────────────────
  console.log("\n🎉 Seed completado:");
  console.log(`   Usuarios : ${usuariosCreados.length}`);
  console.log(`   Recetas  : ${recetasCreadas.length}`);
  console.log("\n🔑 Credenciales de prueba:");
  USUARIOS_SEED.forEach((u) =>
    console.log(`   ${u.correo}  /  ${u.contrasena}`)
  );

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Error en el seed:", err);
  process.exit(1);
});
