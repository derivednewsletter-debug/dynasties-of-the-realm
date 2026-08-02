"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  houseName: string;
  firstName: string;
  banner: string;
  onDone: () => void;
}

export function IntroCinematic({ houseName, firstName, banner, onDone }: Props) {
  const [phase, setPhase] = useState(0); // 0=black, 1=funeral, 2=key, 3=chronicle, 4=done
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timer.current = setTimeout(() => setPhase(1), 1800);
    return () => clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (phase === 1) timer.current = setTimeout(() => setPhase(2), 3500);
    if (phase === 2) timer.current = setTimeout(() => setPhase(3), 3000);
    if (phase === 3) timer.current = setTimeout(() => onDone(), 4000);
    return () => clearTimeout(timer.current);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-black">
      {/* Phase 0: Pure black */}
      {phase === 0 && (
        <div className="flex flex-col items-center gap-4">
          <p className="animate-pulse text-[15px] italic text-[#eee4d0]/60">
            Every dynasty begins with a single name.
          </p>
        </div>
      )}

      {/* Phase 1: Funeral */}
      {phase === 1 && (
        <div className="flex flex-col items-center gap-6 text-center transition-opacity duration-1000" style={{ opacity: 1 }}>
          {/* Snowflakes */}
          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="absolute animate-pulse rounded-full bg-white/20"
                style={{
                  width: 2 + (i % 4),
                  height: 2 + (i % 4),
                  left: `${(i * 37 + 13) % 100}%`,
                  top: `${(i * 53 + 7) % 100}%`,
                  animationDelay: `${i * 0.13}s`,
                }} />
            ))}
          </div>

          <p className="text-[11px] uppercase tracking-[0.4em] text-[#c8a84e]/60">Year 0 · Winter · {houseName} Lands</p>
          <h2 className="text-3xl font-bold text-[#eee4d0]">The old chief has fallen.</h2>
          <p className="max-w-md text-[13px] text-[#bbb5a0]">
            Snow falls over the burial mound. The people of the hamlet stand in silence.
            An elder steps forward from the cold mist.
          </p>
        </div>
      )}

      {/* Phase 2: The Key */}
      {phase === 2 && (
        <div className="flex flex-col items-center gap-6 text-center transition-opacity duration-1000" style={{ opacity: 1 }}>
          <span className="text-6xl text-[#c8a84e] drop-shadow-[0_0_30px_rgba(200,168,78,.5)]">🗝</span>
          <p className="text-2xl font-bold italic text-[#eee4d0]">
            &ldquo;{firstName}... they&rsquo;re waiting.&rdquo;
          </p>
          <p className="max-w-md text-[13px] text-[#bbb5a0]">
            The old mentor places an iron key in your palm. The weight of a people presses down.
            The fire must not go out.
          </p>
        </div>
      )}

      {/* Phase 3: The Blank Chronicle */}
      {phase === 3 && (
        <div className="flex flex-col items-center gap-6 text-center transition-opacity duration-1000" style={{ opacity: 1 }}>
          <div className="rounded-3xl border-2 border-[#c8a84e]/30 bg-[#1a1611] p-10 shadow-[0_0_80px_rgba(200,168,78,.08)]">
            <h2 className="font-serif text-4xl font-bold text-[#c8a84e] tracking-wide">
              The Chronicle<br />of House {houseName}
            </h2>
            <div className="mt-6 h-px w-full bg-[#c8a84e]/20" />
            <p className="mt-6 text-[13px] italic text-[#8d8674]">Year 0 · {banner}</p>
            <div className="mt-8 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 rounded bg-[#c8a84e]/8" style={{ width: `${60 + i * 12}%` }} />
              ))}
            </div>
            <p className="mt-10 text-[11px] text-[#8d8674]">Every page blank. Every line unwritten.</p>
          </div>
          <p className="animate-pulse text-[12px] text-[#c8a84e]">The Chronicle opens...</p>
        </div>
      )}

      {/* Skip button */}
      <button onClick={onDone}
        className="absolute bottom-8 right-8 text-[11px] text-[#8d8674]/50 hover:text-[#c8a84e] transition">
        Skip ▸
      </button>
    </div>
  );
}
