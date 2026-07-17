/**
 * Seed completo — 5 usuarios y 20 recetas de prueba en MongoDB.
 *
 * Uso:
 *   npx ts-node src/scripts/seedCompleto.ts
 *   npx ts-node src/scripts/seedCompleto.ts --force
 *
 * Cubre todas las categorías, dificultades y alérgenos.
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { conectarDB } from "../lib/db";
import { Usuario } from "../models/usuarioMongo";
import { Receta } from "../models/recetaMongo";

const FORCE = process.argv.includes("--force");

const IMG = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

// ── Usuarios ─────────────────────────────────────────────────────────────────
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
    preferencias: ["mediterranea", "vegetariano"],
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
  {
    nombre: "Lucía Fernández",
    correo: "lucia@cookr.dev",
    contrasena: "Seed1234.",
    foto: "https://picsum.photos/seed/avatar-lucia/200/200",
    rol: "usuario" as const,
    proveedor: "local" as const,
    cuentaVerificada: true,
    perfilCompleto: true,
    alergias: ["cereales", "huevo"] as string[],
    preferencias: ["vegano", "bajoEnCalorias"],
  },
  {
    nombre: "Andrés López",
    correo: "andres@cookr.dev",
    contrasena: "Seed1234.",
    foto: "https://picsum.photos/seed/avatar-andres/200/200",
    rol: "usuario" as const,
    proveedor: "local" as const,
    cuentaVerificada: true,
    perfilCompleto: true,
    alergias: [] as string[],
    preferencias: ["altoEnProteinas"],
  },
  {
    nombre: "Sara Molina",
    correo: "sara@cookr.dev",
    contrasena: "Seed1234.",
    foto: "https://picsum.photos/seed/avatar-sara/200/200",
    rol: "usuario" as const,
    proveedor: "local" as const,
    cuentaVerificada: true,
    perfilCompleto: true,
    alergias: ["frutosSecos"] as string[],
    preferencias: ["vegetariano"],
  },
];

// ── Recetas ───────────────────────────────────────────────────────────────────
const RECETAS_SEED = [
  // ── Pasta ────────────────────────────────────────────────────────────────
  {
    autorIndex: 0,
    titulo: "Pasta Carbonara",
    descripcion:
      "La auténtica carbonara italiana: sin nata, solo huevo, pecorino, guanciale crujiente y pimienta negra. El truco está en retirar del fuego antes de añadir el huevo.",
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
    ],
    pasos: [
      "Cocer la pasta en agua con sal hasta al dente. Guardar 1 vaso del agua de cocción.",
      "Dorar el guanciale en sartén sin aceite hasta que esté crujiente.",
      "Mezclar las yemas con el pecorino y pimienta abundante.",
      "Retirar la sartén del fuego, añadir la pasta y la mezcla de yemas fuera del fuego.",
      "Agregar agua de cocción poco a poco hasta obtener una crema sedosa.",
      "Servir inmediatamente con más pecorino y pimienta.",
    ],
    listaComentarios: [
      { autorIndex: 1, texto: "¡La mejor carbonara! El truco del fuego apagado es clave." },
    ],
  },
  {
    autorIndex: 3,
    titulo: "Fettuccine Alfredo con Gambas",
    descripcion:
      "Fettuccine en salsa Alfredo clásica de mantequilla y parmesano, con gambas salteadas al ajo. Cremoso, lujoso y listo en 25 minutos.",
    imagenUrl: IMG("food-alfredo"),
    tiempo: "25 min",
    dificultad: "Fácil" as const,
    porciones: 2,
    categorias: ["pasta", "italiana"],
    alergenos: ["cereales", "lacteos", "crustaceos"],
    macros: { calorias: 680, proteinas: 32, carbos: 70, grasas: 28 },
    ingredientes: [
      { nombre: "Fettuccine", cantidad: 200, unidad: "g" },
      { nombre: "Gambas peladas", cantidad: 200, unidad: "g" },
      { nombre: "Mantequilla", cantidad: 60, unidad: "g" },
      { nombre: "Parmesano rallado", cantidad: 80, unidad: "g" },
      { nombre: "Ajo", cantidad: 3, unidad: "dientes" },
      { nombre: "Nata para cocinar", cantidad: 100, unidad: "ml" },
      { nombre: "Perejil fresco", cantidad: 1, unidad: "manojo" },
    ],
    pasos: [
      "Cocer la pasta en agua salada. Reservar agua de cocción.",
      "Saltear las gambas con ajo en mantequilla 2 min por lado. Retirar.",
      "En la misma sartén, derretir el resto de mantequilla con la nata a fuego bajo.",
      "Añadir el parmesano y remover hasta obtener una salsa cremosa.",
      "Incorporar la pasta y las gambas. Ajustar con agua de cocción.",
      "Servir con perejil picado y más parmesano.",
    ],
    listaComentarios: [],
  },
  {
    autorIndex: 0,
    titulo: "Lasaña de Carne Clásica",
    descripcion:
      "Lasaña italiana de capas generosas: ragù de ternera y cerdo, bechamel casera y mozzarella gratinada. Perfecta para preparar el día anterior.",
    imagenUrl: IMG("food-lasagna"),
    tiempo: "90 min",
    dificultad: "Difícil" as const,
    porciones: 6,
    categorias: ["italiana", "pasta"],
    alergenos: ["cereales", "lacteos", "huevo"],
    macros: { calorias: 560, proteinas: 34, carbos: 48, grasas: 24 },
    ingredientes: [
      { nombre: "Láminas de lasaña", cantidad: 12, unidad: "uds" },
      { nombre: "Carne picada mixta", cantidad: 500, unidad: "g" },
      { nombre: "Tomate triturado", cantidad: 400, unidad: "g" },
      { nombre: "Mozzarella rallada", cantidad: 200, unidad: "g" },
      { nombre: "Leche", cantidad: 500, unidad: "ml" },
      { nombre: "Mantequilla", cantidad: 40, unidad: "g" },
      { nombre: "Harina", cantidad: 40, unidad: "g" },
      { nombre: "Cebolla", cantidad: 1, unidad: "ud" },
      { nombre: "Ajo", cantidad: 2, unidad: "dientes" },
      { nombre: "Vino tinto", cantidad: 100, unidad: "ml" },
    ],
    pasos: [
      "Sofreír cebolla y ajo. Añadir la carne picada y dorar.",
      "Añadir el vino tinto y dejar evaporar. Incorporar el tomate y cocer 30 min.",
      "Preparar la bechamel: fundir mantequilla, añadir harina, incorporar leche poco a poco.",
      "Montar la lasaña alternando capas: láminas, ragù, bechamel, mozzarella.",
      "Hornear a 180°C durante 35-40 min hasta gratinar.",
      "Reposar 10 min antes de servir.",
    ],
    listaComentarios: [
      { autorIndex: 4, texto: "Espectacular, la hago cada domingo. El reposo es fundamental." },
    ],
  },
  // ── Vegano / Vegetariano ─────────────────────────────────────────────────
  {
    autorIndex: 2,
    titulo: "Buddha Bowl Vegano",
    descripcion:
      "Bowl colorido con quinoa, garbanzos asados, aguacate, edamame y aliño de tahini. Vegano, sin gluten y repleto de proteína vegetal.",
    imagenUrl: IMG("food-buddha-bowl"),
    tiempo: "25 min",
    dificultad: "Fácil" as const,
    porciones: 1,
    categorias: ["vegano", "vegetariano", "bajoEnCalorias"],
    alergenos: ["sesamo", "soja"],
    macros: { calorias: 440, proteinas: 22, carbos: 52, grasas: 18 },
    ingredientes: [
      { nombre: "Quinoa", cantidad: 80, unidad: "g" },
      { nombre: "Garbanzos cocidos", cantidad: 120, unidad: "g" },
      { nombre: "Aguacate", cantidad: 1, unidad: "ud" },
      { nombre: "Edamame", cantidad: 60, unidad: "g" },
      { nombre: "Zanahoria rallada", cantidad: 1, unidad: "ud" },
      { nombre: "Tahini", cantidad: 2, unidad: "cdas" },
      { nombre: "Limón", cantidad: 1, unidad: "ud" },
    ],
    pasos: [
      "Cocer la quinoa en agua salada 15 min. Enfriar.",
      "Asar los garbanzos con aceite, comino y pimentón a 200°C 20 min.",
      "Preparar aliño: tahini + zumo de limón + agua + sal.",
      "Montar el bowl por secciones. Aliñar al servir.",
    ],
    listaComentarios: [
      { autorIndex: 1, texto: "Lo hago todas las semanas. El aliño de tahini es adictivo." },
    ],
  },
  {
    autorIndex: 2,
    titulo: "Curry de Garbanzos y Espinacas",
    descripcion:
      "Curry vegano con garbanzos, leche de coco, espinacas y especias indias. Listo en 35 minutos y mejor al día siguiente.",
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
      { nombre: "Curry en polvo", cantidad: 2, unidad: "cdas" },
      { nombre: "Garam masala", cantidad: 1, unidad: "cdta" },
      { nombre: "Cebolla", cantidad: 1, unidad: "ud" },
      { nombre: "Ajo", cantidad: 3, unidad: "dientes" },
    ],
    pasos: [
      "Sofreír cebolla y ajo 8 min.",
      "Añadir las especias y tostar 1 min.",
      "Incorporar el tomate y cocer 5 min.",
      "Añadir los garbanzos y la leche de coco. Cocer 10 min.",
      "Incorporar las espinacas y remover hasta que se integren.",
    ],
    listaComentarios: [],
  },
  {
    autorIndex: 2,
    titulo: "Gazpacho Andaluz",
    descripcion:
      "El gazpacho más refrescante. Tomates maduros, pepino, pimiento y aceite de oliva virgen extra. Sin cocción, vegano y sin gluten.",
    imagenUrl: IMG("food-gazpacho"),
    tiempo: "15 min",
    dificultad: "Fácil" as const,
    porciones: 4,
    categorias: ["vegano", "vegetariano", "bajoEnCalorias", "española"],
    alergenos: [],
    macros: { calorias: 120, proteinas: 2, carbos: 12, grasas: 7 },
    ingredientes: [
      { nombre: "Tomates maduros", cantidad: 1, unidad: "kg" },
      { nombre: "Pepino", cantidad: 1, unidad: "ud" },
      { nombre: "Pimiento verde", cantidad: 0.5, unidad: "ud" },
      { nombre: "Aceite de oliva virgen extra", cantidad: 60, unidad: "ml" },
      { nombre: "Vinagre de jerez", cantidad: 1, unidad: "cda" },
    ],
    pasos: [
      "Trocear todos los ingredientes.",
      "Triturar en batidora potente 2 minutos.",
      "Añadir el aceite en hilo fino con la batidora en marcha.",
      "Colar, salpimentar y refrigerar mínimo 2 horas.",
    ],
    listaComentarios: [],
  },
  // ── Desayuno ─────────────────────────────────────────────────────────────
  {
    autorIndex: 4,
    titulo: "Tostadas de Aguacate con Huevo Poché",
    descripcion:
      "Las tostadas de aguacate definitivas: pan de masa madre tostado, crema de aguacate con limón y chile, huevo poché perfecto y semillas de sésamo.",
    imagenUrl: IMG("food-avocado-toast"),
    tiempo: "15 min",
    dificultad: "Media" as const,
    porciones: 2,
    categorias: ["vegetariano", "desayuno", "bajoEnCalorias"],
    alergenos: ["cereales", "huevo", "sesamo"],
    macros: { calorias: 310, proteinas: 14, carbos: 28, grasas: 18 },
    ingredientes: [
      { nombre: "Pan de masa madre", cantidad: 2, unidad: "rebanadas" },
      { nombre: "Aguacate maduro", cantidad: 1, unidad: "ud" },
      { nombre: "Huevos", cantidad: 2, unidad: "uds" },
      { nombre: "Limón", cantidad: 0.5, unidad: "ud" },
      { nombre: "Chile en copos", cantidad: 1, unidad: "pizca" },
      { nombre: "Semillas de sésamo", cantidad: 1, unidad: "cdta" },
      { nombre: "Vinagre blanco", cantidad: 1, unidad: "cda" },
    ],
    pasos: [
      "Tostar el pan hasta que esté crujiente.",
      "Aplastar el aguacate con zumo de limón, sal y chile. Extender sobre el pan.",
      "Hervir agua con vinagre. Crear un remolino y cascar el huevo en el centro. Cocer 3 min.",
      "Colocar el huevo poché sobre el aguacate. Espolvorear sésamo y sal en escamas.",
    ],
    listaComentarios: [
      { autorIndex: 2, texto: "El huevo poché parece difícil pero con el truco del remolino sale perfecto." },
    ],
  },
  {
    autorIndex: 4,
    titulo: "Pancakes Esponjosos de Arándanos",
    descripcion:
      "Pancakes americanos ultra esponjosos gracias al buttermilk casero, con arándanos frescos y sirope de arce. El desayuno del fin de semana perfecto.",
    imagenUrl: IMG("food-pancakes"),
    tiempo: "20 min",
    dificultad: "Fácil" as const,
    porciones: 8,
    categorias: ["vegetariano", "desayuno", "postres"],
    alergenos: ["cereales", "lacteos", "huevo"],
    macros: { calorias: 280, proteinas: 8, carbos: 42, grasas: 10 },
    ingredientes: [
      { nombre: "Harina", cantidad: 200, unidad: "g" },
      { nombre: "Leche", cantidad: 200, unidad: "ml" },
      { nombre: "Huevos", cantidad: 2, unidad: "uds" },
      { nombre: "Mantequilla fundida", cantidad: 30, unidad: "g" },
      { nombre: "Azúcar", cantidad: 2, unidad: "cdas" },
      { nombre: "Levadura química", cantidad: 2, unidad: "cdtas" },
      { nombre: "Arándanos frescos", cantidad: 150, unidad: "g" },
      { nombre: "Sirope de arce", cantidad: 4, unidad: "cdas" },
      { nombre: "Vinagre de manzana", cantidad: 1, unidad: "cda" },
    ],
    pasos: [
      "Mezclar la leche con el vinagre y dejar reposar 5 min (buttermilk casero).",
      "Batir los huevos con el azúcar y la mantequilla fundida.",
      "Incorporar la harina y la levadura. Añadir el buttermilk y mezclar sin sobrebatir.",
      "Incorporar los arándanos suavemente.",
      "Cocinar en sartén antiadherente a fuego medio-bajo, 2 min por lado.",
      "Servir con sirope de arce y más arándanos frescos.",
    ],
    listaComentarios: [],
  },
  // ── Proteínas / Carne ────────────────────────────────────────────────────
  {
    autorIndex: 1,
    titulo: "Salmón Teriyaki con Arroz",
    descripcion:
      "Filete de salmón lacado con salsa teriyaki casera sobre arroz jazmín. Sabor de restaurante japonés en 30 minutos.",
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
      { nombre: "Sésamo tostado", cantidad: 1, unidad: "cda" },
    ],
    pasos: [
      "Cocer el arroz. Reservar.",
      "Mezclar soja, mirin y azúcar para la salsa teriyaki.",
      "Marinar el salmón 10 min.",
      "Sellar 3 min por lado. Añadir el resto de la salsa y lacear.",
      "Servir sobre arroz con sésamo y cebolleta.",
    ],
    listaComentarios: [],
  },
  {
    autorIndex: 1,
    titulo: "Pollo al Ajillo",
    descripcion:
      "Receta clásica española: muslos de pollo dorados con ajo, vino blanco y romero. Solo 6 ingredientes, 35 minutos.",
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
    ],
    pasos: [
      "Salpimentar el pollo y dorar en aceite caliente 5 min por el lado de la piel.",
      "Dorar los ajos enteros en el mismo aceite.",
      "Añadir el vino y dejar evaporar 2 min.",
      "Incorporar el pollo, el romero y 100 ml de agua. Tapar y cocer 20 min.",
      "Destapar y reducir la salsa.",
    ],
    listaComentarios: [],
  },
  {
    autorIndex: 3,
    titulo: "Pollo Tikka Masala",
    descripcion:
      "El curry más popular del mundo: pollo marinado en yogur y especias, cocinado en salsa de tomate y nata especiada. Acompaña con naan o arroz basmati.",
    imagenUrl: IMG("food-tikka-masala"),
    tiempo: "50 min",
    dificultad: "Media" as const,
    porciones: 4,
    categorias: ["asiática", "altoEnProteinas"],
    alergenos: ["lacteos"],
    macros: { calorias: 430, proteinas: 40, carbos: 22, grasas: 20 },
    ingredientes: [
      { nombre: "Pechugas de pollo", cantidad: 600, unidad: "g" },
      { nombre: "Yogur natural", cantidad: 150, unidad: "g" },
      { nombre: "Tomate triturado", cantidad: 400, unidad: "g" },
      { nombre: "Nata para cocinar", cantidad: 150, unidad: "ml" },
      { nombre: "Cebolla", cantidad: 2, unidad: "uds" },
      { nombre: "Garam masala", cantidad: 2, unidad: "cdas" },
      { nombre: "Cúrcuma", cantidad: 1, unidad: "cdta" },
      { nombre: "Pimentón ahumado", cantidad: 1, unidad: "cdta" },
      { nombre: "Jengibre fresco", cantidad: 2, unidad: "cm" },
    ],
    pasos: [
      "Marinar el pollo en yogur con la mitad de las especias mínimo 30 min.",
      "Dorar el pollo marinado en sartén caliente. Retirar.",
      "Sofreír la cebolla hasta dorar. Añadir el resto de especias y el tomate.",
      "Cocer la salsa 15 min. Triturar si se desea más suave.",
      "Añadir el pollo y la nata. Cocer 10 min más.",
    ],
    listaComentarios: [
      { autorIndex: 0, texto: "El marinado hace toda la diferencia. Lo preparo desde el día anterior." },
    ],
  },
  // ── Arroces / Otros ──────────────────────────────────────────────────────
  {
    autorIndex: 0,
    titulo: "Risotto de Setas",
    descripcion:
      "Risotto cremoso con setas silvestres, vino blanco y parmesano. El secreto: caldo caliente, poco a poco, sin parar de remover.",
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
      { nombre: "Caldo de verduras", cantidad: 1, unidad: "litro" },
      { nombre: "Vino blanco seco", cantidad: 100, unidad: "ml" },
      { nombre: "Parmesano rallado", cantidad: 60, unidad: "g" },
      { nombre: "Mantequilla", cantidad: 30, unidad: "g" },
      { nombre: "Cebolla", cantidad: 1, unidad: "ud" },
    ],
    pasos: [
      "Sofreír la cebolla y las setas.",
      "Añadir el arroz y tostar 2 min.",
      "Añadir el vino y dejar absorber.",
      "Incorporar el caldo cazo a cazo, 18-20 min.",
      "Fuera del fuego, añadir mantequilla y parmesano. Mantecato enérgico.",
    ],
    listaComentarios: [
      { autorIndex: 1, texto: "Quedó cremosísimo siguiendo los pasos al pie de la letra." },
    ],
  },
  {
    autorIndex: 0,
    titulo: "Paella Valenciana",
    descripcion:
      "La auténtica paella de Valencia: pollo, conejo, judía verde, garrofón, azafrán y socarrat perfecto.",
    imagenUrl: IMG("food-paella"),
    tiempo: "90 min",
    dificultad: "Difícil" as const,
    porciones: 6,
    categorias: ["mediterránea", "española"],
    alergenos: [],
    esEvento: true,
    macros: { calorias: 540, proteinas: 35, carbos: 62, grasas: 16 },
    ingredientes: [
      { nombre: "Arroz bomba", cantidad: 500, unidad: "g" },
      { nombre: "Pollo troceado", cantidad: 500, unidad: "g" },
      { nombre: "Conejo troceado", cantidad: 300, unidad: "g" },
      { nombre: "Judía verde plana", cantidad: 200, unidad: "g" },
      { nombre: "Tomate rallado", cantidad: 2, unidad: "uds" },
      { nombre: "Hebras de azafrán", cantidad: 1, unidad: "pizca" },
      { nombre: "Caldo de pollo", cantidad: 1.5, unidad: "litros" },
    ],
    pasos: [
      "Dorar el pollo y el conejo en aceite. Apartar a los lados.",
      "Sofreír la judía, el tomate y el pimentón.",
      "Añadir el caldo con azafrán. Llevar a ebullición.",
      "Añadir el arroz uniformemente. Cocer sin remover 18 min.",
      "Subir el fuego los últimos 2 min para el socarrat.",
    ],
    listaComentarios: [
      { autorIndex: 1, texto: "El socarrat quedó perfecto." },
    ],
  },
  // ── Postres ──────────────────────────────────────────────────────────────
  {
    autorIndex: 4,
    titulo: "Tarta de Queso New York",
    descripcion:
      "La cheesecake más cremosa: Philadelphia, huevos, azúcar y base de galleta. Horneado lento y reposo nocturno en nevera.",
    imagenUrl: IMG("food-cheesecake"),
    tiempo: "70 min",
    dificultad: "Difícil" as const,
    porciones: 10,
    categorias: ["vegetariano", "postres"],
    alergenos: ["lacteos", "huevo", "cereales"],
    macros: { calorias: 380, proteinas: 8, carbos: 28, grasas: 26 },
    ingredientes: [
      { nombre: "Queso Philadelphia", cantidad: 800, unidad: "g" },
      { nombre: "Azúcar", cantidad: 200, unidad: "g" },
      { nombre: "Huevos", cantidad: 4, unidad: "uds" },
      { nombre: "Nata líquida 35%", cantidad: 100, unidad: "ml" },
      { nombre: "Galletas tipo Digestive", cantidad: 200, unidad: "g" },
      { nombre: "Mantequilla fundida", cantidad: 80, unidad: "g" },
    ],
    pasos: [
      "Triturar galletas con mantequilla y presionar en molde. Refrigerar 30 min.",
      "Batir el Philadelphia con el azúcar.",
      "Añadir los huevos de uno en uno.",
      "Incorporar la nata. Verter sobre la base.",
      "Hornear a 160°C 55-60 min. Dejar en horno apagado 1 hora.",
      "Refrigerar mínimo 8 horas antes de desmoldar.",
    ],
    listaComentarios: [
      { autorIndex: 1, texto: "Sin grietas gracias al truco del horno apagado. Bestial." },
    ],
  },
  {
    autorIndex: 4,
    titulo: "Mousse de Chocolate Negro",
    descripcion:
      "Mousse de chocolate negro intenso y ultra aireada: solo 4 ingredientes. El secreto es incorporar las claras a punto de nieve con movimientos envolventes.",
    imagenUrl: IMG("food-chocolate-mousse"),
    tiempo: "30 min",
    dificultad: "Media" as const,
    porciones: 4,
    categorias: ["vegetariano", "postres"],
    alergenos: ["lacteos", "huevo"],
    macros: { calorias: 320, proteinas: 6, carbos: 24, grasas: 22 },
    ingredientes: [
      { nombre: "Chocolate negro 70%", cantidad: 200, unidad: "g" },
      { nombre: "Huevos", cantidad: 4, unidad: "uds" },
      { nombre: "Azúcar", cantidad: 40, unidad: "g" },
      { nombre: "Nata para montar", cantidad: 100, unidad: "ml" },
    ],
    pasos: [
      "Fundir el chocolate al baño maría. Dejar enfriar.",
      "Separar claras y yemas. Montar las claras a punto de nieve con el azúcar.",
      "Montar la nata.",
      "Mezclar las yemas con el chocolate fundido.",
      "Incorporar la nata y después las claras con movimientos envolventes.",
      "Distribuir en copas. Refrigerar mínimo 2 horas.",
    ],
    listaComentarios: [],
  },
  {
    autorIndex: 4,
    titulo: "Tiramisú Clásico",
    descripcion:
      "El postre italiano más amado: bizcochos empapados en espresso y amaretto, crema de mascarpone y yemas, cacao en polvo. Sin horno.",
    imagenUrl: IMG("food-tiramisu"),
    tiempo: "25 min",
    dificultad: "Media" as const,
    porciones: 8,
    categorias: ["vegetariano", "postres", "italiana"],
    alergenos: ["lacteos", "huevo", "cereales"],
    macros: { calorias: 340, proteinas: 7, carbos: 30, grasas: 20 },
    ingredientes: [
      { nombre: "Mascarpone", cantidad: 500, unidad: "g" },
      { nombre: "Yemas de huevo", cantidad: 4, unidad: "uds" },
      { nombre: "Azúcar", cantidad: 100, unidad: "g" },
      { nombre: "Bizcochos de soletilla", cantidad: 24, unidad: "uds" },
      { nombre: "Espresso fuerte", cantidad: 300, unidad: "ml" },
      { nombre: "Amaretto", cantidad: 2, unidad: "cdas" },
      { nombre: "Cacao en polvo", cantidad: 3, unidad: "cdas" },
    ],
    pasos: [
      "Batir las yemas con el azúcar hasta blanquear.",
      "Incorporar el mascarpone y mezclar hasta obtener una crema homogénea.",
      "Mezclar el espresso con el amaretto. Remojar brevemente los bizcochos.",
      "Montar en fuente: capa de bizcochos, crema, bizcochos, crema.",
      "Refrigerar mínimo 4 horas. Espolvorear cacao antes de servir.",
    ],
    listaComentarios: [
      { autorIndex: 0, texto: "El amaretto marca la diferencia. Auténtico sabor italiano." },
    ],
  },
  // ── Saludable / Keto ─────────────────────────────────────────────────────
  {
    autorIndex: 1,
    titulo: "Ensalada César con Pollo",
    descripcion:
      "La clásica César con pollo a la plancha, crutones de ajo, lechuga romana, parmesano y aderezo auténtico con anchoa.",
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
      { nombre: "Anchoas en aceite", cantidad: 3, unidad: "filetes" },
      { nombre: "Mayonesa", cantidad: 3, unidad: "cdas" },
      { nombre: "Zumo de limón", cantidad: 1, unidad: "cda" },
    ],
    pasos: [
      "Preparar el aderezo: triturar anchoas con ajo, añadir mayonesa y limón.",
      "Tostar el pan en dados con aceite y ajo.",
      "Cocinar el pollo a la plancha 4 min por lado. Cortar en tiras.",
      "Mezclar la lechuga con el aderezo. Añadir pollo, crutones y parmesano.",
    ],
    listaComentarios: [],
  },
  {
    autorIndex: 3,
    titulo: "Bowl de Atún y Arroz Estilo Sushi",
    descripcion:
      "Sushi bowl desmontado: arroz de sushi aliñado con vinagre, atún fresco marinado en soja y sésamo, aguacate, pepino y mayonesa sriracha.",
    imagenUrl: IMG("food-sushi-bowl"),
    tiempo: "20 min",
    dificultad: "Fácil" as const,
    porciones: 2,
    categorias: ["altoEnProteinas", "asiática"],
    alergenos: ["pescado", "soja", "sesamo", "huevo"],
    macros: { calorias: 480, proteinas: 36, carbos: 52, grasas: 14 },
    ingredientes: [
      { nombre: "Arroz de sushi", cantidad: 200, unidad: "g" },
      { nombre: "Atún fresco", cantidad: 200, unidad: "g" },
      { nombre: "Aguacate", cantidad: 1, unidad: "ud" },
      { nombre: "Pepino", cantidad: 0.5, unidad: "ud" },
      { nombre: "Salsa de soja", cantidad: 2, unidad: "cdas" },
      { nombre: "Sésamo tostado", cantidad: 1, unidad: "cda" },
      { nombre: "Mayonesa", cantidad: 2, unidad: "cdas" },
      { nombre: "Sriracha", cantidad: 1, unidad: "cdta" },
      { nombre: "Vinagre de arroz", cantidad: 2, unidad: "cdas" },
    ],
    pasos: [
      "Cocer el arroz. Aliñar con vinagre de arroz, azúcar y sal.",
      "Cortar el atún en dados. Marinar 5 min en soja y sésamo.",
      "Mezclar la mayonesa con la sriracha.",
      "Montar el bowl: arroz, atún, aguacate y pepino en secciones.",
      "Aliñar con la mayonesa picante y más sésamo.",
    ],
    listaComentarios: [
      { autorIndex: 4, texto: "Mucho más fácil que hacer sushi y igual de rico. Mi receta favorita." },
    ],
  },
  {
    autorIndex: 1,
    titulo: "Wrap de Pavo y Hummus",
    descripcion:
      "Wrap ligero y saciante: tortilla integral, pechuga de pavo a la plancha, hummus casero, lechuga, tomate y pepino. Alto en proteína y bajo en grasas.",
    imagenUrl: IMG("food-wrap-turkey"),
    tiempo: "15 min",
    dificultad: "Fácil" as const,
    porciones: 2,
    categorias: ["altoEnProteinas", "bajoEnCalorias"],
    alergenos: ["cereales", "sesamo"],
    macros: { calorias: 380, proteinas: 32, carbos: 36, grasas: 12 },
    ingredientes: [
      { nombre: "Tortillas integrales", cantidad: 2, unidad: "uds" },
      { nombre: "Pechuga de pavo", cantidad: 200, unidad: "g" },
      { nombre: "Hummus", cantidad: 4, unidad: "cdas" },
      { nombre: "Lechuga", cantidad: 2, unidad: "hojas" },
      { nombre: "Tomate", cantidad: 1, unidad: "ud" },
      { nombre: "Pepino", cantidad: 0.5, unidad: "ud" },
    ],
    pasos: [
      "Cocinar el pavo a la plancha con especias. Reposar y filetear.",
      "Calentar la tortilla en sartén seca.",
      "Extender el hummus sobre la tortilla.",
      "Añadir lechuga, tomate, pepino y el pavo.",
      "Enrollar firmemente y cortar en diagonal.",
    ],
    listaComentarios: [],
  },
];

// ── Main ─────────────────────────────────────────────────────────────────────
async function seed(): Promise<void> {
  await conectarDB();

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
  usuariosCreados.forEach((u) => console.log(`      · ${u.nombre} (${u.correo})`));

  console.log("\n🍳 Creando recetas seed...");

  const recetasParaInsertar = RECETAS_SEED.map(({ autorIndex, listaComentarios, ...receta }) => {
    const autor = usuariosCreados[autorIndex];
    return {
      ...receta,
      autorId: autor._id,
      likes: [],
      listaComentarios: listaComentarios.map(({ autorIndex: ci, texto }) => ({
        autorId: usuariosCreados[ci]._id,
        autorNombre: usuariosCreados[ci].nombre,
        avatarUrl: (usuariosCreados[ci] as { foto?: string }).foto ?? null,
        texto,
        fecha: new Date(),
      })),
      fechaPublicacion: new Date(
        Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000
      ),
    };
  });

  const recetasCreadas = await Receta.insertMany(recetasParaInsertar);
  console.log(`   ✅ ${recetasCreadas.length} recetas insertadas`);
  recetasCreadas.forEach((r) => console.log(`      · ${r.titulo}`));

  // ── Relaciones de seguimiento ─────────────────────────────────────────────
  // María (0) sigue a Carlos (1) y Lucía (2)
  // Carlos (1) sigue a María (0) y Andrés (3)
  console.log("\n👥 Creando relaciones de seguimiento...");
  const [maria, carlos, lucia, andres] = usuariosCreados;
  await Promise.all([
    Usuario.findByIdAndUpdate(maria._id, {
      $addToSet: { seguidos: { $each: [carlos._id, lucia._id] } },
    }),
    Usuario.findByIdAndUpdate(carlos._id, {
      $addToSet: { seguidores: { $each: [maria._id] }, seguidos: { $each: [maria._id, andres._id] } },
    }),
    Usuario.findByIdAndUpdate(lucia._id, {
      $addToSet: { seguidores: { $each: [maria._id] } },
    }),
    Usuario.findByIdAndUpdate(andres._id, {
      $addToSet: { seguidores: { $each: [carlos._id] } },
    }),
  ]);
  console.log("   ✅ María sigue a Carlos y Lucía · Carlos sigue a María y Andrés");

  console.log("\n🎉 Seed completado:");
  console.log(`   Usuarios : ${usuariosCreados.length}`);
  console.log(`   Recetas  : ${recetasCreadas.length}`);
  console.log("\n🔑 Credenciales de prueba:");
  USUARIOS_SEED.forEach((u) => console.log(`   ${u.correo}  /  ${u.contrasena}`));

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Error en el seed:", err);
  process.exit(1);
});
