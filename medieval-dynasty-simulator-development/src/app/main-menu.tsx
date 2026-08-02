"use client";
import { useState } from "react";

export type RegionChoice = "Forest Valley" | "Golden Plains" | "Mountain Highlands" | "Coastal Bay" | "River Kingdom";
export type BannerChoice = "Lion" | "Eagle" | "Oak" | "Wolf" | "Crown";
export type GenderChoice = "male" | "female";

export const REGIONS: Record<RegionChoice, { color: string; difficulty: string; main: string; desc: string; x: number; y: number }> = {
  "Forest Valley":    { color: "#4a7a3a", difficulty: "Easy",   main: "Wood & Herbs",     desc: "Deep pines shelter abundant game and timber.", x: 3500, y: 5000 },
  "Golden Plains":    { color: "#b8a04a", difficulty: "Easy",   main: "Food & Silver",   desc: "Endless wheat fields feed the continent.", x: 7500, y: 5500 },
  "Mountain Highlands":{color: "#7a7a7a", difficulty: "Hard",   main: "Stone & Iron",    desc: "Ancient peaks hide iron and forgotten halls.", x: 6500, y: 1800 },
  "Coastal Bay":      { color: "#4a7a8a", difficulty: "Medium", main: "Fish & Trade",    desc: "Salt winds carry merchants from distant shores.", x: 12000, y: 4800 },
  "River Kingdom":    { color: "#5a8a6a", difficulty: "Medium", main: "Fertile Lands",   desc: "River waters make the soil rich and dark.", x: 2500, y: 7200 },
};

export const PATHS: { id: string; icon: string; label: string; desc: string }[] = [
  { id: "Forest & Beast", icon: "🌲", label: "Forest & Beast", desc: "Master of woodcraft, hunting, and the wild." },
  { id: "Iron",          icon: "⚒",  label: "Iron",           desc: "Forge and anvil — industry is your strength." },
  { id: "Scholar",       icon: "📜", label: "Scholar",        desc: "Knowledge, diplomacy, and the written word." },
  { id: "Warrior",       icon: "⚔",  label: "Warrior",        desc: "Born for battle — lead from the front." },
  { id: "Sea",           icon: "⛵", label: "Sea",            desc: "Trade winds and tides shape your fortune." },
  { id: "Land",          icon: "🌾", label: "Land",           desc: "Steward of field and flock — the soil provides." },
];

export const BANNERS: Record<BannerChoice, { icon: string; label: string }> = {
  Lion:  { icon: "🦁", label: "The Lion — ferocity and pride" },
  Eagle: { icon: "🦅", label: "The Eagle — vision and freedom" },
  Oak:   { icon: "🌳", label: "The Oak — endurance and wisdom" },
  Wolf:  { icon: "🐺", label: "The Wolf — loyalty and cunning" },
  Crown: { icon: "♚",  label: "The Crown — ambition and rule" },
};

interface Props {
  onCreate: (data: {
    region: RegionChoice;
    gender: GenderChoice;
    firstName: string;
    houseName: string;
    banner: BannerChoice;
    path: string;
  }) => void;
  onContinue: () => void;
  hasSave: boolean;
  isAuthed: boolean;
}

