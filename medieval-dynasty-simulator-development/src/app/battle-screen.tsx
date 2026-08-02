"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type UnitType = "militia" | "archers" | "spearmen" | "knights" | "royalGuard";

export interface BattleSetup {
  enemyHouse: string;
  enemyBanner: string;
  enemyColor: string;
  kind: "attack" | "siege";
  player: Record<UnitType, number>;
  enemyMilitary: number;
  captains: string[];
}

export interface BattleOutcome {
  victory: boolean;
  withdrew: boolean;
  survivors: Record<UnitType, number>;
  enemyKilled: number;
}

interface Squad {
  id: string;
  side: "p" | "e";
  type: UnitType;
  x: number; y: number;
  tx: number; ty: number;
  men: number; maxMen: number;
  target: string | null;
  ordered: boolean;
  hold: boolean;
  routing: boolean;
  flash: number;
}

const FW = 1600, FH = 900;

const STATS: Record<UnitType, { speed: number; range: number; dps: number; icon: string; label: string; color: string }> = {
  militia:  { speed: 40, range: 20,  dps: 2.4, icon: "🗡", label: "Militia",  color: "#9a7440" },
  spearmen: { speed: 34, range: 26,  dps: 3.0, icon: "🔱", label: "Spearmen", color: "#6d8450" },
  archers:  { speed: 32, range: 230, dps: 2.1, icon: "🏹", label: "Archers",  color: "#4f7f96" },
  knights:  { speed: 76, range: 22,  dps: 4.8, icon: "♞", label: "Knights",  color: "#a2503f" },
  royalGuard: { speed: 56, range: 18, dps: 7.2, icon: "♚", label: "Royal Guard", color: "#c8a84e" },
};

// Battle simulation constants
const MIN_POPULATION = 24;

// Battle terrain constants
const FORESTS = [
  { x: 250, y: 330, r: 150 },
  { x: 1360, y: 560, r: 165 },
  { x: 850, y: 250, r: 115 },
  { x: 420, y: 660, r: 120 },
];
const HILL = { x: 1180, y: 300, r: 175 };
const RIVER_Y = 470, RIVER_H = 54;
const WALL_Y = 210, WALL_X1 = 380, WALL_X2 = 1220, GATE_X1 = 740, GATE_X2 = 870;

// Battle control keys for accessibility
const KEY_BINDINGS = {
  'ArrowUp': 'move-up',
  'ArrowDown': 'move-down', 
  'ArrowLeft': 'move-left',
  'ArrowRight': 'move-right',
  'KeyW': 'move-up',
  'KeyS': 'move-down',
  'KeyA': 'move-left',
  'KeyD': 'move-right',
  'Space': 'pause',
  'Escape': 'cancel',
  'KeyH': 'help',
  'KeyC': 'center-view'
} as const;

function inCircle(x: number, y: number, c: { x: number; y: number; r: number }) {
  return Math.hypot(x - c.x, y - c.y) < c.r;
}
function inForest(x: number, y: number) { return FORESTS.some(f => inCircle(x, y, f)); }
function inRiver(y: number) { return y > RIVER_Y - RIVER_H / 2 && y < RIVER_Y + RIVER_H / 2; }
function onHill(x: number, y: number) { return inCircle(x, y, HILL); }

function makeSquads(setup: BattleSetup): Squad[] {
  const out: Squad[] = [];
  const types: UnitType[] = ["militia", "spearmen", "archers", "knights", "royalGuard"];

  // player squads
  const pSlots: { type: UnitType; men: number }[] = [];
  for (const t of types) {
    let left = setup.player[t] ?? 0;
    let guard = 0;
    while (left > 0 && guard < 5) {
      const men = Math.min(10, left);
      pSlots.push({ type: t, men });
      left -= men;
      guard++;
    }
  }
  if (pSlots.length === 0) pSlots.push({ type: "militia", men: 5 });
  pSlots.forEach((s, i) => {
    const span = Math.max(1, pSlots.length - 1);
    const x = pSlots.length === 1 ? FW / 2 : 380 + (i / span) * 840;
    out.push({
      id: `p${i}`, side: "p", type: s.type, x, y: 780, tx: x, ty: 780,
      men: s.men, maxMen: s.men, target: null, ordered: false, hold: false, routing: false, flash: 0,
    });
  });

  // enemy squads scale with military rating
  const totalEnemy = Math.max(4, Math.round(setup.enemyMilitary * 1.5 * (setup.kind === "siege" ? 1.25 : 1)));
  const eCount = Math.max(3, Math.min(9, Math.round(totalEnemy / 12)));
  const perSquad = Math.max(5, Math.round(totalEnemy / eCount));
  for (let i = 0; i < eCount; i++) {
    const type = types[i % 4];
    const span = Math.max(1, eCount - 1);
    const x = eCount === 1 ? FW / 2 : 400 + (i / span) * 800;
    const y = setup.kind === "siege" ? 140 : 150;
    out.push({
      id: `e${i}`, side: "e", type, x, y, tx: x, ty: y,
      men: perSquad, maxMen: perSquad, target: null, ordered: false, hold: setup.kind === "siege", routing: false, flash: 0,
    });
  }
  return out;
}

