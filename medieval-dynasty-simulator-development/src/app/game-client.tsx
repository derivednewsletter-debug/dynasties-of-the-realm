"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BattleScreen, type BattleSetup, type BattleOutcome, type UnitType } from "./battle-screen";
import { AuthModal, useAuth } from "@/components/auth-modal";
import { REALM_MAP, SETTLEMENT_SVGS, PORTRAIT_SVGS } from "@/components/game-svgs";
import { type RegionChoice, type BannerChoice, type GenderChoice } from "./main-menu";
import { type EndingData } from "./ending-screen";

/* ───────── types ───────── */
type Season = "Spring" | "Summer" | "Autumn" | "Winter";
type Panel = "House" | "Build" | "Training" | "Council" | "Resources" | "Chronicle" | "Family" | "Citizens" | "Alerts" | "Settlement" | "Barony" | "Villager" | "Trade" | "War" | "Realm" | "Crown" | "Factions" | null;
type Path = "Forest & Beast" | "Iron" | "Scholar" | "Warrior" | "Sea" | "Land";
type Region = "Northern Marches" | "Heartlands" | "Western Highlands" | "Eastern Coast" | "Southern Wilds";
type SType = "hamlet" | "village" | "town" | "city";
type RN = "food" | "wood" | "stone" | "iron" | "coal" | "fish" | "wool" | "leather" | "herbs" | "tools" | "weapons" | "medicine" | "silver";
type Res = Record<RN, number>;

interface ChronEntry { id: string; year: number; season: Season; title: string; text: string; tone: string }
interface Family { id: string; name: string; age: number; role: string; path: Path; traits: string[]; status: "Living" | "Dead" }
interface Citizen { id: string; name: string; occ: string; age: number; mood: number; skills: Record<string, number>; traits: string[]; memories: string[]; sid: string; orbit: number; dur: number; phase: number; rev: boolean }
interface Building { id: string; name: string; level: number; desc: string; prod: Partial<Res>; cost: Partial<Res> }
interface Settlement { id: string; bid: string; name: string; type: SType; x: number; y: number; pop: number; home: boolean; desc: string }
interface Barony { id: string; name: string; house: string; region: Region; banner: string; motto: string; eco: number; mil: number; dip: number; rel: number; ambition: string; x: number; y: number; color: string }
interface Rep { trust: number; respect: number; fear: number; prosperity: number; tradition: number }
interface EvtOpt { label: string; hint: string; result: string; res?: Partial<Res>; rep?: Partial<Rep>; pres?: number }
interface DecEvt { id: string; title: string; text: string; crisis: boolean; opts: EvtOpt[] }
interface Caravan { id: string; tid: string; resource: RN; amount: number; days: number; total: number; silver: number }
interface Alliance { bid: string; kind: "alliance" | "trade bloc" }
interface Vassal { bid: string; title: string; loyalty: number; tribute: number }
interface SuccessionCrisis { id: string; claimants: { name: string; age: number; support: number; traits: string[] }[]; resolved: boolean; year: number }
interface Army { militia: number; archers: number; spearmen: number; knights: number; royalGuard: number; captains: string[]; training: number }

interface Road { id: string; fromSid: string; toSid: string; level: number; traffic: number; decayed: boolean }
interface Faction { id: string; name: string; goal: string; members: number; aggression: number; loyalty: number }
interface MemoryObj { id: string; text: string; tone: string; year: number; season: Season; spreadTo: string[] }

/* ───── faction reputation ───── */
type ActionType = "raid" | "war_victory" | "war_defeat" | "alliance_formed" | "alliance_broken" | "peace" | "negotiate" | "trade_gift" | "betrothal" | "vassal" | "betrayal";
interface ActionRecord { year: number; season: Season; action: ActionType; magnitude: number; text: string }
interface FactionReputation {
  bid: string;        // target barony id
  trust: number;      // -100 to 100 — overall sentiment
  grudge: number;     // 0 to 100 — inherited pain that never fully heals
  fear: number;       // 0 to 100 — how afraid they are of the player
  respect: number;    // 0 to 100 — how much they admire the player
  actions: ActionRecord[]; // last 30 actions
  genGrudges: { text: string; born: number; decayed: boolean }[]; // generational grudges
}

interface GS {
  day: number; year: number; season: Season;
  ruler: Family; motto: string; rank: string; prestige: number;
  pop: number; popCap: number; res: Res; rate: Partial<Res>; rep: Rep;
  family: Family[]; citizens: Citizen[]; buildings: Building[];
  baronies: Barony[]; settlements: Settlement[]; chronicle: ChronEntry[];
  selBid: string; selSid: string; selCid: string | null;
  evt: DecEvt | null; toast: { title: string; body: string; portrait: string } | null;
  prices: Record<RN, number>; caravans: Caravan[]; alliances: Alliance[]; army: Army;
  atWar: string[];
  roads: Road[]; factions: Faction[]; citizenMemories: MemoryObj[];
  demotions: number; battlesFought: number; lineagesBorn: number; peakRank: string;
  dynastyExtinct: boolean;
  vassals: Vassal[]; successionCrisis: SuccessionCrisis | null;
  civilWarActive: boolean;
  factionRep: FactionReputation[];
}

/* ───────── world constants ───────── */
const W = 15000, H = 10000;
const DAYS_PER_SEASON = 90;
const SEASONS: Season[] = ["Spring", "Summer", "Autumn", "Winter"];
const PATHS: Path[] = ["Forest & Beast", "Iron", "Scholar", "Warrior", "Sea", "Land"];

const RC: Record<Region, { x: number; y: number }> = {
  "Northern Marches": { x: 7500, y: 1500 },
  Heartlands: { x: 7500, y: 5000 },
  "Western Highlands": { x: 2300, y: 4700 },
  "Eastern Coast": { x: 12700, y: 4500 },
  "Southern Wilds": { x: 7500, y: 8400 },
};
const RCOL: Record<Region, string> = {
  "Northern Marches": "#6b9cc4",
  Heartlands: "#c8a84e",
  "Western Highlands": "#8a8078",
  "Eastern Coast": "#4d97a8",
  "Southern Wilds": "#5a9a52",
};
const PORTRAITS = { ruler: PORTRAIT_SVGS.ruler, spouse: PORTRAIT_SVGS.spouse, heir: PORTRAIT_SVGS.heir, mentor: PORTRAIT_SVGS.mentor };
const RICONS: Record<RN, string> = { food: "🌾", wood: "🪵", stone: "🪨", iron: "⛏", coal: "◼", fish: "🐟", wool: "🐑", leather: "🧶", herbs: "🌿", tools: "🔧", weapons: "⚔️", medicine: "💊", silver: "🪙" };
const TICKER: RN[] = ["food", "wood", "stone", "iron", "tools", "weapons", "silver"];
const NAMES = ["Alden","Mira","Rowan","Elowen","Cedric","Brina","Osric","Tamsin","Gareth","Isolde","Perrin","Anwen","Edric","Liora","Maera","Alaric","Duncan","Maelys"];
const SURNAMES = ["Moss","Vale","Brook","Fenn","Ash","Reed","Thorne","Hart","Wold","Grey","Miller","Carver"];
const OCCS = ["farmer","woodcutter","herbalist","smith","fletcher","trapper","scribe","potter","goatherd","miller","guard","merchant"];
const SPX = ["Stone","Willow","Ash","Green","Iron","River","Oak","Fox","Wolf","Gold","Red","Black","White","High","East","West","Elder","Bright","Grim","Salt"];
const SSX = ["brook","fen","mere","hold","ford","gate","haven","ridge","vale","croft","wick","stead","bury","thorpe"];

const OCC_STYLE: Record<string, { tunic: string; tool: string }> = {
  farmer: { tunic: "#5a7a3a", tool: "🌾" }, woodcutter: { tunic: "#6b4423", tool: "🪓" },
  herbalist: { tunic: "#3a7a5a", tool: "🌿" }, smith: { tunic: "#4a4a4a", tool: "🔨" },
  fletcher: { tunic: "#7a6a3a", tool: "🏹" }, trapper: { tunic: "#5a4a3a", tool: "🪤" },
  scribe: { tunic: "#3a4a6a", tool: "📜" }, potter: { tunic: "#8a5a3a", tool: "🏺" },
  goatherd: { tunic: "#6a6a5a", tool: "🐐" }, miller: { tunic: "#8a7a5a", tool: "⚙" },
  guard: { tunic: "#4a3a3a", tool: "🗡" }, merchant: { tunic: "#6a3a5a", tool: "💰" },
};

const BUILDS: Building[] = [
  { id: "homes", name: "Timber Homes", level: 1, desc: "Warm hearths for new families.", prod: { food: -2 }, cost: { wood: 18, tools: 2, silver: 8 } },
  { id: "lumber", name: "Logging Camp", level: 1, desc: "Cutters bring wood from the pines.", prod: { wood: 10, leather: 2, herbs: 1 }, cost: { wood: 12, tools: 2, silver: 5 } },
  { id: "farm", name: "Farmstead", level: 1, desc: "Fields turn survival into abundance.", prod: { food: 18, wool: 2 }, cost: { wood: 10, tools: 3, silver: 8 } },
  { id: "mill", name: "Water Mill", level: 1, desc: "Grinds grain and draws travelers.", prod: { food: 10, silver: 4 }, cost: { wood: 22, stone: 8, tools: 4, silver: 18 } },
  { id: "mine", name: "Iron Mine", level: 1, desc: "Shafts bring iron at cost of danger.", prod: { iron: 6, coal: 3, stone: 2 }, cost: { wood: 20, stone: 14, tools: 4, silver: 22 } },
  { id: "smith", name: "Blacksmith", level: 1, desc: "Iron becomes tools becomes influence.", prod: { tools: 5, weapons: 1, iron: -2, coal: -1 }, cost: { wood: 15, stone: 12, iron: 6, silver: 20 } },
  { id: "market", name: "Market Square", level: 1, desc: "Merchants bring trade and ideas.", prod: { silver: 12, fish: 2 }, cost: { wood: 20, stone: 5, tools: 3, silver: 24 } },
  { id: "shrine", name: "Old Faith Shrine", level: 1, desc: "Ancestral stones soften despair.", prod: { herbs: 2, medicine: 1 }, cost: { stone: 10, wood: 8, silver: 10 } },
  { id: "watch", name: "Ranger Outpost", level: 1, desc: "Drilled watch discourages bandits.", prod: { weapons: -1, silver: -2 }, cost: { wood: 24, stone: 12, weapons: 3, silver: 32 } },
];

const EVENTS: DecEvt[] = [
  { id: "storm", title: "The Summer Storm", text: "A terrible storm has struck. Homes damaged, fields flooded.", crisis: true, opts: [
    { label: "Send workers to help", hint: "+trust", result: "Every free hand shored up roofs.", res: { silver: -10 }, rep: { trust: 6 }, pres: -1 },
    { label: "Assess the damage first", hint: "careful", result: "Losses catalogued before action.", rep: { respect: 2 } },
    { label: "Build drainage for the future", hint: "+prosperity", result: "New drainage ditches ordered.", res: { wood: -15 }, rep: { prosperity: 8 } } ] },
  { id: "bandits", title: "Bandits on the Road", text: "Raiders stalk merchants along the old road.", crisis: false, opts: [
    { label: "Drive them off by force", hint: "+fear", result: "Hunters ambushed the raiders.", res: { weapons: -3 }, rep: { fear: 6, respect: 4 } },
    { label: "Pay them to move on", hint: "-silver", result: "Silver bought a season of peace.", res: { silver: -25 }, rep: { trust: -2 } },
    { label: "Ignore and hope", hint: "risk", result: "Raiders stole grain from an outlying farm.", res: { food: -12 }, rep: { trust: -5 } } ] },
  { id: "pilgrim", title: "A Pilgrim's Blessing", text: "A wandering pilgrim asks to bless the hearth stones.", crisis: false, opts: [
    { label: "Welcome the blessing", hint: "+tradition", result: "The chant echoed through Hearthmere.", res: { herbs: 5 }, rep: { tradition: 6, trust: 2 } },
    { label: "Offer silver for the journey", hint: "-silver", result: "The pilgrim will speak well of the House.", res: { silver: -15 }, rep: { tradition: 8 } } ] },
  { id: "marriage", title: "A Marriage Proposal", text: "An envoy proposes a marriage alliance.", crisis: false, opts: [
    { label: "Accept the alliance", hint: "+prestige", result: "Vows exchanged beneath the old oak.", pres: 5, rep: { respect: 3 } },
    { label: "Decline respectfully", hint: "freedom", result: "Independence preserved for now.", rep: { respect: 1 } } ] },
  { id: "plague", title: "Whispers of Plague", text: "A fever appeared among the riverside crofts.", crisis: true, opts: [
    { label: "Quarantine the crofts", hint: "-medicine", result: "The sick were isolated and tended.", res: { medicine: -5 }, rep: { trust: -2, prosperity: 3 } },
    { label: "Pray at the shrine", hint: "+tradition", result: "Vigils held through the night.", res: { herbs: -4 }, rep: { tradition: 5 } } ] },
  { id: "harvest", title: "A Golden Harvest", text: "The fields yielded far beyond expectation.", crisis: false, opts: [
    { label: "Store it against winter", hint: "+food", result: "Granaries filled to the rafters.", res: { food: 40 }, rep: { prosperity: 4 } },
    { label: "Sell the surplus", hint: "+silver", result: "Merchants paid well for the grain.", res: { food: 10, silver: 35 }, rep: { prosperity: 6 } },
    { label: "Hold a feast", hint: "+trust", result: "The whole valley ate and danced.", res: { food: -10 }, rep: { trust: 10, tradition: 4 } } ] },
];

/* ───────── helpers ───────── */
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;
const cl = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const cl01 = (v: number) => cl(Math.round(v), 0, 100);
const seed = (n: number) => { const x = Math.sin(n * 999.13) * 10000; return x - Math.floor(x); };
const chRes = (r: Res, d: Partial<Res>): Res => { const n = { ...r }; for (const k of Object.keys(d) as RN[]) n[k] = Math.max(0, n[k] + (d[k] ?? 0)); return n; };
const afford = (r: Res, c: Partial<Res>) => (Object.keys(c) as RN[]).every(k => r[k] >= (c[k] ?? 0));
const fmtD = (d: Partial<Res>) => { const e = (Object.entries(d) as [RN, number][]).filter(([, v]) => v !== 0); return e.length ? e.map(([k, v]) => `${v > 0 ? "+" : ""}${Math.round(v)} ${k}`).join(", ") : "—"; };
const portrait = (m: Family, i: number) => m.id === "mentor" ? PORTRAITS.mentor : m.role.includes("Chief") ? PORTRAITS.ruler : i % 2 === 0 ? PORTRAITS.heir : PORTRAITS.spouse;
const renown = (r: number) => r > 80 ? "Renowned" : r > 60 ? "Respected" : r > 40 ? "Known" : "Obscure";
const sIcon = (t: SType, h: boolean) => h ? "♜" : t === "city" ? "🏛" : t === "town" ? "🏰" : t === "village" ? "🏠" : "🛖";
const sImg = (t: SType, h: boolean) => h ? SETTLEMENT_SVGS.hamlet : t === "city" ? SETTLEMENT_SVGS.city : t === "town" ? SETTLEMENT_SVGS.town : SETTLEMENT_SVGS.village;
const sArt = (t: SType, h: boolean) => h ? 760 : t === "city" ? 1150 : t === "town" ? 900 : t === "village" ? 660 : 520;
const chron = (y: number, s: Season, t: string, tx: string, tone: string): ChronEntry => ({ id: uid("c"), year: y, season: s, title: t, text: tx, tone });

