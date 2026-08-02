import type { Pool } from "pg";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

let _db: NodePgDatabase | null = null;
let _initialized = false;

async function ensureDb(): Promise<NodePgDatabase | null> {
  if (_initialized) return _db;
  _initialized = true;

  if (!databaseUrl) return null;

  try {
    // Dynamic imports — only loaded when DATABASE_URL is actually set
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");

    if (globalForDb.__arenaNextJsPostgresqlPool) {
      const pool = globalForDb.__arenaNextJsPostgresqlPool;
      _db = drizzle(pool);
    } else {
      const pool = new Pool({ connectionString: databaseUrl });
      if (process.env.NODE_ENV !== "production") {
        globalForDb.__arenaNextJsPostgresqlPool = pool;
      }
      _db = drizzle(pool);
    }

    return _db;
  } catch {
    // pg or drizzle-orm failed to load — game works offline
    return null;
  }
}

// Async initializer — call this in server components/API routes
export { ensureDb };
