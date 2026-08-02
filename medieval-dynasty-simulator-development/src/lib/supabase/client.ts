import { createBrowserClient } from "@supabase/ssr";
import type { Session, User } from "@supabase/supabase-js";

let _client: ReturnType<typeof createBrowserClient> | null = null;

// Mock user for offline play
const MOCK_USER: User = {
  id: "offline-user",
  email: "offline@dynasties.local",
  aud: "authenticated",
  role: "authenticated",
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
} as User;

const MOCK_SESSION: Session = {
  access_token: "offline",
  refresh_token: "offline",
  expires_in: 999999,
  expires_at: Date.now() + 999999000,
  token_type: "bearer",
  user: MOCK_USER,
} as Session;

// Mock client for offline play when Supabase env vars are missing
const mockClient = {
  auth: {
    getUser: async () => ({ data: { user: MOCK_USER }, error: null }),
    getSession: async () => ({ data: { session: MOCK_SESSION }, error: null }),
    onAuthStateChange: (_event: string, _session: Session | null) => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signInWithPassword: async () => ({
      data: { user: MOCK_USER, session: MOCK_SESSION },
      error: null,
    }),
    signUp: async () => ({
      data: { user: MOCK_USER, session: MOCK_SESSION },
      error: null,
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
