import { db } from "@/db";
import { sql } from "drizzle-orm";
import { GameShell } from "./game-shell";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // DB health check — non-critical; don't crash the page if it fails
  if (db) {
    try { await db.execute(sql`select 1`); } catch { /* DB unreachable — game works offline */ }
  }
  return <GameShell />;
}
