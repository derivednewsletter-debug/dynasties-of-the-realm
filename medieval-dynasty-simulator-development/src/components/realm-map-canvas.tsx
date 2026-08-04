"use client";
import { memo, useEffect, useRef, useCallback } from "react";

const W = 15000, H = 10000;

type Region = "Northern Marches" | "Heartlands" | "Western Highlands" | "Eastern Coast" | "Southern Wilds";
type SType = "hamlet" | "village" | "town" | "city";

interface Settlement { id: string; bid: string; name: string; type: SType; x: number; y: number; pop: number; home: boolean }
interface Barony { id: string; name: string; house: string; region: Region; banner: string; x: number; y: number; color: string; rel: number }
interface Road { id: string; fromSid: string; toSid: string; level: number; traffic: number; decayed: boolean }

const RC: Record<Region, { x: number; y: number; color: string; fillColor: string }> = {
  "Northern Marches": { x: 7500, y: 1500, color: "#6b9cc4", fillColor: "rgba(107,156,196,0.12)" },
  "Heartlands": { x: 7500, y: 5000, color: "#c8a84e", fillColor: "rgba(200,168,78,0.10)" },
  "Western Highlands": { x: 2300, y: 4700, color: "#8a8078", fillColor: "rgba(138,128,120,0.12)" },
  "Eastern Coast": { x: 12700, y: 4500, color: "#4d97a8", fillColor: "rgba(77,151,168,0.10)" },
  "Southern Wilds": { x: 7500, y: 8400, color: "#5a9a52", fillColor: "rgba(90,154,82,0.10)" },
};

/* ═══ COLOR + GEOMETRY HELPERS (all deterministic — safe for the static cache) ═══ */

const REGION_LIST = Object.keys(RC) as Region[];

const HEX_BASE: Record<Region, [number, number, number]> = {
  "Northern Marches": [150, 168, 128], // forest green
  "Western Highlands": [154, 142, 126], // rocky brown-gray
  "Eastern Coast": [200, 190, 152], // coastal sand
  "Southern Wilds": [132, 152, 116], // deep woodland
  Heartlands: [182, 176, 130], // farmland gold-green
};

