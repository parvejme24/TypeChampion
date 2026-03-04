import { Pool, QueryResult } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Missing "DATABASE_URL" in environment');
}

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

const pool =
  process.env.NODE_ENV === "development"
    ? global._pgPool ?? new Pool({ connectionString })
    : new Pool({ connectionString });

if (process.env.NODE_ENV === "development") {
  global._pgPool = pool;
}

export async function query<T = unknown>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

