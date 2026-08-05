import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, afterEach, beforeAll } from 'vitest';

/**
 * Spins up an in-memory MongoDB instance and connects Mongoose to it directly,
 * bypassing store.ts's connect()/env-based config. Call this once per test file
 * that needs real Mongoose behavior (populate, cascades, etc.).
 */
export function useMongoMemoryServer() {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  }, 60_000);

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });
}
