import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Session, User } from "@supabase/supabase-js";

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Return a typed mock client that always reports "not authenticated"
    return {
      auth: {
        getUser: async () => ({ data: { user: null as User | null }, error: null }),
        getSession: async () => ({ data: { session: null as Session | null }, error: null }),
        signOut: async () => ({ error: null }),
      },
    } as unknown as ReturnType<typeof createServerClient>;
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — middleware refreshes sessions
        }
      },
    },
  });
}
