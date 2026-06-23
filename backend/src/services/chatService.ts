import { GoogleGenerativeAI } from "@google/generative-ai";
import { usuarioRepository } from "../repositories/usuarioRepository";
import { recetaRepository, type RecetaCandidataDespensa } from "../repositories/recetaRepository";

interface MensajeChat {
  rol: "user" | "model";
  texto: string;
}

// ── Singleton del cliente Gemini ─────────────────────────────────────────────
let _genAI: GoogleGenerativeAI | null = null;

function obtenerCliente(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw Object.assign(new Error("GEMINI_API_KEY no configurada"), { status: 503 });
  if (!_genAI) _genAI = new GoogleGenerativeAI(apiKey);
  return _genAI;
}

// ── Modelo y tope global diario de llamadas ──────────────────────────────────
const MODELO_GEMINI = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const MAX_LLAMADAS_DIA = Number(process.env.GEMINI_MAX_LLAMADAS_DIA ?? 1000);

// gemini-2.5-flash activa "thinking" por defecto, lo que gasta tokens y cuota
// sin aportar nada en un chat culinario. Lo desactivamos.
const GENERATION_CONFIG = { thinkingConfig: { thinkingBudget: 0 } } as Record<string, unknown>;

let llamadasHoy = 0;
let diaActual = new Date().toISOString().slice(0, 10);

function registrarLlamadaGemini(): void {
  const hoy = new Date().toISOString().slice(0, 10);
  if (hoy !== diaActual) {
    diaActual = hoy;
    llamadasHoy = 0;
  }
  if (llamadasHoy >= MAX_LLAMADAS_DIA) {
    console.warn(`[Gemini guard] Tope diario alcanzado (${MAX_LLAMADAS_DIA}). Bloqueando llamadas hasta mañana.`);
    throw Object.assign(
      new Error("El asistente ha alcanzado el límite diario de uso. Inténtalo de nuevo mañana."),
      { status: 503 },
    );
  }
  llamadasHoy++;
}

// ── Caché de contexto de usuario ─────────────────────────────────────────────
interface EntradaContexto {
  contexto: string;
  expira: number;
}

const cacheContexto = new Map<string, EntradaContexto>();
const TTL_CONTEXTO_MS = 5 * 60 * 1000;
const MAX_ENTRADAS_CONTEXTO = 100;

function limpiarContextosExpirados() {
  const ahora = Date.now();
  for (const [key, entrada] of cacheContexto.entries()) {
    if (entrada.expira < ahora) cacheContexto.delete(key);
  }
}

export function invalidarContextoUsuario(usuarioId: string): void {
  cacheContexto.delete(usuarioId);
}

async function obtenerContextoUsuario(usuarioId: string): Promise<string> {
  const ahora = Date.now();
  const entrada = cacheContexto.get(usuarioId);

  if (entrada && entrada.expira > ahora) {
    console.log(`[Gemini cache] HIT contexto usuario ${usuarioId.slice(-6)}`);
    return entrada.contexto;
  }

  console.log(`[Gemini cache] MISS contexto usuario ${usuarioId.slice(-6)} — consultando MongoDB`);
  const usuario = await usuarioRepository.buscarPerfilPorId(usuarioId);
  const despensa = usuario ? await usuarioRepository.obtenerDespensa(usuarioId) ?? [] : [];

  const lineas: string[] = [];
  if ((usuario?.preferencias ?? []).length > 0) {
    lineas.push(`- Dietas: ${usuario!.preferencias.join(", ")}`);
  }
  if ((usuario?.alergias ?? []).length > 0) {
    lineas.push(`- Alergias: ${usuario!.alergias.join(", ")}`);
  }
  if (despensa.length > 0) {
    const lista = despensa.map((d) => `${d.nombre} (${d.cantidad} ${d.unidad})`).join(", ");
    lineas.push(`- En su despensa: ${lista}`);
  }

  const contexto = lineas.join("\n");

  if (cacheContexto.size >= MAX_ENTRADAS_CONTEXTO) limpiarContextosExpirados();
  cacheContexto.set(usuarioId, { contexto, expira: ahora + TTL_CONTEXTO_MS });

  return contexto;
}

// ── Caché de generación desde texto ──────────────────────────────────────────
interface EntradaRecetaGenerada {
  resultado: unknown;
  expira: number;
}

