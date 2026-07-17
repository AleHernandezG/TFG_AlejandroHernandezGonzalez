import { Redis } from "@upstash/redis";

function crearCliente(): Redis | null {
  const url = process.env.UPSTASH_REDIS_URL;
  const token = process.env.UPSTASH_REDIS_TOKEN;
  if (!url || !token) return null;

  try {
    return new Redis({ url, token });
  } catch (err) {
    console.warn("⚠️  Upstash mal configurado, el rate limiting seguirá en memoria:", (err as Error).message);
    return null;
  }
}

export const redis = crearCliente();
