import { createHash } from "crypto";
import { GoogleGenAI } from "@google/genai";
import { usuarioRepository } from "../repositories/usuarioRepository";
import { recetaRepository, type RecetaCandidataDespensa } from "../repositories/recetaRepository";
import { almacenIA, almacenIAEnRedis } from "../lib/almacenIA";

interface MensajeChat {
  rol: "user" | "model";
  texto: string;
}

// ── Singleton del cliente Gemini ─────────────────────────────────────────────
let _genAI: GoogleGenAI | null = null;

function obtenerCliente(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw Object.assign(new Error("GEMINI_API_KEY no configurada"), { status: 503 });
  if (!_genAI) {
    const baseUrl = process.env.GEMINI_BASE_URL;
    const proxyToken = process.env.GEMINI_PROXY_TOKEN;
    const httpOptions = baseUrl
      ? { baseUrl, ...(proxyToken ? { headers: { "x-proxy-token": proxyToken } } : {}) }
      : undefined;
    _genAI = httpOptions ? new GoogleGenAI({ apiKey, httpOptions }) : new GoogleGenAI({ apiKey });
  }
  return _genAI;
}

// ── Modelo y tope global diario de llamadas ──────────────────────────────────
const MODELO_GEMINI = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const MAX_LLAMADAS_DIA = Number(process.env.GEMINI_MAX_LLAMADAS_DIA ?? 1000);

// gemini-2.5-flash activa "thinking" por defecto, lo que gasta tokens y cuota
// sin aportar nada en un chat culinario. Lo desactivamos.
const GENERATION_CONFIG = { thinkingConfig: { thinkingBudget: 0 } };

const CLAVE_LLAMADAS = "ia:gemini:llamadas";
const TTL_LLAMADAS_SEGUNDOS = 48 * 60 * 60;

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function registrar(mensaje: string): void {
  if (process.env.NODE_ENV !== "test") console.log(mensaje);
}

function advertir(mensaje: string): void {
  if (process.env.NODE_ENV !== "test") console.warn(mensaje);
}

async function registrarLlamadaGemini(): Promise<void> {
  const total = await almacenIA.incrementar(`${CLAVE_LLAMADAS}:${hoyISO()}`, TTL_LLAMADAS_SEGUNDOS);

  if (total > MAX_LLAMADAS_DIA) {
    advertir(`[Gemini guard] Tope diario alcanzado (${MAX_LLAMADAS_DIA}). Bloqueando llamadas hasta mañana.`);
    throw Object.assign(
      new Error("El asistente ha alcanzado el límite diario de uso. Inténtalo de nuevo mañana."),
      { status: 503 },
    );
  }

  registrar(`[Gemini guard] llamada ${total}/${MAX_LLAMADAS_DIA} de hoy (${almacenIAEnRedis() ? "redis" : "memoria"})`);
}

// ── Caché de contexto de usuario ─────────────────────────────────────────────
const CLAVE_CONTEXTO = "ia:contexto";
const TTL_CONTEXTO_SEGUNDOS = 5 * 60;

function huella(texto: string): string {
  return createHash("sha256").update(texto).digest("hex").slice(0, 32);
}

export async function invalidarContextoUsuario(usuarioId: string): Promise<void> {
  await almacenIA.borrar(`${CLAVE_CONTEXTO}:${usuarioId}`);
}

async function obtenerContextoUsuario(usuarioId: string): Promise<string> {
  const clave = `${CLAVE_CONTEXTO}:${usuarioId}`;
  const guardado = await almacenIA.leer<string>(clave);

  if (guardado !== null) {
    registrar(`[Gemini cache] HIT contexto usuario ${usuarioId.slice(-6)}`);
    return guardado;
  }

  registrar(`[Gemini cache] MISS contexto usuario ${usuarioId.slice(-6)} — consultando MongoDB`);
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

  await almacenIA.guardar(clave, contexto, TTL_CONTEXTO_SEGUNDOS);

  return contexto;
}

// ── Caché de generación desde texto ──────────────────────────────────────────
const CLAVE_RECETA = "ia:receta";
const TTL_RECETA_SEGUNDOS = 2 * 60;

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

// ── Caché semántica de dudas de cocina ───────────────────────────────────────
const VERSION_PROMPT = "v1";
const CLAVE_CHAT = `ia:chat:${VERSION_PROMPT}`;
const TTL_CHAT_SEGUNDOS = 7 * 24 * 60 * 60;
const MAX_CHARS_PREGUNTA_CACHEABLE = 200;

const CLAVE_ACIERTOS = "ia:cache:aciertos";
const CLAVE_FALLOS = "ia:cache:fallos";
const TTL_METRICAS_SEGUNDOS = 30 * 24 * 60 * 60;