const cacheRecetaGenerada = new Map<string, EntradaRecetaGenerada>();
const TTL_RECETA_MS = 2 * 60 * 1000;

function normalizarDescripcion(desc: string): string {
  return desc.trim().toLowerCase().replace(/\s+/g, " ");
}

function sanitizarTextoUsuario(texto: string): string {
  return texto.replace(/\\/g, " ").replace(/"/g, "'").replace(/`/g, "'");
}

interface RecetaGeneradaEsperada {
  titulo: string;
  descripcion: string;
  tiempo: number;
  unidadTiempo: string;
  porciones: number;
  dificultad: string;
  dietas: string[];
  ingredientes: unknown[];
  pasos: unknown[];
}

function validarEsquemaReceta(obj: unknown): obj is RecetaGeneradaEsperada {
  if (typeof obj !== "object" || obj === null) return false;
  const r = obj as Record<string, unknown>;
  return (
    typeof r.titulo === "string" && r.titulo.length > 0 &&
    typeof r.descripcion === "string" &&
    typeof r.tiempo === "number" &&
    typeof r.unidadTiempo === "string" &&
    typeof r.porciones === "number" &&
    typeof r.dificultad === "string" &&
    Array.isArray(r.dietas) &&
    Array.isArray(r.ingredientes) && r.ingredientes.length > 0 &&
    Array.isArray(r.pasos) && r.pasos.length > 0
  );
}

function validarEsquemaIngredientes(arr: unknown): boolean {
  if (!Array.isArray(arr)) return false;
  return arr.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as Record<string, unknown>).nombre === "string" &&
      typeof (item as Record<string, unknown>).cantidad === "number"
  );
}

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = (contexto: string) => `Eres el asistente culinario de Cookr, una app de recetas y gastronomía social.
Responde siempre en español. Sé conciso, útil y con personalidad.
Si te preguntan qué cocinar, sugiere recetas que usen los ingredientes disponibles y respeten las restricciones del usuario.
Usa markdown para estructurar las respuestas: **negrita** para títulos de sección, listas con - para ingredientes o pasos, párrafos separados para ideas distintas. Sin bloques de código.

Contexto del usuario:
${contexto || "- Sin información de perfil disponible"}`;

// ── Funciones exportadas ──────────────────────────────────────────────────────
export async function responderChat(
  mensajes: MensajeChat[],
  usuarioId: string,
  imagenBase64?: string,
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return "El asistente no está disponible en este momento. Configura GEMINI_API_KEY para activarlo.";
  }

  registrarLlamadaGemini();

  try {
    const contexto = await obtenerContextoUsuario(usuarioId);

    const model = obtenerCliente().getGenerativeModel({
      model: MODELO_GEMINI,
      systemInstruction: SYSTEM_PROMPT(contexto),
      generationConfig: GENERATION_CONFIG,
    });

    const historial = mensajes.slice(0, -1).map((m) => ({
      role: m.rol,
      parts: [{ text: m.texto }],
    }));

    const ultimo = mensajes[mensajes.length - 1];
    const chat = model.startChat({ history: historial });

    let result;
    if (imagenBase64) {
      const partes = imagenBase64.split(",");
      const mimeType = partes[0].match(/:(.*?);/)?.[1] ?? "image/jpeg";
      const data = partes[1] ?? partes[0];
      result = await chat.sendMessage([
        { inlineData: { mimeType, data } },
        { text: ultimo.texto || "¿Qué ves en esta imagen? Ayúdame en el contexto culinario." },
      ]);
    } else {
      result = await chat.sendMessage(ultimo.texto);
    }

    return result.response.text();
  } catch (err) {
    const error = err as Error;
    console.error("[Gemini chat] Error:", error.message);
    if (/429|quota|rate.?limit|too many requests/i.test(error.message)) {
      throw Object.assign(
        new Error("El asistente está recibiendo muchas peticiones ahora mismo. Espera unos segundos e inténtalo de nuevo."),
        { status: 429 },
      );
    }
    throw Object.assign(new Error("El asistente no está disponible en este momento"), { status: 503 });
  }
}

