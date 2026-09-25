import { MongoMemoryServer } from "mongodb-memory-server";

export default async function arrancarMongoCompartido() {
  const mongo = await MongoMemoryServer.create();
  (globalThis as { __MONGO_TESTS__?: MongoMemoryServer }).__MONGO_TESTS__ = mongo;
  process.env.MONGO_URI_TESTS = mongo.getUri();
}
