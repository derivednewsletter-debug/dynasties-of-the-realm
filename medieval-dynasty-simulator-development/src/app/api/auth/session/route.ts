import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return Response.json({ user: data.user ?? null });
  } catch {
    return Response.json({ user: null });
  }
}
