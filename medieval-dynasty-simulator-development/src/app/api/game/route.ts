import { ensureDb } from "@/db";
import { dynastySaves } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type SavePayload = {
  slot?: string;
  houseName?: string;
  rulerName?: string;
  state?: unknown;
};

let _tableEnsured = false;
async function ensureSaveTable(db: Awaited<ReturnType<typeof ensureDb>>) {
  if (!db || _tableEnsured) return;
  _tableEnsured = true;
  await db.execute(sql`
    create table if not exists dynasty_saves (
      id uuid primary key default gen_random_uuid(),
      slot text not null,
      user_id uuid references auth.users(id) on delete cascade,
      house_name text not null,
      ruler_name text not null,
      payload jsonb not null,
      updated_at timestamptz not null default now(),
      unique(slot, user_id)
    )
  `);
}

export async function GET(request: NextRequest) {
  const db = await ensureDb();
  if (!db) return Response.json({ ok: false, error: "No database configured" }, { status: 500 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  try {
    await ensureSaveTable(db);
    const slot = request.nextUrl.searchParams.get("slot") ?? "autosave";

    const rows = await db
      .select({ payload: dynastySaves.payload, updatedAt: dynastySaves.updatedAt })
      .from(dynastySaves)
      .where(and(eq(dynastySaves.slot, slot), eq(dynastySaves.userId, user.id)))
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
  const db = await ensureDb();
  if (!db) return Response.json({ ok: false, error: "No database configured" }, { status: 500 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  try {
    await ensureSaveTable(db);
    const body = (await request.json()) as SavePayload;
    const slot = body.slot ?? "autosave";
    const houseName = body.houseName ?? "Sheatsley";
    const rulerName = body.rulerName ?? "Landon Sheatsley";
    const state = body.state ?? {};

    await db
      .insert(dynastySaves)
      .values({ slot, userId: user.id, houseName, rulerName, payload: state })
      .onConflictDoUpdate({
        target: [dynastySaves.slot, dynastySaves.userId],
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
