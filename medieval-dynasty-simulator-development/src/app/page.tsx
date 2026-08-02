// Thin client wrapper — `ssr: false` in next/dynamic is only allowed
// inside Client Components in Next.js 16.
"use client";

import dynamicImport from "next/dynamic";

const GameShell = dynamicImport(() => import("./game-shell"), {
  ssr: false,
  loading: () => (
    <div role="status" aria-label="Loading game" className="flex h-screen w-screen items-center justify-center bg-[#0a0908]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-[#c8a84e]" />
        <p className="text-[14px] font-semibold text-[#c8a84e]">Loading Dynasties of the Realm…</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  return <GameShell />;
}
