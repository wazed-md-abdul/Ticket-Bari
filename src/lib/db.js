import { MongoClient } from "mongodb";

const uri = process.env.MONGO_DB_URI;
let client;
let clientPromise;

if (!uri) {
  throw new Error("Please add your MONGO_DB_URI to env config");
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDb() {
  const clientConn = await clientPromise;
  return clientConn.db("hire_hub_db");
}

export default clientPromise;