export async function generarRecetaDesdeTexto(descripcion: string): Promise<unknown> {
  if (!process.env.GEMINI_API_KEY) {
    throw Object.assign(new Error("Gemini no está configurado"), { status: 503 });
  }

  const clave = normalizarDescripcion(descripcion);
  const ahora = Date.now();
  const entrada = cacheRecetaGenerada.get(clave);

  if (entrada && entrada.expira > ahora) {
    return entrada.resultado;
  }

  registrarLlamadaGemini();

  try {
    const model = obtenerCliente().getGenerativeModel({
      model: MODELO_GEMINI,
      generationConfig: GENERATION_CONFIG,
    });

    const descripcionSegura = sanitizarTextoUsuario(descripcion);
    const prompt = `Genera una receta en JSON con exactamente este formato:
{
  "titulo": string,
  "descripcion": string,
  "tiempo": number,
  "unidadTiempo": "min" o "h",
  "porciones": number,
  "dificultad": "facil" o "media" o "dificil",
  "dietas": string[],
  "ingredientes": [{"nombre": string, "cantidad": string, "unidad": string}],
  "pasos": [{"texto": string}]
}

Descripción del usuario: ${descripcionSegura}

Solo responde con el JSON, sin markdown, sin explicaciones.`;

    const result = await model.generateContent(prompt);
    const texto = result.response.text().trim();
    const limpio = texto.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
    const receta = JSON.parse(limpio);

    if (!validarEsquemaReceta(receta)) {
      throw new Error("La respuesta de Gemini no tiene el formato esperado");
    }

    cacheRecetaGenerada.set(clave, { resultado: receta, expira: ahora + TTL_RECETA_MS });

    return receta;
  } catch (err) {
    const error = err as Error;
    console.error("[Gemini generar-receta] Error:", error.message);
    throw Object.assign(new Error("No se pudo generar la receta. Verifica la configuración de Gemini."), { status: 503 });
  }
}

export async function escanearTicket(imagenBase64: string): Promise<Array<{ nombre: string; cantidad: number; unidad: string }>> {
  if (!process.env.GEMINI_API_KEY) {
    throw Object.assign(new Error("Gemini no está configurado"), { status: 503 });
  }

  registrarLlamadaGemini();

  try {
    const model = obtenerCliente().getGenerativeModel({
      model: MODELO_GEMINI,
      generationConfig: GENERATION_CONFIG,
    });

    const partes = imagenBase64.split(",");
    const mimeType = partes[0].match(/:(.*?);/)?.[1] ?? "image/jpeg";
    const data = partes[1] ?? partes[0];

    const prompt = `Esta es una foto de un ticket de compra. Extrae los ingredientes alimentarios en formato JSON:
[{"nombre": string, "cantidad": number, "unidad": string}]
Solo ingredientes comestibles. Si no puedes determinar la cantidad, usa 1.
Si no hay ingredientes reconocibles, devuelve [].
Solo responde con el JSON, sin markdown.`;

    const result = await model.generateContent([
      { inlineData: { mimeType, data } },
      prompt,
    ]);

    const texto = result.response.text().trim();
    const limpio = texto.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
    const ingredientes = JSON.parse(limpio);

    if (!validarEsquemaIngredientes(ingredientes)) {
      return [];
    }

    return ingredientes as Array<{ nombre: string; cantidad: number; unidad: string }>;
  } catch (err) {
    const error = err as Error;
    console.error("[Gemini escanear-ticket] Error:", error.message);
    throw Object.assign(new Error("No se pudo procesar el ticket"), { status: 503 });
  }
}

// ── Receta con lo que tengo (despensa) ───────────────────────────────────────
export interface RespuestaRecetaDespensa {
  respuesta: string;
  fuente: "bbdd" | "gemini" | "sin-despensa";
  receta?: { id: string; titulo: string; imagenUrl: string };
}