function regionAt(x: number, y: number): Region {
  let best = REGION_LIST[0];
  let bd = Infinity;
  for (const r of REGION_LIST) {
    const d = (x - RC[r].x) ** 2 + (y - RC[r].y) ** 2;
    if (d < bd) { bd = d; best = r; }
  }
  return best;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Per-house realm tint — CK3-style: each barony gets a clearly distinct, vivid
 *  color. A golden-angle hue spread (anchored loosely to the region's own hue)
 *  guarantees neighbouring barons read as different on the political map. */
function baronyColor(color: string, id: string): [number, number, number] {
  const [r, g, b] = hexToRgb(color);
  const [h] = rgbToHsl(r, g, b);
  const hh = hashStr(id);
  const nh = (h * 0.22 + ((hh * 137.508) % 360) * 0.78) % 360;
  const ns = clamp(0.55 + ((hh >> 4) % 5) * 0.06, 0.5, 0.8);
  const nl = clamp(0.5 + ((hh >> 7) % 4) * 0.05, 0.46, 0.66);
  return hslToRgb(nh, ns, nl);
}

function triAlpha(t: [number, number, number], a: number): string {
  return `rgba(${t[0]},${t[1]},${t[2]},${a})`;
}

/* ═══ PARCHMENT + OCEAN (cached irregular coastline) ═══ */

let landCache: [number, number][] | null = null;

function getLandPoly(): [number, number][] {
  if (landCache) return landCache;
  const m = 320;
  const pts: [number, number][] = [];
  const edges: Array<[[number, number], [number, number], number]> = [
    [[m, m], [W - m, m], 1],
    [[W - m, m], [W - m, H - m], 2],
    [[W - m, H - m], [m, H - m], 3],
    [[m, H - m], [m, m], 4],
  ];
  for (const [a, b, seed] of edges) {
    const n = 44;
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = a[0] + dx * t;
      const y = a[1] + dy * t;
      const wob = Math.sin(t * Math.PI * 4 + seed) * 26 + Math.sin(t * Math.PI * 9 + seed * 2) * 12;
      pts.push([x - (dy / len) * wob, y + (dx / len) * wob]);
    }
  }
  landCache = pts;
  return pts;
}

function tracePoly(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}

function traceOpen(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
}

function fillOcean(ctx: CanvasRenderingContext2D) {
  const og = ctx.createRadialGradient(W / 2, H / 2, 2500, W / 2, H / 2, 8500);
  og.addColorStop(0, "#34505f");
  og.addColorStop(0.6, "#2e4a58");
  og.addColorStop(1, "#1f3541");
  ctx.fillStyle = og;
  ctx.fillRect(0, 0, W, H);
}

function fillParchment(ctx: CanvasRenderingContext2D) {
  const pg = ctx.createRadialGradient(W / 2, H / 2, 400, W / 2, H / 2, 8200);
  pg.addColorStop(0, "#e0d2a4");
  pg.addColorStop(0.55, "#d3c392");
  pg.addColorStop(0.85, "#c6b482");
  pg.addColorStop(1, "#b7a273");
  ctx.fillStyle = pg;
  ctx.fillRect(0, 0, W, H);
}

function strokeCoastline(ctx: CanvasRenderingContext2D) {
  const land = getLandPoly();
  tracePoly(ctx, land);
  ctx.strokeStyle = "rgba(26,38,46,0.65)";
  ctx.lineWidth = 16;
  ctx.stroke();
  tracePoly(ctx, land);
  ctx.strokeStyle = "rgba(224,212,158,0.9)";
  ctx.lineWidth = 5;
  ctx.stroke();
}

/* ═══ REALM TERRITORIES (CK3-style house-colored domains) ═══ */

/* ── Voronoi tessellation: each barony's land is exactly the set of points
 * closer to its seat than to any other — so neighbours share crisp, identical
 * borders, CK3-style, instead of overlapping blobs. ── */

// Deterministic hand-drawn wobble along a shared border. Both neighbouring
// cells sample the same absolute t-grid with the same sorted pair key, so the
// border geometry is shared exactly — gap-free and identical on both sides.
function borderWobble(pairKey: string, t: number): number {
  const h = hashStr(pairKey);
  const a1 = 26 + (h % 34); // 26–60 px primary sway
  const a2 = 8 + ((h >> 6) % 14); // 8–22 px secondary sway
  const f1 = (Math.PI * 2) / (240 + (h % 220)); // ~1 wave per 240–460 px
  const f2 = f1 * (1.9 + ((h >> 9) % 5) * 0.35);
  const p1 = (h % 628) / 100;
  const p2 = ((h >> 12) % 628) / 100;
  return a1 * Math.sin(t * f1 + p1) + a2 * Math.sin(t * f2 + p2);
}

const CELL_STEP = 60; // wobble sample density along a border (px)
const CELL_SIDE = 3200; // starting square around each seat, clipped into a cell
const CELL_MAX_WOBBLE = 100; // pre-filter slack: max |wobble| + epsilon

interface VoronoiResult {
  cells: [number, number][][]; // one clipped polygon per barony (same order)
  borders: [number, number][][]; // one crisp shared border per adjacent pair
}

// Module-level cache: barony seats never move during a session, so the whole
// tessellation is computed once per seating layout and shared by the main map
// and the minimap (even across static-cache rebuilds).
const voronoiCache: { sig: string; result: VoronoiResult } = { sig: "", result: { cells: [], borders: [] } };

function baronyCells(baronies: Barony[]): VoronoiResult {
  const sig = baronies.map(b => `${b.id}@${b.x.toFixed(0)},${b.y.toFixed(0)}`).join(";");
  if (voronoiCache.sig === sig) return voronoiCache.result;

  const n = baronies.length;
  const cells: [number, number][][] = [];
  // For each adjacent pair, remember how far each side spans along the shared
  // border axis so the crisp border polyline can be rebuilt from both sides.
  const pairRanges = new Map<string, { i: number; j: number; range: [number, number][] }>();

  for (let i = 0; i < n; i++) {
    const b = baronies[i];
    let poly: [number, number][] = [
      [b.x - CELL_SIDE, b.y - CELL_SIDE],
      [b.x + CELL_SIDE, b.y - CELL_SIDE],
      [b.x + CELL_SIDE, b.y + CELL_SIDE],
      [b.x - CELL_SIDE, b.y + CELL_SIDE],
    ];
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const o = baronies[j];
      const dx = o.x - b.x, dy = o.y - b.y;
      const len = Math.hypot(dx, dy);
      if (len < 1) continue;
      // u points from b toward o (across the border); v runs along the border.
      const ux = dx / len, uy = dy / len;
      const vx = -uy, vy = ux;
      const mx = (b.x + o.x) / 2, my = (b.y + o.y) / 2;

      // Fast reject: if the whole polygon sits more than max-wobble from the
      // straight bisector on one side, this pair can never touch the cell.
      let minSd = Infinity, maxSd = -Infinity;
      for (const [px, py] of poly) {
        const sd = (px - mx) * ux + (py - my) * uy;
        if (sd < minSd) minSd = sd;
        if (sd > maxSd) maxSd = sd;
      }
      if (minSd > CELL_MAX_WOBBLE || maxSd < -CELL_MAX_WOBBLE) continue;

      const pairKey = b.id < o.id ? `${b.id}|${o.id}` : `${o.id}|${b.id}`;
      // Project the current polygon onto v to bound the wobble sampling. The
      // absolute t-grid (k * CELL_STEP) is identical for both cells, so both
      // clip against exactly the same hand-drawn border.
      let tMin = Infinity, tMax = -Infinity;
      for (const [px, py] of poly) {
        const t = (px - mx) * vx + (py - my) * vy;
        if (t < tMin) tMin = t;
        if (t > tMax) tMax = t;
      }
      const rec = pairRanges.get(pairKey) ?? { i: Math.min(i, j), j: Math.max(i, j), range: [] as [number, number][] };
      rec.range.push([tMin, tMax]);
      pairRanges.set(pairKey, rec);

      // Clip the polygon against the sampled border, one straight segment at a
      // time (Sutherland–Hodgman). b's cell keeps the side with sd <= 0.
      const k0 = Math.floor((tMin - CELL_MAX_WOBBLE) / CELL_STEP);
      const k1 = Math.ceil((tMax + CELL_MAX_WOBBLE) / CELL_STEP);
      let prevPt: [number, number] | null = null;
      for (let k = k0; k <= k1; k++) {
        const t = k * CELL_STEP;
        const wob = borderWobble(pairKey, t);
        const px = mx + wob * ux + t * vx;
        const py = my + wob * uy + t * vy;
        if (prevPt) {
          const a = prevPt;
          const out: [number, number][] = [];
          for (let vi = 0; vi < poly.length; vi++) {
            const c = poly[vi];
            const nx = poly[(vi + 1) % poly.length];
            const sc = (c[0] - a[0]) * ux + (c[1] - a[1]) * uy;
            const sn = (nx[0] - a[0]) * ux + (nx[1] - a[1]) * uy;
            const ic = sc <= 0.5, inn = sn <= 0.5;
            if (ic) out.push(c);
            if (ic !== inn) {
              const f = sc / (sc - sn);
              out.push([c[0] + (nx[0] - c[0]) * f, c[1] + (nx[1] - c[1]) * f]);
            }
          }
          poly = out;
          if (poly.length < 3) break;
        }
        prevPt = [px, py];
      }
    }
    cells.push(poly);
  }

  // Rebuild one crisp border polyline per adjacent pair (shared geometry).
  const borders: [number, number][][] = [];
  for (const { i, j, range } of pairRanges.values()) {
    if (range.length < 2) continue; // only one side saw it — not a shared edge
    if (cells[i].length < 3 || cells[j].length < 3) continue; // degenerate cell
    const b = baronies[i], o = baronies[j];
    const dx = o.x - b.x, dy = o.y - b.y;
    const len = Math.hypot(dx, dy);
    if (len < 1) continue;
    const ux = dx / len, uy = dy / len;
    const vx = -uy, vy = ux;
    const mx = (b.x + o.x) / 2, my = (b.y + o.y) / 2;
    const pairKey = b.id < o.id ? `${b.id}|${o.id}` : `${o.id}|${b.id}`;
    // Tiny margin (half a sample) masks the piecewise curve approximation
    // without letting the border stub into a third realm at triple junctions.
    const tLo = Math.max(range[0][0], range[1][0]) - CELL_STEP * 0.5;
    const tHi = Math.min(range[0][1], range[1][1]) + CELL_STEP * 0.5;
    const kLo = Math.floor(tLo / CELL_STEP), kHi = Math.ceil(tHi / CELL_STEP);
    const pts: [number, number][] = [];
    for (let k = kLo; k <= kHi; k++) {
      const t = k * CELL_STEP;
      const wob = borderWobble(pairKey, t);
      pts.push([mx + wob * ux + t * vx, my + wob * uy + t * vy]);
    }
    if (pts.length >= 2) borders.push(pts);
  }

  voronoiCache.sig = sig;
  voronoiCache.result = { cells, borders };
  return voronoiCache.result;
}

