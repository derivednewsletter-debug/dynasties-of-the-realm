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

// SSR-safe mock — used during server-side rendering until hydration
const ssrMock = {
  auth: {
    getUser: async () => ({ data: { user: null as User | null }, error: null }),
    getSession: async () => ({ data: { session: null as Session | null }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signInWithPassword: async () => ({
      data: { user: null as User | null, session: null as Session | null },
      error: null,
    }),
    signUp: async () => ({
      data: { user: null as User | null, session: null as Session | null },
      error: null,
    }),
    signOut: async () => ({ error: null }),
  },
} as unknown as ReturnType<typeof createBrowserClient>;

// Full mock for offline play (loaded client-side when Supabase env vars are missing)
const offlineMock = {
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

// Check if we're on the client (browser) — safe during SSR.
// ssrMock reports no user (safe for render-phase calls);
// offlineMock simulates a fake logged-in user (for hooks that run after mount).
const isClient = typeof window !== 'undefined';

export function createClient() {
  // During SSR, return a minimal mock that reports no user.
  // createBrowserClient cannot be safely called on the server.
  if (!isClient) return ssrMock;

  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return offlineMock;
  }

  _client = createBrowserClient(supabaseUrl, supabaseKey);
  return _client;
}