function normalizarIngrediente(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function ingredienteCoincide(itemDespensa: string, ingredientesReceta: string[]): boolean {
  const objetivo = normalizarIngrediente(itemDespensa);
  if (objetivo.length === 0) return false;

  return ingredientesReceta.some((ing) => {
    const candidato = normalizarIngrediente(ing);
    if (objetivo.length < 4) return candidato.split(/\s+/).includes(objetivo);
    return candidato.includes(objetivo) || objetivo.includes(candidato);
  });
}

function elegirMejorReceta(
  candidatas: RecetaCandidataDespensa[],
  ingredientesDespensa: string[],
  preferencias: string[],
): RecetaCandidataDespensa | null {
  const completas = candidatas.filter((receta) =>
    ingredientesDespensa.every((item) => ingredienteCoincide(item, receta.ingredientes)),
  );

  if (completas.length === 0) return null;

  const prefs = new Set(preferencias);
  completas.sort((a, b) => {
    const prefA = a.categorias.filter((c) => prefs.has(c)).length;
    const prefB = b.categorias.filter((c) => prefs.has(c)).length;
    if (prefB !== prefA) return prefB - prefA;
    return b.likes - a.likes;
  });

  return completas[0];
}

function construirRespuestaBBDD(receta: RecetaCandidataDespensa): string {
  return [
    "¡Tengo justo lo que necesitas! 🧺",
    "",
    `Con lo que hay en tu despensa puedes preparar **${receta.titulo}**.`,
    "",
    `- ⏱️ ${receta.tiempo} · ${receta.dificultad}`,
    `- ${receta.descripcion}`,
    "",
    `👉 [Ver la receta completa](/recetas/${receta.id})`,
  ].join("\n");
}

async function sugerirRecetaConGemini(
  ingredientes: string[],
  alergias: string[],
  preferencias: string[],
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return "Ahora mismo no tengo ninguna receta guardada que use justo lo que tienes. Configura el asistente para que pueda inventarte una a medida.";
  }

  registrarLlamadaGemini();

  const restricciones = alergias.length > 0
    ? `Alergias e intolerancias que debes respetar SÍ o SÍ (no incluyas estos ingredientes ni derivados): ${alergias.join(", ")}.`
    : "Sin alergias ni intolerancias.";
  const gustos = preferencias.length > 0
    ? `Preferencias de dieta del usuario: ${preferencias.join(", ")}.`
    : "Sin preferencias de dieta concretas.";

  const prompt = `El usuario tiene estos ingredientes en su despensa: ${ingredientes.join(", ")}.
${restricciones}
${gustos}

No hay ninguna receta guardada que use todos esos ingredientes. Propón UNA receta realista que aproveche el máximo posible de esos ingredientes (puede usar básicos de despensa como aceite, sal o agua), respetando estrictamente las alergias e intolerancias y, si encajan, las preferencias.
Responde en español con markdown: título en **negrita**, una lista de ingredientes y los pasos numerados. Sé concreto y conciso.`;

  try {
    const model = obtenerCliente().getGenerativeModel({
      model: MODELO_GEMINI,
      generationConfig: GENERATION_CONFIG,
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    const error = err as Error;
    console.error("[Gemini receta-despensa] Error:", error.message);
    if (/429|quota|rate.?limit|too many requests/i.test(error.message)) {
      throw Object.assign(
        new Error("El asistente está recibiendo muchas peticiones ahora mismo. Espera unos segundos e inténtalo de nuevo."),
        { status: 429 },
      );
    }
    throw Object.assign(new Error("El asistente no está disponible en este momento"), { status: 503 });
  }
}

export async function recetaConDespensa(usuarioId: string): Promise<RespuestaRecetaDespensa> {
  const [perfil, despensa] = await Promise.all([
    usuarioRepository.buscarPerfilPorId(usuarioId),
    usuarioRepository.obtenerDespensa(usuarioId),
  ]);

  const ingredientes = (despensa ?? []).map((d) => d.nombre).filter((n) => n && n.trim().length > 0);

  if (ingredientes.length === 0) {
    return {
      fuente: "sin-despensa",
      respuesta:
        "Tu despensa está vacía 🧺. Añade lo que tengas en la sección **Despensa** y te buscaré una receta que puedas cocinar ahora mismo. Mientras tanto, dime qué ingredientes tienes y te ayudo igual.",
    };
  }

  const alergias = perfil?.alergias ?? [];
  const preferencias = perfil?.preferencias ?? [];

  const candidatas = await recetaRepository.buscarCandidatasParaDespensa(alergias);
  const mejor = elegirMejorReceta(candidatas, ingredientes, preferencias);

  if (mejor) {
    return {
      fuente: "bbdd",
      respuesta: construirRespuestaBBDD(mejor),
      receta: { id: mejor.id, titulo: mejor.titulo, imagenUrl: mejor.imagenUrl },
    };
  }

  const respuesta = await sugerirRecetaConGemini(ingredientes, alergias, preferencias);
  return { fuente: "gemini", respuesta };
}
