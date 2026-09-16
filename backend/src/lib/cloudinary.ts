import crypto from "crypto";
import axios from "axios";

interface Credenciales {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export interface FirmaSubida {
  url: string;
  campos: Record<string, string>;
}

function leerCredenciales(): Credenciales | null {
  const url = process.env.CLOUDINARY_URL?.trim();
  if (!url) return null;

  const partes = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec(url);
  if (!partes) return null;

  return { apiKey: partes[1], apiSecret: partes[2], cloudName: partes[3] };
}

function credencialesOFallo(): Credenciales {
  const credenciales = leerCredenciales();
  if (!credenciales) {
    throw Object.assign(
      new Error("El almacenamiento de imágenes no está configurado"),
      { status: 503 },
    );
  }
  return credenciales;
}

export function cloudinaryConfigurado(): boolean {
  return leerCredenciales() !== null;
}

function firmar(parametros: Record<string, string>, apiSecret: string): string {
  const cadena = Object.keys(parametros)
    .sort()
    .map((clave) => `${clave}=${parametros[clave]}`)
    .join("&");

  return crypto.createHash("sha1").update(cadena + apiSecret).digest("hex");
}

function parametrosFirmados(publicId: string): Record<string, string> {
  return {
    overwrite: "true",
    public_id: publicId,
    timestamp: String(Math.floor(Date.now() / 1000)),
  };
}

export function firmarSubida(publicId: string): FirmaSubida {
  const { cloudName, apiKey, apiSecret } = credencialesOFallo();
  const parametros = parametrosFirmados(publicId);

  return {
    url: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    campos: {
      ...parametros,
      api_key: apiKey,
      signature: firmar(parametros, apiSecret),
    },
  };
}

export async function subirImagen(fichero: string, publicId: string): Promise<string> {
  const { cloudName, apiKey, apiSecret } = credencialesOFallo();
  const parametros = parametrosFirmados(publicId);

  const cuerpo = new URLSearchParams({
    ...parametros,
    api_key: apiKey,
    signature: firmar(parametros, apiSecret),
    file: fichero,
  });

  const { data } = await axios.post<{ secure_url?: string }>(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    cuerpo.toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 120000,
    },
  );

  if (!data.secure_url) {
    throw new Error("Cloudinary no ha devuelto secure_url");
  }
  return data.secure_url;
}
