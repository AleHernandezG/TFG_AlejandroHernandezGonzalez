import type { Redis } from "@upstash/redis";
import type { Store, Options, IncrementResponse } from "express-rate-limit";

export class UpstashStore implements Store {
  private windowMs = 60_000;
  private readonly client: Redis;
  private readonly prefijo: string;

  constructor(client: Redis, prefijo: string) {
    this.client = client;
    this.prefijo = prefijo;
  }

  init(options: Options): void {
    this.windowMs = options.windowMs;
  }

  private clave(key: string): string {
    return `${this.prefijo}${key}`;
  }

  async increment(key: string): Promise<IncrementResponse> {
    const k = this.clave(key);
    const totalHits = await this.client.incr(k);
    if (totalHits === 1) {
      await this.client.pexpire(k, this.windowMs);
    }
    const ttl = await this.client.pttl(k);
    const restante = ttl > 0 ? ttl : this.windowMs;
    return { totalHits, resetTime: new Date(Date.now() + restante) };
  }

  async decrement(key: string): Promise<void> {
    await this.client.decr(this.clave(key));
  }

  async resetKey(key: string): Promise<void> {
    await this.client.del(this.clave(key));
  }

  async resetAll(): Promise<void> {
    let cursor = "0";
    do {
      const [siguiente, claves] = await this.client.scan(cursor, {
        match: `${this.prefijo}*`,
        count: 100,
      });
      if (claves.length > 0) await this.client.del(...claves);
      cursor = siguiente;
    } while (cursor !== "0");
  }
}
