import type { Pool } from "pg";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

let _db: NodePgDatabase | null = null;
let _initPromise: Promise<NodePgDatabase | null> | null = null;

async function doInit(): Promise<NodePgDatabase | null> {
  if (_db) return _db;
  if (!databaseUrl) return null;

  try {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");

    const pool = globalForDb.__arenaNextJsPostgresqlPool ?? new Pool({ connectionString: databaseUrl });
    if (process.env.NODE_ENV !== "production") {
      globalForDb.__arenaNextJsPostgresqlPool = pool;
    }

    _db = drizzle(pool);
    return _db;
  } catch {
    return null;
  }
}

// Singleton initializer — concurrent callers share the same promise
export function ensureDb(): Promise<NodePgDatabase | null> {
  if (!_initPromise) _initPromise = doInit();
  return _initPromise;
}
