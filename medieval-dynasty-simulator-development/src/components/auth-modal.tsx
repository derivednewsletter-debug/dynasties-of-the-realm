"use client";

import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";

interface Props {
  onUserChange?: (user: User | null) => void;
}

export function useAuth(onUserChange?: (user: User | null) => void) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const onUserChangeRef = useRef(onUserChange);
  onUserChangeRef.current = onUserChange;

  // Check session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      onUserChangeRef.current?.(u);
    });
    return () => sub.subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      } else {
        setShowAuth(false);
        setEmail("");
        setPassword("");
      }
    } catch {
      setError("Network error");
    }
    setBusy(false);
  }, [email, password, mode]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    onUserChange?.(null);
  }, [onUserChange]);

  return {
    user, loading, showAuth, setShowAuth,
    email, setEmail, password, setPassword,
    mode, setMode, error, setError, busy, submit, logout,
  };
}

export function AuthModal({
  show, onClose, email, setEmail, password, setPassword,
  mode, setMode, error, setError, busy, submit,
}: {
  show: boolean;
  onClose: () => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  mode: "login" | "signup";
  setMode: (v: "login" | "signup") => void;
  error: string;
  setError: (v: string) => void;
  busy: boolean;
  submit: () => void;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4" onClick={onClose}>
      <div
        className="ck-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[#c8a84e]">
            {mode === "login" ? "Welcome Back" : "Join the Realm"}
          </h2>
          <button onClick={onClose} className="rounded-full bg-white/6 px-2 py-0.5 text-[11px] hover:bg-white/12">
            ✕
          </button>
        </div>

        <p className="mb-4 text-[11px] text-[#bbb5a0]">
          {mode === "login"
            ? "Sign in to access your cloud saves."
            : "Create an account to save your dynasty to the cloud."}
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
    </div>
  );
}