export function BattleScreen({ setup, onEnd }: { setup: BattleSetup; onEnd: (o: BattleOutcome) => void }) {
  const initial = useMemo(() => makeSquads(setup), [setup]);
  const squadsRef = useRef<Squad[]>(initial);
  const [squads, setSquads] = useState<Squad[]>(initial);
  const [sel, setSel] = useState<string[]>([]);
  const [speed, setSpeed] = useState(1);
  const [log, setLog] = useState("Deploy your host. Click a squad, then click ground to advance.");
  const [box, setBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const fieldRef = useRef<HTMLDivElement>(null);
  const ended = useRef(false);
  const dragging = useRef<{ on: boolean; sx: number; sy: number; moved: boolean }>({ on: false, sx: 0, sy: 0, moved: false });
  const enemyKilled = useRef(0);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / FW, (window.innerHeight - 210) / FH));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const finish = useCallback((victory: boolean, withdrew: boolean) => {
    if (ended.current) return;
    ended.current = true;
    const survivors: Record<UnitType, number> = { militia: 0, archers: 0, spearmen: 0, knights: 0, royalGuard: 0 };
    for (const s of squadsRef.current) if (s.side === "p" && s.men > 0) survivors[s.type] += Math.round(s.men);
    onEnd({ victory, withdrew, survivors, enemyKilled: Math.round(enemyKilled.current) });
  }, [onEnd]);

  /* ── real-time simulation ── */
  useEffect(() => {
    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const rawDt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const sp = speedRef.current;
      if (sp > 0 && !ended.current) {
        const dt = rawDt * sp;
        setElapsed(e => e + dt);
        const arr = squadsRef.current;
        const capBonus = 1 + setup.captains.length * 0.05;

        for (const s of arr) {
          if (s.men <= 0) continue;
          s.flash = Math.max(0, s.flash - dt * 3);

          // routing check
          if (!s.routing && s.men / s.maxMen < 0.28) {
            s.routing = true;
            s.target = null;
            s.ordered = false;
          }
          if (s.routing) {
            const fleeY = s.side === "p" ? FH + 120 : -120;
            const dy = fleeY - s.y;
            s.y += Math.sign(dy) * STATS[s.type].speed * 1.4 * dt;
            if (s.y > FH + 100 || s.y < -100) s.men = 0;
            continue;
          }

          const st = STATS[s.type];
          const foes = arr.filter(o => o.side !== s.side && o.men > 0 && !o.routing);
          if (foes.length === 0) continue;

          // acquire target
          let tgt = s.target ? foes.find(f => f.id === s.target) ?? null : null;
          if (!tgt) {
            tgt = foes.reduce((a, b) => (Math.hypot(b.x - s.x, b.y - s.y) < Math.hypot(a.x - s.x, a.y - s.y) ? b : a));
            if (s.side === "e") s.target = tgt.id;
          }

          const dist = Math.hypot(tgt.x - s.x, tgt.y - s.y);
          const rangeBonus = onHill(s.x, s.y) && st.range > 100 ? 1.25 : 1;
          const inRange = dist <= st.range * rangeBonus;

          // movement
          let mx = s.x, my = s.y;
          if (s.ordered) {
            const d = Math.hypot(s.tx - s.x, s.ty - s.y);
            if (d < 8) { s.ordered = false; }
            else {
              let spd = st.speed;
              if (inForest(s.x, s.y)) spd *= 0.62;
              if (inRiver(s.y)) spd *= 0.5;
              mx = s.x + ((s.tx - s.x) / d) * spd * dt;
              my = s.y + ((s.ty - s.y) / d) * spd * dt;
            }
          } else if (!s.hold && !inRange) {
            let spd = st.speed;
            if (inForest(s.x, s.y)) spd *= 0.62;
            if (inRiver(s.y)) spd *= 0.5;
            mx = s.x + ((tgt.x - s.x) / (dist || 1)) * spd * dt;
            my = s.y + ((tgt.y - s.y) / (dist || 1)) * spd * dt;
          }

          // siege wall blocks attackers
          if (setup.kind === "siege" && s.side === "p" && my < WALL_Y + 26) {
            const throughGate = mx > GATE_X1 && mx < GATE_X2;
            const withinWall = mx > WALL_X1 && mx < WALL_X2;
            if (withinWall && !throughGate) my = WALL_Y + 26;
          }
          s.x = Math.max(20, Math.min(FW - 20, mx));
          s.y = Math.max(20, Math.min(FH - 20, my));

          // combat
          if (inRange) {
            let dmg = st.dps * (0.45 + 0.55 * (s.men / s.maxMen)) * dt;
            if (s.side === "p") dmg *= capBonus;
            if (st.range > 100 && inForest(tgt.x, tgt.y)) dmg *= 0.5;      // cover
            if (onHill(s.x, s.y)) dmg *= 1.15;                              // high ground
            if (s.type === "spearmen" && tgt.type === "knights") dmg *= 1.8; // anti-cavalry
            if (s.type === "knights" && tgt.type === "archers") dmg *= 1.6;  // shock
            const before = tgt.men;
            tgt.men = Math.max(0, tgt.men - dmg);
            tgt.flash = 1;
            if (tgt.side === "e") enemyKilled.current += before - tgt.men;
            if (tgt.men <= 0) { tgt.target = null; s.target = null; }
          }
        }

        squadsRef.current = arr.filter(s => s.men > 0.05);
        setSquads([...squadsRef.current]);

        const pAlive = squadsRef.current.some(s => s.side === "p" && !s.routing);
        const eAlive = squadsRef.current.some(s => s.side === "e" && !s.routing);
        if (!eAlive) finish(true, false);
        else if (!pAlive) finish(false, false);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [setup, finish]);

  /* ── input ── */
  const toField = (cx: number, cy: number) => {
    const r = fieldRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: (cx - r.left) / scale, y: (cy - r.top) / scale };
  };
  const hitSquad = (x: number, y: number) => squadsRef.current.find(s => Math.hypot(s.x - x, s.y - y) < 40) ?? null;

  const onDown = (e: React.PointerEvent) => {
    const p = toField(e.clientX, e.clientY);
    dragging.current = { on: true, sx: p.x, sy: p.y, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current.on) return;
    const p = toField(e.clientX, e.clientY);
    if (Math.hypot(p.x - dragging.current.sx, p.y - dragging.current.sy) > 12) {
      dragging.current.moved = true;
      setBox({ x1: dragging.current.sx, y1: dragging.current.sy, x2: p.x, y2: p.y });
    }
  };
  const onUp = (e: React.PointerEvent) => {
    if (!dragging.current.on) return;
    const p = toField(e.clientX, e.clientY);
    if (dragging.current.moved) {
      const x1 = Math.min(dragging.current.sx, p.x), x2 = Math.max(dragging.current.sx, p.x);
      const y1 = Math.min(dragging.current.sy, p.y), y2 = Math.max(dragging.current.sy, p.y);
      const picked = squadsRef.current.filter(s => s.side === "p" && s.x >= x1 && s.x <= x2 && s.y >= y1 && s.y <= y2).map(s => s.id);
      setSel(picked);
      setLog(picked.length ? `${picked.length} squad(s) selected.` : "No squads in selection.");
    } else {
      const hit = hitSquad(p.x, p.y);
      if (hit && hit.side === "p") {
        setSel(e.shiftKey ? Array.from(new Set([...sel, hit.id])) : [hit.id]);
        setLog(`${STATS[hit.type].label} selected — ${Math.round(hit.men)} men.`);
      } else if (hit && hit.side === "e" && sel.length) {
        for (const s of squadsRef.current) if (sel.includes(s.id)) { s.target = hit.id; s.ordered = false; s.hold = false; }
        setLog(`Charging the enemy ${STATS[hit.type].label.toLowerCase()}!`);
      } else if (sel.length) {
        const n = sel.length;
        sel.forEach((id, i) => {
          const s = squadsRef.current.find(q => q.id === id);
          if (!s) return;
          const off = n > 1 ? (i - (n - 1) / 2) * 62 : 0;
          s.tx = Math.max(20, Math.min(FW - 20, p.x + off));
          s.ty = p.y;
          s.ordered = true; s.hold = false; s.target = null;
        });
        setLog("Advancing to position.");
      }
    }
    dragging.current.on = false;
    setBox(null);
  };

  const holdPos = () => {
    for (const s of squadsRef.current) if (sel.includes(s.id)) { s.hold = true; s.ordered = false; s.target = null; }
    setLog("Squads holding position.");
  };
  const selectAll = () => setSel(squadsRef.current.filter(s => s.side === "p").map(s => s.id));

  const pMen = squads.filter(s => s.side === "p").reduce((a, b) => a + b.men, 0);
  const eMen = squads.filter(s => s.side === "e").reduce((a, b) => a + b.men, 0);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-[#0a0b08]">
      {/* top bar */}
      <div className="flex items-center justify-between gap-4 px-6 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-red-300">{setup.kind === "siege" ? "Siege Assault" : "Field Battle"} · {Math.floor(elapsed)}s</p>
          <h2 className="text-xl font-bold text-[#eee4d0]">Your Host vs {setup.enemyHouse}</h2>
        </div>
        <div className="flex flex-1 items-center gap-4 px-6">
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-[10px] text-[#bbb5a0]"><span>Your host {Math.round(pMen)}</span><span>{Math.round(eMen)} enemy</span></div>
            <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-emerald-500" style={{ width: `${(pMen / Math.max(1, pMen + eMen)) * 100}%` }} />
              <div className="h-full flex-1 bg-red-500" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[0, 1, 2, 4].map(s => (
            <button key={s} onClick={() => setSpeed(s)} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${speed === s ? "bg-[#c8a84e] text-[#1a1611]" : "bg-white/8 text-[#eee4d0] hover:bg-white/12"}`}>
              {s === 0 ? "⏸" : `${s}×`}
            </button>
          ))}
          <button onClick={() => finish(false, true)} className="ml-2 rounded-full bg-red-950/70 px-4 py-1.5 text-[11px] font-semibold text-red-200 ring-1 ring-red-400/20 hover:bg-red-900/70">Withdraw</button>
        </div>
      </div>

      {/* battlefield */}
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={fieldRef}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          className="absolute left-1/2 top-0 origin-top cursor-crosshair"
          style={{ width: FW, height: FH, transform: `translateX(-50%) scale(${scale})` }}
        >
          {/* terrain */}
          <svg width={FW} height={FH} className="absolute inset-0">
            <defs>
              <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2b3a24" /><stop offset="55%" stopColor="#35482b" /><stop offset="100%" stopColor="#2a3a23" />
              </linearGradient>
            </defs>
            <rect width={FW} height={FH} fill="url(#grass)" />
            <circle cx={HILL.x} cy={HILL.y} r={HILL.r} fill="#4a5a35" opacity={0.55} />
            <circle cx={HILL.x} cy={HILL.y} r={HILL.r * 0.62} fill="#57683d" opacity={0.5} />
            <rect x={0} y={RIVER_Y - RIVER_H / 2} width={FW} height={RIVER_H} fill="#3d6a80" opacity={0.62} />
            <rect x={GATE_X1 - 40} y={RIVER_Y - RIVER_H / 2} width={220} height={RIVER_H} fill="#6b5539" opacity={0.9} />
            {FORESTS.map((f, i) => (
              <g key={i} opacity={0.75}>
                <circle cx={f.x} cy={f.y} r={f.r} fill="#1e2f1b" />
                {Array.from({ length: 16 }).map((_, k) => {
                  const a = (k / 16) * Math.PI * 2, rr = f.r * (0.35 + ((k * 37) % 55) / 100);
                  return <circle key={k} cx={f.x + Math.cos(a) * rr} cy={f.y + Math.sin(a) * rr} r={20} fill="#243a20" />;
                })}
              </g>
            ))}
            {setup.kind === "siege" && (
              <g>
                <rect x={WALL_X1} y={WALL_Y} width={GATE_X1 - WALL_X1} height={26} fill="#6d6459" stroke="#3c352d" strokeWidth={3} />
                <rect x={GATE_X2} y={WALL_Y} width={WALL_X2 - GATE_X2} height={26} fill="#6d6459" stroke="#3c352d" strokeWidth={3} />
                <rect x={GATE_X1} y={WALL_Y + 4} width={GATE_X2 - GATE_X1} height={18} fill="#4a3524" stroke="#2a1e14" strokeWidth={2} />
                <text x={(GATE_X1 + GATE_X2) / 2} y={WALL_Y - 10} textAnchor="middle" fill="#c8a84e" fontSize={16}>Gate</text>
              </g>
            )}
            {/* order lines */}
            {squads.filter(s => sel.includes(s.id) && s.ordered).map(s => (
              <line key={`o${s.id}`} x1={s.x} y1={s.y} x2={s.tx} y2={s.ty} stroke="#c8a84e" strokeWidth={2} strokeDasharray="7 7" opacity={0.7} />
            ))}
            {box && (
              <rect x={Math.min(box.x1, box.x2)} y={Math.min(box.y1, box.y2)} width={Math.abs(box.x2 - box.x1)} height={Math.abs(box.y2 - box.y1)} fill="#c8a84e22" stroke="#c8a84e" strokeWidth={2} />
            )}
          </svg>

          {/* squads */}
          {squads.map(s => {
            const st = STATS[s.type];
            const selected = sel.includes(s.id);
            const pct = Math.max(0, s.men / s.maxMen);
            return (
              <div key={s.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: s.x, top: s.y, opacity: s.routing ? 0.45 : 1 }}>
                <div
                  className="grid place-items-center rounded-xl text-[18px] shadow-lg"
                  style={{
                    width: 46, height: 46,
                    background: s.side === "p" ? st.color : "#3a2626",
                    border: selected ? "3px solid #c8a84e" : s.side === "p" ? "2px solid rgba(255,255,255,0.35)" : `2px solid ${setup.enemyColor}`,
                    filter: s.flash > 0 ? `brightness(${1 + s.flash * 0.9})` : undefined,
                  }}
                >
                  {s.side === "p" ? st.icon : setup.enemyBanner}
                </div>
                <div className="mx-auto mt-1 h-1.5 w-12 overflow-hidden rounded-full bg-black/60">
                  <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: s.side === "p" ? "#5ec27a" : "#d15b52" }} />
                </div>
                <div className="mt-0.5 text-center text-[10px] font-bold text-white drop-shadow">{Math.round(s.men)}</div>
                {s.routing && <div className="text-center text-[9px] font-bold text-amber-300">ROUTING</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* bottom command bar */}
      <div className="flex items-center gap-4 border-t border-white/8 bg-[#0e0d0b]/95 px-6 py-3 backdrop-blur-xl">
        <div className="flex flex-1 gap-1.5 overflow-x-auto">
          {squads.filter(s => s.side === "p").map(s => {
            const st = STATS[s.type];
            const selected = sel.includes(s.id);
            return (
              <button key={s.id} onClick={() => setSel([s.id])} className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left transition ${selected ? "bg-[#c8a84e] text-[#1a1611]" : "bg-white/5 text-[#eee4d0] hover:bg-white/10"}`}>
                <span className="text-base">{st.icon}</span>
                <span><span className="block text-[11px] font-semibold">{st.label}</span><span className="block text-[10px] opacity-75">{Math.round(s.men)} men</span></span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={selectAll} className="rounded-full bg-white/8 px-4 py-2 text-[11px] font-semibold hover:bg-white/12">Select all</button>
          <button onClick={holdPos} className="rounded-full bg-white/8 px-4 py-2 text-[11px] font-semibold hover:bg-white/12">Hold</button>
        </div>
        <p className="max-w-[280px] text-right text-[11px] text-[#bbb5a0]">{log}</p>
      </div>
    </div>
  );
}
