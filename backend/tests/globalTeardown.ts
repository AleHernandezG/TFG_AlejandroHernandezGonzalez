import type { MongoMemoryServer } from "mongodb-memory-server";

export default async function pararMongoCompartido() {
  await (globalThis as { __MONGO_TESTS__?: MongoMemoryServer }).__MONGO_TESTS__?.stop();
}