function normalizarPregunta(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[¿?¡!]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function preguntaSuelta(mensajes: MensajeChat[], imagenBase64?: string): string | null {
  if (imagenBase64) return null;
  if (mensajes.length !== 1) return null;

  const unico = mensajes[0];
  if (unico.rol !== "user") return null;
  if (unico.texto.length > MAX_CHARS_PREGUNTA_CACHEABLE) return null;

  return unico.texto;
}

function claveDePregunta(contexto: string, pregunta: string): string {
  return `${CLAVE_CHAT}:${huella(`${contexto}||${normalizarPregunta(pregunta)}`)}`;
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

  let contexto: string;
  try {
    contexto = await obtenerContextoUsuario(usuarioId);
  } catch (err) {
    console.error("[Gemini chat] Error:", (err as Error).message);
    throw Object.assign(new Error("El asistente no está disponible en este momento"), { status: 503 });
  }

  const pregunta = preguntaSuelta(mensajes, imagenBase64);
  const clave = pregunta === null ? null : claveDePregunta(contexto, pregunta);

  if (clave) {
    const cacheada = await almacenIA.leer<string>(clave);
    if (cacheada !== null) {
      await almacenIA.incrementar(`${CLAVE_ACIERTOS}:${hoyISO()}`, TTL_METRICAS_SEGUNDOS);
      registrar(`[Gemini cache] HIT pregunta ${clave.slice(-8)} — sin llamar a Gemini`);
      return cacheada;
    }
    await almacenIA.incrementar(`${CLAVE_FALLOS}:${hoyISO()}`, TTL_METRICAS_SEGUNDOS);
  }

  await registrarLlamadaGemini();

  try {
    const historial = mensajes.slice(0, -1).map((m) => ({
      role: m.rol,
      parts: [{ text: m.texto }],
    }));

    const ultimo = mensajes[mensajes.length - 1];
    const chat = obtenerCliente().chats.create({
      model: MODELO_GEMINI,
      history: historial,
      config: {
        systemInstruction: SYSTEM_PROMPT(contexto),
        ...GENERATION_CONFIG,
      },
    });

    let result;
    if (imagenBase64) {
      const partes = imagenBase64.split(",");
      const mimeType = partes[0].match(/:(.*?);/)?.[1] ?? "image/jpeg";
      const data = partes[1] ?? partes[0];
      result = await chat.sendMessage({
        message: [
          { inlineData: { mimeType, data } },
          { text: ultimo.texto || "¿Qué ves en esta imagen? Ayúdame en el contexto culinario." },
        ],
      });
    } else {
      result = await chat.sendMessage({ message: ultimo.texto });
    }

    const respuesta = result.text ?? "";
    if (clave && respuesta.length > 0) {
      await almacenIA.guardar(clave, respuesta, TTL_CHAT_SEGUNDOS);
    }

    return respuesta;
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

  const clave = `${CLAVE_RECETA}:${huella(normalizarDescripcion(descripcion))}`;
  const guardada = await almacenIA.leer<unknown>(clave);

  if (guardada !== null) return guardada;

  await registrarLlamadaGemini();

  try {
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

    const result = await obtenerCliente().models.generateContent({
      model: MODELO_GEMINI,
      contents: prompt,
      config: GENERATION_CONFIG,
    });
    const texto = (result.text ?? "").trim();
    const limpio = texto.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
    const receta = JSON.parse(limpio);

    if (!validarEsquemaReceta(receta)) {
      throw new Error("La respuesta de Gemini no tiene el formato esperado");
    }

    await almacenIA.guardar(clave, receta, TTL_RECETA_SEGUNDOS);

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

  await registrarLlamadaGemini();

  try {
    const partes = imagenBase64.split(",");
    const mimeType = partes[0].match(/:(.*?);/)?.[1] ?? "image/jpeg";
    const data = partes[1] ?? partes[0];

    const prompt = `Esta es una foto de un ticket de compra. Extrae los ingredientes alimentarios en formato JSON:
[{"nombre": string, "cantidad": number, "unidad": string}]
Solo ingredientes comestibles. Si no puedes determinar la cantidad, usa 1.
Si no hay ingredientes reconocibles, devuelve [].
Solo responde con el JSON, sin markdown.`;

    const result = await obtenerCliente().models.generateContent({
      model: MODELO_GEMINI,
      contents: [
        { inlineData: { mimeType, data } },
        { text: prompt },
      ],
      config: GENERATION_CONFIG,
    });

    const texto = (result.text ?? "").trim();
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
): RecetaCandidataDespensa | null {
  const mejor = candidatas.find((receta) =>
    ingredientesDespensa.every((item) => ingredienteCoincide(item, receta.ingredientes)),
  );

  return mejor ?? null;
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

  await registrarLlamadaGemini();

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
    const result = await obtenerCliente().models.generateContent({
      model: MODELO_GEMINI,
      contents: prompt,
      config: GENERATION_CONFIG,
    });
    return result.text ?? "";
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

  const candidatas = await recetaRepository.buscarCandidatasParaDespensa(alergias, preferencias);
  const mejor = elegirMejorReceta(candidatas, ingredientes);

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
