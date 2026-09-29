import { headers } from "next/headers";

export function cabecerasIpCliente(): Record<string, string> {
  const token = process.env.CLIENT_IP_TOKEN;
  if (!token) return {};

  let ip: string | undefined;
  try {
    const entrantes = headers();
    ip = entrantes.get("x-real-ip") ?? entrantes.get("x-forwarded-for")?.split(",")[0];
  } catch {
    return {};
  }

  ip = ip?.trim();
  if (!ip) return {};

  return { "x-client-ip": ip, "x-client-ip-token": token };
}
