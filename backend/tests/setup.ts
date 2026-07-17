import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { reiniciarLimitesAuth } from "../src/middlewares/rateLimitAuth";

process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret-solo-para-tests";
process.env.FRONTEND_URL = "http://localhost:3000";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  for (const c of Object.values(mongoose.connection.collections)) {
    await c.deleteMany({});
  }
  // Los limitadores son estado global en memoria: sin esto, el cupo se agota
  // entre tests y los fallos aparecen en tests que no tienen la culpa.
  reiniciarLimitesAuth();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