function cellCentroid(poly: [number, number][]): [number, number] {
  let ax = 0, ay = 0;
  for (const [x, y] of poly) { ax += x; ay += y; }
  const n = poly.length || 1;
  return [ax / n, ay / n];
}

// Radius from a cell's centroid to its farthest vertex — used to feather a
// radial realm tint to (near) zero at the cell edge, so neighbouring realms
// blend into regions instead of reading as hard-edged hexagons.
function cellRadius(cx: number, cy: number, poly: [number, number][]): number {
  let r = 0;
  for (const [x, y] of poly) { const d = Math.hypot(x - cx, y - cy); if (d > r) r = d; }
  return r;
}

function drawRealmTerritories(ctx: CanvasRenderingContext2D, baronies: Barony[]) {
  const { cells, borders } = baronyCells(baronies);

  // Feathered radial tints, non-player realms first and the player's seat last.
  // Each wash is clipped to its own Voronoi cell and fades to transparent at the
  // edge, so neighbouring realms blend softly — CK3-style regional colour washes.
  for (let bi = 1; bi < baronies.length; bi++) {
    const b = baronies[bi];
    const poly = cells[bi];
    if (!poly || poly.length < 3) continue;
    const tri = baronyColor(b.color, b.id + b.house);
    const [cx, cy] = cellCentroid(poly);
    const rr = cellRadius(cx, cy, poly);
    tracePoly(ctx, poly);
    ctx.save();
    ctx.clip();
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
    grad.addColorStop(0, triAlpha(tri, 0.42));
    grad.addColorStop(0.55, triAlpha(tri, 0.16));
    grad.addColorStop(1, triAlpha(tri, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
    ctx.restore();
  }
  const p = baronies[0];
  if (p && cells[0] && cells[0].length >= 3) {
    const tri = baronyColor(p.color, p.id + p.house);
    const [cx, cy] = cellCentroid(cells[0]);
    const rr = cellRadius(cx, cy, cells[0]);
    tracePoly(ctx, cells[0]);
    ctx.save();
    ctx.clip();
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
    grad.addColorStop(0, triAlpha(tri, 0.58));
    grad.addColorStop(0.55, triAlpha(tri, 0.24));
    grad.addColorStop(1, triAlpha(tri, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
    ctx.restore();
  }

  // Soft ink underlay on every cell edge — hides seams and grounds each realm
  // where it faces open land, without a hard polygon band.
  ctx.save();
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(24,18,10,0.14)";
  ctx.lineWidth = 3;
  for (let bi = 0; bi < cells.length; bi++) {
    const poly = cells[bi];
    if (!poly || poly.length < 3) continue;
    tracePoly(ctx, poly);
    ctx.stroke();
  }
  ctx.restore();

  // Feathered shared borders — one soft ink line per adjacent pair, lightened so
  // realms read as gently-divided regions rather than crisp cut boundaries.
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const bp of borders) {
    traceOpen(ctx, bp);
    ctx.strokeStyle = "rgba(22,16,9,0.32)";
    ctx.lineWidth = 3.5;
    ctx.stroke();
    traceOpen(ctx, bp);
    ctx.strokeStyle = "rgba(150,122,70,0.32)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
  ctx.restore();

  // The player's realm gets a soft gold ring on top.
  if (p && cells[0] && cells[0].length >= 3) {
    ctx.save();
    ctx.shadowColor = "rgba(244, 214, 120, 0.5)";
    ctx.shadowBlur = 22;
    tracePoly(ctx, cells[0]);
    ctx.strokeStyle = "rgba(244, 214, 120, 0.85)";
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.restore();
  }
}

/** Standard even-odd ray-cast point-in-polygon test. */
function pointInPoly(x: number, y: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * Returns the index (into `baronies`) of the barony whose Voronoi territory
 * contains the world point (x, y), or -1 if the point is off-land or outside
 * every cell. Used to turn clicks on realm territory into a barony selection.
 */
export function baronyIndexAt(baronies: Barony[], x: number, y: number): number {
  if (!pointInPoly(x, y, getLandPoly())) return -1; // don't select realms from the ocean
  const { cells } = baronyCells(baronies);
  for (let i = 0; i < cells.length; i++) {
    const poly = cells[i];
    if (poly.length >= 3 && pointInPoly(x, y, poly)) return i;
  }
  return -1;
}

/* ═══ TERRAIN DECORATIONS ═══ */

function drawRivers(ctx: CanvasRenderingContext2D) {
  const rivers: [number, number][][] = [
    [[2700, 4700], [4000, 5000], [5800, 5280], [7900, 5200], [9800, 4980], [11700, 4800]],
    [[7050, 2050], [6900, 2900], [7150, 3700], [7420, 4550]],
    [[7600, 8050], [8100, 7200], [8850, 6450], [9350, 5850]],
  ];
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const pts of rivers) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.strokeStyle = "rgba(58,108,150,0.5)";
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.strokeStyle = "rgba(152,190,224,0.7)";
    ctx.lineWidth = 3.2;
    ctx.stroke();
  }
  ctx.restore();
}

function drawMountainRange(ctx: CanvasRenderingContext2D, cx0: number, cy0: number, n: number, w: number, hMax: number, fill: string) {
  ctx.save();
  ctx.lineJoin = "round";
  for (let i = 0; i < n; i++) {
    const x = cx0 + i * w - ((n - 1) * w) / 2;
    const hh = hMax * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.7)));
    const y = cy0 + hh * 0.3;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.lineTo(x, y - hh);
    ctx.lineTo(x + w / 2, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(235,240,245,0.55)";
    ctx.beginPath();
    ctx.moveTo(x - w * 0.09, y - hh * 0.8);
    ctx.lineTo(x, y - hh);
    ctx.lineTo(x + w * 0.09, y - hh * 0.8);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawPine(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.lineTo(x + s * 0.55, y + s * 0.05);
  ctx.lineTo(x - s * 0.55, y + s * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.45);
  ctx.lineTo(x + s * 0.5, y + s * 0.62);
  ctx.lineTo(x - s * 0.5, y + s * 0.62);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(96,64,40,0.9)";
  ctx.fillRect(x - s * 0.07, y + s * 0.58, s * 0.14, s * 0.4);
}

function drawForestPatch(ctx: CanvasRenderingContext2D, cx0: number, cy0: number, nx: number, ny: number, spacing: number, color: string) {
  for (let gy = 0; gy < ny; gy++) {
    for (let gx = 0; gx < nx; gx++) {
      const x = cx0 + (gx - (nx - 1) / 2) * spacing + Math.sin(gy * 3 + gx) * 7;
      const y = cy0 + (gy - (ny - 1) / 2) * spacing + Math.cos(gx * 2 + gy) * 7;
      drawPine(ctx, x, y, 7 + Math.abs(Math.sin(gx * 2.3 + gy * 1.9)) * 6, color);
    }
  }
}

function drawFarmland(ctx: CanvasRenderingContext2D, cx0: number, cy0: number, nx: number, ny: number, spacing: number) {
  ctx.save();
  ctx.strokeStyle = "rgba(128,106,58,0.42)";
  ctx.lineWidth = 1.6;
  for (let gy = 0; gy < ny; gy++) {
    for (let gx = 0; gx < nx; gx++) {
      const x = cx0 + (gx - (nx - 1) / 2) * spacing;
      const y = cy0 + (gy - (ny - 1) / 2) * spacing;
      ctx.beginPath();
      ctx.moveTo(x - 8, y);
      ctx.lineTo(x + 8, y);
      ctx.moveTo(x, y - 8);
      ctx.lineTo(x, y + 8);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawHills(ctx: CanvasRenderingContext2D, cx0: number, cy0: number, n: number, spacing: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const x = cx0 + i * spacing - ((n - 1) * spacing) / 2;
    const y = cy0 + Math.sin(i * 1.3) * 9;
    ctx.beginPath();
    ctx.ellipse(x, y, 15, 6.5, 0, Math.PI, 0);
    ctx.fill();
  }
  ctx.restore();
}

function drawTerrain(ctx: CanvasRenderingContext2D) {
  drawMountainRange(ctx, 2300, 4400, 16, 90, 110, "rgba(118,106,96,0.9)");
  drawMountainRange(ctx, 7300, 1350, 14, 100, 100, "rgba(96,120,150,0.85)");
  drawMountainRange(ctx, 11500, 4100, 10, 80, 80, "rgba(110,100,92,0.8)");
  drawForestPatch(ctx, 8200, 1250, 7, 5, 42, "rgba(64,110,64,0.85)");
  drawForestPatch(ctx, 6650, 7800, 8, 6, 40, "rgba(52,96,54,0.9)");
  drawForestPatch(ctx, 6100, 1550, 5, 4, 38, "rgba(70,118,66,0.8)");
  drawFarmland(ctx, 7000, 4700, 7, 6, 52);
  drawFarmland(ctx, 8400, 5300, 6, 5, 48);
  drawHills(ctx, 3800, 5050, 8, 55, "rgba(150,132,110,0.5)");
  drawHills(ctx, 9800, 3900, 6, 50, "rgba(150,132,110,0.45)");
}

function drawHexGrid(ctx: CanvasRenderingContext2D, camX: number, camY: number, zoom: number, vw: number, vh: number) {
  const hexR = 80;
  const hexW = hexR * 2;
  const hexH = hexR * Math.sqrt(3);
  const cols = Math.ceil(vw / (hexW * 0.75 * zoom)) + 2;
  const rows = Math.ceil(vh / (hexH * zoom)) + 2;
  const startCol = Math.floor(camX / (hexW * 0.75)) - 1;
  const startRow = Math.floor(camY / hexH) - 1;

  for (let row = startRow; row < startRow + rows; row++) {
    for (let col = startCol; col < startCol + cols; col++) {
      const cx = col * hexW * 0.75;
      const cy = row * hexH + (col % 2 ? hexH / 2 : 0);
      if (cx < -hexW || cx > W + hexW || cy < -hexH || cy > H + hexH) continue;
      const [br, bg, bb] = HEX_BASE[regionAt(cx, cy)];
      const noise = ((cx * 73 + cy * 137) % 17) / 17;
      const r = br + noise * 14 - 7;
      const g = bg + noise * 14 - 7;
      const b = bb + noise * 10 - 5;
      ctx.fillStyle = `rgba(${r},${g},${b},0.55)`;
      ctx.beginPath();
      ctx.moveTo(cx + hexR * 0.92, cy);
      for (let i = 1; i <= 6; i++) {
        const a = (Math.PI / 3) * i;
        ctx.lineTo(cx + hexR * 0.92 * Math.cos(a), cy + hexR * 0.92 * Math.sin(a));
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(140,120,90,0.08)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }
}

function drawRegionOverlays(ctx: CanvasRenderingContext2D) {
  const regions = Object.entries(RC) as [Region, typeof RC[Region]][];
  for (const [name, r] of regions) {
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, 300, 200, 0, 0, Math.PI * 2);
    ctx.strokeStyle = r.color + "22";
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "italic 600 15px Georgia, 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "rgba(24,20,14,0.85)";
    ctx.lineWidth = 4;
    ctx.strokeText(name.toUpperCase(), r.x, r.y - 205);
    ctx.fillStyle = "rgba(216,192,112,0.92)";
    ctx.fillText(name.toUpperCase(), r.x, r.y - 205);
  }
}

function drawRoads(ctx: CanvasRenderingContext2D, roads: Road[], settMap: Map<string, { x: number; y: number }>) {
  for (const road of roads) {
    if (road.level < 1) continue;
    const a = settMap.get(road.fromSid);
    const b = settMap.get(road.toSid);
    if (!a || !b) continue;
    const isGhost = road.decayed;
    const baseAlpha = isGhost ? 0.15 : road.level === 3 ? 0.45 : road.level === 2 ? 0.25 : 0.12;
    const width = isGhost ? road.level * 0.8 : road.level * 1.5;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = `rgba(80,60,30,${baseAlpha * 0.3})`;
    ctx.lineWidth = width + 2;
    if (isGhost) ctx.setLineDash([6, 14]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = isGhost
      ? `rgba(160,140,100,${baseAlpha})`
      : road.level === 3
        ? `rgba(200,180,130,${baseAlpha})`
        : `rgba(180,160,120,${baseAlpha})`;
    ctx.lineWidth = width;
    if (isGhost) ctx.setLineDash([6, 14]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawWarZones(ctx: CanvasRenderingContext2D, atWar: string[], baronies: Barony[]) {
  const t = Date.now() * 0.002;
  const pulse = 0.15 + Math.sin(t) * 0.08;
  for (const b of baronies) {
    if (!atWar.includes(b.id)) continue;
    const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 200);
    grad.addColorStop(0, `rgba(200,60,40,${pulse})`);
    grad.addColorStop(0.5, `rgba(200,60,40,${pulse * 0.4})`);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(220,80,50,${pulse * 2})`;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(b.x - 9, b.y - 189);
    ctx.lineTo(b.x + 9, b.y - 171);
    ctx.moveTo(b.x - 9, b.y - 171);
    ctx.lineTo(b.x + 9, b.y - 189);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.x - 4, b.y - 184);
    ctx.lineTo(b.x + 4, b.y - 176);
    ctx.moveTo(b.x + 4, b.y - 184);
    ctx.lineTo(b.x - 4, b.y - 176);
    ctx.stroke();
  }
}

function drawCompass(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.translate(1350, 150);
  ctx.beginPath();
  ctx.arc(0, 0, 40, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(200,168,78,0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "rgba(200,168,78,0.35)";
  ctx.beginPath();
  ctx.moveTo(0, -35); ctx.lineTo(5, -5); ctx.lineTo(35, 0);
  ctx.lineTo(5, 5); ctx.lineTo(0, 35); ctx.lineTo(-5, 5);
  ctx.lineTo(-35, 0); ctx.lineTo(-5, -5); ctx.closePath();
  ctx.fill();
  ctx.font = "bold 12px serif";
  ctx.fillStyle = "rgba(200,168,78,0.5)";
  ctx.textAlign = "center";
  ctx.fillText("N", 0, -44);
  ctx.restore();
}

function drawTitleBanner(ctx: CanvasRenderingContext2D) {
  const bw = 360, bh = 32, bx = W / 2, by = H - 30;
  ctx.fillStyle = "rgba(26,22,17,0.7)";
  ctx.strokeStyle = "rgba(200,168,78,0.4)";
  ctx.lineWidth = 1;
  // Manual rounded rect for browser compat
  const rx = 6;
  ctx.beginPath();
  ctx.moveTo(bx - bw / 2 + rx, by - bh / 2);
  ctx.lineTo(bx + bw / 2 - rx, by - bh / 2);
  ctx.arcTo(bx + bw / 2, by - bh / 2, bx + bw / 2, by - bh / 2 + rx, rx);
  ctx.lineTo(bx + bw / 2, by + bh / 2 - rx);
  ctx.arcTo(bx + bw / 2, by + bh / 2, bx + bw / 2 - rx, by + bh / 2, rx);
  ctx.lineTo(bx - bw / 2 + rx, by + bh / 2);
  ctx.arcTo(bx - bw / 2, by + bh / 2, bx - bw / 2, by + bh / 2 - rx, rx);
  ctx.lineTo(bx - bw / 2, by - bh / 2 + rx);
  ctx.arcTo(bx - bw / 2, by - bh / 2, bx - bw / 2 + rx, by - bh / 2, rx);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.font = "13px serif";
  ctx.fillStyle = "rgba(200,168,78,0.7)";
  ctx.textAlign = "center";
  ctx.fillText("THE REALM OF ORESTIA", bx, by + 4);
}

type Season = "Spring" | "Summer" | "Autumn" | "Winter";

interface RealmMapCanvasProps {
  atWar: string[];
  baronies: Barony[];
  roads: Road[];
  settlements: { id: string; x: number; y: number }[];
  camX: number;
  camY: number;
  zoom: number;
  /** Live camera ref ({x,y,z} in world units / zoom), read at 60fps by the rAF
   *  loop so the viewport canvas tracks the same camera the DOM markers use.
   *  When provided it overrides camX/camY/zoom for the dynamic layer. */
  camRef?: { current: { x: number; y: number; z: number } };
  /** If true, renders only the static base layer (no war animation, no hex grid culling) */
  staticMode?: boolean;
  /** Fog of war: hex key -> reveal level (0=hidden, 1=dim, 2=clear) */
  exploredHexes?: Record<string, number>;
  /** Current season for weather particles */
  season?: Season;
}

// ═══ WEATHER PARTICLES ═══
const weatherParticles = new Float64Array(600); // [x, y, vx, vy, life, maxLife] x 100
let weatherInited = false;
function initWeather(W2: number, H2: number) {
  for (let i = 0; i < 100; i++) {
    const off = i * 6;
    weatherParticles[off] = Math.random() * W2;
    weatherParticles[off + 1] = Math.random() * H2;
    weatherParticles[off + 2] = (Math.random() - 0.5) * 40;
    weatherParticles[off + 3] = 20 + Math.random() * 60;
    weatherParticles[off + 4] = Math.random() * 10;
    weatherParticles[off + 5] = 6 + Math.random() * 10;
  }
  weatherInited = true;
}

function drawWeatherParticles(ctx: CanvasRenderingContext2D, season: Season, dt: number) {
  if (!weatherInited) initWeather(W, H);
  ctx.save();
  for (let i = 0; i < 100; i++) {
    const off = i * 6;
    let x = weatherParticles[off];
    let y = weatherParticles[off + 1];
    const vx = weatherParticles[off + 2];
    const vy = weatherParticles[off + 3];
    let life = weatherParticles[off + 4];
    const maxLife = weatherParticles[off + 5];

    // Update
    life += dt;
    if (life >= maxLife) {
      x = Math.random() * W;
      y = -10;
      life = 0;
      weatherParticles[off] = x;
      weatherParticles[off + 5] = 6 + Math.random() * 14;
    } else {
      weatherParticles[off] = x + vx * dt;
      weatherParticles[off + 1] = y + vy * dt;
    }
    weatherParticles[off + 4] = life;
    if (weatherParticles[off + 1] > H + 50) {
      weatherParticles[off] = Math.random() * W;
      weatherParticles[off + 1] = -10;
      weatherParticles[off + 4] = 0;
    }

    const alpha = 1 - life / maxLife;
    const px = weatherParticles[off];
    const py = weatherParticles[off + 1];

    if (season === "Winter") {
      // Snow
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(px, py, 2.5 * alpha + 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (season === "Spring") {
      // Rain
      ctx.strokeStyle = `rgba(100,140,180,${alpha * 0.22})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + vx * 0.3, py + 8);
      ctx.stroke();
    } else if (season === "Autumn") {
      // Falling leaves
      ctx.fillStyle = `rgba(210,140,40,${alpha * 0.35})`;
      ctx.beginPath();
      ctx.arc(px, py, 3 * alpha + 1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Summer — heat shimmer (tiny glowing motes)
      ctx.fillStyle = `rgba(255,230,160,${alpha * 0.15})`;
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawFogOfWar(ctx: CanvasRenderingContext2D, exploredHexes: Record<string, number>, camX: number, camY: number, zoom: number, vw: number, vh: number) {
  const hexR = 80;
  const colSpacing = hexR * 1.5; // staggered column spacing (must match revealHexes + drawHexGrid)
  const hexH = hexR * Math.sqrt(3);
  const cols = Math.ceil(vw / (colSpacing * zoom)) + 2;
  const rows = Math.ceil(vh / (hexH * zoom)) + 2;
  const startCol = Math.floor(camX / colSpacing) - 1;
  const startRow = Math.floor(camY / hexH) - 1;

  for (let row = startRow; row < startRow + rows; row++) {
    for (let col = startCol; col < startCol + cols; col++) {
      const cx = col * colSpacing;
      const cy = row * hexH + (col % 2 ? hexH / 2 : 0);
      if (cx < -hexR || cx > W + hexR || cy < -hexH || cy > H + hexH) continue;
      const k = `${col},${row}`;
      const level = exploredHexes[k] ?? 0;
      if (level >= 2) continue; // fully revealed
      const alpha = level === 0 ? 0.75 : 0.35; // hidden = dark, dim = semi-transparent
      ctx.fillStyle = `rgba(20,18,15,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(cx + hexR * 0.92, cy);
      for (let i = 1; i <= 6; i++) {
        const a = (Math.PI / 3) * i;
        ctx.lineTo(cx + hexR * 0.92 * Math.cos(a), cy + hexR * 0.92 * Math.sin(a));
      }
      ctx.closePath();
      ctx.fill();
    }
  }
}

export const RealmMapCanvas = memo(function RealmMapCanvas({ atWar, baronies, roads, settlements, camX, camY, zoom, camRef, staticMode, exploredHexes, season }: RealmMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const stateRef = useRef({ atWar, baronies, roads, settlements, camX, camY, zoom, staticMode, exploredHexes, season });
  const lastFrameRef = useRef(0);
  // World-only half of the static cache key (baronies/roads/settlements/fog).
  // Rebuilt only when props change — never inside the per-frame hot path.
  const worldSigRef = useRef("");
  // staticMode (minimap) only needs ~10fps for the war-zone pulse, not 60.
  const lastStaticDrawRef = useRef(0);
  const settMapRef = useRef(new Map<string, { x: number; y: number }>());
  const prevSettLenRef = useRef(settlements.length);

  // Offscreen layer holding the static (non-animated) viewport: hex grid, fog,
  // decorations, borders, roads, compass, banner. Rebuilt only when the camera
  // moves by >= 1 hex, the viewport resizes, or the world signature changes.
  const staticCacheRef = useRef<{ key: string; canvas: HTMLCanvasElement | null; ctx: CanvasRenderingContext2D | null; w: number; h: number }>({ key: "", canvas: null, ctx: null, w: 0, h: 0 });

  // Cheap: camera + viewport only. The expensive world part comes from worldSigRef.
  const staticKey = useCallback((camX: number, camY: number, z: number, vw: number, vh: number, dpr: number) => {
    let k = `${Math.round(camX / 120)}|${Math.round(camY / 138.56)}|${z.toFixed(3)}|${Math.round(vw)}x${Math.round(vh)}@${dpr}`;
    k += "|" + worldSigRef.current;
    return k;
  }, []);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    const now = performance.now();
    const dt = lastFrameRef.current ? (now - lastFrameRef.current) * 0.001 : 0.016;
    lastFrameRef.current = now;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Recreate settMap when settlements length or first item changes (ref-safe here in rAF)
    if (prevSettLenRef.current !== s.settlements.length || (s.settlements.length > 0 && !settMapRef.current.has(s.settlements[0].id))) {
      prevSettLenRef.current = s.settlements.length;
      settMapRef.current = new Map(s.settlements.map(ss => [ss.id, ss]));
    }

    const needsResize = canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr);
    if (needsResize) {
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.save();

    if (s.staticMode) {
      // Static mode: scale entire world into minimap canvas
      const key = staticKey(0, 0, 1, rect.width, rect.height, dpr);
      let cache = staticCacheRef.current;
      const cw = Math.round(rect.width * dpr), ch = Math.round(rect.height * dpr);
      const fresh = cache.canvas && cache.key === key && cache.w === cw && cache.h === ch;
      if (!fresh) {
        if (!cache.canvas) {
          cache.canvas = document.createElement("canvas");
          cache.ctx = cache.canvas.getContext("2d");
        }
        cache.w = cw;
        cache.h = ch;
        if (cache.canvas.width !== cw) cache.canvas.width = cw;
        if (cache.canvas.height !== ch) cache.canvas.height = ch;
        const cctx = cache.ctx;
        if (cctx) {
          const scale = Math.min(rect.width / W, rect.height / H);
          cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          cctx.clearRect(0, 0, rect.width, rect.height);
          cctx.save();
          cctx.scale(scale, scale);
          fillOcean(cctx);
          const land = getLandPoly();
          tracePoly(cctx, land);
          cctx.save();
          cctx.clip();
          fillParchment(cctx);
          // Skip hex grid in staticMode — too wasteful at minimap scale
          drawTerrain(cctx);
          drawRivers(cctx);
          drawRoads(cctx, s.roads, settMapRef.current);
          // Simplified fog for minimap: uniform dim overlay
          if (s.exploredHexes && Object.keys(s.exploredHexes).length > 0) {
            cctx.fillStyle = "rgba(20,18,15,0.25)";
            cctx.fillRect(0, 0, W, H);
          }
          drawRealmTerritories(cctx, s.baronies);
          drawRegionOverlays(cctx);
          cctx.restore();
          strokeCoastline(cctx);
          cctx.restore();
        }
        cache.key = key;
      }
      if (cache.canvas) ctx.drawImage(cache.canvas, 0, 0, rect.width, rect.height);

      // Animated war-zone pulses on top (rare)
      ctx.save();
      const scale = Math.min(rect.width / W, rect.height / H);
      ctx.scale(scale, scale);
      drawWarZones(ctx, s.atWar, s.baronies);
      ctx.restore();
    } else {
      // Dynamic mode: camera-transformed.
      // Prefer the live camera ref (read at 60fps) so the viewport canvas tracks the
      // same camera the DOM markers use; fall back to props when no ref is provided.
      const live = camRef?.current;
      const camX = live?.x ?? s.camX;
      const camY = live?.y ?? s.camY;
      const zoom = live?.z ?? s.zoom;

      const vw = rect.width / zoom;
      const vh = rect.height / zoom;

      // Static layer (hex grid, fog, borders, roads, compass, banner) is cached per
      // viewport + world-signature so idle frames skip the expensive path/fill work.
      const key = staticKey(camX, camY, zoom, vw, vh, dpr);
      let cache = staticCacheRef.current;
      const cw = Math.round(rect.width * dpr), ch = Math.round(rect.height * dpr);
      const fresh = cache.canvas && cache.key === key && cache.w === cw && cache.h === ch;
      if (!fresh) {
        if (!cache.canvas) {
          cache.canvas = document.createElement("canvas");
          cache.ctx = cache.canvas.getContext("2d");
        }
        cache.w = cw;
        cache.h = ch;
        if (cache.canvas.width !== cw) cache.canvas.width = cw;
        if (cache.canvas.height !== ch) cache.canvas.height = ch;
        const cctx = cache.ctx;
        if (cctx) {
          cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          cctx.clearRect(0, 0, rect.width, rect.height);
          cctx.save();
          cctx.translate(-camX * zoom, -camY * zoom);
          cctx.scale(zoom, zoom);

          fillOcean(cctx);
          const land = getLandPoly();
          tracePoly(cctx, land);
          cctx.save();
          cctx.clip();
          fillParchment(cctx);
          const vignette = cctx.createRadialGradient(W / 2, H / 2, 3000, W / 2, H / 2, 7800);
          vignette.addColorStop(0, "rgba(80,65,35,0)");
          vignette.addColorStop(1, "rgba(60,48,26,0.22)");
          cctx.fillStyle = vignette;
          cctx.fillRect(0, 0, W, H);

          drawHexGrid(cctx, camX, camY, zoom, vw, vh);
          drawTerrain(cctx);
          drawRivers(cctx);
          drawRoads(cctx, s.roads, settMapRef.current);
          // Fog of war overlay
          if (s.exploredHexes && Object.keys(s.exploredHexes).length > 0) {
            drawFogOfWar(cctx, s.exploredHexes, camX, camY, zoom, vw, vh);
          }
          // Realm territories drawn ABOVE the fog so baron colors always read
          // (CK3-style political map), while unexplored land stays darker.
          drawRealmTerritories(cctx, s.baronies);
          drawRegionOverlays(cctx);
          cctx.restore();
          strokeCoastline(cctx);
          drawCompass(cctx);
          drawTitleBanner(cctx);
          cctx.restore();
        }
        cache.key = key;
      }
      if (cache.canvas) ctx.drawImage(cache.canvas, 0, 0, rect.width, rect.height);

      // Animated overlay (weather + war pulses) still drawn every frame
      ctx.save();
      ctx.translate(-camX * zoom, -camY * zoom);
      ctx.scale(zoom, zoom);
      drawWarZones(ctx, s.atWar, s.baronies);
      if (s.season) drawWeatherParticles(ctx, s.season, Math.min(dt, 0.1));
      ctx.restore();
    }

    ctx.restore();
  }, [staticKey, camRef]);

  useEffect(() => {
    // Props flow into the rAF draw loop via this ref. Synced in an effect (not during
    // render) so the component can be React.memo'd without risking stale draws.
    const s = { atWar, baronies, roads, settlements, camX, camY, zoom, staticMode, exploredHexes, season };
    stateRef.current = s;
    // Cache the world-only half of the static key here — O(baronies+roads+settlements+fog)
    // runs only when those props actually change, never on every animation frame.
    let ws = "B" + s.baronies.map(b => `${b.id}@${b.x.toFixed(0)},${b.y.toFixed(0)},${b.rel.toFixed(0)},${b.color},${s.atWar.includes(b.id) ? 1 : 0}`).join(";");
    ws += "|R" + s.roads.map(r => `${r.fromSid}-${r.toSid}-${r.level}-${r.decayed ? 1 : 0}`).join(";");
    ws += "|S" + s.settlements.map(ss => `${ss.id}@${ss.x.toFixed(0)},${ss.y.toFixed(0)}`).join(";");
    let eh = 0;
    let eCount = 0;
    if (s.exploredHexes) for (const e in s.exploredHexes) { eh = (eh * 31 + s.exploredHexes[e]) | 0; eCount++; }
    ws += `|E${eCount}:${eh}`;
    worldSigRef.current = ws;
  }, [atWar, baronies, roads, settlements, camX, camY, zoom, staticMode, exploredHexes, season]);

  useEffect(() => {
    // Continuous loop: props flow in through stateRef, the static-layer cache keeps
    // idle frames cheap. Weather always animates in dynamic mode. The minimap
    // (staticMode) only needs a slow pulse, so throttle it to ~10fps.
    const loop = () => {
      if (stateRef.current.staticMode) {
        const now = performance.now();
        if (now - lastStaticDrawRef.current < 100) {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }
        lastStaticDrawRef.current = now;
      }
      drawFrame();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawFrame]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ imageRendering: zoom > 1.5 ? "pixelated" : "auto" }}
    />
  );
});