export function MainMenu({ onCreate, onContinue, hasSave, isAuthed }: Props) {
  const [screen, setScreen] = useState<"menu" | "create" | "settings" | "credits">("menu");

  // Creation state
  const [region, setRegion] = useState<RegionChoice>("Golden Plains");
  const [gender, setGender] = useState<GenderChoice>("male");
  const [firstName, setFirstName] = useState("Landon");
  const [houseName, setHouseName] = useState("Sheatsley");
  const [banner, setBanner] = useState<BannerChoice>("Wolf");
  const [path, setPath] = useState("Forest & Beast");

  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 5;

  if (screen === "menu") return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-[#080706]">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(200,168,78,.08),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(107,156,196,.06),transparent_60%)]" />

      <div className="relative z-10 flex flex-col items-center gap-2">
        <p className="text-[10px] uppercase tracking-[0.5em] text-[#c8a84e]/60">A Living Medieval Dynasty Simulator</p>
        <h1 className="font-serif text-5xl font-bold tracking-tight text-[#eee4d0] sm:text-6xl">
          Dynasties<br /><span className="text-[#c8a84e]">of the Realm</span>
        </h1>
        <p className="mt-2 max-w-md text-center text-[13px] text-[#8d8674]">
          Shape a house across centuries. Every birth, every battle, every harvest — written into the Chronicle.
        </p>

        <div className="mt-10 flex flex-col gap-3">
          <button onClick={() => { setScreen("create"); setStep(1); }}
            className="rounded-2xl bg-[#c8a84e] px-12 py-4 text-[15px] font-bold text-[#1a1611] shadow-lg shadow-[#c8a84e]/20 transition hover:brightness-110">
            New Game
          </button>
          <button onClick={onContinue} disabled={!hasSave}
            className={`rounded-2xl border px-12 py-4 text-[15px] font-semibold transition ${
              hasSave ? "border-[#c8a84e]/30 text-[#c8a84e] hover:bg-[#c8a84e]/10" : "border-white/5 text-white/20 cursor-not-allowed"}`}>
            {isAuthed ? "Load Your World" : "Continue"}
          </button>
          {isAuthed && (
            <p className="mt-2 text-center text-[10px] text-[#8d8674]/60">Signed in · one world per account</p>
          )}
          <div className="mt-4 flex justify-center gap-6">
            <button onClick={() => setScreen("settings")} className="text-[11px] text-[#8d8674] hover:text-[#c8a84e] transition">Settings</button>
            <button onClick={() => setScreen("credits")} className="text-[11px] text-[#8d8674] hover:text-[#c8a84e] transition">Credits</button>
          </div>
        </div>
      </div>

      <p className="absolute bottom-6 text-[10px] text-[#8d8674]/50">v1.0 · A Freebuff Production</p>
    </div>
  );

  if (screen === "settings") return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#080706] gap-6">
      <h2 className="text-2xl font-bold text-[#c8a84e]">Settings</h2>
      <p className="text-[13px] text-[#bbb5a0]">Audio, display, and gameplay settings coming soon.</p>
      <button onClick={() => setScreen("menu")} className="rounded-xl bg-white/8 px-6 py-2 text-[12px] font-semibold hover:bg-white/12">← Back</button>
    </div>
  );

  if (screen === "credits") return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#080706] gap-4">
      <h2 className="text-2xl font-bold text-[#c8a84e]">Credits</h2>
      <p className="text-[13px] text-[#bbb5a0]">Built with Next.js · React · TypeScript · Tailwind CSS</p>
      <p className="text-[11px] text-[#8d8674]">A game by Landon Sheatsley · Powered by Freebuff</p>
      <button onClick={() => setScreen("menu")} className="mt-4 rounded-xl bg-white/8 px-6 py-2 text-[12px] font-semibold hover:bg-white/12">← Back</button>
    </div>
  );

  // Character creation
  const r = REGIONS[region];
  return (
    <div className="flex h-screen w-screen flex-col bg-[#080706]">
      {/* Progress bar */}
      <div className="flex items-center gap-2 px-8 pt-6">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
          <div key={s} className={`h-1 flex-1 rounded-full transition ${s <= step ? "bg-[#c8a84e]" : "bg-white/8"}`} />
        ))}
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Step 1: Region */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-center text-2xl font-bold text-[#eee4d0]">Choose Your Homeland</h2>
              <p className="text-center text-[12px] text-[#8d8674]">The land shapes your people, your resources, and your destiny.</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(Object.keys(REGIONS) as RegionChoice[]).map(rk => {
                  const ri = REGIONS[rk];
                  return (
                    <button key={rk} onClick={() => setRegion(rk)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        region === rk ? "border-[#c8a84e] bg-[#c8a84e]/10" : "border-white/8 bg-white/3 hover:bg-white/5"
                      }`}>
                      <div className="mb-2 h-16 w-full rounded-xl" style={{ background: `linear-gradient(135deg, ${ri.color}, ${ri.color}88)` }} />
                      <p className="text-[14px] font-bold">{rk}</p>
                      <p className="mt-0.5 text-[11px] text-[#bbb5a0]">{ri.desc}</p>
                      <div className="mt-2 flex gap-2">
                        <span className="rounded-full bg-white/8 px-2 py-0.5 text-[9px]">{ri.difficulty}</span>
                        <span className="rounded-full bg-white/8 px-2 py-0.5 text-[9px]">{ri.main}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Name & House */}
          {step === 2 && (
            <div className="mx-auto max-w-md space-y-6">
              <h2 className="text-center text-2xl font-bold text-[#eee4d0]">Name Your House</h2>
              <p className="text-center text-[12px] text-[#8d8674]">These names will echo through the Chronicle for centuries.</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => setGender("male")} className={`rounded-xl px-6 py-3 text-[14px] font-semibold transition ${gender === "male" ? "bg-[#c8a84e] text-[#1a1611]" : "bg-white/6 hover:bg-white/10"}`}>♂ Lord</button>
                <button onClick={() => setGender("female")} className={`rounded-xl px-6 py-3 text-[14px] font-semibold transition ${gender === "female" ? "bg-[#c8a84e] text-[#1a1611]" : "bg-white/6 hover:bg-white/10"}`}>♀ Lady</button>
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#8d8674]">First Name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-[14px] outline-none focus:border-[#c8a84e]/40" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#8d8674]">House Name</label>
                <div className="flex items-center gap-2">
                  <span className="text-[18px] text-[#c8a84e]">House</span>
                  <input value={houseName} onChange={e => setHouseName(e.target.value)}
                    className="flex-1 rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-[14px] outline-none focus:border-[#c8a84e]/40" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Path */}
          {step === 3 && (
            <div className="mx-auto max-w-xl space-y-6">
              <h2 className="text-center text-2xl font-bold text-[#eee4d0]">Choose Your Path</h2>
              <p className="text-center text-[12px] text-[#8d8674]">Your path shapes your starting skills, your people, and your legacy.</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PATHS.map(p => (
                  <button key={p.id} onClick={() => setPath(p.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      path === p.id ? "border-[#c8a84e] bg-[#c8a84e]/10" : "border-white/8 bg-white/3 hover:bg-white/5"
                    }`}>
                    <span className="text-3xl">{p.icon}</span>
                    <p className="mt-2 text-[13px] font-bold">{p.label}</p>
                    <p className="mt-0.5 text-[11px] text-[#bbb5a0]">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Banner */}
          {step === 4 && (
            <div className="mx-auto max-w-md space-y-6">
              <h2 className="text-center text-2xl font-bold text-[#eee4d0]">Choose Your Banner</h2>
              <p className="text-center text-[12px] text-[#8d8674]">Your sigil flies over every field, fort, and throne.</p>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(BANNERS) as BannerChoice[]).map(bk => {
                  const bi = BANNERS[bk];
                  return (
                    <button key={bk} onClick={() => setBanner(bk)}
                      className={`rounded-2xl border p-5 text-center transition ${
                        banner === bk ? "border-[#c8a84e] bg-[#c8a84e]/10" : "border-white/8 bg-white/3 hover:bg-white/5"
                      }`}>
                      <span className="text-5xl">{bi.icon}</span>
                      <p className="mt-2 text-[11px] text-[#bbb5a0]">{bi.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Confirm */}
          {step === 5 && (
            <div className="mx-auto max-w-md space-y-6 text-center">
              <h2 className="text-2xl font-bold text-[#eee4d0]">The Chronicle Awaits</h2>
              <div className="rounded-2xl border border-[#c8a84e]/20 bg-[#0e0d0b] p-6 text-left space-y-2">
                <p className="text-[11px] uppercase tracking-wider text-[#c8a84e]">House {houseName}</p>
                <p className="text-[13px] text-[#bbb5a0]">
                  <strong className="text-[#eee4d0]">{gender === "male" ? "Chief" : "Chieftess"} {firstName} {houseName}</strong> of {region}
                </p>
                <p className="text-[12px] text-[#8d8674]">Path: {path} · Banner: {BANNERS[banner].icon} {banner} · Difficulty: {REGIONS[region].difficulty}</p>
                <p className="text-[11px] text-[#8d8674] italic">A small hamlet clings to the land, waiting for its first page.</p>
              </div>
              <p className="text-[11px] text-[#8d8674]">Every dynasty begins with a single name.</p>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-center gap-4">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="rounded-xl bg-white/6 px-6 py-2.5 text-[12px] font-semibold hover:bg-white/10">← Back</button>
            )}
            {step < TOTAL_STEPS ? (
              <button onClick={() => setStep(s => s + 1)} className="rounded-xl bg-[#c8a84e] px-8 py-2.5 text-[12px] font-bold text-[#1a1611] hover:brightness-110">Next →</button>
            ) : (
              <button onClick={() => onCreate({ region, gender, firstName, houseName, banner, path })}
                className="rounded-xl bg-[#c8a84e] px-10 py-3 text-[14px] font-bold text-[#1a1611] shadow-lg shadow-[#c8a84e]/20 hover:brightness-110 transition">
                Begin the Chronicle
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
