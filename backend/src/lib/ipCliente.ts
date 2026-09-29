import crypto from "crypto";
import net from "net";
import type { Request } from "express";

export const CABECERA_IP_REENVIADA = "x-client-ip";
export const CABECERA_TOKEN_IP = "x-client-ip-token";

function leerCabecera(req: Request, nombre: string): string | undefined {
  const valor = req.headers[nombre];
  return Array.isArray(valor) ? valor[0] : valor;
}

function ipValida(valor: string | undefined): string | null {
  const ip = valor?.trim();
  return ip && net.isIP(ip) ? ip : null;
}

function tokenDelFrontendValido(recibido: string | undefined): boolean {
  const esperado = process.env.CLIENT_IP_TOKEN;
  if (!esperado || !recibido) return false;

  const resumen = (valor: string) => crypto.createHash("sha256").update(valor).digest();
  return crypto.timingSafeEqual(resumen(recibido), resumen(esperado));
}

export function ipDelCliente(req: Request): string {
  if (tokenDelFrontendValido(leerCabecera(req, CABECERA_TOKEN_IP))) {
    const reenviada = ipValida(leerCabecera(req, CABECERA_IP_REENVIADA));
    if (reenviada) return reenviada;
  }

  return (
    ipValida(leerCabecera(req, "cf-connecting-ip")) ??
    req.ip ??
    req.socket.remoteAddress ??
    "sin-ip"
  );
}

export function avisarSiFaltaTokenDeIp(): void {
  if (process.env.NODE_ENV !== "production" || process.env.CLIENT_IP_TOKEN) return;

  console.warn(
    "[rate-limit] CLIENT_IP_TOKEN no está definida: el login y el login con Google llegan desde el servidor de Vercel " +
      "y sus limitadores van a contar por la IP de Vercel, compartida por todos los usuarios. " +
      "Define el mismo valor en Render y en Vercel.",
  );
}