/* ───────── world gen ───────── */function genWorld(cd?: CharData) {
  const regions: Region[] = ["Northern Marches","Heartlands","Western Highlands","Eastern Coast","Southern Wilds"];
  const houses = ["Veyne","Corwall","Dunmere","Ashford","Saltwyn","Grimhart","Elderbrook","Kestrel","Marrow","Brightmere"];
  const ambitions = ["a marriage pact","the disputed toll roads","royal favor","expanded mines","a rival claimant","eastern trade","an ancient shrine"];
  const banners = ["⚜","🛡","☾","♜","✦","⚔","🦌","🦅","🐺","⚓"];
  const mottos = ["Stone remembers","By river and crown","No winter breaks us","Trade is blood","The old roots endure"];
  const playerHouse = cd?.houseName ? `House ${cd.houseName}` : "House Sheatsley";
  const playerBanner = cd?.banner ? { Lion: "🦁", Eagle: "🦅", Oak: "🌳", Wolf: "🐺", Crown: "♚" }[cd.banner] : "♜";
  const playerMotto = cd?.region ? REGION_RES[cd.region].motto : "From quiet roots, lasting shade";
  const baronies: Barony[] = [];
  const settlements: Settlement[] = [];
  let si = 0;

  for (let i = 0; i < 50; i++) {
    const region = regions[i % 5];
    const c = RC[region];
    const slot = Math.floor(i / 5);
    const a = (slot / 10) * Math.PI * 2 + (i % 5) * 0.62 + seed(i) * 0.3;
    const r = 700 + slot * 240 + seed(i + 3) * 320;
    const x = cl(c.x + Math.cos(a) * r, 700, W - 700);
    const y = cl(c.y + Math.sin(a) * r * 0.8, 700, H - 700);
    const isP = i === 0;

    baronies.push({
      id: `b-${i}`,
      name: isP ? "Hearthmere Barony" : `${region.split(" ")[0]} ${i % 2 ? "Cross" : "Hold"} ${i + 1}`,
      house: isP ? playerHouse : `House ${houses[i % 10]}`,
      region, banner: isP ? playerBanner : banners[i % 10],
      motto: isP ? playerMotto : mottos[i % 5],
      eco: 35 + (i * 11) % 55, mil: 20 + (i * 17) % 70, dip: 25 + (i * 13) % 60,
      rel: isP ? 100 : i % 7 === 0 ? -12 : 8 + i % 18,
      ambition: ambitions[i % 7], x, y, color: RCOL[region],
    });

    const sc = 3 + i % 4;
    for (let s = 0; s < sc; s++) {
      const sa = (s / sc) * Math.PI * 2 + seed(i * 10 + s) * 1.1;
      const sr = s === 0 ? 0 : 420 + seed(i + s * 7) * 340;
      const sx = cl(x + Math.cos(sa) * sr, 400, W - 400);
      const sy = cl(y + Math.sin(sa) * sr * 0.85, 400, H - 400);
      let type: SType = "hamlet";
      if (s === 0 && i % 9 === 0) type = "city";
      else if (s === 0 && i % 4 === 0) type = "town";
      else if (s === 0 || i % 3 === 0) type = "village";
      if (isP && s === 0) type = "hamlet";
      settlements.push({
        id: `s-${si}`, bid: `b-${i}`,
        name: isP && s === 0 ? "Hearthmere" : `${SPX[si % SPX.length]}${SSX[(si * 3) % SSX.length]}`,
        type: isP && s === 0 ? "hamlet" : type, x: sx, y: sy,
        pop: type === "city" ? 800 + i % 5 * 120 : type === "town" ? 320 + i % 4 * 40 : type === "village" ? 110 + i % 6 * 18 : 40 + i % 5 * 8,
        home: isP && s === 0,
        desc: type === "city" ? "A walled seat of power, ringed with markets and towers." : type === "town" ? "A bustling market town where roads and ambitions meet." : type === "village" ? "A working village of farms, crafts and parish life." : "A small frontier settlement clinging to the land.",
      });
      si++;
    }
  }
  return { baronies, settlements };
}

function genCitizens(settlements: Settlement[]): Citizen[] {
  const out: Citizen[] = [];
  for (const s of settlements) {
    const n = s.home ? 20 : s.type === "city" ? 14 : s.type === "town" ? 10 : s.type === "village" ? 7 : 4;
    const artR = sArt(s.type, s.home) / 2;
    for (let i = 0; i < n; i++) {
      const k = out.length;
      // orbit ring sits on the OUTER streets/fields, never over the dense building core
      const ring = 0.56 + (i % 4) * 0.09 + seed(k * 5) * 0.05;
      out.push({
        id: `cz-${k}`, name: `${NAMES[k % NAMES.length]} ${SURNAMES[(k * 3) % SURNAMES.length]}`,
        occ: OCCS[k % OCCS.length], age: 16 + (k * 7) % 48, mood: 55 + k % 8,
        skills: { gathering: 2 + (k * 3) % 5, craft: 1 + (k * 5) % 5, combat: 1 + (k * 2) % 4, faith: 1 + (k * 4) % 5 },
        traits: [k % 4 === 0 ? "hardworking" : "easygoing", k % 3 === 0 ? "pious" : "practical"],
        memories: k % 3 === 0 ? ["Remembers Landon sharing winter meat.", "Hopes to marry before the harvest."] : ["Carries no famous story yet.", "Dreams of seeing a great city."],
        sid: s.id, orbit: Math.round(artR * ring), dur: 46 + seed(k * 11) * 60, phase: seed(k * 13) * 100, rev: k % 3 === 0,
      });
    }
  }
  return out;
}

type CharData = { region: RegionChoice; gender: GenderChoice; firstName: string; houseName: string; banner: BannerChoice; path: string };

const REGION_RES: Record<RegionChoice, Partial<Res> & { motto: string; difficulty: number }> = {
  "Forest Valley":     { food: 60, wood: 110, stone: 14, iron: 4, fish: 6, wool: 8, herbs: 28, leather: 16, motto: "Deep roots, strong timber", difficulty: 1 },
  "Golden Plains":     { food: 120, wood: 48, stone: 18, iron: 6, fish: 4, wool: 20, herbs: 8, leather: 8, silver: 45, motto: "From golden fields, abundance", difficulty: 1 },
  "Mountain Highlands":{ food: 40, wood: 56, stone: 40, iron: 22, coal: 6, wool: 6, herbs: 6, leather: 8, motto: "Stone endures, iron conquers", difficulty: 2 },
  "Coastal Bay":       { food: 54, wood: 60, stone: 18, iron: 6, fish: 28, wool: 10, herbs: 12, leather: 6, silver: 30, motto: "Tides bring fortune", difficulty: 1.5 },
  "River Kingdom":     { food: 96, wood: 66, stone: 20, iron: 6, fish: 16, wool: 14, herbs: 14, leather: 10, silver: 20, motto: "The river provides, the river protects", difficulty: 1.5 },
};

function initGame(cd?: CharData): GS {
  const { baronies, settlements } = genWorld(cd);
  const home = settlements.find(s => s.home)!;
  const regionChoice = cd?.region ?? "Golden Plains";
  const rc = REGION_RES[regionChoice];
  const houseName = cd?.houseName ?? "Sheatsley";
  const firstName = cd?.firstName ?? "Landon";
  const gender = cd?.gender ?? "male";
  const title = gender === "female" ? "Chieftess" : "Chief";
  const bannerIcon = cd?.banner ? { Lion: "🦁", Eagle: "🦅", Oak: "🌳", Wolf: "🐺", Crown: "♚" }[cd.banner] : "♜";
  const rulerPath = cd?.path ?? "Forest & Beast";

  // Place home in chosen region
  const regionPos = { "Forest Valley": { x: 3500, y: 5000 }, "Golden Plains": { x: 7500, y: 5500 }, "Mountain Highlands": { x: 6500, y: 1800 }, "Coastal Bay": { x: 12000, y: 4800 }, "River Kingdom": { x: 2500, y: 7200 } }[regionChoice];
  const pos = regionPos;

  const ruler: Family = { id: "ruler", name: `${firstName} ${houseName}`, age: 40, role: `${title} of Hearthmere`, path: rulerPath as Path, traits: ["orphaned", "patient", "woods-wise"], status: "Living" };

  // Scale resources by difficulty (harder = fewer starting resources)
  const diffScale = 1 / rc.difficulty;
  const baseRes: Res = { food: 86, wood: 72, stone: 22, iron: 8, coal: 0, fish: 10, wool: 14, leather: 12, herbs: 16, tools: 7, weapons: 3, medicine: 2, silver: 35 };
  const merged = { ...baseRes } as Res;
  for (const k of Object.keys(rc) as RN[]) merged[k] = Math.round((rc[k as keyof typeof rc] as number ?? baseRes[k]) * diffScale);

  return {
    day: 1, year: 1, season: "Spring", ruler, motto: rc.motto, rank: "Hamlet", prestige: 4,
    pop: 74, popCap: 130,
    res: merged,
    rate: { food: -5, wood: 10, stone: 0, iron: 0, tools: 0, weapons: 0, silver: 1 }, rep: { trust: 48, respect: 32, fear: 5, prosperity: 28, tradition: 42 },
    family: [ruler, { id: "mentor", name: "Old Mara Wold", age: 71, role: "Mentor", path: "Scholar", traits: ["stern", "beloved"], status: "Living" }],
    citizens: genCitizens(settlements),
    buildings: [{ ...BUILDS[0], level: 1 }, { ...BUILDS[1], level: 1 }, { ...BUILDS[7], level: 1 }],
    baronies, settlements,
    chronicle: [chron(1, "Spring", "The Chronicle Opens", `${firstName} ${houseName} accepted the burden of Hearthmere. The first page of House ${houseName} was written.`, "hope")],
    selBid: home.bid, selSid: home.id, selCid: null, evt: null,
    toast: { title: "A New Chief Rises", body: "Press ▶ to let time flow across the Realm.", portrait: PORTRAITS.ruler },
    prices: { food: 2, wood: 3, stone: 4, iron: 8, coal: 6, fish: 3, wool: 4, leather: 6, herbs: 5, tools: 10, weapons: 15, medicine: 18, silver: 1 },
    caravans: [], alliances: [], army: { militia: 8, archers: 3, spearmen: 2, knights: 0, royalGuard: 0, captains: [], training: 12 }, atWar: [],
    roads: [], factions: [], citizenMemories: [], demotions: 0, battlesFought: 0, lineagesBorn: 0, peakRank: "Hamlet", dynastyExtinct: false,
    vassals: [], successionCrisis: null, civilWarActive: false,
    factionRep: baronies.filter(b => b.id !== home.bid).map(b => ({ bid: b.id, trust: 0, grudge: 0, fear: 0, respect: 0, actions: [], genGrudges: [] })),
  };
}

function seasonRate(g: GS): Partial<Res> {
  const d: Partial<Res> = { food: -Math.ceil(g.pop / 18), silver: 1 };
  for (const b of g.buildings) for (const [k, v] of Object.entries(b.prod) as [RN, number][]) {
    const m = k === "food" && g.season === "Autumn" ? 1.6 : k === "food" && g.season === "Winter" ? 0.45 : 1;
    d[k] = (d[k] ?? 0) + v * b.level * m;
  }
  if (g.season === "Winter") { d.wood = (d.wood ?? 0) - 8; d.medicine = (d.medicine ?? 0) - 1; }
  if (g.season === "Summer") { d.stone = (d.stone ?? 0) + 3; d.iron = (d.iron ?? 0) + 2; }
  return d;
}
const promoteRank = (g: GS) => { const s = g.pop + g.prestige * 2 + g.rep.prosperity; return s > 2000 ? "King of the Realm" : s > 1500 ? "Regional Lord" : s > 1100 ? "Great Barony" : s > 780 ? "Small Barony" : s > 580 ? "Petty Barony" : s > 430 ? "City" : s > 300 ? "Town" : s > 210 ? "Village" : "Hamlet"; };
const demotionThreshold = (rank: string) => ({ "King of the Realm": 1500, "Regional Lord": 1000, "Great Barony": 700, "Small Barony": 500, "Petty Barony": 350, "City": 220, "Town": 140, "Village": 70, "Hamlet": 0 } as Record<string, number>)[rank] ?? 0;

/* ───── faction reputation helpers ───── */
function recordFactionAction(rep: FactionReputation[], bid: string, action: ActionType, magnitude: number, year: number, season: Season, text: string): FactionReputation[] {
  return rep.map(fr => {
    if (fr.bid !== bid) return fr;
    const trustDelta = (
      action === "raid" ? -magnitude * 1.5 : action === "war_victory" ? -magnitude * 2 : action === "war_defeat" ? magnitude * 0.5 :
      action === "alliance_formed" ? magnitude * 1.2 : action === "alliance_broken" ? -magnitude * 2.5 : action === "peace" ? magnitude * 0.8 :
      action === "negotiate" ? magnitude * 0.5 : action === "trade_gift" ? magnitude * 0.3 : action === "betrothal" ? magnitude * 1.5 :
      action === "vassal" ? magnitude * 0.2 : action === "betrayal" ? -magnitude * 3 : 0
    );
    const fearDelta = (
      action === "raid" ? magnitude * 1.2 : action === "war_victory" ? magnitude * 1.8 : action === "war_defeat" ? -magnitude * 0.5 :
      action === "betrayal" ? magnitude * 0.5 : 0
    );
    const respectDelta = (
      action === "war_victory" ? magnitude * 0.8 : action === "war_defeat" ? -magnitude * 0.4 : action === "negotiate" ? magnitude * 0.2 :
      action === "trade_gift" ? magnitude * 0.15 : action === "alliance_formed" ? magnitude * 0.5 : action === "betrothal" ? magnitude * 0.8 : 0
    );
    const newTrust = cl(fr.trust + trustDelta, -100, 100);
    const newFear = cl01(fr.fear + fearDelta);
    const newRespect = cl01(fr.respect + respectDelta);
    const grudgeDelta = (action === "raid" ? magnitude * 0.6 : action === "war_victory" ? magnitude * 0.8 : action === "betrayal" ? magnitude * 1.2 : action === "alliance_broken" ? magnitude * 0.5 : 0);
    const newGrudge = cl01(fr.grudge + grudgeDelta);
    const newGrudges = [...fr.genGrudges];
    if (grudgeDelta > 3) {
      newGrudges.push({ text, born: year, decayed: false });
      if (newGrudges.length > 8) newGrudges.splice(0, newGrudges.length - 8);
    }
    const actionEntry: ActionRecord = { year, season, action, magnitude, text };
    const newActions = [actionEntry, ...fr.actions].slice(0, 30);
    return { ...fr, trust: newTrust, grudge: newGrudge, fear: newFear, respect: newRespect, actions: newActions, genGrudges: newGrudges };
  });
}
function getBaronyRep(rep: FactionReputation[], bid: string): FactionReputation | undefined { return rep.find(fr => fr.bid === bid); }

