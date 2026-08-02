import { createBrowserClient } from "@supabase/ssr";
import type { Session, User } from "@supabase/supabase-js";

let _client: ReturnType<typeof createBrowserClient> | null = null;

// Mock client for offline play when Supabase env vars are missing
const mockClient = {
  auth: {
    getUser: async () => ({ data: { user: null as User | null }, error: null }),
    getSession: async () => ({ data: { session: null as Session | null }, error: null }),
    onAuthStateChange: (_event: string, _session: Session | null) => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signInWithPassword: async () => ({
      data: { user: null as User | null, session: null as Session | null },
      error: new Error("Supabase not configured"),
    }),
    signUp: async () => ({
      data: { user: null as User | null, session: null as Session | null },
      error: new Error("Supabase not configured"),
    }),
    signOut: async () => ({ error: null }),
  },
} as unknown as ReturnType<typeof createBrowserClient>;

export function createClient() {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return mockClient;
  }

  _client = createBrowserClient(supabaseUrl, supabaseKey);
  return _client;
}
