import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return Response.json({ error: "Email and password required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ user: data.user, session: data.session });
  } catch (err) {
    return Response.json({ error: "Signup failed" }, { status: 500 });
  }
}
