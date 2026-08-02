"use client";

import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useMemo, useState } from "react";

type AppUser = { email?: string; id?: string };

interface Props {
  onStartNew: (user: AppUser) => void;
  onContinue: (user: AppUser, save: unknown) => void;
  onSkipAuth: () => void;
}

export function OnboardingGate({ onStartNew, onContinue, onSkipAuth }: Props) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingWorld, setCheckingWorld] = useState(false);

  // Auth form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  // ── Auth session ──
  useEffect(() => {
    supabase.auth.getSession().then((resp: { data: { session: { user: { email?: string; id?: string } | null } | null } }) => {
      const u = resp.data.session?.user;
      setUser(u ? { email: u.email, id: u.id } : null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt: string, session: { user: { email?: string; id?: string } | null } | null) => {
      const u = session?.user;
      setUser(u ? { email: u.email, id: u.id } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── World-exists check ──
  const checkWorld = useCallback(async () => {
    if (!user) return;
    setCheckingWorld(true);
    try {
      const res = await fetch("/api/game?slot=autosave");
      const data = await res.json();
      if (data.ok && data.save) {
        onContinue(user, data.save.payload);
      } else {
        onStartNew(user);
      }
    } catch {
      // Network error — proceed to new game
      onStartNew(user);
    }
    setCheckingWorld(false);
  }, [user, onContinue, onStartNew]);

  // Auto-check world when user becomes available
  useEffect(() => {
    if (user) checkWorld();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth submit ──
  const submit = useCallback(async () => {
    setError("");
    setBusy(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
      }
      // Session listener will pick up the new user
    } catch {
      setError("Network error — is the server reachable?");
    }
    setBusy(false);
  }, [email, password, mode]);

  // ── Loading spinner ──
  if (loading) return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#080706]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#c8a84e] border-t-transparent" />
        <p className="text-[13px] text-[#8d8674]">Restoring session…</p>
      </div>
    </div>
  );

  // ── Checking world after login ──
  if (user && checkingWorld) return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#080706]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#c8a84e] border-t-transparent" />
        <p className="text-[13px] text-[#8d8674]">Checking your dynasty…</p>
      </div>
    </div>
  );

  // ── Auth form ──
  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-[#080706]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(200,168,78,.08),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(107,156,196,.06),transparent_60%)]" />

      <div className="relative z-10 flex flex-col items-center gap-2">
        <p className="text-[10px] uppercase tracking-[0.5em] text-[#c8a84e]/60">A Living Medieval Dynasty Simulator</p>
        <h1 className="font-serif text-5xl font-bold tracking-tight text-[#eee4d0] sm:text-6xl">
          Dynasties<br /><span className="text-[#c8a84e]">of the Realm</span>
        </h1>
        <p className="mt-2 max-w-md text-center text-[13px] text-[#8d8674]">
          One world, one dynasty, one account — your choices echo across centuries.
        </p>
      </div>

      <div className="relative z-10 mt-10 w-full max-w-sm">
        <div className="ck-panel rounded-2xl p-6 shadow-2xl">
          <h2 className="mb-1 text-center text-[16px] font-bold text-[#c8a84e]">
            {mode === "login" ? "Welcome Back" : "Found a Dynasty"}
          </h2>
          <p className="mb-5 text-center text-[11px] text-[#bbb5a0]">
            {mode === "login" ? "Sign in to continue your Chronicle." : "Create an account to write your first page."}
          </p>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            className="mb-2 w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-[13px] outline-none placeholder:text-white/25 focus:border-[#c8a84e]/40"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="mb-3 w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-[13px] outline-none placeholder:text-white/25 focus:border-[#c8a84e]/40"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />

          {error && (
            <p className="mb-3 rounded-xl bg-red-950/40 px-3 py-2 text-[11px] text-red-300">{error}</p>
          )}

          <button
            onClick={submit}
            disabled={busy || !email.trim() || !password}
            className="w-full rounded-xl bg-[#c8a84e] py-2.5 text-[13px] font-semibold text-[#1a1611] transition hover:brightness-110 disabled:opacity-40"
          >
            {busy ? "…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>

          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            className="mt-3 w-full text-center text-[11px] text-[#bbb5a0] hover:text-[#c8a84e]"
          >
            {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <button
          onClick={onSkipAuth}
          className="mt-4 w-full text-center text-[11px] text-[#8d8674]/60 hover:text-[#8d8674] transition"
        >
          Play offline without an account
        </button>
      </div>

      <p className="absolute bottom-6 text-[10px] text-[#8d8674]/50">v1.0 · A Freebuff Production</p>
    </div>
  );
}
