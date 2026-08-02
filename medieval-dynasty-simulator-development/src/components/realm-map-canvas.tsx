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
      const noise = ((cx * 73 + cy * 137) % 17) / 17;
      const r = 196 + noise * 14 - 7;
      const g = 186 + noise * 14 - 7;
      const b = 155 + noise * 10 - 5;
      ctx.fillStyle = `rgba(${r},${g},${b},0.55)`;
      ctx.beginPath();
      ctx.moveTo(cx + hexR, cy);
      for (let i = 1; i <= 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
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
    const grad = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, 500);
    grad.addColorStop(0, r.fillColor);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(r.x - 500, r.y - 500, 1000, 1000);
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, 300, 200, 0, 0, Math.PI * 2);
    ctx.strokeStyle = r.color + "33";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "italic 14px serif";
    ctx.fillStyle = r.color + "88";
    ctx.textAlign = "center";
    ctx.fillText(name.toUpperCase(), r.x, r.y - 210);
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

function drawBaronyBorders(ctx: CanvasRenderingContext2D, baronies: Barony[], atWar: string[]) {
  for (const b of baronies) {
    const r = 350 + (b.rel + 50) * 1.5;
    ctx.beginPath();
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = atWar.includes(b.id) ? "rgba(200,80,50,0.25)" : b.color + "30";
    ctx.lineWidth = atWar.includes(b.id) ? 2 : 1;
    ctx.setLineDash(atWar.includes(b.id) ? [] : [12, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawDecorations(ctx: CanvasRenderingContext2D) {
  // Mountains — Northern Marches
  ctx.save();
  ctx.translate(600, 80);
  ctx.strokeStyle = "rgba(90,128,160,0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 14; i++) {
    const x = i * 20;
    ctx.moveTo(x, 35 + Math.sin(i) * 15);
    ctx.lineTo(x + 6, 10 + Math.cos(i) * 12);
    ctx.lineTo(x + 12, 38 + Math.sin(i + 1) * 15);
  }
  ctx.stroke();
  ctx.restore();
  // Mountains — Western Highlands
  ctx.save();
  ctx.translate(160, 370);
  ctx.strokeStyle = "rgba(106,96,88,0.3)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const x = i * 16;
    ctx.moveTo(x, 22 + Math.sin(i * 1.5) * 12);
    ctx.lineTo(x + 5, 6);
    ctx.lineTo(x + 10, 25 + Math.cos(i) * 10);
  }
  ctx.stroke();
  ctx.restore();
  // Trees — Southern Wilds
  ctx.fillStyle = "rgba(74,122,66,0.25)";
  for (let i = 0; i < 24; i++) {
    const tx = 580 + (i % 8) * 35;
    const ty = 760 + Math.floor(i / 8) * 22;
    ctx.beginPath();
    ctx.arc(tx, ty, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(tx - 0.5, ty + 4, 1, 8);
  }
  // Ocean waves
  ctx.strokeStyle = "rgba(90,74,42,0.04)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 30; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 50, 800 + i * 3);
    ctx.quadraticCurveTo(i * 50 + 25, 790 + i * 3, i * 50 + 50, 800 + i * 3);
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
      ctx.moveTo(cx + hexR, cy);
      for (let i = 1; i <= 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        ctx.lineTo(cx + hexR * 0.95 * Math.cos(a), cy + hexR * 0.95 * Math.sin(a));
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
          cctx.fillStyle = "#d4caa5";
          cctx.fillRect(0, 0, W, H);
          const edgeGrad = cctx.createRadialGradient(W / 2, H / 2, 2000, W / 2, H / 2, 8000);
          edgeGrad.addColorStop(0, "rgba(212,202,165,0)");
          edgeGrad.addColorStop(1, "rgba(160,150,120,0.3)");
          cctx.fillStyle = edgeGrad;
          cctx.fillRect(0, 0, W, H);
          // Skip hex grid in staticMode — too wasteful at minimap scale
          drawDecorations(cctx);
          drawRegionOverlays(cctx);
          drawBaronyBorders(cctx, s.baronies, s.atWar);
          drawRoads(cctx, s.roads, settMapRef.current);
          // Simplified fog for minimap: uniform dim overlay
          if (s.exploredHexes && Object.keys(s.exploredHexes).length > 0) {
            cctx.fillStyle = "rgba(20,18,15,0.25)";
            cctx.fillRect(0, 0, W, H);
          }
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

          cctx.fillStyle = "#d4caa5";
          cctx.fillRect(0, 0, W, H);
          const edgeGrad = cctx.createRadialGradient(W / 2, H / 2, 2000, W / 2, H / 2, 8000);
          edgeGrad.addColorStop(0, "rgba(212,202,165,0)");
          edgeGrad.addColorStop(1, "rgba(160,150,120,0.3)");
          cctx.fillStyle = edgeGrad;
          cctx.fillRect(0, 0, W, H);

          drawHexGrid(cctx, s.camX, s.camY, s.zoom, vw, vh);
          drawDecorations(cctx);
          drawRegionOverlays(cctx);
          drawBaronyBorders(cctx, s.baronies, s.atWar);
          drawRoads(cctx, s.roads, settMapRef.current);
          // Fog of war overlay
          if (s.exploredHexes && Object.keys(s.exploredHexes).length > 0) {
            drawFogOfWar(cctx, s.exploredHexes, s.camX, s.camY, s.zoom, vw, vh);
          }
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
