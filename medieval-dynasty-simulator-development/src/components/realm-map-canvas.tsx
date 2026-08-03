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

/** Per-house realm tint: hue/lightness/saturation drift off the region base color. */
function baronyColor(color: string, id: string): [number, number, number] {
  const [r, g, b] = hexToRgb(color);
  const [h, s, l] = rgbToHsl(r, g, b);
  const hh = hashStr(id);
  const nh = (h + ((hh % 13) - 6) * 4 + 360) % 360;
  const ns = clamp(s + (((hh >> 4) % 9) - 4) * 0.04, 0.18, 0.78);
  const nl = clamp(l + (((hh >> 7) % 13) - 6) * 0.03, 0.34, 0.74);
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

function baronyPoly(b: Barony): [number, number][] {
  const r = 350 + (b.rel + 50) * 1.5;
  const h = hashStr(b.id + b.house);
  const pts: [number, number][] = [];
  for (let i = 0; i <= 16; i++) {
    const ang = (i / 16) * Math.PI * 2;
    const wob = 0.8 + 0.32 * Math.abs(Math.sin(i * 2.6 + (h % 11)));
    const x = b.x + Math.cos(ang) * r * wob + Math.sin(ang * 2 + h) * 16;
    const y = b.y + Math.sin(ang) * r * wob * 0.94 + Math.cos(ang * 3 + h) * 16;
    pts.push([x, y]);
  }
  return pts;
}

function drawRealmTerritories(ctx: CanvasRenderingContext2D, baronies: Barony[]) {
  // Non-player domains first, player realm last so its gold ring reads on top.
  for (let bi = 1; bi < baronies.length; bi++) {
    const b = baronies[bi];
    const tri = baronyColor(b.color, b.id + b.house);
    tracePoly(ctx, baronyPoly(b));
    ctx.fillStyle = triAlpha(tri, 0.27);
    ctx.fill();
    ctx.strokeStyle = triAlpha(tri, 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  const p = baronies[0];
  if (p) {
    const tri = baronyColor(p.color, p.id + p.house);
    tracePoly(ctx, baronyPoly(p));
    ctx.fillStyle = triAlpha(tri, 0.36);
    ctx.fill();
    ctx.strokeStyle = triAlpha(tri, 0.95);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.save();
    ctx.shadowColor = "rgba(244, 214, 120, 0.55)";
    ctx.shadowBlur = 22;
    ctx.strokeStyle = "rgba(244, 214, 120, 0.95)";
    ctx.lineWidth = 3.5;
    tracePoly(ctx, baronyPoly(p));
    ctx.stroke();
    ctx.restore();
  }
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

export const RealmMapCanvas = memo(function RealmMapCanvas({ atWar, baronies, roads, settlements, camX, camY, zoom, staticMode, exploredHexes, season }: RealmMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const stateRef = useRef({ atWar, baronies, roads, settlements, camX, camY, zoom, staticMode, exploredHexes, season });
  const lastFrameRef = useRef(0);
  const settMapRef = useRef(new Map<string, { x: number; y: number }>());
  const prevSettLenRef = useRef(settlements.length);

  // Offscreen layer holding the static (non-animated) viewport: hex grid, fog,
  // decorations, borders, roads, compass, banner. Rebuilt only when the camera
  // moves by >= 1 hex, the viewport resizes, or the world signature changes.
  const staticCacheRef = useRef<{ key: string; canvas: HTMLCanvasElement | null; ctx: CanvasRenderingContext2D | null; w: number; h: number }>({ key: "", canvas: null, ctx: null, w: 0, h: 0 });

  const staticKey = useCallback((s: typeof stateRef.current, vw: number, vh: number, dpr: number) => {
    let k = `${Math.round(s.camX / 120)}|${Math.round(s.camY / 138.56)}|${s.zoom.toFixed(3)}|${Math.round(vw)}x${Math.round(vh)}@${dpr}`;
    k += "|B" + s.baronies.map(b => `${b.id}@${b.x.toFixed(0)},${b.y.toFixed(0)},${b.rel.toFixed(0)},${b.color},${s.atWar.includes(b.id) ? 1 : 0}`).join(";");
    k += "|R" + s.roads.map(r => `${r.fromSid}-${r.toSid}-${r.level}-${r.decayed ? 1 : 0}`).join(";");
    k += "|S" + s.settlements.map(ss => `${ss.id}@${ss.x.toFixed(0)},${ss.y.toFixed(0)}`).join(";");
    let eh = 0;
    let eCount = 0;
    if (s.exploredHexes) for (const e in s.exploredHexes) { eh = (eh * 31 + s.exploredHexes[e]) | 0; eCount++; }
    k += `|E${eCount}:${eh}`;
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

    const dpr = window.devicePixelRatio || 1;
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
      const key = staticKey(s, rect.width, rect.height, dpr);
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
          drawRealmTerritories(cctx, s.baronies);
          drawRivers(cctx);
          drawRegionOverlays(cctx);
          drawRoads(cctx, s.roads, settMapRef.current);
          // Simplified fog for minimap: uniform dim overlay
          if (s.exploredHexes && Object.keys(s.exploredHexes).length > 0) {
            cctx.fillStyle = "rgba(20,18,15,0.25)";
            cctx.fillRect(0, 0, W, H);
          }
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
      // Dynamic mode: camera-transformed
      const vw = rect.width / s.zoom;
      const vh = rect.height / s.zoom;

      // Static layer (hex grid, fog, borders, roads, compass, banner) is cached per
      // viewport + world-signature so idle frames skip the expensive path/fill work.
      const key = staticKey(s, vw, vh, dpr);
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
          cctx.translate(-s.camX * s.zoom, -s.camY * s.zoom);
          cctx.scale(s.zoom, s.zoom);

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

          drawHexGrid(cctx, s.camX, s.camY, s.zoom, vw, vh);
          drawTerrain(cctx);
          drawRealmTerritories(cctx, s.baronies);
          drawRivers(cctx);
          drawRegionOverlays(cctx);
          drawRoads(cctx, s.roads, settMapRef.current);
          // Fog of war overlay
          if (s.exploredHexes && Object.keys(s.exploredHexes).length > 0) {
            drawFogOfWar(cctx, s.exploredHexes, s.camX, s.camY, s.zoom, vw, vh);
          }
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
      ctx.translate(-s.camX * s.zoom, -s.camY * s.zoom);
      ctx.scale(s.zoom, s.zoom);
      drawWarZones(ctx, s.atWar, s.baronies);
      if (s.season) drawWeatherParticles(ctx, s.season, Math.min(dt, 0.1));
      ctx.restore();
    }

    ctx.restore();
  }, [staticKey]);

  useEffect(() => {
    // Props flow into the rAF draw loop via this ref. Synced in an effect (not during
    // render) so the component can be React.memo'd without risking stale draws.
    stateRef.current = { atWar, baronies, roads, settlements, camX, camY, zoom, staticMode, exploredHexes, season };
  }, [atWar, baronies, roads, settlements, camX, camY, zoom, staticMode, exploredHexes, season]);

  useEffect(() => {
    // Continuous loop: props flow in through stateRef, the static-layer cache keeps
    // idle frames cheap. Weather always animates in dynamic mode.
    const loop = () => { drawFrame(); rafRef.current = requestAnimationFrame(loop); };
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
