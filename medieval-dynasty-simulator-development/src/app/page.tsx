import { db } from "@/db";
import { sql } from "drizzle-orm";
import { GameClient } from "./game-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (db) await db.execute(sql`select 1`);
  return <GameClient />;
}
