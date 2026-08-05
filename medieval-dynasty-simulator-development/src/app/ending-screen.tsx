"use client";
import { useEffect, useRef, useState } from "react";

interface ChronEntry { id: string; year: number; season: string; title: string; text: string; tone: string }

export interface EndingData {
  chronicle: ChronEntry[];
  houseName: string;
  firstName: string;
  startYear: number;
  endYear: number;
  settlements: { id: string; name: string; type: string; x: number; y: number; peakType: string }[];
  roads: { x1: number; y1: number; x2: number; y2: number; level: number }[];
  rulers: { name: string; year: number }[];
  peakRank: string;
  totalPrestige: number;
  battlesFought: number;
  lineagesBorn: number;
  demotions: number;
}

interface Props {
  data: EndingData;
  onRestart: () => void;
}

const TONE_STYLE: Record<string, { rail: string; stamp: string }> = {
  hope:    { rail: "bg-emerald-400/80", stamp: "text-emerald-300" },
  glory:   { rail: "bg-[#c8a84e]",      stamp: "text-[#e3c76e]" },
  grief:   { rail: "bg-slate-400/60",    stamp: "text-slate-300" },
  warning: { rail: "bg-amber-400/80",    stamp: "text-amber-300" },
  trade:   { rail: "bg-teal-400/70",     stamp: "text-teal-300" },
  faith:   { rail: "bg-violet-400/70",   stamp: "text-violet-300" },
};

export function EndingScreen({ data, onRestart }: Props) {
  const [phase, setPhase] = useState<"scroll" | "final">("scroll");
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalYears = data.endYear - data.startYear;

  // Auto-scroll the finished chronicle
  useEffect(() => {
    if (phase !== "scroll") return;
    const el = scrollRef.current;
    if (!el) return;
    let pos = 0;
    const speed = 1.2;
    const id = setInterval(() => {
      pos += speed;
      el.scrollTop = pos;
      if (pos >= el.scrollHeight - el.clientHeight) {
        clearInterval(id);
        setTimeout(() => setPhase("final"), 1500);
      }
    }, 30);
    return () => clearInterval(id);
  }, [phase]);

  if (phase === "final") return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#080706] gap-8">
      <div className="rounded-3xl border-2 border-[#c8a84e]/30 bg-[#1a1611] p-10 text-center shadow-[0_0_120px_rgba(200,168,78,.06)]">
        <h2 className="font-serif text-4xl font-bold text-[#c8a84e]">
          The Chronicle<br />of House {data.houseName}
        </h2>
        <div className="mt-6 h-px w-full bg-[#c8a84e]/20" />
        <p className="mt-6 font-serif text-[15px] italic text-[#eee4d0]">
          &ldquo;{data.firstName} inherited the hamlet of Hearthmere.&rdquo;
        </p>
        <div className="mt-8 space-y-1 text-[11px] text-[#8d8674]">
          <p>Year {data.startYear} — Year {data.endYear} · {totalYears} years</p>
          <p>Peak rank: {data.peakRank} · Prestige: {data.totalPrestige}</p>
          <p>Battles fought: {data.battlesFought} · Heirs born: {data.lineagesBorn}</p>
          {data.demotions > 0 && <p className="text-red-400">Times the House fell: {data.demotions}</p>}
        </div>
      </div>
      <button onClick={onRestart}
        className="rounded-2xl bg-[#c8a84e] px-10 py-4 text-[14px] font-bold text-[#1a1611] shadow-lg hover:brightness-110 transition">
        Begin a New Chronicle
      </button>
    </div>
  );

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-black">
      <div ref={scrollRef} className="absolute inset-0 overflow-hidden px-12 py-16">
        <div className="mx-auto max-w-2xl space-y-4">
          <h2 className="font-serif text-3xl font-bold text-[#c8a84e]">The Chronicle</h2>
          <div className="h-px w-full bg-[#c8a84e]/15" />
          {data.chronicle.slice(-250).reverse().map(e => {
            const ts = TONE_STYLE[e.tone] ?? TONE_STYLE.hope;
            return (
              <div key={e.id} className="relative rounded-xl bg-white/3 px-4 py-3 pl-5">
                <span className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${ts.rail}`} />
                <span className="text-[10px] text-[#8d8674]">Y{e.year} {e.season}</span>
                <strong className="ml-2 text-[13px] text-[#eee4d0]">{e.title}</strong>
                <p className="mt-1 text-[12px] text-[#bbb5a0]">{e.text}</p>
              </div>
            );
          })}
          <div className="pt-8 text-center text-[13px] italic text-[#c8a84e]">— End of the Chronicle —</div>
        </div>
      </div>
    </div>
  );
}
