import { MongoClient } from "mongodb";

const uri = process.env.DB_URL;

if (!uri) {
  throw new Error('Missing "DB_URL" in environment');
}

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().then((c) => {
      console.log("[MongoDB] DB connection successfully.");
      return c;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect().then((c) => {
    console.log("[MongoDB] DB connection successfully.");
    return c;
  });
}

export default clientPromise;

export async function getDb() {
  const c = await clientPromise;
  const dbName = process.env.DB_NAME ?? "typechampion";
  if (process.env.NODE_ENV === "development" && !process.env.DB_NAME) {
    console.warn("[MongoDB] DB_NAME not set; using default: typechampion");
  }
  return c.db(dbName);
}
