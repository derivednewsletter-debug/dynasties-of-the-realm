import { ensureDb } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await ensureDb();
    if (!db) {
      return Response.json({ ok: true, db: "not_configured", message: "Game works offline" });
    }
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, db: "connected" });
  } catch (error) {
    return Response.json({
      ok: true,
      db: "unreachable",
      message: "Game works offline",
    });
  }
}
