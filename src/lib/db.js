import { MongoClient } from "mongodb";

const uri = process.env.MONGO_DB_URI;
let clientPromise;

if (uri) {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
} else {
  // Graceful mock for build-time static route evaluation
  clientPromise = Promise.resolve({
    db: () => ({
      collection: () => ({
        findOne: async () => null,
        find: () => ({ toArray: async () => [] }),
        updateOne: async () => {},
        insertOne: async () => {},
      }),
    }),
  });
}

export async function getDb() {
  if (!process.env.MONGO_DB_URI) {
    throw new Error("Please add your MONGO_DB_URI to env config");
  }
  const clientConn = await clientPromise;
  return clientConn.db("ticketbari");
}

export default clientPromise;


