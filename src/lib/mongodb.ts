import { MongoClient, Collection } from "mongodb";

export type BookingDoc = {
  date: string;
  name: string;
  message: string;
  groupId: string;
  createdAt: Date;
};

const CLIENT_OPTIONS = { serverSelectionTimeoutMS: 5000 };

let cachedPromise: Promise<MongoClient> | undefined;

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };
    if (!globalWithMongo._mongoClientPromise) {
      globalWithMongo._mongoClientPromise = new MongoClient(uri, CLIENT_OPTIONS).connect();
    }
    return globalWithMongo._mongoClientPromise;
  }

  if (!cachedPromise) {
    cachedPromise = new MongoClient(uri, CLIENT_OPTIONS).connect();
  }
  return cachedPromise;
}

let indexReady: Promise<unknown> | undefined;

export async function getMongo(): Promise<{
  client: MongoClient;
  collection: Collection<BookingDoc>;
}> {
  const client = await getClientPromise();
  const collection = client
    .db(process.env.MONGODB_DB || "london_booking")
    .collection<BookingDoc>("bookings");
  if (!indexReady) {
    indexReady = collection.createIndex({ date: 1 }, { unique: true });
  }
  await indexReady;
  return { client, collection };
}
