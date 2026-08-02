import { db } from "@/db";
import { dynastySaves } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type SavePayload = {
  slot?: string;
  houseName?: string;
  rulerName?: string;
  state?: unknown;
};

async function ensureSaveTable() {
  if (!db) return;
  await db.execute(sql`
    create table if not exists dynasty_saves (
      id uuid primary key default gen_random_uuid(),
      slot text not null unique,
      house_name text not null,
      ruler_name text not null,
      payload jsonb not null,
      updated_at timestamptz not null default now()
    )
  `);
}

export async function GET(request: NextRequest) {
  if (!db) return Response.json({ ok: false, error: "No database configured" }, { status: 500 });
  try {
    await ensureSaveTable();
    const slot = request.nextUrl.searchParams.get("slot") ?? "autosave";
    const rows = await db
      .select({ payload: dynastySaves.payload, updatedAt: dynastySaves.updatedAt })
      .from(dynastySaves)
      .where(eq(dynastySaves.slot, slot))
      .limit(1);

    if (rows.length === 0) {
      return Response.json({ ok: true, save: null });
    }

    return Response.json({ ok: true, save: rows[0] });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Unable to load save" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!db) return Response.json({ ok: false, error: "No database configured" }, { status: 500 });
  try {
    await ensureSaveTable();
    const body = (await request.json()) as SavePayload;
    const slot = body.slot ?? "autosave";
    const houseName = body.houseName ?? "Sheatsley";
    const rulerName = body.rulerName ?? "Landon Sheatsley";
    const state = body.state ?? {};

    await db
      .insert(dynastySaves)
      .values({ slot, houseName, rulerName, payload: state })
      .onConflictDoUpdate({
        target: dynastySaves.slot,
        set: {
          houseName,
          rulerName,
          payload: state,
          updatedAt: sql`now()`,
        },
      });

    return Response.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Unable to save game" },
      { status: 500 },
    );
  }
}
