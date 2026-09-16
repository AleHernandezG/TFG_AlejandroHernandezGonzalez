import { OAuth2Client } from "google-auth-library";

export type IdentidadGoogle = {
  googleId: string;
  correo: string;
  correoVerificado: boolean;
  nombre?: string;
  foto?: string;
};

let cliente: OAuth2Client | null = null;
let clienteParaId: string | null = null;

function obtenerClientId(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw Object.assign(
      new Error("El inicio de sesión con Google no está disponible"),
      { status: 503 },
    );
  }
  return clientId;
}

export async function verificarIdTokenGoogle(idToken: string): Promise<IdentidadGoogle> {
  const clientId = obtenerClientId();

  if (!cliente || clienteParaId !== clientId) {
    cliente = new OAuth2Client(clientId);
    clienteParaId = clientId;
  }

  const ticket = await cliente.verifyIdToken({ idToken, audience: clientId });
  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email) {
    throw new Error("El token de Google no contiene identidad");
  }

  return {
    googleId: payload.sub,
    correo: payload.email.trim().toLowerCase(),
    correoVerificado: payload.email_verified === true,
    nombre: payload.name?.trim() || undefined,
    foto: typeof payload.picture === "string" && /^https?:\/\//.test(payload.picture)
      ? payload.picture
      : undefined,
  };
}
