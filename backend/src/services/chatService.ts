import { GoogleGenerativeAI } from "@google/generative-ai";
import { usuarioRepository } from "../repositories/usuarioRepository";
import { Usuario } from "../models/usuarioMongo";

interface MensajeChat {
  rol: "user" | "model";
  texto: string;
}

async function obtenerContextoUsuario(usuarioId: string): Promise<string> {
  const usuario = await usuarioRepository.buscarPerfilPorId(usuarioId);
  if (!usuario) return "";

  const despensaUsuario = await Usuario.findById(usuarioId).select("despensa").lean().exec();
  const despensa = (despensaUsuario?.despensa as Array<{ nombre: string; cantidad: number; unidad: string }> | undefined) ?? [];

  const lineas: string[] = [];

  if ((usuario.preferencias ?? []).length > 0) {
    lineas.push(`- Dietas: ${usuario.preferencias.join(", ")}`);
  }
  if ((usuario.alergias ?? []).length > 0) {
    lineas.push(`- Alergias: ${usuario.alergias.join(", ")}`);
  }
  if (despensa.length > 0) {
    const lista = despensa.map((d) => `${d.nombre} (${d.cantidad} ${d.unidad})`).join(", ");
    lineas.push(`- En su despensa: ${lista}`);
  }

  return lineas.join("\n");
}

const SYSTEM_PROMPT = (contexto: string) => `Eres el asistente culinario de Cookr, una app de recetas y gastronomía social.
Responde siempre en español. Sé conciso, útil y con personalidad.
Si te preguntan qué cocinar, sugiere recetas que usen los ingredientes disponibles y respeten las restricciones del usuario.
No uses asteriscos para formato. Usa puntos o guiones simples.

Contexto del usuario:
${contexto || "- Sin información de perfil disponible"}`;

export async function responderChat(
  mensajes: MensajeChat[],
  usuarioId: string,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return "El asistente no está disponible en este momento. Configura GEMINI_API_KEY para activarlo.";
  }

  try {
    const contexto = await obtenerContextoUsuario(usuarioId);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: SYSTEM_PROMPT(contexto),
    });

    const historial = mensajes.slice(0, -1).map((m) => ({
      role: m.rol,
      parts: [{ text: m.texto }],
    }));

    const ultimo = mensajes[mensajes.length - 1];
    const chat = model.startChat({ history: historial });
    const result = await chat.sendMessage(ultimo.texto);

    return result.response.text();
  } catch (err) {
    const error = err as Error;
    console.error("[Gemini chat] Error:", error.message);
    throw Object.assign(new Error("El asistente no está disponible en este momento"), { status: 503 });
  }
}

export async function generarRecetaDesdeTexto(descripcion: string): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error("Gemini no está configurado"), { status: 503 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `Dado este texto: "${descripcion}", genera una receta en JSON con exactamente este formato:
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
Solo responde con el JSON, sin markdown, sin explicaciones.`;

    const result = await model.generateContent(prompt);
    const texto = result.response.text().trim();

    const limpio = texto.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
    return JSON.parse(limpio);
  } catch (err) {
    const error = err as Error;
    console.error("[Gemini generar-receta] Error:", error.message);
    throw Object.assign(new Error("No se pudo generar la receta. Verifica la configuración de Gemini."), { status: 503 });
  }
}

export async function escanearTicket(imagenBase64: string): Promise<Array<{ nombre: string; cantidad: number; unidad: string }>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error("Gemini no está configurado"), { status: 503 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

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
    return JSON.parse(limpio);
  } catch (err) {
    const error = err as Error;
    console.error("[Gemini escanear-ticket] Error:", error.message);
    throw Object.assign(new Error("No se pudo procesar el ticket"), { status: 503 });
  }
}
