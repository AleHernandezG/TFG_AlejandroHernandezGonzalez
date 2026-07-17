import type { Redis } from "@upstash/redis";
import type { Options } from "express-rate-limit";
import { UpstashStore } from "../src/lib/upstashRateLimitStore";

class RedisFalso {
  private valores = new Map<string, number>();
  private expiraciones = new Map<string, number>();
  pexpireLlamadas = 0;

  async incr(k: string): Promise<number> {
    const v = (this.valores.get(k) ?? 0) + 1;
    this.valores.set(k, v);
    return v;
  }

  async decr(k: string): Promise<number> {
    const v = (this.valores.get(k) ?? 0) - 1;
    this.valores.set(k, v);
    return v;
  }

  async pexpire(k: string, ms: number): Promise<0 | 1> {
    this.pexpireLlamadas++;
    if (!this.valores.has(k)) return 0;
    this.expiraciones.set(k, Date.now() + ms);
    return 1;
  }

  async pttl(k: string): Promise<number> {
    const e = this.expiraciones.get(k);
    if (e === undefined) return this.valores.has(k) ? -1 : -2;
    return e - Date.now();
  }

  async del(...keys: string[]): Promise<number> {
    let n = 0;
    for (const k of keys) {
      if (this.valores.delete(k)) n++;
      this.expiraciones.delete(k);
    }
    return n;
  }

  async scan(_cursor: string, opts: { match?: string; count?: number }): Promise<[string, string[]]> {
    const prefijo = (opts.match ?? "").replace("*", "");
    const claves = [...this.valores.keys()].filter((k) => k.startsWith(prefijo));
    return ["0", claves];
  }
}

function nuevoStore() {
  const falso = new RedisFalso();
  const store = new UpstashStore(falso as unknown as Redis, "rl:auth:login:");
  store.init({ windowMs: 15 * 60_000 } as Options);
  return { store, falso };
}

describe("UpstashStore", () => {
  it("cuenta desde 1 y programa la expiración solo en el primer hit", async () => {
    const { store, falso } = nuevoStore();

    const r1 = await store.increment("1.2.3.4");
    expect(r1.totalHits).toBe(1);
    expect(r1.resetTime).toBeInstanceOf(Date);
    expect(r1.resetTime!.getTime()).toBeGreaterThan(Date.now());
    expect(falso.pexpireLlamadas).toBe(1);

    const r2 = await store.increment("1.2.3.4");
    expect(r2.totalHits).toBe(2);
    expect(falso.pexpireLlamadas).toBe(1);
  });

  it("aísla los contadores por clave", async () => {
    const { store } = nuevoStore();
    await store.increment("1.1.1.1");
    const otra = await store.increment("2.2.2.2");
    expect(otra.totalHits).toBe(1);
  });

  it("decrement revierte un hit (lo que hace skipSuccessfulRequests)", async () => {
    const { store } = nuevoStore();
    await store.increment("1.2.3.4");
    await store.increment("1.2.3.4");
    await store.decrement("1.2.3.4");
    const r = await store.increment("1.2.3.4");
    expect(r.totalHits).toBe(2);
  });

  it("resetKey borra el contador de una clave", async () => {
    const { store } = nuevoStore();
    await store.increment("1.2.3.4");
    await store.increment("1.2.3.4");
    await store.resetKey("1.2.3.4");
    const r = await store.increment("1.2.3.4");
    expect(r.totalHits).toBe(1);
  });

  it("resetAll limpia todas las claves del prefijo", async () => {
    const { store } = nuevoStore();
    await store.increment("1.1.1.1");
    await store.increment("2.2.2.2");
    await store.resetAll();
    const r = await store.increment("1.1.1.1");
    expect(r.totalHits).toBe(1);
  });
});
