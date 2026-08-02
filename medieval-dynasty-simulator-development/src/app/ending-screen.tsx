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

export function EndingScreen({ data, onRestart }: Props) {
  const [phase, setPhase] = useState<"scroll" | "rewind" | "final">("scroll");
  const [yearPos, setYearPos] = useState(data.endYear);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const totalYears = data.endYear - data.startYear;

  // Auto-scroll chronicle
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
        setTimeout(() => setPhase("rewind"), 1500);
      }
    }, 30);
    return () => clearInterval(id);
  }, [phase]);

  // Map rewind canvas
  useEffect(() => {
    if (phase !== "rewind") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const interval = setInterval(() => {
      setYearPos(p => {
        if (p <= data.startYear) { clearInterval(interval); setTimeout(() => setPhase("final"), 2000); return data.startYear; }
        return p - Math.max(1, Math.floor(totalYears / 150));
      });
    }, 50);

    return () => clearInterval(interval);
  }, [phase, totalYears, data.startYear]);

  // Draw settlements on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase !== "rewind") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    const progress = (data.endYear - yearPos) / Math.max(1, totalYears);

    // Dark parchment background
    ctx.fillStyle = "#1a1611";
    ctx.fillRect(0, 0, w, h);

    // Region labels
    const regions = [
      { name: "Northern Marches", x: w / 2, y: h * 0.15 },
      { name: "Western Highlands", x: w * 0.15, y: h * 0.47 },
      { name: "Heartlands", x: w / 2, y: h * 0.5 },
      { name: "Eastern Coast", x: w * 0.85, y: h * 0.45 },
      { name: "Southern Wilds", x: w / 2, y: h * 0.84 },
    ];
    ctx.font = `${10 * (1 - progress * 0.3)}px serif`;
    ctx.textAlign = "center";
    for (const r of regions) {
      ctx.fillStyle = `rgba(200, 168, 78, ${0.08 + progress * 0.12})`;
      ctx.fillText(r.name, r.x, r.y);
    }

    // Draw settlements
    for (const s of data.settlements) {
      const sx = (s.x / 15000) * w;
      const sy = (s.y / 10000) * h;
      // Settlements shrink backwards in time
      const reverseSize = 0.3 + (1 - progress) * 0.7;
      const size = (s.peakType === "city" ? 8 : s.peakType === "town" ? 5 : s.peakType === "village" ? 3.5 : 2.2) * reverseSize;
      const alpha = 0.2 + progress * 0.7;

      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(1, size), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 168, 78, ${alpha})`;
      ctx.fill();

      if (size > 3) {
        ctx.font = `${Math.max(6, size * 0.9)}px sans-serif`;
        ctx.fillStyle = `rgba(238, 228, 208, ${alpha})`;
        ctx.fillText(s.name, sx, sy - size - 4);
      }
    }

    // Year display
    ctx.font = "bold 28px serif";
    ctx.fillStyle = "#c8a84e";
    ctx.textAlign = "center";
    ctx.fillText(`Year ${yearPos}`, w / 2, h - 30);

    // Progress bar
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(50, h - 12, w - 100, 4);
    ctx.fillStyle = "#c8a84e";
    ctx.fillRect(50, h - 12, (w - 100) * progress, 4);
  }, [phase, yearPos, data]);

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
      {/* Scroll phase */}
      {phase === "scroll" && (
        <div ref={scrollRef} className="absolute inset-0 overflow-hidden px-12 py-16">
          <div className="mx-auto max-w-2xl space-y-4">
            <h2 className="font-serif text-3xl font-bold text-[#c8a84e]">The Chronicle</h2>
            <div className="h-px w-full bg-[#c8a84e]/15" />
            {data.chronicle.slice(-250).reverse().map(e => (
              <div key={e.id} className="rounded-xl bg-white/3 px-4 py-3">
                <span className="text-[10px] text-[#8d8674]">Y{e.year} {e.season}</span>
                <strong className="ml-2 text-[13px] text-[#eee4d0]">{e.title}</strong>
                <p className="mt-1 text-[12px] text-[#bbb5a0]">{e.text}</p>
              </div>
            ))}
            <div className="pt-8 text-center text-[13px] italic text-[#c8a84e]">— End of the Chronicle —</div>
          </div>
        </div>
      )}

      {/* Rewind phase */}
      {phase === "rewind" && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4">
          <canvas ref={canvasRef} className="rounded-2xl border border-[#c8a84e]/15 shadow-2xl" />
          <p className="text-[14px] text-[#eee4d0]">Drag the years backward...</p>
          <p className="text-[11px] text-[#8d8674]">Watch the Realm shrink to its roots</p>
        </div>
      )}
    </div>
  );
}
