import { redis } from "./redis";

interface EntradaMemoria {
  valor: unknown;
  expira: number;
}

interface Envoltorio {
  v: unknown;
}

const MAX_ENTRADAS_MEMORIA = 500;

class AlmacenMemoria {
  private datos = new Map<string, EntradaMemoria>();

  private purgar(): void {
    const ahora = Date.now();
    for (const [clave, entrada] of this.datos) {
      if (entrada.expira <= ahora) this.datos.delete(clave);
    }
    const sobrantes = this.datos.size - MAX_ENTRADAS_MEMORIA + 1;
    if (sobrantes > 0) {
      for (const clave of [...this.datos.keys()].slice(0, sobrantes)) this.datos.delete(clave);
    }
  }

  incrementar(clave: string, ttlSegundos: number): number {
    const ahora = Date.now();
    const entrada = this.datos.get(clave);
    if (!entrada || entrada.expira <= ahora) {
      this.datos.set(clave, { valor: 1, expira: ahora + ttlSegundos * 1000 });
      return 1;
    }
    const total = (entrada.valor as number) + 1;
    entrada.valor = total;
    return total;
  }

  leer<T>(clave: string): T | null {
    const entrada = this.datos.get(clave);
    if (!entrada) return null;
    if (entrada.expira <= Date.now()) {
      this.datos.delete(clave);
      return null;
    }
    return entrada.valor as T;
  }

  guardar(clave: string, valor: unknown, ttlSegundos: number): void {
    if (this.datos.size >= MAX_ENTRADAS_MEMORIA) this.purgar();
    this.datos.set(clave, { valor, expira: Date.now() + ttlSegundos * 1000 });
  }

  borrar(clave: string): void {
    this.datos.delete(clave);
  }

  vaciar(): void {
    this.datos.clear();
  }
}

const memoria = new AlmacenMemoria();
let caidaAvisada = false;

function avisarCaida(operacion: string, err: unknown): void {
  if (caidaAvisada) return;
  caidaAvisada = true;
  if (process.env.NODE_ENV === "test") return;
  console.warn(
    `⚠️  Upstash no respondió a ${operacion}. El tope diario de Gemini y las cachés de IA siguen en memoria hasta que vuelva:`,
    (err as Error).message,
  );
}

export function almacenIAEnRedis(): boolean {
  return redis !== null;
}

async function incrementar(clave: string, ttlSegundos: number): Promise<number> {
  if (redis) {
    try {
      const total = await redis.incr(clave);
      if (total === 1) await redis.expire(clave, ttlSegundos);
      return total;
    } catch (err) {
      avisarCaida("INCR", err);
    }
  }
  return memoria.incrementar(clave, ttlSegundos);
}

async function leer<T>(clave: string): Promise<T | null> {
  if (redis) {
    try {
      const envoltorio = await redis.get<Envoltorio>(clave);
      return envoltorio ? (envoltorio.v as T) : null;
    } catch (err) {
      avisarCaida("GET", err);
    }
  }
  return memoria.leer<T>(clave);
}

async function guardar(clave: string, valor: unknown, ttlSegundos: number): Promise<void> {
  if (redis) {
    try {
      await redis.set(clave, { v: valor }, { ex: ttlSegundos });
      return;
    } catch (err) {
      avisarCaida("SET", err);
    }
  }
  memoria.guardar(clave, valor, ttlSegundos);
}

async function borrar(clave: string): Promise<void> {
  if (redis) {
    try {
      await redis.del(clave);
      return;
    } catch (err) {
      avisarCaida("DEL", err);
    }
  }
  memoria.borrar(clave);
}

export const almacenIA = { incrementar, leer, guardar, borrar };

export function reiniciarAlmacenIA(): void {
  memoria.vaciar();
  caidaAvisada = false;
}
