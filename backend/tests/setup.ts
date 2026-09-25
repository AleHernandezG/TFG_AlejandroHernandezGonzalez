import { randomUUID } from "crypto";
import mongoose from "mongoose";
import { reiniciarLimitesAuth } from "../src/middlewares/rateLimitAuth";
import { reiniciarAlmacenIA } from "../src/lib/almacenIA";

process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret-solo-para-tests";
process.env.FRONTEND_URL = "http://localhost:3000";

beforeAll(async () => {
  const uri = process.env.MONGO_URI_TESTS;
  if (!uri) {
    throw new Error("Falta MONGO_URI_TESTS: tests/globalSetup.ts no ha arrancado el Mongo de pruebas");
  }
  await mongoose.connect(uri, { dbName: `test-${randomUUID()}` });
});

afterEach(async () => {
  for (const c of Object.values(mongoose.connection.collections)) {
    await c.deleteMany({});
  }
  // Los limitadores son estado global en memoria: sin esto, el cupo se agota
  // entre tests y los fallos aparecen en tests que no tienen la culpa.
  reiniciarLimitesAuth();
  reiniciarAlmacenIA();
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
  }
  await mongoose.disconnect();
});
