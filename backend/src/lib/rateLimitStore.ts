import { MemoryStore } from "express-rate-limit";
import type { Store } from "express-rate-limit";
import { redis } from "./redis";
import { UpstashStore } from "./upstashRateLimitStore";

const stores: Store[] = [];

export function crearStore(prefijo: string): Store {
  const store: Store = redis
    ? new UpstashStore(redis, `rl:${prefijo}:`)
    : new MemoryStore();
  stores.push(store);
  return store;
}

export function reiniciarStores(): void {
  for (const store of stores) store.resetAll?.();
}