/* ───────── component ───────── */
export function GameClient({ charData, onEnding, onSave }: { charData?: { region: RegionChoice; gender: GenderChoice; firstName: string; houseName: string; banner: BannerChoice; path: string }; onEnding?: (data: EndingData) => void; onSave?: () => void }) {
  const [g, setG] = useState<GS>(() => initGame(charData));
  const [mapReady, setMapReady] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [speed, setSpeed] = useState(0);
  const [battleSetup, setBattleSetup] = useState<BattleSetup | null>(null);
  const [notice, setNotice] = useState("Press ▶ to let time flow. Drag to explore, scroll to zoom. Arrow keys pan, Space toggles time, Esc closes panels.");
  const [cSearch, setCSearch] = useState("");
  const [rSearch, setRSearch] = useState("");
  const [cTone, setCTone] = useState<"all" | ChronEntry["tone"]>("all");
  const [cTab, setCTab] = useState<"Info" | "Skills" | "Memories">("Info");
  const [confirmReset, setConfirmReset] = useState(false);

  // Auth
  const auth = useAuth();
  const [cam, setCam] = useState({ x: 0, y: 0, z: 0.35 });
  const [vp, setVp] = useState({ w: 1280, h: 800 });
  const [hover, setHover] = useState<{ x: number; y: number; label: string; sub: string } | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ on: false, sx: 0, sy: 0, cx: 0, cy: 0, moved: false });
  const speedRef = useRef(speed); speedRef.current = speed;

  const camRef = useRef(cam); camRef.current = cam;

  const home = useMemo(() => g.settlements.find(s => s.home) ?? g.settlements[0], [g.settlements]);
  const selB = g.baronies.find(b => b.id === g.selBid) ?? g.baronies[0];
  const selS = g.settlements.find(s => s.id === g.selSid) ?? home;
  const selC = g.citizens.find(c => c.id === g.selCid) ?? null;
  const living = g.family.filter(m => m.status === "Living");

  const center = useCallback((wx: number, wy: number, z?: number) => {
    setCam(c => { const zz = z ?? c.z; return { x: cl(wx - vp.w / (2 * zz), 0, Math.max(0, W - vp.w / zz)), y: cl(wy - vp.h / (2 * zz), 0, Math.max(0, H - vp.h / zz)), z: zz }; });
  }, [vp]);

  /* persistence + viewport */
  useEffect(() => {
    const base = new Image();
    base.decoding = "async";
    base.onload = () => setMapReady(true);
    base.onerror = () => setMapReady(true);
    base.src = REALM_MAP;
    const idle = window.setTimeout(() => {
      for (const src of [SETTLEMENT_SVGS.hamlet, SETTLEMENT_SVGS.village, SETTLEMENT_SVGS.town, SETTLEMENT_SVGS.city]) {
        const img = new Image();
        img.decoding = "async";
        img.src = src;
      }
    }, 120);
    return () => window.clearTimeout(idle);
  }, []);
  useEffect(() => { try { const d = localStorage.getItem("dotr-v8"); if (d) { const p = JSON.parse(d) as GS; if (p.prices && p.army && p.settlements?.length && typeof p.day === "number") { setG(p); setNotice("Chronicle restored."); } } } catch { /* ignore */ } }, []);
  useEffect(() => { const t = setTimeout(() => localStorage.setItem("dotr-v8", JSON.stringify(g)), 400); return () => clearTimeout(t); }, [g]);
  useEffect(() => { const fn = () => { if (!mapRef.current) return; const r = mapRef.current.getBoundingClientRect(); setVp({ w: r.width, h: r.height }); }; fn(); window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn); }, []);
  useEffect(() => { center(home.x, home.y, 0.55); }, [vp.w, vp.h]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── REAL-TIME CLOCK ── */
  useEffect(() => {
    if (speed === 0) return;
    const id = setInterval(() => {
      setG(prev => {
        if (prev.evt) return prev;
        const step = speed;
        let day = prev.day + step, year = prev.year, season = prev.season;
        let family = prev.family, ruler = prev.ruler, pop = prev.pop, popCap = prev.popCap, prestige = prev.prestige;
        let lineagesBorn = prev.lineagesBorn;
        const extra: ChronEntry[] = [];
        let toast = prev.toast;
        let seasonRoads: Road[] | null = null;
        let rep = { ...prev.rep };
        const rate = seasonRate(prev);
        let res = chRes(prev.res, Object.fromEntries((Object.entries(rate) as [RN, number][]).map(([k, v]) => [k, v * step / DAYS_PER_SEASON])) as Partial<Res>);

        // caravans
        const arrived = prev.caravans.filter(c => c.days - step <= 0);
        const caravans = prev.caravans.filter(c => c.days - step > 0).map(c => ({ ...c, days: c.days - step }));
        if (arrived.length) {
          const inc = arrived.reduce((a, c) => a + c.silver, 0);
          res = chRes(res, { silver: inc });
          extra.push(chron(year, season, "Caravan Returned", `Traders returned with ${inc} silver.`, "trade"));
        }

        // season / year boundary
        if (day > DAYS_PER_SEASON) {
          day -= DAYS_PER_SEASON;
          const ni = (SEASONS.indexOf(season) + 1) % 4;
          season = SEASONS[ni];
          if (ni === 0) {
            year += 1;
            const hunger = res.food < pop / 3;
            pop = Math.max(24, Math.min(popCap, pop + Math.max(-4, Math.min(6, Math.round(rep.prosperity / 18) - (hunger ? 6 : 0)))));
            const lc = family.filter(m => m.status === "Living").length;
            family = family.map(m => {
              if (m.status !== "Living") return m;
              const age = m.age + 1;
              if (age > 65 && lc > 1 && Math.random() < Math.min(0.3, (age - 65) * 0.018)) {
                extra.push(chron(year, season, `${m.name} Passes`, `${m.name} died peacefully at ${age}.`, "grief"));
                return { ...m, age, status: "Dead" as const };
              }
              if (age === 16 && m.role === "Child of the House") {
                toast = { title: "Come of Age", body: `${m.name} is ready for responsibility.`, portrait: portrait(m, 1) };
                extra.push(chron(year, season, `${m.name} Comes of Age`, `${m.name} turned sixteen.`, "hope"));
              }
              return { ...m, age };
            });
            const heirs = family.filter(m => m.status === "Living" && m.id !== "mentor").length;
            if (heirs < 3 && year > 1 && Math.random() < 0.55) {
              const ch: Family = { id: uid("h"), name: `${NAMES[(year + pop) % NAMES.length]} Sheatsley`, age: 0, role: "Child of the House", path: PATHS[(year + prestige) % PATHS.length], traits: ["curious"], status: "Living" };
              family = [...family, ch];
              extra.push(chron(year, season, "An Heir Is Born", `${ch.name} born beneath the banner.`, "hope"));
              lineagesBorn += 1;
            }
            const rr = family.find(m => m.id === ruler.id);
            if (rr?.status === "Dead") {
              const cand = family.filter(m => m.status === "Living" && m.id !== "mentor").sort((a, b) => b.age - a.age)[0];
              if (cand) { ruler = { ...cand, role: "Chief of Hearthmere" }; family = family.map(m => m.id === cand.id ? ruler : m); const ph = prev.baronies[0]?.house ?? "House Sheatsley"; extra.unshift(chron(year, season, `${cand.name} Takes the Seat`, `${cand.name} rose to lead ${ph}.`, "glory")); toast = { title: "A New Chief", body: `${cand.name} now leads the House.`, portrait: portrait(cand, 0) }; }
            } else ruler = family.find(m => m.id === ruler.id) ?? ruler;
            prestige += 1;
          }
          extra.push(chron(year, season, `${season} Arrives`, season === "Winter" ? "Snow settles over the valley; stores begin to thin." : season === "Spring" ? "Thaw comes and the fields are turned." : season === "Summer" ? "Long days bring building and trade." : "Harvest and taxes fill the barns.", "hope"));

          // ──── ROAD EVOLUTION (season boundary) ────
          let roads = [...(prev.roads ?? [])];
          if (prev.settlements.length > 1) {
            for (const a of prev.settlements) for (const b of prev.settlements) {
              if (a.id >= b.id) continue;
              const dist = Math.hypot(a.x - b.x, b.y - a.y);
              if (dist > 2500) continue;
              const existing = roads.find(r => (r.fromSid === a.id && r.toSid === b.id) || (r.fromSid === b.id && r.toSid === a.id));
              const traffic = Math.min(200, (a.pop + b.pop) / 20 + (existing?.traffic ?? 0) * (existing?.decayed ? 0.7 : 0.95));
              const level = traffic > 140 ? 3 : traffic > 75 ? 2 : traffic > 3 ? 1 : 0;
              if (level === 0) continue;
              if (existing) {
                existing.traffic = traffic;
                existing.level = level;
                existing.decayed = false;
              } else {
                roads.push({ id: uid("rd"), fromSid: a.id, toSid: b.id, level, traffic, decayed: false });
              }
            }
          }
          // Ghost roads: if a settlement's pop dropped hard, decay its roads
          for (const r of roads) {
            if (r.decayed) continue;
            const a = prev.settlements.find(s => s.id === r.fromSid);
            const b2 = prev.settlements.find(s => s.id === r.toSid);
            if (a && b2 && (a.pop < 30 || b2.pop < 30)) {
              r.decayed = true;
              r.level = Math.max(2, r.level - 1);
            }
          }
          seasonRoads = roads;
          // ──── VASSAL TRIBUTE ────
          const tributeSilver = prev.vassals.filter(v => v.loyalty > 25).reduce((s, v) => s + v.tribute, 0);
          if (tributeSilver > 0) res = chRes(res, { silver: tributeSilver });
          const hungry = res.food < pop / 3;
          rep = { ...rep, trust: cl01(rep.trust + (hungry ? -4 : 1)), prosperity: cl01(rep.prosperity + (res.silver > 60 ? 2 : 0) + (hungry ? -5 : 1)), tradition: cl01(rep.tradition + (prev.buildings.some(b => b.id === "shrine") ? 1 : 0)) };
        }

        // drifting AI world
        let baronies = prev.baronies;
        if (Math.random() < 0.05 * step) {
          baronies = prev.baronies.map((b, i) => { const p = ((i * 5 + b.eco + b.mil) % 9) - 4; return { ...b, eco: cl01(b.eco + p * 0.4), mil: cl01(b.mil + (p > 0 ? 1 : -0.5)), rel: cl(b.rel + (p > 2 ? -1 : 0.4), -100, 100) }; });
        }

        // random decision event
        let evt: DecEvt | null = null;
        if (Math.random() < 0.008 * step) evt = EVENTS[Math.floor(Math.random() * EVENTS.length)];

        const ng: GS = { ...prev, day, year, season, res, rate, pop, popCap, family, ruler, prestige, rep, caravans, baronies, evt, toast, chronicle: extra.length ? [...extra.reverse(), ...prev.chronicle].slice(0, 400) : prev.chronicle };
        if (seasonRoads) ng.roads = seasonRoads;
        // ──── DEMOTION CHECK ────
        const rank = promoteRank(ng);
        const RANK_ORDER = ["Hamlet","Village","Town","City","Petty Barony","Small Barony","Great Barony","Regional Lord","King of the Realm"];
        const prevRankIdx = RANK_ORDER.indexOf(prev.rank);
        const newRankIdx = (["Hamlet","Village","Town","City","Petty Barony","Small Barony","Great Barony","Regional Lord","King of the Realm"]).indexOf(rank);
        let demotions = prev.demotions;
        let dynastyExtinct = prev.dynastyExtinct;
        let civilWarActive = prev.civilWarActive;
        if (newRankIdx < prevRankIdx) {
          demotions += 1;
          popCap = Math.max(60, Math.round(popCap * 0.7));
          ng.chronicle = [chron(year, season, `Fallen to ${rank}`, `The House has been humbled — fortifications breached, wealth plundered.`, "grief"), ...ng.chronicle];
          ng.rep = { ...rep, respect: cl01(rep.respect - 12), fear: cl01(rep.fear - 8), prosperity: cl01(rep.prosperity - 15) };
          ng.res = chRes(ng.res, { silver: -Math.floor(ng.res.silver * 0.4), food: -Math.floor(ng.res.food * 0.25) } as Partial<Res>);
          ng.pop = Math.max(24, Math.round(ng.pop * 0.6));
        } else if (newRankIdx > prevRankIdx) {
          ng.chronicle = [chron(year, season, `Risen to ${rank}`, `Hearthmere is now spoken of as a ${rank.toLowerCase()}.`, "glory"), ...ng.chronicle];
          ng.popCap = Math.round(popCap * 1.4);
        }
        ng.rank = rank;
        ng.demotions = demotions;
        ng.peakRank = newRankIdx > RANK_ORDER.indexOf(prev.peakRank) ? rank : prev.peakRank;

        // ──── CITIZEN MEMORY SPREADING ────
        let memories = (prev.citizenMemories ?? []).map(m => ({ ...m, spreadTo: [...m.spreadTo] }));
        if (Math.random() < 0.02 * step) {
          const tone = ng.res.food < ng.pop / 3 ? "grief" : ng.atWar.length > 0 ? "warning" : ng.rep.trust > 70 ? "hope" : "faith";
          const idx = Math.floor(Math.random() * ng.citizens.length);
          const c = ng.citizens[idx];
          if (c) {
            const m: MemoryObj = { id: uid("mem"), text: `${c.name} remembers ${tone === "grief" ? "the hunger" : tone === "warning" ? "the drums of war" : tone === "hope" ? "the golden harvest" : "the old ways"}.`, tone, year, season, spreadTo: [] };
            memories.push(m);
          }
        }
        for (const m of memories) {
          if (Math.random() < 0.15 * step) {
            const nearby = ng.citizens.filter(c => !m.spreadTo.includes(c.id)).slice(0, 3);
            for (const c of nearby) m.spreadTo.push(c.id);
          }
        }
        if (memories.length > 200) memories = memories.slice(-200);
        ng.citizenMemories = memories;

        // ──── LOYALTY & FACTIONS ────
        const loyaltyScore = cl01(ng.rep.trust + ng.rep.tradition / 2 - (ng.rep.fear > 30 ? 10 : 0) - (ng.atWar.length * 8) - (demotions * 15));
        let factions = (prev.factions ?? []).map(f => ({ ...f }));
        if (loyaltyScore < 35 && Math.random() < 0.04 * step && factions.length < 3) {
          factions.push({
            id: uid("fc"), name: ["The Discontented","Shadow Council","Free Soil Pact","The Broken Hearth"][factions.length],
            goal: ["lower taxes","end the war","new leadership","return to old ways"][factions.length],
            members: Math.floor(ng.pop * (0.08 + Math.random() * 0.12)),
            aggression: 10 + Math.floor(Math.random() * 40),
            loyalty: loyaltyScore,
          });
        }
        // Faction events
        for (const f of factions) {
          if (Math.random() < 0.03 * step && f.aggression > 50) {
            if (Math.random() < 0.4) {
              ng.res = chRes(ng.res, { food: -8, silver: -5 } as Partial<Res>);
              ng.chronicle = [chron(year, season, `${f.name} Strikes`, `Workers withheld their labor — stores diminished.`, "warning"), ...ng.chronicle];
            } else if (Math.random() < 0.2) {
              ng.pop = Math.max(24, ng.pop - Math.floor(f.members * 0.3));
              ng.chronicle = [chron(year, season, `${f.name} Flees`, `${Math.floor(f.members * 0.3)} souls abandoned the settlement.`, "grief"), ...ng.chronicle];
            }
          }
          f.aggression = cl01(f.aggression + (loyaltyScore < 30 ? 3 : -2));
          if (f.aggression > 90) {
            ng.res = chRes(ng.res, { silver: -15, food: -5 } as Partial<Res>);
            ng.rep.trust = cl01(ng.rep.trust - 8);
            f.aggression = cl01(f.aggression - 40);
            ng.chronicle = [chron(year, season, `${f.name} Rises`, `A criminal faction seized a storehouse before the guard restored order.`, "warning"), ...ng.chronicle];
          }
        }
        factions = factions.filter(f => f.members > 2 && f.aggression > 0);
        ng.factions = factions;

        // ──── AI WARS ────
        if (Math.random() < 0.015 * step) {
          const aggressor = baronies[Math.floor(Math.random() * baronies.length)];
          const target = baronies.filter(b => b.id !== aggressor.id && Math.hypot(b.x - aggressor.x, b.y - aggressor.y) < 2500)[0];
          if (target && aggressor.id !== prev.baronies[0]?.id) {
            const outcome = Math.random();
            if (outcome < 0.4) {
              baronies = baronies.map(b => b.id === target.id ? { ...b, mil: cl01(b.mil - 15), eco: cl01(b.eco - 10), rel: cl(b.rel - 10, -100, 100) } : b);
              ng.chronicle = [chron(year, season, "War in the Realm", `${aggressor.house} raided ${target.house}.`, "warning"), ...ng.chronicle];
            } else if (outcome < 0.7) {
              baronies = baronies.map(b => b.id === aggressor.id ? { ...b, mil: cl01(b.mil - 8) } : b);
            }
          }
        }
        ng.baronies = baronies;
        // ──── DYNASTY EXTINCTION CHECK ────
        const livingHeirs = ng.family.filter(m => m.status === "Living" && m.id !== "mentor");
        if (livingHeirs.length === 0 && ng.year > 1) {
          dynastyExtinct = true;
        }
        ng.dynastyExtinct = dynastyExtinct;
        ng.lineagesBorn = lineagesBorn;

        // ──── CROWN ERA: SUCCESSION CRISIS ────
        let successionCrisis = prev.successionCrisis;
        if (rank === "King of the Realm" && !successionCrisis) {
          const adultHeirs = family.filter(m => m.status === "Living" && m.id !== "mentor" && m.age >= 16);
          if (adultHeirs.length >= 2 && Math.random() < 0.06 * step) {
            successionCrisis = {
              id: uid("cr"),
              claimants: adultHeirs.slice(0, 4).map((h, i) => ({
                name: h.name, age: h.age,
                support: 20 + Math.round(seed(i * 7 + year) * 55),
                traits: h.traits.slice(0, 2),
              })),
              resolved: false, year,
            };
            ng.chronicle = [chron(year, season, "A Crown Contested", `Multiple claimants vie for the throne. The court is divided.`, "warning"), ...ng.chronicle];
          }
        }
        // If crisis resolved, apply effects
        if (successionCrisis?.resolved && successionCrisis !== prev.successionCrisis) {
          const winner = successionCrisis.claimants.reduce((a, b) => a.support > b.support ? a : b);
          rep = { ...rep, respect: cl01(rep.respect - 5), trust: cl01(rep.trust - 8) };
          const losers = successionCrisis.claimants.filter(c => c.name !== winner.name);
          if (losers.length > 0 && Math.random() < 0.5) {
            civilWarActive = true;
            ng.chronicle = [chron(year, season, "Civil War Erupts", `${losers[0].name} raised a banner against the throne.`, "grief"), ...ng.chronicle];
            ng.atWar = [...new Set([...ng.atWar, ...prev.baronies.filter(b => Math.random() < 0.3).map(b => b.id)])];
          }
          successionCrisis = null;
        }
        ng.successionCrisis = successionCrisis;

        // ──── CROWN ERA: VASSAL LOYALTY & CIVIL WAR ────
        let vassals = prev.vassals.map(v => ({ ...v }));
        if (rank === "King of the Realm" || rank === "Regional Lord") {
          for (const v of vassals) {
            const barony = baronies.find(b => b.id === v.bid);
            if (!barony) continue;
            const relEffect = (barony.rel - 20) * 0.3;
            const prosperityEffect = (rep.prosperity - 30) * 0.2;
            v.loyalty = cl01(v.loyalty + relEffect + prosperityEffect + (Math.random() - 0.5) * 4 * step);
            if (v.loyalty < 15 && Math.random() < 0.03 * step) {
              vassals = vassals.filter(x => x.bid !== v.bid);
              ng.chronicle = [chron(year, season, `${barony.house} Breaks Free`, `${barony.house} renounced vassalage to the Crown.`, "warning"), ...ng.chronicle];
            }
          }
          // Civil war check
          const rebels = vassals.filter(v => v.loyalty < 20);
          if (rebels.length >= 3 && !civilWarActive) {
            civilWarActive = true;
            ng.chronicle = [chron(year, season, "The Realm Fractures", `${rebels.length} vassal houses rose in open rebellion.`, "grief"), ...ng.chronicle];
            ng.atWar = [...new Set([...ng.atWar, ...rebels.map(r => r.bid)])];
          }
          if (civilWarActive && rebels.length === 0) {
            civilWarActive = false;
            ng.chronicle = [chron(year, season, "The Realm Restored", "The Crown has crushed the rebellion. Peace, for now.", "glory"), ...ng.chronicle];
          }
        }
        ng.vassals = vassals;
        ng.civilWarActive = civilWarActive;

        // ──── FACTION REPUTATION: generational grudge decay ────
        ng.factionRep = (prev.factionRep ?? []).map(fr => {
          const newGrudges = fr.genGrudges.map(g => {
            const age = year - g.born;
            if (age >= 8) return { ...g, decayed: true };
            return g;
          });
          return {
            ...fr,
            trust: fr.trust > 0 ? fr.trust - 1 : fr.trust + 1,
            grudge: Math.max(0, fr.grudge - (season === "Winter" ? 3 : 1)),
            fear: Math.max(0, fr.fear - 1),
            respect: Math.min(100, fr.respect + (fr.respect > 20 ? 0 : 1)),
            genGrudges: newGrudges.filter(g => !g.decayed || year - g.born < 12),
          };
        });

        return ng;
      });
    }, 500);
    return () => clearInterval(id);
  }, [speed]);

  // clear confirmReset after timeout
  useEffect(() => { if (confirmReset) { const t = setTimeout(() => setConfirmReset(false), 5000); return () => clearTimeout(t); } }, [confirmReset]);

  // pause automatically when an event demands a decision
  useEffect(() => { if (g.evt && speedRef.current !== 0) { setSpeed(0); setNotice("Time paused — the council awaits your decision."); } }, [g.evt]);

  // dynasty extinction → trigger ending
  useEffect(() => {
    if (g.dynastyExtinct && onEnding) {
      setSpeed(0);
      const endingData: EndingData = {
        chronicle: g.chronicle,
        houseName: charData?.houseName ?? "Sheatsley",
        firstName: charData?.firstName ?? g.ruler.name.split(" ")[0],
        startYear: 1,
        endYear: g.year,
        settlements: g.settlements.map(s => ({ id: s.id, name: s.name, type: s.type, x: s.x, y: s.y, peakType: s.type })),
        peakRank: g.peakRank,
        totalPrestige: g.prestige,
        battlesFought: g.battlesFought,
        lineagesBorn: g.lineagesBorn,
        demotions: g.demotions,
      };
      setTimeout(() => onEnding(endingData), 2000);
    }
  }, [g.dynastyExtinct]);

  /* ── actions ── */
  const resolveEvt = (o: EvtOpt) => { setConfirmReset(false); setG(p => { if (!p.evt) return p; const rep = { ...p.rep }; for (const [k, v] of Object.entries(o.rep ?? {}) as [keyof Rep, number][]) rep[k] = cl01(rep[k] + v); return { ...p, res: chRes(p.res, o.res ?? {}), rep, prestige: p.prestige + (o.pres ?? 0), evt: null, chronicle: [chron(p.year, p.season, p.evt.title, o.result, "warning"), ...p.chronicle] }; }); };

  const build = (t: Building) => { setConfirmReset(false); setG(p => {
    const ex = p.buildings.find(b => b.id === t.id);
    const sc = Object.fromEntries(Object.entries(t.cost).map(([k, v]) => [k, Math.ceil((v ?? 0) * (ex ? ex.level + 1 : 1))])) as Partial<Res>;
    if (!afford(p.res, sc)) { setNotice(`Need ${fmtD(sc)}`); return p; }
    setNotice(`${t.name} ${ex ? "upgraded" : "built"}.`);
    return { ...p, buildings: ex ? p.buildings.map(b => b.id === t.id ? { ...b, level: b.level + 1 } : b) : [...p.buildings, { ...t, level: 1 }], res: chRes(p.res, Object.fromEntries(Object.entries(sc).map(([k, v]) => [k, -(v ?? 0)])) as Partial<Res>), prestige: p.prestige + (ex ? 2 : 3), rep: { ...p.rep, prosperity: cl01(p.rep.prosperity + 3) }, chronicle: [chron(p.year, p.season, `${t.name} ${ex ? "Improved" : "Founded"}`, t.desc, "glory"), ...p.chronicle] };
  }); };

  const trainAct = () => { setConfirmReset(false); setG(p => { if (p.army.training >= 100) { setNotice("Training already at maximum."); return p; } if (!afford(p.res, { food: 10, weapons: 2, silver: 12 })) { setNotice("Need food, weapons and silver."); return p; } setNotice("The militia drilled in the yard."); return { ...p, res: chRes(p.res, { food: -10, weapons: -2, silver: -12 }), prestige: p.prestige + 2, army: { ...p.army, training: cl01(p.army.training + 4) }, rep: { ...p.rep, respect: cl01(p.rep.respect + 4), fear: cl01(p.rep.fear + 3) }, chronicle: [chron(p.year, p.season, "Militia Muster", "Hearthmere drilled under ash poles.", "glory"), ...p.chronicle] }; }); };

  const council = (pol: "mercy" | "trade" | "tradition" | "envoys") => {
    setConfirmReset(false);
    const ch: Record<typeof pol, Partial<Rep>> = { mercy: { trust: 6, fear: -2 }, trade: { prosperity: 6 }, tradition: { tradition: 7, trust: 2 }, envoys: { respect: 4, prosperity: 2 } };
    const titles: Record<typeof pol, string> = { mercy: "Merciful Judgment", trade: "Merchants Welcomed", tradition: "Ancestor Law Renewed", envoys: "Envoys Dispatched" };
    setG(p => { const rep = { ...p.rep }; for (const [k, v] of Object.entries(ch[pol]) as [keyof Rep, number][]) rep[k] = cl01(rep[k] + v); const baronies = pol === "envoys" ? p.baronies.map((b, i) => i < 10 ? { ...b, rel: cl(b.rel + 5, -100, 100) } : b) : p.baronies; setNotice(titles[pol]); return { ...p, rep, baronies, prestige: p.prestige + 1, chronicle: [chron(p.year, p.season, titles[pol], `The council chose ${titles[pol].toLowerCase()}.`, "faith"), ...p.chronicle] }; });
  };

  const sendCaravan = (r: RN) => { setConfirmReset(false); setG(p => {
    const amt = Math.min(12, Math.floor(p.res[r]));
    if (amt < 5 || r === "silver") { setNotice(`Not enough ${r} to load a caravan.`); return p; }
    const dist = Math.hypot(selB.x - home.x, selB.y - home.y);
    const days = Math.round(cl(dist / 90, 20, 160));
    const sv = Math.round(amt * p.prices[r] * (1 + selB.dip / 250) * (p.alliances.some(a => a.bid === selB.id) ? 1.25 : 1));
    setNotice(`Caravan bound for ${selB.house} — ${days} days out.`);
    return { ...p, res: chRes(p.res, { [r]: -amt } as Partial<Res>), caravans: [...p.caravans, { id: uid("cv"), tid: selB.id, resource: r, amount: amt, days, total: days, silver: sv }], factionRep: recordFactionAction(p.factionRep, selB.id, "trade_gift", 3, p.year, p.season, `${amt} ${r} traded with ${selB.house}.`), chronicle: [chron(p.year, p.season, "Caravan Departed", `${amt} ${r} sent to ${selB.house}.`, "trade"), ...p.chronicle] };
  }); };

  const dipAction = (kind: "negotiate" | "alliance" | "bloc" | "peace") => { setConfirmReset(false); setG(p => {
    if (selB.id === p.baronies[0]?.id) { setNotice("You cannot treat with yourself."); return p; }
    const t = p.baronies.find(b => b.id === selB.id); if (!t) return p;
    const playerHouse = p.baronies[0]?.house ?? "House Sheatsley";
    if (kind === "peace") { setNotice(`Peace made with ${t.house}.`); return { ...p, atWar: p.atWar.filter(id => id !== t.id), baronies: p.baronies.map(b => b.id === t.id ? { ...b, rel: cl(b.rel + 15, -100, 100) } : b), factionRep: recordFactionAction(p.factionRep, t.id, "peace", 8, p.year, p.season, `${playerHouse} sued for peace with ${t.house}.`) }; }
    if (kind === "negotiate") { if (p.res.silver < 10) { setNotice("Envoys need 10 silver."); return p; } setNotice(`Relations improved with ${t.house}.`); return { ...p, res: chRes(p.res, { silver: -10 }), baronies: p.baronies.map(b => b.id === t.id ? { ...b, rel: cl(b.rel + 12, -100, 100) } : b), factionRep: recordFactionAction(p.factionRep, t.id, "negotiate", 5, p.year, p.season, `${playerHouse} sent envoys with gifts to ${t.house}.`) }; }
    const need = kind === "bloc" ? 45 : 25, cost = kind === "bloc" ? 40 : 25;
    if (t.rel < need || p.res.silver < cost) { setNotice(`${t.house} requires ${need} relations and ${cost} silver.`); return p; }
    const ak: Alliance["kind"] = kind === "bloc" ? "trade bloc" : "alliance";
    setNotice(`${t.house} joined your ${ak}.`);
    return { ...p, res: chRes(p.res, { silver: -cost }), alliances: [...p.alliances.filter(a => a.bid !== t.id), { bid: t.id, kind: ak }], prestige: p.prestige + (kind === "bloc" ? 6 : 4), factionRep: recordFactionAction(p.factionRep, t.id, "alliance_formed", 10, p.year, p.season, `${t.house} formed a ${ak} with ${playerHouse}.`), chronicle: [chron(p.year, p.season, `${ak === "trade bloc" ? "Trade Bloc" : "Alliance"} Formed`, `${t.house} bound itself to ${playerHouse}.`, "glory"), ...p.chronicle] };
  }); };

  const recruit = (u: UnitType) => {
    setConfirmReset(false);
    const costs: Record<UnitType, Partial<Res>> = { militia: { food: 6, silver: 5 }, archers: { food: 8, wood: 5, silver: 9 }, spearmen: { food: 8, weapons: 1, silver: 8 }, knights: { food: 14, weapons: 3, silver: 25 }, royalGuard: { food: 20, weapons: 5, silver: 40 } };
    setG(p => { if (!afford(p.res, costs[u])) { setNotice("Insufficient supplies."); return p; } setNotice(`Five ${u} joined the levy.`); return { ...p, res: chRes(p.res, Object.fromEntries(Object.entries(costs[u]).map(([k, v]) => [k, -(v ?? 0)])) as Partial<Res>), army: { ...p.army, [u]: p.army[u] + 5, training: cl01(p.army.training + 1) } }; });
  };
  const assignCpt = () => { setConfirmReset(false); setG(p => { const c = p.citizens.find(c2 => !p.army.captains.includes(c2.name)); if (!c) { setNotice("No free citizens to promote as captain."); return p; } setNotice(`${c.name} raised as captain.`); return { ...p, army: { ...p.army, captains: [...p.army.captains, c.name], training: cl01(p.army.training + 5) } }; }); };
  const raid = () => { setConfirmReset(false); setG(p => { const ph = p.baronies[0]?.house ?? "House Sheatsley"; if (selB.id === p.baronies[0]?.id || p.army.militia < 5) { setNotice("Need a foreign target and at least 5 militia."); return p; } const loot = 8 + Math.round(p.army.training / 8); setNotice(`Raided ${selB.house} for ${loot} silver.`); return { ...p, res: chRes(p.res, { silver: loot, food: 4 }), atWar: p.atWar.includes(selB.id) ? p.atWar : [...p.atWar, selB.id], baronies: p.baronies.map(b => b.id === selB.id ? { ...b, rel: cl(b.rel - 18, -100, 100) } : b), rep: { ...p.rep, fear: cl01(p.rep.fear + 5), trust: cl01(p.rep.trust - 2) }, factionRep: recordFactionAction(p.factionRep, selB.id, "raid", 12, p.year, p.season, `${ph.split(" ")[1]} riders raided ${selB.house} for silver.`), chronicle: [chron(p.year, p.season, "Caravan Raided", `${ph.split(" ")[1]} riders raided ${selB.house}.`, "warning"), ...p.chronicle] }; }); };

  const startBattle = (kind: "attack" | "siege") => {
    setConfirmReset(false);
    if (selB.id === g.baronies[0]?.id) { setNotice("Select a foreign barony on the map first."); return; }
    const total = g.army.militia + g.army.archers + g.army.spearmen + g.army.knights;
    if (total < 4) { setNotice("Raise more soldiers before marching."); return; }
    setSpeed(0);
    setPanel(null);
    setG(p => ({ ...p, atWar: p.atWar.includes(selB.id) ? p.atWar : [...p.atWar, selB.id] }));
    setBattleSetup({ enemyHouse: selB.house, enemyBanner: selB.banner, enemyColor: selB.color, kind, player: { militia: g.army.militia, archers: g.army.archers, spearmen: g.army.spearmen, knights: g.army.knights, royalGuard: g.army.royalGuard }, enemyMilitary: selB.mil, captains: g.army.captains });
  };

  const endBattle = useCallback((o: BattleOutcome) => {
    setBattleSetup(null);
    setG(p => {
      const army: Army = { ...p.army, militia: o.survivors.militia, archers: o.survivors.archers, spearmen: o.survivors.spearmen, knights: o.survivors.knights, royalGuard: o.survivors.royalGuard };
      if (o.withdrew) { setNotice("Your host withdrew from the field."); return { ...p, army, battlesFought: p.battlesFought + 1, chronicle: [chron(p.year, p.season, "A Withdrawal", `The host retreated from ${selB.name}.`, "grief"), ...p.chronicle] }; }
      if (o.victory) {
        setNotice(`Victory over ${selB.house}!`);
        return { ...p, army, prestige: p.prestige + 10, battlesFought: p.battlesFought + 1, res: chRes(p.res, { silver: 40, food: 12 }), rep: { ...p.rep, fear: cl01(p.rep.fear + 8), respect: cl01(p.rep.respect + 6) }, baronies: p.baronies.map(b => b.id === selB.id ? { ...b, mil: cl01(b.mil - 25), rel: cl(b.rel - 20, -100, 100) } : b), factionRep: recordFactionAction(p.factionRep, selB.id, "war_victory", 15, p.year, p.season, `${selB.house} was defeated in open battle.`), chronicle: [chron(p.year, p.season, "A Battle Won", `${selB.house} was broken in the field. ${o.enemyKilled} enemies fell.`, "glory"), ...p.chronicle] };
      }
      setNotice("Your army was broken.");
      return { ...p, army, prestige: Math.max(0, p.prestige - 6), battlesFought: p.battlesFought + 1, rep: { ...p.rep, respect: cl01(p.rep.respect - 5) }, factionRep: recordFactionAction(p.factionRep, selB.id, "war_defeat", 8, p.year, p.season, `${selB.house} shattered the host of ${p.baronies[0]?.house ?? "House Sheatsley"}.`), chronicle: [chron(p.year, p.season, "A Battle Lost", `The host was shattered before ${selB.name}.`, "grief"), ...p.chronicle] };
    });
  }, [selB]);

  /* ── Crown actions ── */
  const grantTitle = (bid: string) => setG(p => {
    const barony = p.baronies.find(b => b.id === bid);
    if (!barony || p.rank !== "King of the Realm") { setNotice("Only the Crown may grant titles."); return p; }
    if (p.vassals.some(v => v.bid === bid)) { setNotice(`${barony.house} already serves the Crown.`); return p; }
    if (p.prestige < 15) { setNotice("The Crown needs 15 prestige to bestow a title."); return p; }
    setNotice(`${barony.house} now kneels to the Crown.`);
    return { ...p, prestige: p.prestige - 15, vassals: [...p.vassals, { bid, title: `Lord of ${barony.name}`, loyalty: 55 + Math.round(barony.rel * 0.4), tribute: Math.round(barony.eco * 0.3) }], chronicle: [chron(p.year, p.season, "Title Bestowed", `${barony.house} was granted vassalage under the Crown.`, "glory"), ...p.chronicle] };
  });

  const resolveCrownCrisis = (claimantIdx: number) => setG(p => {
    if (!p.successionCrisis) return p;
    const resolved = { ...p.successionCrisis, resolved: true, claimants: p.successionCrisis.claimants.map((c, i) => ({
      ...c, support: i === claimantIdx ? c.support + 30 : c.support - 10,
    })) };
    const winner = resolved.claimants[claimantIdx];
    setNotice(`${winner.name} is acclaimed by the court.`);
    return { ...p, successionCrisis: { ...resolved, resolved: true }, prestige: p.prestige + 5, chronicle: [chron(p.year, p.season, "The Crown Resolved", `${winner.name} was named the rightful heir by royal decree.`, "glory"), ...p.chronicle] };
  });

  const recruitRoyalGuard = () => setG(p => {
    if (p.rank !== "King of the Realm" && p.rank !== "Regional Lord") { setNotice("Only the Crown or a Regional Lord may raise royal guards."); return p; }
    if (!afford(p.res, { food: 20, weapons: 5, silver: 40 })) { setNotice("Need food, weapons and silver for royal guards."); return p; }
    setNotice("Five royal guards sworn to the Crown.");
    return { ...p, res: chRes(p.res, { food: -20, weapons: -5, silver: -40 }), prestige: p.prestige + 4, army: { ...p.army, royalGuard: p.army.royalGuard + 5 }, chronicle: [chron(p.year, p.season, "Royal Guard Sworn", "Elite defenders took the oath beneath the banner.", "glory"), ...p.chronicle] };
  });

  const saveGame = async () => {
    setConfirmReset(false);
    onSave?.();
    if (!auth.user) { setNotice("Sign in to save your dynasty to the cloud."); auth.setShowAuth(true); return; }
    setNotice("Saving…");
    const r = await fetch("/api/game", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slot: "autosave", houseName: "Sheatsley", rulerName: g.ruler.name, state: g }) });
    setNotice(r.ok ? "Saved to the realm archive." : "Save failed.");
  };
  const loadGame = async () => {
    if (!auth.user) { setNotice("Sign in to load your cloud save."); auth.setShowAuth(true); return; }
    const r = await fetch("/api/game?slot=autosave");
    if (!r.ok) { setNotice(r.status === 401 ? "Sign in to access cloud saves." : "Archive unreachable."); return; }
    const d = await r.json() as { save?: { payload?: GS } | null };
    if (d.save?.payload?.prices && d.save.payload.army && typeof d.save.payload.day === "number") { setG(d.save.payload); setNotice("Chronicle loaded."); } else setNotice("No compatible save found.");
  };
  const reset = () => { if (!confirmReset) { setConfirmReset(true); setNotice("Click reset again to confirm — this opens a blank Chronicle and discards the current one."); return; } const ng = initGame(charData); setG(ng); setPanel(null); setSpeed(0); setConfirmReset(false); const h = ng.settlements.find(s => s.home)!; center(h.x, h.y, 0.55); setNotice("A new blank Chronicle has opened."); };

  // auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (!g.toast) return;
    const t = setTimeout(() => setG(p => ({ ...p, toast: null })), 6000);
    return () => clearTimeout(t);
  }, [g.toast]);

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (battleSetup || g.evt) return;
      const t = e.target as HTMLElement;
      if ((t.tagName === "INPUT" || t.closest("[data-ui]")) && e.key !== "Escape") return;
      const cz = camRef.current.z;
      if (e.key === " ") { e.preventDefault(); setSpeed(s => s === 0 ? 1 : 0); }
      if (e.key === "Escape") { setPanel(null); setConfirmReset(false); }
      if (e.key === "ArrowLeft" || e.key === "a") setCam(c => ({ ...c, x: cl(c.x - 120 / cz, 0, Math.max(0, W - vp.w / cz)) }));
      if (e.key === "ArrowRight" || e.key === "d") setCam(c => ({ ...c, x: cl(c.x + 120 / cz, 0, Math.max(0, W - vp.w / cz)) }));
      if (e.key === "ArrowUp" || e.key === "w") setCam(c => ({ ...c, y: cl(c.y - 120 / cz, 0, Math.max(0, H - vp.h / cz)) }));
      if (e.key === "ArrowDown" || e.key === "s") setCam(c => ({ ...c, y: cl(c.y + 120 / cz, 0, Math.max(0, H - vp.h / cz)) }));
      if ((e.key === "+" || e.key === "=") && cz < 3.2) setCam(c => ({ ...c, z: cl(c.z * 1.25, 0.08, 3.2) }));
      if (e.key === "-" && cz > 0.08) setCam(c => ({ ...c, z: cl(c.z * 0.8, 0.08, 3.2) }));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [battleSetup, g.evt, vp]);

  /* ── map input ── */
  const onDown = (e: React.PointerEvent) => { if ((e.target as HTMLElement).closest("[data-ui]")) return; drag.current = { on: true, sx: e.clientX, sy: e.clientY, cx: cam.x, cy: cam.y, moved: false }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); };
  const onMove = (e: React.PointerEvent) => { if (!drag.current.on) return; const dx = e.clientX - drag.current.sx, dy = e.clientY - drag.current.sy; if (Math.hypot(dx, dy) > 4) drag.current.moved = true; setCam(c => ({ ...c, x: cl(drag.current.cx - dx / c.z, 0, Math.max(0, W - vp.w / c.z)), y: cl(drag.current.cy - dy / c.z, 0, Math.max(0, H - vp.h / c.z)) })); };
  const onUp = () => { drag.current.on = false; };
  const onWheel = (e: React.WheelEvent) => { e.preventDefault(); e.stopPropagation(); const r = mapRef.current?.getBoundingClientRect(); if (!r) return; const mx = e.clientX - r.left, my = e.clientY - r.top; setCam(c => { const wx = c.x + mx / c.z, wy = c.y + my / c.z; const nz = cl(c.z * (e.deltaY > 0 ? 0.96 : 1.04), 0.08, 3.2); return { z: nz, x: cl(wx - mx / nz, 0, Math.max(0, W - vp.w / nz)), y: cl(wy - my / nz, 0, Math.max(0, H - vp.h / nz)) }; }); };

  const toggle = (p: Panel) => { setConfirmReset(false); setPanel(cur => cur === p ? null : p); };
  const pickS = (s: Settlement, focus = false) => { setG(p => ({ ...p, selSid: s.id, selBid: s.bid, selCid: null })); setPanel("Settlement"); if (focus) center(s.x, s.y, Math.max(cam.z, 1.1)); };
  const pickB = (b: Barony, focus = false) => { setG(p => ({ ...p, selBid: b.id })); setPanel("Barony"); if (focus) center(b.x, b.y, Math.max(cam.z, 0.7)); };
  const pickC = (c: Citizen) => { setG(p => ({ ...p, selCid: c.id, selSid: c.sid })); setPanel("Villager"); };
  const onMini = (e: React.MouseEvent<HTMLDivElement>) => { const r = e.currentTarget.getBoundingClientRect(); center((e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H); };

  const filtChron = useMemo(() => {
    let list = g.chronicle;
    const q = cSearch.trim().toLowerCase();
    if (q) list = list.filter(e => `${e.title} ${e.text}`.toLowerCase().includes(q));
    if (cTone !== "all") list = list.filter(e => e.tone === cTone);
    return list;
  }, [cSearch, cTone, g.chronicle]);    const alerts = useMemo(() => {
    const l: string[] = [];
    if (g.res.food < g.pop / 2) l.push("Food stores are low.");
    if (g.season === "Winter" && g.res.wood < 20) l.push("Firewood is critically low.");
    if (g.family.some(m => m.role === "Child of the House" && m.age === 16)) l.push("A child has come of age.");
    if (g.atWar.length) l.push(`At war with ${g.atWar.length} house(s).`);
    if ((g.factions ?? []).length) {
      for (const f of (g.factions ?? [])) {
        if (f.aggression > 70) l.push(`Faction "${f.name}" is growing violent — ${f.members} members seek ${f.goal}.`);
        else if (f.aggression > 40) l.push(`Faction "${f.name}" voices discontent — ${f.members} followers.`);
      }
    }
    if (g.dynastyExtinct) l.push("The House has no living heirs. The dynasty will end.");
    if (!l.length) l.push("All is quiet across the Realm.");
    return l;
  }, [g]);

  const vW = vp.w / cam.z, vH = vp.h / cam.z;
  const visible = (x: number, y: number, pad: number) => x > cam.x - pad && x < cam.x + vW + pad && y > cam.y - pad && y < cam.y + vH + pad;

  // Apply charData to customize starting position
  useEffect(() => {
    if (!charData) return;
    const regionMap: Record<RegionChoice, { x: number; y: number }> = {
      "Forest Valley": { x: 3500, y: 5000 },
      "Golden Plains": { x: 7500, y: 5500 },
      "Mountain Highlands": { x: 6500, y: 1800 },
      "Coastal Bay": { x: 12000, y: 4800 },
      "River Kingdom": { x: 2500, y: 7200 },
    };
    const pos = regionMap[charData.region];
    center(pos.x, pos.y, 0.55);
  }, []); // run once on mount

  const LOD = { crests: cam.z < 1.6, settles: cam.z >= 0.12, art: cam.z >= 0.8, people: cam.z >= 0.95, names: cam.z >= 0.18 };
  const visSettles = useMemo(() => g.settlements.filter(s => visible(s.x, s.y, 900)), [g.settlements, cam, vp]); // eslint-disable-line react-hooks/exhaustive-deps
  const visBaronies = useMemo(() => g.baronies.filter(b => visible(b.x, b.y, 700)), [g.baronies, cam, vp]); // eslint-disable-line react-hooks/exhaustive-deps

  /* thin border lines between neighbouring baronies */
  const borders = useMemo(() => {
    const out: { d: string; col: string; w: number }[] = [];
    for (let i = 0; i < g.baronies.length; i++) for (let j = i + 1; j < g.baronies.length; j++) {
      const a = g.baronies[i], b = g.baronies[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist > 1900) continue;
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const nx = -(b.y - a.y) / dist, ny = (b.x - a.x) / dist;
      const half = Math.min(620, dist * 0.42);
      const wob = ((i * 7 + j * 13) % 90) - 45;
      const d = `M ${mx - nx * half} ${my - ny * half} Q ${mx + wob} ${my + wob} ${mx + nx * half} ${my + ny * half}`;
      out.push({ d, col: a.region !== b.region ? "rgba(200,168,78,0.30)" : "rgba(232,220,196,0.13)", w: a.region !== b.region ? 3 : 1.6 });
    }
    return out;
  }, [g.baronies]);

  const seasonRateMemo = useMemo(() => seasonRate(g), [g.season, g.pop, g.buildings]);
  const seasonPct = (g.day / DAYS_PER_SEASON) * 100;

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0a0908] text-[#eee4d0]">
      {/* ════ MAP ════ */}
      <div ref={mapRef} className={`absolute inset-0 select-none ${drag.current.on ? "cursor-grabbing" : "cursor-grab"}`} style={{ touchAction: "none" }} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onWheel={onWheel}>
        <div className="absolute left-0 top-0 origin-top-left will-change-transform" style={{ width: W, height: H, transform: `translate(${-cam.x * cam.z}px,${-cam.y * cam.z}px) scale(${cam.z})` }}>
          <div className="absolute inset-0" style={{ backgroundImage: `url(${REALM_MAP})`, backgroundSize: "100% 100%" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 15%, rgba(107,156,196,.16), transparent 26%), radial-gradient(circle at 50% 50%, rgba(200,168,78,.13), transparent 26%), radial-gradient(circle at 15% 47%, rgba(138,128,120,.15), transparent 22%), radial-gradient(circle at 85% 45%, rgba(77,151,168,.15), transparent 22%), radial-gradient(circle at 50% 84%, rgba(90,154,82,.15), transparent 24%)" }} />

          {/* thin barony borders */}
          <svg className="pointer-events-none absolute inset-0" width={W} height={H}>
            {borders.map((b, i) => <path key={i} d={b.d} stroke={b.col} strokeWidth={b.w} fill="none" strokeDasharray="14 10" />)}
            {/* roads */}
            {(g.roads ?? []).filter(r => r.level >= 2).map(r => {
              const a = g.settlements.find(s => s.id === r.fromSid);
              const b2 = g.settlements.find(s => s.id === r.toSid);
              if (!a || !b2) return null;
              const isGhost = r.decayed;
              const colors = ["", "", isGhost ? "rgba(140,120,100,0.15)" : "rgba(180,160,120,0.25)", isGhost ? "rgba(140,120,100,0.25)" : "rgba(180,160,120,0.45)"];
              const widths = [0, 0, isGhost ? 1.5 : 2.5, isGhost ? 2.5 : 4.5];
              return <line key={`rd-${r.id}`} x1={a.x} y1={a.y} x2={b2.x} y2={b2.y} stroke={colors[r.level]} strokeWidth={widths[r.level]} strokeDasharray={isGhost ? "6 14" : r.level === 3 ? "none" : "10 8"} />;
            })}
          </svg>

          {g.caravans.map(caravan => {
            const target = g.baronies.find(b => b.id === caravan.tid);
            if (!target) return null;
            const progress = 1 - cl(caravan.days / Math.max(1, caravan.total || 160), 0, 1);
            const x = home.x + (target.x - home.x) * progress;
            const y = home.y + (target.y - home.y) * progress;
            return (
              <div key={caravan.id} className="pointer-events-none absolute" style={{ left: x, top: y, zIndex: 22 }}>
                <div className="-translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c8a84e] px-1.5 py-0.5 text-[10px] shadow-lg ring-2 ring-black/50">🐎</div>
                <div className="mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-black/75 px-1.5 py-0.5 text-[9px] text-[#eee4d0]">{Math.ceil(caravan.days)}d</div>
              </div>
            );
          })}

          {/* region names */}
          {(Object.keys(RC) as Region[]).map(r => (
            <div key={r} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-semibold uppercase" style={{ left: RC[r].x, top: RC[r].y - 1150, color: `${RCOL[r]}66`, fontSize: 120, letterSpacing: "0.4em", textShadow: "0 6px 30px rgba(0,0,0,.8)" }}>{r}</div>
          ))}

          {/* settlement artwork */}
          {visSettles.filter(s => LOD.art || s.id === g.selSid).map(s => {
            const size = sArt(s.type, s.home);
            return (
              <button key={`art-${s.id}`} data-ui="1" onClick={() => pickS(s)} onPointerEnter={() => setHover({ x: s.x, y: s.y, label: s.name, sub: `${s.type} · ${g.baronies.find(b => b.id === s.bid)?.house ?? ""}` })} onPointerLeave={() => setHover(null)}
                className="absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[46%] transition hover:brightness-110"
                style={{ left: s.x, top: s.y, width: size, height: size * 0.68, zIndex: 5, boxShadow: g.selSid === s.id ? "0 0 0 4px rgba(200,168,78,.7), 0 30px 70px rgba(0,0,0,.55)" : "0 24px 60px rgba(0,0,0,.5)" }}>
                <img src={sImg(s.type, s.home)} alt={s.name} loading="lazy" decoding="async" className="h-full w-full object-cover" draggable={false} />
                <span className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 52%, rgba(10,9,8,.85) 88%)" }} />
              </button>
            );
          })}

          {/* villagers – CSS orbit on the outer streets, never over the building core */}
          {LOD.people && visSettles.map(s => {
            const cits = g.citizens.filter(c => c.sid === s.id);
            return cits.map(c => {
              const st = OCC_STYLE[c.occ] ?? { tunic: "#666", tool: "•" };
              const sel = g.selCid === c.id;
              return (
                <div key={c.id} className="orbit" style={{ left: s.x, top: s.y, zIndex: 14 }}>
                  <div className="orbit-arm" style={{ animationDuration: `${c.dur}s`, animationDelay: `-${c.phase}s`, animationDirection: c.rev ? "reverse" : "normal" }}>
                    <div className="orbit-pos" style={{ transform: `translateX(${c.orbit}px)` }}>
                      <div className="orbit-up" style={{ animationDuration: `${c.dur}s`, animationDelay: `-${c.phase}s`, animationDirection: c.rev ? "normal" : "reverse" }}>
                        <button data-ui="1" onClick={() => pickC(c)} onPointerEnter={() => setHover({ x: s.x, y: s.y - 40, label: c.name, sub: c.occ })} onPointerLeave={() => setHover(null)} className={`villager ${sel ? "v-sel" : ""}`} title={`${c.name} · ${c.occ}`}>
                          <span className="v-bob" style={{ animationDelay: `-${(c.phase % 1).toFixed(2)}s` }}>
                            <span className="v-head" />
                            <span className="v-torso" style={{ background: st.tunic }} />
                            <span className="v-legL" /><span className="v-legR" />
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            });
          })}

          {/* settlement markers */}
          {LOD.settles && visSettles.map(s => {
            const size = s.home ? 34 : s.type === "city" ? 32 : s.type === "town" ? 28 : s.type === "village" ? 24 : 20;
            const sel = g.selSid === s.id;
            return (
              <button key={s.id} data-ui="1" onClick={() => pickS(s)} onDoubleClick={() => center(s.x, s.y, 1.4)}
                onPointerEnter={() => setHover({ x: s.x, y: s.y, label: s.name, sub: `${s.type} · ${g.baronies.find(b => b.id === s.bid)?.house ?? ""}` })} onPointerLeave={() => setHover(null)}
                className="absolute flex -translate-x-1/2 flex-col items-center" style={{ left: s.x, top: s.y - ((LOD.art || s.id === g.selSid) ? sArt(s.type, s.home) * 0.30 : 0), zIndex: 16 }}>
                <span className="grid place-items-center rounded-full shadow-xl transition hover:scale-110" style={{ width: size, height: size, fontSize: size * 0.5, background: s.home ? "#6b1f1f" : "rgba(20,18,15,.9)", border: sel ? "2.5px solid #c8a84e" : s.home ? "2.5px solid #c8a84e" : "2px solid rgba(200,168,78,.4)" }}>{sIcon(s.type, s.home)}</span>
                {LOD.names && <span className="mt-1 whitespace-nowrap rounded-full bg-black/75 px-2.5 py-0.5 font-semibold text-[#eee4d0]" style={{ fontSize: Math.max(11, 13 / Math.max(cam.z, .35)) }}>{s.name}</span>}
              </button>
            );
          })}

          {/* barony crests */}
          {LOD.crests && visBaronies.map(b => {
            const sel = g.selBid === b.id;
            const size = cam.z < 0.2 ? 120 : cam.z < 0.5 ? 70 : 46;
            return (
              <button key={b.id} data-ui="1" onClick={() => pickB(b)} onDoubleClick={() => center(b.x, b.y, 0.9)}
                onPointerEnter={() => setHover({ x: b.x, y: b.y - size, label: b.house, sub: `${b.name} · ${b.region}` })} onPointerLeave={() => setHover(null)}
                className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full shadow-2xl transition hover:scale-110"
                style={{ left: b.x, top: b.y - (cam.z < 0.5 ? 0 : 420), width: size, height: size, fontSize: size * 0.46, background: b.color, border: sel ? `${size * 0.07}px solid #c8a84e` : `${size * 0.05}px solid rgba(0,0,0,.55)`, zIndex: 18 }}>
                {b.banner}
                {g.alliances.some(a => a.bid === b.id) && <span className="absolute -bottom-1 -right-1 grid h-1/3 w-1/3 place-items-center rounded-full bg-emerald-500 text-[50%] text-black">✓</span>}
                {g.atWar.includes(b.id) && <span className="absolute -bottom-1 -right-1 grid h-1/3 w-1/3 place-items-center rounded-full bg-red-600 text-[50%]">⚔</span>}
              </button>
            );
          })}

          {/* hover tooltip */}
          {hover && (
            <div className="pointer-events-none absolute -translate-x-1/2 rounded-xl bg-black/85 px-3 py-1.5 shadow-2xl ring-1 ring-[#c8a84e]/30" style={{ left: hover.x, top: hover.y + 30, zIndex: 30 }}>
              <p className="whitespace-nowrap font-semibold text-[#c8a84e]" style={{ fontSize: Math.max(12, 15 / Math.max(cam.z, .35)) }}>{hover.label}</p>
              <p className="whitespace-nowrap capitalize text-[#bbb5a0]" style={{ fontSize: Math.max(10, 12 / Math.max(cam.z, .35)) }}>{hover.sub}</p>
            </div>
          )}
        </div>
      </div>

      {!mapReady && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-[#0a0908]">
          <div className="rounded-2xl border border-[#c8a84e]/25 bg-[#0e0d0b]/90 px-6 py-4 text-center shadow-2xl">
            <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-[#c8a84e]" />
            <p className="text-[12px] font-semibold text-[#c8a84e]">Opening the Realm</p>
            <p className="mt-1 text-[10px] text-[#8d8674]">Preparing the map and settlements…</p>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/45" />

      {/* ════ TOP BAR ════ */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3">
        <button data-ui="1" onClick={() => toggle("House")} className="ck-panel pointer-events-auto flex items-center gap-3 rounded-2xl py-2 pl-2 pr-5 transition hover:brightness-110">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#a43a39] to-[#4b1219] text-lg ring-1 ring-[#c8a84e]/40">♜</span>
          <span className="text-left">
            <span className="block text-[8px] uppercase tracking-[0.35em] text-[#c8a84e]">House {charData?.houseName ?? "Sheatsley"}</span>
            <span className="block text-[13px] font-semibold leading-tight">{g.rank} of Hearthmere</span>
            <span className="block text-[10px] text-[#8d8674]">Prestige {g.prestige} · {renown(g.rep.respect)}</span>
          </span>
        </button>

        {/* clock */}
        <div data-ui="1" className="ck-panel pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-2">
          <div className="text-center">
            <p className="text-[13px] font-semibold leading-tight">Year {g.year} · <span className="text-[#c8a84e]">{g.season}</span></p>
            <p className="text-[9px] text-[#8d8674]">Day {Math.floor(g.day)} of {DAYS_PER_SEASON}</p>
            <div className="mt-1 h-1 w-32 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#c8a84e] transition-[width] duration-200" style={{ width: `${seasonPct}%` }} /></div>
          </div>
          <div className="flex items-center gap-1">
            {([[0, "⏸"], [1, "▶ 1×"], [2, "▶ 2×"], [4, "▶ 4×"]] as const).map(([s, icon]) => (
              <button key={s} onClick={() => setSpeed(s)} disabled={!!g.evt && s !== 0} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition disabled:opacity-25 ${speed === s ? "bg-[#c8a84e] text-[#1a1611]" : "bg-white/6 hover:bg-white/12"}`}>{icon}</button>
            ))}
          </div>
        </div>

        {/* resources */}
        <div data-ui="1" className="ck-panel pointer-events-auto flex items-center gap-0.5 rounded-2xl px-3 py-2">            {TICKER.map(k => {
            const rate = seasonRateMemo[k] ?? 0;
            return (
              <div key={k} className="flex flex-col items-center px-2" title={`${k}: ${Math.round(g.res[k])} (${rate >= 0 ? "+" : ""}${rate.toFixed(1)}/season)`}>
                <span className="text-[13px] leading-none">{RICONS[k]}</span>
                <span className="mt-0.5 text-[12px] font-semibold tabular-nums leading-none">{Math.floor(g.res[k])}</span>
                <span className={`text-[9px] tabular-nums leading-none ${rate >= 0 ? "text-emerald-400" : "text-red-400"}`}>{rate >= 0 ? "+" : ""}{rate.toFixed(0)}</span>
              </div>
            );
          })}
          <div className="mx-1 h-8 w-px bg-white/10" />
          <div className="flex flex-col items-center px-2"><span className="text-[13px] leading-none">👥</span><span className="mt-0.5 text-[12px] font-semibold leading-none">{g.pop}</span><span className="text-[9px] text-[#8d8674]">/{g.popCap}</span></div>
          <div className="flex flex-col items-center px-2"><span className="text-[13px] leading-none">🛡</span><span className="mt-0.5 text-[12px] font-semibold leading-none">{g.army.militia + g.army.archers + g.army.spearmen + g.army.knights}</span><span className="text-[9px] text-[#8d8674]">host</span></div>
        </div>

        <div data-ui="1" className="pointer-events-auto flex flex-col gap-1">
          <div className="flex gap-1">
            <button onClick={saveGame} className="rounded-lg bg-emerald-950/70 px-3 py-1.5 text-[10px] font-semibold text-emerald-200 ring-1 ring-emerald-400/20 hover:bg-emerald-900/70">{auth.user ? "☁ Save" : "Save"}</button>
            <button onClick={loadGame} className="rounded-lg bg-sky-950/70 px-3 py-1.5 text-[10px] font-semibold text-sky-200 ring-1 ring-sky-400/20 hover:bg-sky-900/70">Load</button>
            <button onClick={reset} className="rounded-lg bg-red-950/70 px-3 py-1.5 text-[10px] font-semibold text-red-200 ring-1 ring-red-400/20 hover:bg-red-900/70">New</button>
            {auth.user
              ? <button onClick={auth.logout} title={auth.user.email} className="rounded-lg bg-white/6 px-3 py-1.5 text-[10px] font-semibold text-[#eee4d0] hover:bg-white/12">👤 Sign out</button>
              : <button onClick={() => auth.setShowAuth(true)} className="rounded-lg bg-[#c8a84e]/20 px-3 py-1.5 text-[10px] font-semibold text-[#c8a84e] ring-1 ring-[#c8a84e]/30 hover:bg-[#c8a84e]/30">Sign in</button>}
          </div>
          <button onClick={() => toggle("Realm")} className="rounded-lg bg-white/6 px-3 py-1.5 text-[10px] font-semibold hover:bg-white/12">🗺 Realm Directory</button>
        </div>
      </header>

      {/* ════ DOCK ════ */}
      <nav data-ui="1" className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-0.5 rounded-2xl border border-white/8 bg-[#0e0d0b]/90 p-1.5 shadow-[0_16px_50px_rgba(0,0,0,.55)] backdrop-blur-2xl">
        {(g.rank === "King of the Realm" || g.rank === "Regional Lord") && <button onClick={() => toggle("Crown")} className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[12px] font-semibold transition ${panel === "Crown" ? "bg-[#c8a84e] text-[#1a1611]" : "bg-amber-900/60 text-amber-200 hover:bg-amber-800/60"}`}><span>♚</span>Crown</button>}
        {([["Build","🏗"],["Training","⚔️"],["Council","👑"],["Trade","⚖️"],["War","🗡️"],["Factions","🤝"],["Resources","📦"],["Chronicle","📖"]] as const).map(([id, ic]) => (
          <button key={id} onClick={() => toggle(id)} className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[12px] font-semibold transition ${panel === id ? "bg-[#c8a84e] text-[#1a1611]" : "hover:bg-white/8"}`}><span>{ic}</span>{id}</button>
        ))}
        <span className="mx-1 h-6 w-px bg-white/10" />
        <button onClick={() => center(home.x, home.y, 1.2)} className="flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[12px] font-semibold hover:bg-white/8">⌂ Home</button>
      </nav>

      <div className="pointer-events-none absolute bottom-[74px] left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/55 px-5 py-1.5 text-center text-[11px] text-[#eee4d0]/85 backdrop-blur">{notice}</div>

      {/* ════ MINIMAP ════ */}
      <div data-ui="1" className="absolute bottom-4 right-4 z-30 w-52 rounded-2xl border border-white/8 bg-[#0e0d0b]/88 p-2 shadow-xl backdrop-blur-xl">
        <div className="mb-1 flex justify-between px-0.5 text-[9px] uppercase tracking-wider text-[#8d8674]"><span>The Realm</span><span>{Math.round(cam.z * 100)}%</span></div>
        <div className="relative h-32 w-full cursor-crosshair overflow-hidden rounded-lg" onClick={onMini}>
          <div className="absolute inset-0 opacity-55" style={{ backgroundImage: `url(${REALM_MAP})`, backgroundSize: "100% 100%" }} />
          {g.baronies.map(b => <span key={b.id} className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${b.x / W * 100}%`, top: `${b.y / H * 100}%`, background: g.atWar.includes(b.id) ? "#e05a4a" : g.alliances.some(a => a.bid === b.id) ? "#57c07a" : b.color }} />)}
          <span className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#c8a84e] bg-[#6b1f1f]" style={{ left: `${home.x / W * 100}%`, top: `${home.y / H * 100}%` }} />
          <div className="absolute border-2 border-[#c8a84e]/90 bg-[#c8a84e]/10" style={{ left: `${cam.x / W * 100}%`, top: `${cam.y / H * 100}%`, width: `${Math.min(100, vW / W * 100)}%`, height: `${Math.min(100, vH / H * 100)}%` }} />
        </div>
        <div className="mt-1.5 flex gap-1 text-[10px]">
          <button onClick={() => setCam(c => ({ ...c, z: cl(c.z * 1.1, 0.08, 3.2) }))} className="flex-1 rounded-md bg-white/6 py-1 hover:bg-white/12">Zoom +</button>
          <button onClick={() => setCam(c => ({ ...c, z: cl(c.z * 0.91, 0.08, 3.2) }))} className="flex-1 rounded-md bg-white/6 py-1 hover:bg-white/12">Zoom −</button>
          <button onClick={() => center(W / 2, H / 2, 0.09)} className="flex-1 rounded-md bg-white/6 py-1 hover:bg-white/12">All</button>
        </div>
      </div>

      {/* toast */}
      {g.toast && (
        <div data-ui="1" className="absolute bottom-24 left-4 z-30 w-72 rounded-2xl border border-white/8 bg-[#0e0d0b]/93 p-3 shadow-xl backdrop-blur-xl">
          <div className="flex gap-2"><img src={g.toast.portrait} alt="" className="h-11 w-9 rounded-lg object-cover" /><div><p className="text-[12px] font-semibold text-[#c8a84e]">{g.toast.title}</p><p className="text-[11px] text-[#bbb5a0]">{g.toast.body}</p></div></div>
          <div className="mt-2 flex gap-1"><button onClick={() => toggle("Family")} className="flex-1 rounded-lg bg-[#c8a84e] py-1.5 text-[11px] font-semibold text-[#1a1611]">View</button><button onClick={() => setG(p => ({ ...p, toast: null }))} className="rounded-lg bg-white/6 px-3 text-[11px]">✕</button></div>
        </div>
      )}

      {/* ════ DRAWER ════ */}
      {panel && (
        <div data-ui="1" className="drawer absolute bottom-[74px] left-1/2 z-40 max-h-[58vh] w-[min(1020px,calc(100vw-250px))] -translate-x-1/2 overflow-auto rounded-3xl border border-white/8 bg-[#0e0d0b]/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,.65)] backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold tracking-wide text-[#c8a84e]">{panel === "House" ? `House ${charData?.houseName ?? "Sheatsley"}` : panel === "Trade" ? "Trade & Alliances" : panel === "Realm" ? "Realm Directory" : panel}</h2>
            <button onClick={() => setPanel(null)} className="rounded-full bg-white/6 px-3 py-1 text-[11px] hover:bg-white/12">✕</button>
          </div>

          {panel === "House" && <HousePanel g={g} living={living} center={center} home={home} setPanel={setPanel} houseName={charData?.houseName ?? "Sheatsley"} bannerIcon={charData?.banner ? { Lion: "🦁", Eagle: "🦅", Oak: "🌳", Wolf: "🐺", Crown: "♚" }[charData.banner] : "♜"} />}
          {panel === "Family" && <div className="flex gap-3 overflow-x-auto pb-2">{g.family.map((m, i) => <div key={m.id} className={`w-32 shrink-0 rounded-2xl border p-3 text-center ${m.status === "Dead" ? "border-white/5 opacity-50" : "border-white/8 bg-white/3"}`}><img src={portrait(m, i)} alt={m.name} className="mx-auto h-16 w-14 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='64'%3E%3Crect fill='%233a2a1a' width='56' height='64' rx='8'/%3E%3Ctext x='28' y='42' text-anchor='middle' fill='%23c8a84e' font-size='24' font-family='sans-serif'%3E${encodeURIComponent(m.name.split(" ")[0][0])}%3C/text%3E%3C/svg%3E`; }} /><p className="mt-1 text-[12px] font-semibold">{m.name}</p><p className="text-[10px] text-[#bbb5a0]">{m.role}</p><p className="text-[10px] text-[#c8a84e]">{m.status === "Dead" ? "Deceased" : `Age ${m.age}`}</p></div>)}<div className="flex w-32 shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-[11px] text-[#8d8674]"><span className="text-xl">?</span>continues…</div></div>}
          {panel === "Citizens" && <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">{g.citizens.filter(c => c.sid === home.id).map(c => { const st = OCC_STYLE[c.occ]; return <button key={c.id} onClick={() => { pickC(c); center(home.x, home.y, 1.3); }} className="flex items-center gap-2 rounded-xl bg-white/3 px-3 py-2 text-left transition hover:bg-white/7"><span className="grid h-7 w-7 place-items-center rounded-full text-[11px]" style={{ background: st?.tunic }}>{st?.tool}</span><span><span className="block text-[12px] font-medium">{c.name}</span><span className="text-[10px] text-[#bbb5a0]">{c.occ} · {c.age}</span></span></button>; })}</div>}
          {panel === "Alerts" && <div className="grid gap-6 md:grid-cols-2"><div><h3 className="mb-2 text-[11px] uppercase tracking-wider text-[#c8a84e]">Alerts</h3><ul className="space-y-1 text-[12px]">{alerts.map(a => <li key={a} className="rounded-xl bg-white/3 px-3 py-2">• {a}</li>)}</ul></div><div><h3 className="mb-2 text-[11px] uppercase tracking-wider text-[#c8a84e]">Recent</h3><ul className="space-y-1 text-[12px]">{g.chronicle.slice(0, 7).map(e => <li key={e.id} className="rounded-xl bg-white/3 px-3 py-2"><strong className="text-[#c8a84e]">{e.title}</strong> <span className="text-[#bbb5a0]">{e.text}</span></li>)}</ul></div></div>}
          {panel === "Build" && <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">{BUILDS.map(t => { const ex = g.buildings.find(b => b.id === t.id); const lv = ex?.level ?? 0; const nxt = lv + 1; const sc = Object.fromEntries(Object.entries(t.cost).map(([k, v]) => [k, Math.ceil((v ?? 0) * nxt)])) as Partial<Res>; const aff = afford(g.res, sc); return <button key={t.id} onClick={() => build(t)} className={`rounded-2xl border p-3 text-left transition ${aff ? "border-white/6 bg-white/3 hover:bg-white/7" : "border-red-400/15 bg-red-950/10 opacity-60"}`}><div className="flex justify-between"><span className="text-[13px] font-semibold">{t.name}</span><span className="rounded-full bg-[#c8a84e]/20 px-2 text-[10px] text-[#c8a84e]">Lv {lv}</span></div><p className="mt-1 text-[11px] text-[#bbb5a0]">{t.desc}</p><p className="mt-1 text-[10px] text-emerald-400">Lv {nxt}: {fmtD(t.prod)}</p><p className={`mt-1 text-[10px] ${aff ? "text-[#c8a84e]" : "text-red-400"}`}>Cost: {fmtD(sc)}</p></button>; })}</div>}
          {panel === "Training" && <div className="grid gap-3 md:grid-cols-3"><AC t="Muster Militia" b="Drill defenders with food, weapons and silver." bt="Train" fn={trainAct} /><AC t="Tactical Doctrine" b={`Doctrine favours ${g.ruler.path}.`} bt="Study" fn={trainAct} /><AC t="Border Watch" b="Post rangers to track rival movements." bt="Post" fn={trainAct} /></div>}
          {panel === "Council" && <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"><AC t="Merciful Judgment" b="Raise trust, reduce fear." bt="Judge" fn={() => council("mercy")} /><AC t="Open Trade" b="Invite merchants and foreign coin." bt="Invite" fn={() => council("trade")} /><AC t="Honour Old Faith" b="Strengthen tradition." bt="Gather" fn={() => council("tradition")} /><AC t="Send Envoys" b="Improve relations broadly." bt="Dispatch" fn={() => council("envoys")} /></div>}
          {panel === "Resources" && <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">{(Object.entries(g.res) as [RN, number][]).map(([k, v]) => { const liveRate = seasonRateMemo[k] ?? 0; return <div key={k} title={`${liveRate >= 0 ? "+" : ""}${liveRate.toFixed(1)} per season. ${RICONS[k]} ${k} is used for buildings, trade, and survival.`} className="rounded-2xl bg-white/3 p-3"><p className="text-[10px] uppercase tracking-wide text-[#8d8674]">{RICONS[k]} {k}</p><p className="text-xl font-bold tabular-nums">{Math.floor(v)}</p><p className={`text-[10px] tabular-nums ${liveRate >= 0 ? "text-emerald-400" : "text-red-400"}`}>{liveRate >= 0 ? "+" : ""}{liveRate.toFixed(1)}/season</p></div>; })}</div>}
          {panel === "Chronicle" && <div><input value={cSearch} onChange={e => setCSearch(e.target.value)} placeholder="Search the Chronicle…" className="mb-3 w-full rounded-full border border-white/8 bg-white/4 px-4 py-2 text-[12px] outline-none placeholder:text-white/25 focus:border-[#c8a84e]/40" /><div className="mb-2 flex flex-wrap gap-1">{(["all","hope","glory","grief","warning","trade","faith"] as const).map(tone => <button key={tone} onClick={() => setCTone(tone)} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${cTone === tone ? "bg-[#c8a84e] text-[#1a1611]" : "bg-white/6 hover:bg-white/10"}`}>{tone === "all" ? "All" : tone}</button>)}</div><div className="space-y-1.5 text-[12px]">{filtChron.slice(0, 200).map(e => <div key={e.id} className="rounded-xl bg-white/3 px-3 py-2"><span className="mr-2 text-[10px] text-[#8d8674]">Y{e.year} {e.season}</span><strong className="text-[#c8a84e]">{e.title}</strong> <span className="text-[#bbb5a0]">{e.text}</span></div>)}</div></div>}
          {panel === "Realm" && <RealmPanel g={g} search={rSearch} setSearch={setRSearch} pickB={pickB} center={center} />}
          {panel === "Trade" && <TradePanel g={g} selB={selB} send={sendCaravan} dip={dipAction} />}
          {panel === "War" && <WarPanel g={g} selB={selB} recruit={recruit} recruitRoyalGuard={recruitRoyalGuard} assignCpt={assignCpt} raid={raid} start={startBattle} dip={dipAction} />}
          {panel === "Settlement" && <SettPanel s={selS} b={selB} g={g} center={center} setPanel={setPanel} />}
          {panel === "Barony" && <BarPanel b={selB} g={g} center={center} pickS={pickS} setPanel={setPanel} />}
          {panel === "Villager" && selC && <VillPanel c={selC} g={g} center={center} tab={cTab} setTab={setCTab} />}
          {panel === "Crown" && <CrownPanel g={g} grantTitle={grantTitle} resolveCrisis={resolveCrownCrisis} recruitRoyalGuard={recruitRoyalGuard} />}
          {panel === "Factions" && <FactionRepPanel g={g} home={home} />}
        </div>
      )}

      {/* ════ EVENT ════ */}
      {g.evt && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/82 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0e0d0b] shadow-2xl">
            {g.evt.crisis && <div className="flex h-44 w-full items-center justify-center bg-gradient-to-b from-red-950/50 to-[#0e0d0b] text-5xl">⚠</div>}
            <div className="p-6">
              <p className="text-[9px] uppercase tracking-[0.35em] text-[#c8a84e]">Year {g.year} · {g.season}</p>
              <h2 className="mt-1 text-xl font-bold">{g.evt.title}</h2>
              <p className="mt-3 text-[13px] text-[#bbb5a0]">{g.evt.text}</p>
              <div className="mt-5 space-y-2">{g.evt.opts.map(o => <button key={o.label} onClick={() => resolveEvt(o)} className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-left text-[13px] font-medium transition hover:bg-[#c8a84e]/12"><span>{o.label}</span><span className="text-[11px] text-[#c8a84e]">{o.hint}</span></button>)}</div>
            </div>
          </div>
        </div>
      )}

      {/* ════ REAL-TIME BATTLE ════ */}
      {battleSetup && <BattleScreen setup={battleSetup} onEnd={endBattle} />}

      {/* ════ AUTH MODAL ════ */}
      <AuthModal
        show={auth.showAuth}
        onClose={() => auth.setShowAuth(false)}
        email={auth.email}
        setEmail={auth.setEmail}
        password={auth.password}
        setPassword={auth.setPassword}
        mode={auth.mode}
        setMode={auth.setMode}
        error={auth.error}
        setError={auth.setError}
        busy={auth.busy}
        submit={auth.submit}
      />
    </main>
  );
}

/* ───────── panels ───────── */
function HousePanel({ g, living, center, home, setPanel, houseName, bannerIcon }: { g: GS; living: Family[]; center: (x: number, y: number, z?: number) => void; home: Settlement; setPanel: (p: Panel) => void; houseName: string; bannerIcon: string }) {
  return (
    <div className="grid gap-6 md:grid-cols-[290px_1fr]">
      <div className="space-y-4">
        <div className="flex items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#a43a39] to-[#4b1219] text-2xl ring-2 ring-[#c8a84e]/30">{bannerIcon}</span><div><h3 className="text-[15px] font-bold">House {houseName}</h3><p className="text-[11px] italic text-[#c8a84e]">&ldquo;{g.motto}&rdquo;</p></div></div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
          <p><span className="text-[#8d8674]">Ruler</span> {g.ruler.name}</p><p><span className="text-[#8d8674]">Age</span> {living.find(m => m.id === g.ruler.id)?.age ?? g.ruler.age}</p>
          <p><span className="text-[#8d8674]">Rank</span> {g.rank}</p><p><span className="text-[#8d8674]">Prestige</span> {g.prestige}</p>
          <p><span className="text-[#8d8674]">Allies</span> {g.alliances.length}</p><p><span className="text-[#8d8674]">Wars</span> {g.atWar.length}</p>
        </div>
        <div className="flex gap-2">{living.slice(0, 4).map((m, i) => <div key={m.id} className="flex flex-col items-center"><img src={portrait(m, i)} alt={m.name} className="h-12 w-10 rounded-lg border border-[#c8a84e]/25 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='48'%3E%3Crect fill='%233a2a1a' width='40' height='48' rx='8'/%3E%3Ctext x='20' y='30' text-anchor='middle' fill='%23c8a84e' font-size='18' font-family='sans-serif'%3E${encodeURIComponent(m.name.split(" ")[0][0])}%3C/text%3E%3C/svg%3E`; }} /><span className="mt-0.5 max-w-12 truncate text-[9px]">{m.name.split(" ")[0]}</span></div>)}</div>
        <div className="flex gap-1">{(["Family", "Citizens", "Alerts"] as const).map(p => <button key={p} onClick={() => setPanel(p)} className="flex-1 rounded-lg bg-white/6 py-1.5 text-[11px] font-semibold hover:bg-white/12">{p}</button>)}</div>
        <button onClick={() => center(home.x, home.y, 1.3)} className="w-full rounded-lg bg-[#c8a84e] py-2 text-[12px] font-semibold text-[#1a1611]">Zoom into Hearthmere</button>
      </div>
      <div className="space-y-2">{(Object.entries(g.rep) as [string, number][]).map(([k, v]) => <div key={k}><div className="mb-0.5 flex justify-between text-[10px] uppercase tracking-wider text-[#8d8674]"><span>{k}</span><span>{v}</span></div><div className="h-1.5 rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-[#9a7a30] to-[#c8a84e]" style={{ width: `${v}%` }} /></div></div>)}</div>
    </div>
  );
}

function RealmPanel({ g, search, setSearch, pickB, center }: { g: GS; search: string; setSearch: (s: string) => void; pickB: (b: Barony, f?: boolean) => void; center: (x: number, y: number, z?: number) => void }) {
  const q = search.trim().toLowerCase();
  const list = q ? g.baronies.filter(b => `${b.house} ${b.name} ${b.region}`.toLowerCase().includes(q)) : g.baronies;
  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search all 50 baronies…" className="mb-3 w-full rounded-full border border-white/8 bg-white/4 px-4 py-2 text-[12px] outline-none placeholder:text-white/25 focus:border-[#c8a84e]/40" />
      <div className="grid gap-1.5 md:grid-cols-2 lg:grid-cols-3">
        {list.map(b => (
          <button key={b.id} onClick={() => { pickB(b); center(b.x, b.y, 0.75); }} className="flex items-center gap-2 rounded-xl bg-white/3 px-3 py-2 text-left transition hover:bg-white/7">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px]" style={{ background: b.color }}>{b.banner}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold">{b.house}</span>
              <span className="block truncate text-[10px] text-[#bbb5a0]">{b.name} · {b.region}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className={`block text-[10px] font-semibold ${b.rel > 40 ? "text-emerald-400" : b.rel < 0 ? "text-red-400" : "text-[#c8a84e]"}`}>{b.rel > 0 ? "+" : ""}{b.rel}</span>
              {g.alliances.some(a => a.bid === b.id) && <span className="block text-[9px] text-emerald-400">allied</span>}
              {g.atWar.includes(b.id) && <span className="block text-[9px] text-red-400">at war</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TradePanel({ g, selB, send, dip }: { g: GS; selB: Barony; send: (r: RN) => void; dip: (k: "negotiate" | "alliance" | "bloc" | "peace") => void }) {
  const allied = g.alliances.find(a => a.bid === selB.id);
  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
      <div>
        <div className="mb-3 flex items-center justify-between rounded-2xl bg-white/3 px-4 py-3">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full text-lg" style={{ background: selB.color }}>{selB.banner}</span><div><p className="text-[13px] font-semibold">{selB.house}</p><p className="text-[10px] text-[#bbb5a0]">{selB.name} · relations {selB.rel} · {allied ? allied.kind : "no pact"}</p></div></div>
          <button onClick={() => dip("negotiate")} className="rounded-full bg-[#c8a84e] px-4 py-2 text-[11px] font-semibold text-[#1a1611]">Negotiate · 10🪙</button>
        </div>
        <p className="mb-2 text-[11px] text-[#8d8674]">Living market — click a good to send a caravan (travel time scales with distance)</p>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">            {(Object.keys(g.prices) as RN[]).filter(k => k !== "silver").map(k => (
              <button key={k} onClick={() => send(k)} title={`Send a caravan of ${k} to ${selB.house}. Travel time varies by distance.`} className="rounded-xl bg-white/3 p-2.5 text-left transition hover:bg-white/7">
              <div className="flex items-center justify-between text-[11px]"><span>{RICONS[k]}</span><span className="font-semibold text-[#c8a84e]">{g.prices[k]}🪙</span></div>
              <p className="mt-0.5 text-[11px] font-medium capitalize">{k}</p>
              <p className="text-[9px] text-[#8d8674]">stock {Math.floor(g.res[k])}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="rounded-2xl bg-white/3 p-4">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#c8a84e]">Pacts</h4>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <button onClick={() => dip("alliance")} className="rounded-lg bg-white/6 py-2 text-[11px] font-semibold hover:bg-white/12">Alliance · 25🪙</button>
            <button onClick={() => dip("bloc")} className="rounded-lg bg-emerald-950/50 py-2 text-[11px] font-semibold text-emerald-200 hover:bg-emerald-900/50">Trade bloc · 40🪙</button>
          </div>
          {g.atWar.includes(selB.id) && <button onClick={() => dip("peace")} className="mt-1.5 w-full rounded-lg bg-sky-950/50 py-2 text-[11px] font-semibold text-sky-200 hover:bg-sky-900/50">Sue for peace</button>}
          <div className="mt-2 space-y-0.5 text-[11px] text-[#bbb5a0]">{g.alliances.length === 0 ? <p>No bonds yet.</p> : g.alliances.map(a => <p key={a.bid}>◆ {g.baronies.find(b => b.id === a.bid)?.house} — {a.kind}</p>)}</div>
        </div>
        <div className="rounded-2xl bg-white/3 p-4">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#c8a84e]">Caravans on the road</h4>
          <div className="mt-2 space-y-1 text-[11px] text-[#bbb5a0]">{g.caravans.length === 0 ? <p>None travelling.</p> : g.caravans.map(c => <p key={c.id}>{RICONS[c.resource]} {c.amount} → {g.baronies.find(b => b.id === c.tid)?.house} · {Math.ceil(c.days)}d · {c.silver}🪙</p>)}</div>
        </div>
      </div>
    </div>
  );
}

function WarPanel({ g, selB, recruit, recruitRoyalGuard, assignCpt, raid, start, dip }: { g: GS; selB: Barony; recruit: (u: UnitType) => void; recruitRoyalGuard: () => void; assignCpt: () => void; raid: () => void; start: (k: "attack" | "siege") => void; dip: (k: "peace") => void }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <p className="mb-2 text-[10px] uppercase tracking-wider text-red-300">The Hearthmere Host</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["militia", "archers", "spearmen", "knights", "royalGuard"] as UnitType[]).map(u => (
            <button key={u} onClick={() => u === "royalGuard" ? recruitRoyalGuard() : recruit(u)} className="rounded-2xl bg-white/3 p-3 text-left transition hover:bg-white/7">
              <p className="text-lg">{u === "militia" ? "🗡" : u === "archers" ? "🏹" : u === "spearmen" ? "🔱" : u === "royalGuard" ? "♚" : "♞"}</p>
              <p className="text-lg font-bold">{g.army[u]}</p><p className="text-[10px] capitalize text-[#bbb5a0]">{u === "royalGuard" ? "Royal Guard" : u}</p>
              <p className="mt-1 text-[9px] text-[#c8a84e]">recruit +5</p>
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-2xl bg-white/3 p-3">
          <div className="flex justify-between text-[12px]"><span>Training</span><strong>{g.army.training}/100</strong></div>
          <div className="mt-1 h-1.5 rounded-full bg-white/8"><div className="h-full rounded-full bg-red-400" style={{ width: `${g.army.training}%` }} /></div>
          <button onClick={assignCpt} className="mt-2 rounded-lg bg-white/6 px-3 py-1.5 text-[11px] font-semibold hover:bg-white/12">Appoint captain (+5% damage)</button>
          <p className="mt-1 text-[10px] text-[#bbb5a0]">Captains: {g.army.captains.join(", ") || "none"}</p>
        </div>
      </div>
      <div className="rounded-3xl border border-red-400/12 bg-red-950/12 p-5">
        <p className="text-[10px] uppercase tracking-wider text-red-300">Target</p>
        <div className="mt-1 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full text-lg" style={{ background: selB.color }}>{selB.banner}</span><div><h3 className="text-[15px] font-bold">{selB.house}</h3><p className="text-[11px] text-[#bbb5a0]">{selB.name} · military {selB.mil} · relations {selB.rel}</p></div></div>
        <p className="mt-3 text-[11px] text-[#8d8674]">Battles open a live tactical field where you command each squad in real time.</p>
        <div className="mt-4 grid gap-2">
          <button onClick={raid} className="rounded-xl bg-amber-800/60 py-2.5 text-[12px] font-semibold text-amber-100 hover:bg-amber-700/60">Raid their caravans</button>
          <button onClick={() => start("attack")} className="rounded-xl bg-red-800/85 py-2.5 text-[12px] font-semibold hover:bg-red-700/85">⚔ March to battle</button>
          <button onClick={() => start("siege")} className="rounded-xl bg-white/5 py-2.5 text-[12px] font-semibold ring-1 ring-red-400/20 hover:bg-red-950/40">🏰 Lay siege</button>
          {g.atWar.includes(selB.id) && <button onClick={() => dip("peace")} className="rounded-xl bg-sky-950/50 py-2.5 text-[12px] font-semibold text-sky-200 hover:bg-sky-900/50">Sue for peace</button>}
        </div>
      </div>
    </div>
  );
}

function SettPanel({ s, b, g, center, setPanel }: { s: Settlement; b: Barony; g: GS; center: (x: number, y: number, z?: number) => void; setPanel: (p: Panel) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
      <div>
        <p className="text-[9px] uppercase tracking-wider text-[#8d8674]">{s.type}{s.home ? " · your seat" : ""}</p>
        <h3 className="text-lg font-bold">{s.name}</h3>
        <p className="mt-1 text-[12px] text-[#bbb5a0]">{s.desc}</p>
        <p className="mt-2 text-[12px]">Population <strong>{s.home ? g.pop : s.pop}</strong></p>
        <p className="text-[12px]">Ruled by <strong>{b.house}</strong> · relations {b.rel}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button onClick={() => center(s.x, s.y, 1.5)} className="rounded-lg bg-[#c8a84e] px-3 py-1.5 text-[11px] font-semibold text-[#1a1611]">Zoom in</button>
          {s.home ? <button onClick={() => setPanel("Build")} className="rounded-lg bg-white/6 px-3 py-1.5 text-[11px] font-semibold hover:bg-white/12">Manage</button> : <>
            <button onClick={() => setPanel("Trade")} className="rounded-lg bg-white/6 px-3 py-1.5 text-[11px] font-semibold hover:bg-white/12">Trade</button>
            <button onClick={() => setPanel("War")} className="rounded-lg bg-red-900/50 px-3 py-1.5 text-[11px] font-semibold text-red-200 hover:bg-red-800/50">War</button>
            <button onClick={() => setPanel("Barony")} className="rounded-lg bg-white/6 px-3 py-1.5 text-[11px] font-semibold hover:bg-white/12">Barony</button>
          </>}
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl"><img src={sImg(s.type, s.home)} alt={s.name} className="h-40 w-full object-cover" onError={(e) => { const isHome = s.home; (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='160'%3E%3Crect fill='%231a1611' width='400' height='160'/%3E%3Ctext x='200' y='95' text-anchor='middle' fill='${isHome ? "%23c8a84e" : "%23888"}' font-size='48' font-family='sans-serif'%3E${isHome ? "%E2%99%9C" : "%F0%9F%8F%98"}%3C/text%3E%3C/svg%3E`; }} /></div>
    </div>
  );
}

function BarPanel({ b, g, center, pickS, setPanel }: { b: Barony; g: GS; center: (x: number, y: number, z?: number) => void; pickS: (s: Settlement, f?: boolean) => void; setPanel: (p: Panel) => void }) {
  const allied = g.alliances.find(a => a.bid === b.id);
  return (
    <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
      <div>
        <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full text-xl" style={{ background: b.color }}>{b.banner}</span><div><h3 className="text-[15px] font-bold">{b.house}</h3><p className="text-[12px] text-[#c8a84e]">{b.name}</p></div></div>
        <p className="mt-2 text-[12px] italic text-[#8d8674]">&ldquo;{b.motto}&rdquo;</p>
        <p className="mt-1 text-[12px]">{b.region} · seeks {b.ambition}</p>
        {allied && <p className="mt-1 text-[11px] font-semibold text-emerald-400">Bound to you by {allied.kind}</p>}
        {g.atWar.includes(b.id) && <p className="mt-1 text-[11px] font-semibold text-red-400">At war with {g.baronies[0]?.house ?? "your house"}</p>}
        <Meter l="Economy" v={b.eco} /><Meter l="Military" v={b.mil} /><Meter l="Diplomacy" v={b.dip} /><Meter l="Relations" v={b.rel + 50} />
        {b.id !== g.baronies[0]?.id && (
          <div className="mt-3 flex gap-1.5">
            <button onClick={() => setPanel("Trade")} className="flex-1 rounded-lg bg-[#c8a84e] py-2 text-[11px] font-semibold text-[#1a1611]">Diplomacy & trade</button>
            <button onClick={() => setPanel("War")} className="flex-1 rounded-lg bg-red-900/60 py-2 text-[11px] font-semibold text-red-100">War council</button>
          </div>
        )}
      </div>
      <div>
        <p className="mb-1 text-[10px] uppercase tracking-wider text-[#8d8674]">Holdings ({g.settlements.filter(s => s.bid === b.id).length})</p>
        <div className="space-y-1">{g.settlements.filter(s => s.bid === b.id).map(s => (
          <button key={s.id} onClick={() => { pickS(s); center(s.x, s.y, 1.2); }} className="flex w-full items-center justify-between rounded-xl bg-white/3 px-3 py-2 text-left text-[12px] hover:bg-white/7">
            <span className="flex items-center gap-2"><span>{sIcon(s.type, s.home)}</span><span className="font-medium">{s.name}</span></span>
            <span className="text-[10px] capitalize text-[#bbb5a0]">{s.type} · {s.pop}</span>
          </button>
        ))}</div>
      </div>
    </div>
  );
}

function VillPanel({ c, g, center, tab, setTab }: { c: Citizen; g: GS; center: (x: number, y: number, z?: number) => void; tab: "Info" | "Skills" | "Memories"; setTab: (t: "Info" | "Skills" | "Memories") => void }) {
  const st = OCC_STYLE[c.occ] ?? { tunic: "#666", tool: "•" };
  const s = g.settlements.find(x => x.id === c.sid);
  return (
    <div className="grid gap-5 md:grid-cols-[250px_1fr]">
      <div>
        <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full text-lg" style={{ background: st.tunic }}>{st.tool}</span><div><h3 className="text-[15px] font-bold">{c.name}</h3><p className="text-[12px] text-[#bbb5a0]">{c.occ} · age {c.age}</p></div></div>
        <p className="mt-2 text-[11px] text-[#8d8674]">Traits: {c.traits.join(", ")}</p>
        <p className="text-[11px] text-[#bbb5a0]">Lives in {s?.name}</p>
        <Meter l="Mood" v={c.mood} />
        <button onClick={() => s && center(s.x, s.y, 1.6)} className="mt-3 w-full rounded-lg bg-[#c8a84e] py-2 text-[11px] font-semibold text-[#1a1611]">Zoom to their village</button>
      </div>
      <div>
        <div className="mb-3 flex gap-1">{(["Info", "Skills", "Memories"] as const).map(t => <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold ${tab === t ? "bg-[#c8a84e] text-[#1a1611]" : "bg-white/6"}`}>{t}</button>)}</div>
        {tab === "Info" && <p className="text-[12px] text-[#bbb5a0]">A {c.occ} of {s?.name}, working the same rounds each day. {c.traits.join(" and ")} by nature.</p>}
        {tab === "Skills" && <div className="space-y-1">{(Object.entries(c.skills) as [string, number][]).map(([k, v]) => <Meter key={k} l={k} v={v * 10} />)}</div>}
        {tab === "Memories" && <ul className="list-disc space-y-1 pl-4 text-[12px] text-[#bbb5a0]">{c.memories.map(m => <li key={m}>{m}</li>)}</ul>}
      </div>
    </div>
  );
}

function FactionRepPanel({ g, home }: { g: GS; home: Settlement }) {
  const playerHouse = g.baronies[0]?.house ?? "House Sheatsley";
  const reps = (g.factionRep ?? []).filter(fr => {
    const b = g.baronies.find(b2 => b2.id === fr.bid);
    return b && b.id !== g.baronies[0]?.id;
  });
  const sorted = [...reps].sort((a, b) => a.trust - b.trust);
  const actionIcon: Record<ActionType, string> = {
    raid: "⚔", war_victory: "🏆", war_defeat: "💀", alliance_formed: "🤝", alliance_broken: "💔",
    peace: "🕊", negotiate: "💬", trade_gift: "📦", betrothal: "💍", vassal: "👑", betrayal: "🗡",
  };
  const toneColor = (t: string) => t === "grief" ? "text-red-400" : t === "warning" ? "text-amber-400" : t === "glory" ? "text-emerald-400" : "text-sky-400";
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Barony reputation cards */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-[#8d8674]">Reputation with {reps.length} baronies</p>
        {sorted.map(fr => {
          const b = g.baronies.find(b2 => b2.id === fr.bid);
          if (!b) return null;
          const isWar = g.atWar.includes(fr.bid);
          const isAllied = g.alliances.some(a => a.bid === fr.bid);
          return (
            <div key={fr.bid} className={`rounded-2xl border p-4 transition ${isWar ? "border-red-500/30 bg-red-950/15" : isAllied ? "border-emerald-500/20 bg-emerald-950/10" : "border-white/6 bg-white/3"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px]" style={{ background: b.color }}>{b.banner}</span>
                  <div>
                    <p className="text-[12px] font-semibold">{b.house}</p>
                    <p className="text-[10px] text-[#8d8674]">{b.name} · {b.region}</p>
                  </div>
                </div>
                <div className="text-right">
                  {isWar && <span className="text-[9px] font-bold text-red-400">AT WAR</span>}
                  {isAllied && <span className="text-[9px] font-bold text-emerald-400">ALLIED</span>}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[{ l: "Trust", v: fr.trust, c: fr.trust > 0 ? "bg-emerald-400" : "bg-red-400" },
                  { l: "Fear", v: fr.fear, c: "bg-amber-400" },
                  { l: "Respect", v: fr.respect, c: "bg-sky-400" },
                  { l: "Grudge", v: fr.grudge, c: "bg-red-500" }].map(m => (
                  <div key={m.l}>
                    <p className="text-[9px] text-[#8d8674]">{m.l}</p>
                    <div className="mt-0.5 h-1 rounded-full bg-white/8"><div className={`h-full rounded-full ${m.c}`} style={{ width: `${cl01(Math.abs(m.l === "Trust" ? m.v : m.v))}%` }} /></div>
                    <p className="text-[10px] text-[#bbb5a0]">{Math.round(m.v)}</p>
                  </div>
                ))}
              </div>
              {/* Generational grudges */}
              {fr.genGrudges.filter(g2 => !g2.decayed).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {fr.genGrudges.filter(g2 => !g2.decayed).map((gr, i) => (
                    <span key={i} className="rounded-full bg-red-950/40 px-2 py-0.5 text-[9px] text-red-300" title={`Born year ${gr.born}`}>🗡 {gr.text.slice(0, 40)}{gr.text.length > 40 ? "…" : ""}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Recent action log for selected barony */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-[#8d8674]">Recent Actions ({g.baronies.find(b => b.id === g.selBid)?.house ?? "—"})</p>
        {(() => { const fr = getBaronyRep(g.factionRep ?? [], g.selBid); if (!fr) return <p className="text-[11px] text-[#8d8674]">Select a barony on the map to view its history with {playerHouse}.</p>; return (
          <div className="space-y-1.5">
            {fr.actions.length === 0 && <p className="text-[11px] text-[#8d8674]">No recorded interactions yet.</p>}
            {fr.actions.map((a, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl bg-white/3 px-3 py-2">
                <span className="text-lg">{actionIcon[a.action] ?? "•"}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] text-[#bbb5a0]">{a.text}</p>
                  <p className="text-[9px] text-[#8d8674]">Year {a.year} · {a.season} · magnitude {a.magnitude}</p>
                </div>
              </div>
            ))}
          </div>
        ); })()}
        {/* Summary */}
        <div className="mt-4 rounded-2xl border border-white/6 bg-white/3 p-4">
          <p className="text-[10px] uppercase tracking-wider text-[#8d8674]">Reputation Summary</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
            <p>Total grudges: <span className="text-red-400">{reps.reduce((s, fr) => s + fr.genGrudges.filter(g2 => !g2.decayed).length, 0)}</span></p>
            <p>Most feared: <span className="text-amber-400">{reps.sort((a, b) => b.fear - a.fear)[0] ? g.baronies.find(b2 => b2.id === reps.sort((a, b) => b.fear - a.fear)[0].bid)?.house ?? "—" : "—"}</span></p>
            <p>Most trusted: <span className="text-emerald-400">{reps.sort((a, b) => b.trust - a.trust)[0] ? g.baronies.find(b2 => b2.id === reps.sort((a, b) => b.trust - a.trust)[0].bid)?.house ?? "—" : "—"}</span></p>
            <p>Most grudged: <span className="text-red-400">{reps.sort((a, b) => b.grudge - a.grudge)[0] ? g.baronies.find(b2 => b2.id === reps.sort((a, b) => b.grudge - a.grudge)[0].bid)?.house ?? "—" : "—"}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CrownPanel({ g, grantTitle, resolveCrisis, recruitRoyalGuard }: { g: GS; grantTitle: (bid: string) => void; resolveCrisis: (idx: number) => void; recruitRoyalGuard: () => void }) {
  const crisis = g.successionCrisis;
  const isCrown = g.rank === "King of the Realm" || g.rank === "Regional Lord";
  if (!isCrown) return <p className="text-[12px] text-[#8d8674]">Rise to Regional Lord or King of the Realm to access the Crown court.</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Succession Crisis */}
      {crisis && (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-950/15 p-5">
          <p className="text-[10px] uppercase tracking-wider text-amber-300">Succession Crisis</p>
          <h3 className="mt-1 text-[14px] font-bold text-[#eee4d0]">The Crown is Contested</h3>
          <p className="mt-1 text-[11px] text-[#bbb5a0]">Year {crisis.year} — multiple claimants vie for the throne.</p>
          <div className="mt-3 space-y-2">
            {crisis.claimants.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between rounded-xl bg-white/4 px-4 py-3">
                <div>
                  <p className="text-[13px] font-semibold">{c.name}</p>
                  <p className="text-[10px] text-[#8d8674]">Age {c.age} · {c.traits.join(", ")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[#c8a84e]">{c.support}% support</span>
                  {!crisis.resolved && (
                    <button onClick={() => resolveCrisis(i)} className="rounded-lg bg-[#c8a84e] px-3 py-1.5 text-[11px] font-semibold text-[#1a1611] hover:brightness-110">Acclaim</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vassals */}
      <div>
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wider text-[#8d8674]">Vassals ({g.vassals.length})</p>
          <select onChange={e => { if (e.target.value) grantTitle(e.target.value); e.target.value = ""; }}
            className="rounded-lg border border-white/8 bg-white/4 px-2 py-1 text-[10px] outline-none">
            <option value="">Grant title (15 prestige)…</option>
            {g.baronies.filter(b => b.id !== g.baronies[0]?.id && !g.vassals.some(v => v.bid === b.id)).slice(0, 20).map(b => (
              <option key={b.id} value={b.id}>{b.house} · relations {b.rel}</option>
            ))}
          </select>
        </div>
        {g.vassals.length === 0 ? (
          <p className="mt-2 text-[11px] text-[#bbb5a0]">No houses kneel to the Crown yet. Bestow titles to bind baronies to your rule.</p>
        ) : (
          <div className="mt-2 space-y-1.5">
            {g.vassals.map(v => {
              const barony = g.baronies.find(b => b.id === v.bid);
              return (
                <div key={v.bid} className={`flex items-center justify-between rounded-xl px-3 py-2 ${v.loyalty < 25 ? "bg-red-950/20" : "bg-white/3"}`}>
                  <div>
                    <p className="text-[12px] font-semibold">{barony?.house ?? v.bid}</p>
                    <p className="text-[10px] text-[#bbb5a0]">{v.title} · tribute {v.tribute}🪙/season</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[11px] font-bold ${v.loyalty > 60 ? "text-emerald-400" : v.loyalty > 30 ? "text-[#c8a84e]" : "text-red-400"}`}>{v.loyalty}% loyal</span>
                    {g.civilWarActive && v.loyalty < 25 && <span className="ml-1 text-[9px] text-red-400">⚔</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {g.civilWarActive && (
          <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-950/15 p-4">
            <p className="text-[11px] font-semibold text-red-300">⚔ Continental Civil War</p>
            <p className="mt-1 text-[10px] text-[#bbb5a0]">The Realm burns. Crush the rebels or negotiate peace to restore order.</p>
          </div>
        )}
      </div>

      {/* Royal Guard */}
      <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
        <p className="text-[10px] uppercase tracking-wider text-[#8d8674]">Royal Guard</p>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-xl font-bold tabular-nums">{g.army.royalGuard}</p>
            <p className="text-[10px] text-[#bbb5a0]">Elite defenders of the Crown</p>
          </div>
          <button onClick={recruitRoyalGuard} className="rounded-xl bg-amber-800/70 px-4 py-2 text-[11px] font-semibold text-amber-100 hover:bg-amber-700/70">
            Recruit +5
          </button>
        </div>
        <p className="mt-2 text-[9px] text-[#8d8674]">Royal guards fight with +50% damage in battles. Cost: 20 food, 5 weapons, 40 silver.</p>
      </div>
    </div>
  );
}

function Meter({ l, v }: { l: string; v: number }) {
  return <div className="mt-1.5"><div className="mb-0.5 flex justify-between text-[10px] uppercase tracking-wider text-[#8d8674]"><span>{l}</span><span>{Math.round(v)}</span></div><div className="h-1.5 rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-[#9a7a30] to-[#c8a84e]" style={{ width: `${cl01(v)}%` }} /></div></div>;
}
function AC({ t, b, bt, fn }: { t: string; b: string; bt: string; fn: () => void }) {
  return <div className="rounded-2xl border border-white/6 bg-white/3 p-4"><h3 className="text-[13px] font-semibold text-[#c8a84e]">{t}</h3><p className="mt-1 text-[11px] text-[#bbb5a0]">{b}</p><button onClick={fn} className="mt-3 rounded-lg bg-[#c8a84e] px-4 py-1.5 text-[11px] font-semibold text-[#1a1611]">{bt}</button></div>;
}
