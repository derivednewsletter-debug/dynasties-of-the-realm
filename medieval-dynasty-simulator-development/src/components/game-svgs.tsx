/**
 * High-quality SVG placeholder images for the game.
 * Each export is a data:image/svg+xml;base64 URI that works without any /public/image files.
 */

function svgUri(svg: string): string {
  const bytes = new TextEncoder().encode(svg);
  const binary = Array.from(bytes, b => String.fromCharCode(b)).join("");
  return `data:image/svg+xml;base64,${btoa(binary)}`;
}

/* ───── REALM MAP ───── */
export const REALM_MAP = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 1000">
  <defs>
    <filter id="parchment"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/><feColorMatrix type="saturate" values="0" in="noise" result="gray"/><feBlend in="SourceGraphic" in2="gray" mode="multiply" result="blend"/></filter>
    <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
    <linearGradient id="compass" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#c8a84e"/><stop offset="100%" stop-color="#8a6a20"/></linearGradient>
    <radialGradient id="oceanGrad"><stop offset="0%" stop-color="#c8c0a8"/><stop offset="100%" stop-color="#b8b090"/></radialGradient>
  </defs>
  <!-- Parchment base -->
  <rect width="1500" height="1000" fill="#d4caa5" filter="url(#parchment)"/>
  <rect width="1500" height="1000" fill="url(#oceanGrad)" opacity="0.3"/>
  <!-- Ocean texture -->
  <g opacity="0.06">
    ${Array.from({length:30},(_,i)=>`<path d="M${i*50} ${800+i*3} Q${i*50+25} ${790+i*3} ${i*50+50} ${800+i*3}" stroke="#5a4a2a" fill="none" stroke-width="0.5"/>`).join('')}
  </g>
  <!-- Northern Marches (top-center) - icy blue region -->
  <ellipse cx="750" cy="150" rx="280" ry="180" fill="#6b9cc4" opacity="0.25"/>
  <path d="M470 150 Q550 40 750 20 Q950 40 1030 150 Q1050 280 750 330 Q450 280 470 150Z" fill="#6b9cc4" opacity="0.2" stroke="#6b9cc4" stroke-width="1.5"/>
  <text x="750" y="180" text-anchor="middle" font-family="serif" font-size="18" fill="#4a7090" font-style="italic">NORTHERN MARCHES</text>
  <!-- Mountain range in Northern Marches -->
  <g transform="translate(600,100)" fill="none" stroke="#5a80a0" stroke-width="1.5" opacity="0.5">
    ${Array.from({length:12},(_,i)=>`<polyline points="${i*22-5},${40+Math.sin(i)*18} ${i*22+5},${15+Math.cos(i)*15} ${i*22+15},${45+Math.sin(i+1)*18}"/>`).join('')}
  </g>
  <!-- Heartlands (center) - golden region -->
  <ellipse cx="750" cy="500" rx="320" ry="200" fill="#c8a84e" opacity="0.2"/>
  <ellipse cx="750" cy="500" rx="260" ry="150" fill="#c8a84e" opacity="0.15" stroke="#c8a84e" stroke-width="1.5" stroke-dasharray="8,4"/>
  <text x="750" y="510" text-anchor="middle" font-family="serif" font-size="18" fill="#8a7030" font-style="italic">HEARTLANDS</text>
  <!-- Crown icon in Heartlands -->
  <text x="750" y="470" text-anchor="middle" font-size="28" fill="#c8a84e" opacity="0.5">♚</text>

  <!-- Western Highlands (left-center) - grey/green region -->
  <ellipse cx="230" cy="470" rx="250" ry="180" fill="#8a8078" opacity="0.2" transform="rotate(-15,230,470)"/>
  <path d="M50 400 Q120 300 230 290 Q340 300 410 400 Q440 540 230 650 Q20 540 50 400Z" fill="#8a8078" opacity="0.15" stroke="#8a8078" stroke-width="1.5"/>
  <text x="230" y="480" text-anchor="middle" font-family="serif" font-size="16" fill="#6a6058" font-style="italic">WESTERN HIGHLANDS</text>
  <!-- Mountains in Western Highlands -->
  <g transform="translate(160,380)" fill="none" stroke="#6a6058" stroke-width="1.2" opacity="0.4">
    ${Array.from({length:10},(_,i)=>`<polyline points="${i*18},${25+Math.sin(i*1.5)*15} ${i*18+6},${8} ${i*18+12},${28+Math.cos(i)*12}"/>`).join('')}
  </g>

  <!-- Eastern Coast (right) - sea-blue region -->
  <path d="M1050 250 Q1120 350 1270 380 Q1350 400 1420 480 Q1440 580 1200 650 Q1050 600 1050 500Z" fill="#4d97a8" opacity="0.2" stroke="#4d97a8" stroke-width="1.5"/>
  <text x="1220" y="480" text-anchor="middle" font-family="serif" font-size="16" fill="#3d7788" font-style="italic">EASTERN COAST</text>
  <!-- Ships -->
  <g opacity="0.35">
    <path d="M1250 390 Q1280 380 1310 390 L1300 400 L1260 400Z" fill="#3d7788"/>
    <path d="M1310 440 Q1335 430 1360 440 L1350 450 L1320 450Z" fill="#3d7788"/>
  </g>

  <!-- Southern Wilds (bottom) - green region -->
  <ellipse cx="750" cy="840" rx="280" ry="160" fill="#5a9a52" opacity="0.2"/>
  <path d="M470 780 Q600 700 750 680 Q900 700 1030 780 Q1030 920 750 1000 Q470 920 470 780Z" fill="#5a9a52" opacity="0.15" stroke="#5a9a52" stroke-width="1.5"/>
  <text x="750" y="860" text-anchor="middle" font-family="serif" font-size="18" fill="#4a7a42" font-style="italic">SOUTHERN WILDS</text>
  <!-- Trees in Southern Wilds -->
  <g opacity="0.3">
    ${Array.from({length:18},(_,i)=>`<circle cx="${650+(i%6)*40}" cy="${780+Math.floor(i/6)*25}" r="6" fill="#4a7a42"/><line x1="${650+(i%6)*40}" y1="${786+Math.floor(i/6)*25}" x2="${650+(i%6)*40}" y2="${796+Math.floor(i/6)*25}" stroke="#4a7a42" stroke-width="1"/>`).join('')}
  </g>

  <!-- Region labels -->
  <g font-family="serif" font-size="11" fill="#5a4a2a" font-style="italic" text-anchor="middle">
    <text x="380" y="640">— West Road —</text>
    <text x="1020" y="340">— East Pass —</text>
    <text x="750" y="620">— King's Road —</text>
  </g>

  <!-- Compass rose -->
  <g transform="translate(1300,140)">
    <circle cx="0" cy="0" r="45" fill="none" stroke="#c8a84e" stroke-width="1" opacity="0.4"/>
    <circle cx="0" cy="0" r="42" fill="none" stroke="#c8a84e" stroke-width="0.5" opacity="0.3"/>
    <path d="M0-40 L8-8 L40 0 L8 8 L0 40 L-8 8 L-40 0 L-8-8Z" fill="url(#compass)" opacity="0.5"/>
    <text x="0" y="-50" text-anchor="middle" font-family="serif" font-size="14" fill="#c8a84e" font-weight="bold">N</text>
    <text x="0" y="62" text-anchor="middle" font-family="serif" font-size="10" fill="#c8a84e">S</text>
    <text x="55" y="4" text-anchor="middle" font-family="serif" font-size="10" fill="#c8a84e">E</text>
    <text x="-55" y="4" text-anchor="middle" font-family="serif" font-size="10" fill="#c8a84e">W</text>
  </g>

  <!-- Title banner -->
  <g transform="translate(750,960)">
    <rect x="-180" y="-20" width="360" height="36" rx="8" fill="#1a1611" stroke="#c8a84e" stroke-width="1" opacity="0.7"/>
    <text x="0" y="4" text-anchor="middle" font-family="serif" font-size="14" fill="#c8a84e" letter-spacing="4">THE REALM OF CROWNS</text>
  </g>

  <!-- Border decorative corners -->
  <g fill="none" stroke="#c8a84e" stroke-width="1" opacity="0.3">
    <path d="M10 10 L120 10 L10 120Z"/>
    <path d="M1490 10 L1380 10 L1490 120Z"/>
    <path d="M10 990 L120 990 L10 880Z"/>
    <path d="M1490 990 L1380 990 L1490 880Z"/>
  </g>
  <g font-size="18" fill="#c8a84e" opacity="0.25">
    <text x="25" y="12">✦</text>
    <text x="1475" y="12">✦</text>
    <text x="25" y="992">✦</text>
    <text x="1475" y="992">✦</text>
  </g>
</svg>`);

/* ───── SETTLEMENT SCENES (season-aware) ───── */

/* Each scene is one 800×360 illustration with a Summer base plus seasonal
 * overlay layers: snow-capped roofs & bare trees & falling snow in Winter,
 * golden fields & autumn foliage in Autumn, blossom-laden trees & petals in
 * Spring. Overlay geometry is data-driven from the base scene coordinates so
 * the art composites exactly. */

type Season = "Spring" | "Summer" | "Autumn" | "Winter";
type SceneType = "hamlet" | "village" | "town" | "city" | "home";

interface SceneSpec {
  roofs: string[]; // gable roof polygon points (snow caps in Winter)
  trees: { x: number; y: number; r: number }[]; // tree canopy circles
  fields: { x: number; y: number; w: number; h: number }[]; // crop fields
  walls: { x: number; y: number; w: number; h: number }[]; // wall/crenellation tops
}

const HAMLET_SPEC: SceneSpec = {
  roofs: ["238,208 304,158 370,208", "424,218 478,174 530,218"],
  trees: [{ x: 88, y: 202, r: 27 }, { x: 704, y: 196, r: 23 }],
  fields: [{ x: 36, y: 288, w: 150, h: 72 }, { x: 620, y: 288, w: 150, h: 72 }],
  walls: [],
};

const VILLAGE_SPEC: SceneSpec = {
  roofs: ["342,172 395,110 448,172", "172,216 228,168 284,216", "462,220 515,176 568,220", "578,226 629,184 680,226", "256,254 280,240 304,254", "304,256 327,243 350,256"],
  trees: [{ x: 70, y: 210, r: 26 }, { x: 724, y: 200, r: 24 }],
  fields: [],
  walls: [],
};

const TOWN_SPEC: SceneSpec = {
  roofs: ["132,52 149,26 166,52", "634,52 651,26 668,52", "232,98 260,60 288,98", "174,172 209,138 244,172", "464,174 499,140 534,174", "534,178 566,148 598,178", "294,232 319,218 344,232", "414,232 439,218 464,232"],
  trees: [],
  fields: [],
  // snow sits on the crenellation blocks only, leaving the gate banner clear
  walls: [128, 156, 248, 276, 368, 396, 488, 516, 608, 636].map(x => ({ x, y: 104, w: 20, h: 12 })),
};

const CITY_SPEC: SceneSpec = {
  roofs: ["74,40 93,12 112,40", "688,40 707,12 726,40", "202,18 215,-6 228,18", "572,18 585,-6 598,18", "252,72 267,34 282,72", "422,72 437,34 452,72", "464,158 493,126 522,158", "520,164 547,136 574,164", "244,178 271,150 298,178", "200,188 226,164 252,188", "140,194 166,170 192,194"],
  trees: [],
  fields: [],
  // snow on each crenellation block, clear of the gate arch and banners
  walls: Array.from({ length: 24 }, (_, i) => ({ x: 72 + i * 28, y: 88, w: 18, h: 12 })),
};

const HOME_SPEC: SceneSpec = {
  roofs: ["348,84 400,36 452,84", "307,86 315,66 323,86", "477,86 485,66 493,86", "312,180 338,160 364,180", "438,182 464,162 490,182"],
  trees: [{ x: 110, y: 238, r: 26 }, { x: 690, y: 240, r: 22 }],
  fields: [{ x: 30, y: 300, w: 150, h: 60 }, { x: 620, y: 302, w: 150, h: 58 }],
  // snow on the palisade blocks + gate tower cap, clear of the hanging banners
  walls: [{ x: 306, y: 138, w: 16, h: 12 }, { x: 332, y: 138, w: 16, h: 12 }, { x: 450, y: 138, w: 16, h: 12 }, { x: 476, y: 138, w: 16, h: 12 }, { x: 380, y: 110, w: 40, h: 8 }],
};

/** A white snow cap perched on a gabled roof ridge (Winter). */
function snowCap(points: string): string {
  const pts = points.split(" ").map(p => p.split(",").map(Number));
  let peak = pts[0];
  for (const p of pts) if (p[1] < peak[1]) peak = p;
  const base = pts.filter(p => p !== peak);
  const cap = [peak, ...base.map(o => [peak[0] + (o[0] - peak[0]) * 0.4, peak[1] + (o[1] - peak[1]) * 0.4])];
  return `<polygon points="${cap.map(c => `${c[0]},${c[1]}`).join(" ")}" fill="#f4f8fb" opacity="0.96"/>`;
}

/** Builds the seasonal overlay SVG fragment for a scene ('' for Summer). */
function seasonOverlay(season: Season, spec: SceneSpec): string {
  if (season === "Summer") return "";
  const g: string[] = [];
  if (season === "Winter") {
    g.push(`<rect width="800" height="360" fill="rgba(196,218,236,0.20)"/>`); // cold winter light
    for (const w of spec.walls) g.push(`<rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" rx="2" fill="#eef3f8" opacity="0.9"/>`);
    for (const r of spec.roofs) g.push(snowCap(r));
    for (const f of spec.fields) g.push(`<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" rx="6" fill="#eef4f9" opacity="0.62"/>`);
    for (const t of spec.trees) {
      g.push(`<circle cx="${t.x}" cy="${t.y}" r="${t.r}" fill="#d9e6ee" opacity="0.88"/>`);
      g.push(`<g stroke="#5a4632" stroke-width="3" fill="none" stroke-linecap="round"><path d="M${t.x} ${t.y + t.r * 0.3} L${t.x - t.r * 0.5} ${t.y + t.r * 0.95}"/><path d="M${t.x} ${t.y + t.r * 0.3} L${t.x + t.r * 0.45} ${t.y + t.r * 0.95}"/></g>`);
      g.push(`<path d="M${t.x} ${t.y + t.r * 0.1} L${t.x - t.r * 0.4} ${t.y - t.r * 0.5} M${t.x} ${t.y + t.r * 0.1} L${t.x + t.r * 0.4} ${t.y - t.r * 0.45}" stroke="#4a3822" stroke-width="2.5" fill="none" stroke-linecap="round"/>`);
    }
    for (let i = 0; i < 10; i++) {
      const sx = (i * 137 + 43) % 780 + 10;
      const sy = (i * 61 + 29) % 190 + 12;
      g.push(`<circle cx="${sx}" cy="${sy}" r="${2 + (i % 3)}" fill="#fff" opacity="0.85"/>`);
    }
  } else if (season === "Autumn") {
    g.push(`<rect width="800" height="360" fill="rgba(228,170,84,0.16)"/>`); // warm autumn light
    for (const f of spec.fields) g.push(`<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" rx="6" fill="#d8a33c" opacity="0.75"/>`);
    for (const t of spec.trees) {
      g.push(`<circle cx="${t.x}" cy="${t.y}" r="${t.r}" fill="#c06a2a" opacity="0.92"/>`);
      g.push(`<circle cx="${t.x - t.r * 0.25}" cy="${t.y - t.r * 0.3}" r="${t.r * 0.55}" fill="#d88a3a" opacity="0.9"/>`);
    }
    for (let i = 0; i < 8; i++) {
      const sx = (i * 173 + 17) % 780 + 10;
      const sy = (i * 79 + 41) % 200 + 10;
      g.push(`<ellipse cx="${sx}" cy="${sy}" rx="5" ry="2.6" fill="#c86a2a" opacity="0.8" transform="rotate(${(i * 37) % 360} ${sx} ${sy})"/>`);
    }
  } else if (season === "Spring") {
    g.push(`<rect width="800" height="360" fill="rgba(150,205,120,0.12)"/>`); // fresh spring light
    for (const t of spec.trees) {
      g.push(`<circle cx="${t.x}" cy="${t.y}" r="${t.r * 0.95}" fill="#7fbf5a" opacity="0.85"/>`);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        g.push(`<circle cx="${(t.x + Math.cos(a) * t.r * 0.7).toFixed(1)}" cy="${(t.y + Math.sin(a) * t.r * 0.7).toFixed(1)}" r="${(t.r * 0.16 + 1).toFixed(1)}" fill="#f2b8d0" opacity="0.95"/>`);
      }
    }
    for (let i = 0; i < 9; i++) {
      const sx = (i * 149 + 31) % 780 + 10;
      const sy = (i * 67 + 53) % 200 + 10;
      g.push(`<ellipse cx="${sx}" cy="${sy}" rx="4" ry="2.2" fill="#e88bb0" opacity="0.75" transform="rotate(${(i * 47) % 360} ${sx} ${sy})"/>`);
    }
  }
  return `<g>${g.join("")}</g>`;
}

function seasonalScene(base: string, spec: SceneSpec): Record<Season, string> {
  return {
    Spring: svgUri(base.replace("</svg>", seasonOverlay("Spring", spec) + "</svg>")),
    Summer: svgUri(base),
    Autumn: svgUri(base.replace("</svg>", seasonOverlay("Autumn", spec) + "</svg>")),
    Winter: svgUri(base.replace("</svg>", seasonOverlay("Winter", spec) + "</svg>")),
  };
}

export const SETTLEMENT_SVGS: Record<SceneType, Record<Season, string>> = {
  hamlet: seasonalScene(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360">
    <defs>
      <linearGradient id="hSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7fa8c8"/><stop offset="62%" stop-color="#c8d8c8"/><stop offset="100%" stop-color="#ecdfc0"/></linearGradient>
      <linearGradient id="hGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6f9642"/><stop offset="100%" stop-color="#476e2e"/></linearGradient>
    </defs>
    <rect width="800" height="360" fill="url(#hSky)"/>
    <circle cx="690" cy="58" r="26" fill="#ffe9a8" opacity="0.95"/>
    <circle cx="690" cy="58" r="42" fill="#ffe9a8" opacity="0.22"/>
    <g fill="#ffffff" opacity="0.72"><ellipse cx="140" cy="68" rx="46" ry="12"/><ellipse cx="182" cy="60" rx="28" ry="9"/><ellipse cx="430" cy="92" rx="52" ry="11"/></g>
    <path d="M0 252 Q140 202 300 240 Q450 190 620 246 Q720 216 800 246 L800 360 L0 360 Z" fill="#88aa5e" opacity="0.85"/>
    <path d="M0 276 Q180 236 360 268 Q540 232 800 268 L800 360 L0 360 Z" fill="url(#hGrass)"/>
    <rect x="36" y="288" width="150" height="72" fill="#9ab858" opacity="0.5" rx="6"/>
    <rect x="620" y="288" width="150" height="72" fill="#8aa84a" opacity="0.5" rx="6"/>
    <g opacity="0.5" stroke="#5a8a38" stroke-width="2"><path d="M46 302 h130 M46 316 h130 M46 330 h130 M46 344 h130"/><path d="M630 302 h130 M630 316 h130 M630 330 h130 M630 344 h130"/></g>
    <path d="M400 360 Q382 322 395 286 Q410 256 400 236" fill="none" stroke="#b8a070" stroke-width="16" stroke-linecap="round" opacity="0.95"/>
    <path d="M400 360 Q382 322 395 286 Q410 256 400 236" fill="none" stroke="#cdbb8c" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
    <g><circle cx="88" cy="202" r="27" fill="#2f5a22"/><circle cx="88" cy="202" r="20" fill="#3a7030" opacity="0.9"/><rect x="85" y="226" width="7" height="22" fill="#5a3f22"/><circle cx="704" cy="196" r="23" fill="#2f5a22"/><circle cx="704" cy="196" r="17" fill="#3a7030" opacity="0.9"/><rect x="702" y="216" width="6" height="18" fill="#5a3f22"/></g>
    <g>
      <rect x="248" y="204" width="112" height="72" fill="#a88850" stroke="#6a4a28" stroke-width="2"/>
      <polygon points="238,208 304,158 370,208" fill="#7a5a34" stroke="#5a3f22" stroke-width="2"/>
      <path d="M252 174 l52 -11 52 11" stroke="#5a3f22" stroke-width="2" fill="none" opacity="0.55"/>
      <rect x="293" y="236" width="26" height="40" fill="#4a3018"/>
      <rect x="260" y="226" width="22" height="18" fill="#cdbb8c" stroke="#5a3f22" stroke-width="1.5"/>
      <rect x="328" y="226" width="22" height="18" fill="#cdbb8c" stroke="#5a3f22" stroke-width="1.5"/>
      <rect x="338" y="168" width="10" height="22" fill="#8a7a60"/>
      <g fill="#ddd" opacity="0.55"><circle cx="343" cy="158" r="5"/><circle cx="348" cy="148" r="7"/><circle cx="341" cy="137" r="9"/></g>
    </g>
    <g>
      <rect x="432" y="214" width="92" height="62" fill="#b09058" stroke="#6a4a28" stroke-width="2"/>
      <polygon points="424,218 478,174 530,218" fill="#8a6a3a" stroke="#5a3f22" stroke-width="2"/>
      <rect x="466" y="240" width="20" height="36" fill="#4a3018"/>
      <rect x="440" y="230" width="20" height="16" fill="#cdbb8c" stroke="#5a3f22" stroke-width="1.5"/>
      <rect x="502" y="230" width="16" height="16" fill="#cdbb8c" stroke="#5a3f22" stroke-width="1.5"/>
    </g>
    <g transform="translate(564,256)"><rect x="-24" y="-6" width="48" height="10" fill="#8a8a78" rx="2"/><path d="M-18 -8 Q0 -20 18 -8" fill="none" stroke="#8a8a78" stroke-width="5"/><rect x="-4" y="-22" width="8" height="14" fill="#6a5a40"/></g>
    <g><ellipse cx="150" cy="300" rx="13" ry="9" fill="#eee4d0"/><circle cx="160" cy="296" r="6.5" fill="#ddd0b8"/><circle cx="163" cy="295" r="1.6" fill="#333"/><ellipse cx="182" cy="305" rx="11" ry="7.5" fill="#f2ead8"/><circle cx="191" cy="302" r="5.5" fill="#ddd0b8"/><circle cx="194" cy="301" r="1.5" fill="#333"/></g>
    <g stroke="#6a4a28" stroke-width="3" opacity="0.6"><line x1="478" y1="302" x2="520" y2="302"/><line x1="478" y1="314" x2="520" y2="314"/><line x1="484" y1="296" x2="484" y2="320"/><line x1="506" y1="296" x2="506" y2="320"/></g>
    <g stroke="#334" stroke-width="1.6" fill="none" opacity="0.5"><path d="M560 88 q5 -6 10 0 q5 -6 10 0"/><path d="M592 72 q4 -5 8 0 q4 -5 8 0"/></g>
  </svg>`, HAMLET_SPEC),

  village: seasonalScene(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360">
    <defs>
      <linearGradient id="vSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6d97bd"/><stop offset="60%" stop-color="#bcd0c4"/><stop offset="100%" stop-color="#e4dcc0"/></linearGradient>
      <linearGradient id="vGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#68904a"/><stop offset="100%" stop-color="#40662c"/></linearGradient>
    </defs>
    <rect width="800" height="360" fill="url(#vSky)"/>
    <circle cx="120" cy="70" r="24" fill="#ffe9a8" opacity="0.9"/>
    <g fill="#ffffff" opacity="0.7"><ellipse cx="560" cy="70" rx="52" ry="12"/><ellipse cx="606" cy="62" rx="30" ry="9"/><ellipse cx="300" cy="100" rx="44" ry="10"/></g>
    <path d="M0 250 Q160 210 340 244 Q520 200 800 250 L800 360 L0 360 Z" fill="#7fa458" opacity="0.8"/>
    <path d="M0 278 Q200 240 400 272 Q600 240 800 272 L800 360 L0 360 Z" fill="url(#vGrass)"/>
    <ellipse cx="150" cy="330" rx="90" ry="26" fill="#9fc4d8" opacity="0.7"/>
    <path d="M400 360 Q392 326 404 296 Q416 272 406 252" fill="none" stroke="#b8a070" stroke-width="16" stroke-linecap="round" opacity="0.9"/>
    <path d="M400 360 Q392 326 404 296 Q416 272 406 252" fill="none" stroke="#cdbb8c" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
    <g><circle cx="70" cy="210" r="26" fill="#2f5a22"/><rect x="68" y="234" width="6" height="20" fill="#5a3f22"/><circle cx="724" cy="200" r="24" fill="#2f5a22"/><rect x="722" y="222" width="6" height="18" fill="#5a3f22"/></g>
    <!-- Church -->
    <g>
      <rect x="350" y="170" width="90" height="110" fill="#d8d0b8" stroke="#8a7a5a" stroke-width="2"/>
      <polygon points="342,172 395,110 448,172" fill="#9a8a6a" stroke="#8a7a5a" stroke-width="2"/>
      <rect x="392" y="62" width="7" height="50" fill="#8a7a5a"/>
      <circle cx="395" cy="56" r="6" fill="#c8a84e" opacity="0.9"/>
      <path d="M395 50 v-18 M386 40 h18" stroke="#c8a84e" stroke-width="3"/>
      <rect x="378" y="216" width="34" height="64" fill="#8a6a3a" stroke="#5a3f22" stroke-width="2"/>
      <circle cx="395" cy="200" r="12" fill="#cdbb8c" stroke="#8a7a5a" stroke-width="2"/>
      <circle cx="395" cy="200" r="6" fill="#c8a84e" opacity="0.8"/>
      <rect x="322" y="196" width="22" height="18" fill="#cdbb8c" stroke="#8a7a5a" stroke-width="1.5"/>
      <rect x="446" y="196" width="22" height="18" fill="#cdbb8c" stroke="#8a7a5a" stroke-width="1.5"/>
    </g>
    <!-- Houses left of church -->
    <g><rect x="180" y="212" width="96" height="70" fill="#a88850" stroke="#6a4a28" stroke-width="2"/><polygon points="172,216 228,168 284,216" fill="#7a5a34" stroke="#5a3f22" stroke-width="2"/><rect x="222" y="244" width="20" height="38" fill="#4a3018"/><rect x="190" y="234" width="20" height="16" fill="#cdbb8c" stroke="#5a3f22" stroke-width="1.5"/><rect x="250" y="234" width="20" height="16" fill="#cdbb8c" stroke="#5a3f22" stroke-width="1.5"/></g>
    <g><rect x="470" y="216" width="90" height="66" fill="#b09058" stroke="#6a4a28" stroke-width="2"/><polygon points="462,220 515,176 568,220" fill="#8a6a3a" stroke="#5a3f22" stroke-width="2"/><rect x="504" y="244" width="18" height="38" fill="#4a3018"/><rect x="478" y="232" width="18" height="15" fill="#cdbb8c" stroke="#5a3f22" stroke-width="1.5"/></g>
    <g><rect x="586" y="222" width="86" height="60" fill="#a88850" stroke="#6a4a28" stroke-width="2"/><polygon points="578,226 629,184 680,226" fill="#7a5a34" stroke="#5a3f22" stroke-width="2"/><rect x="616" y="246" width="18" height="36" fill="#4a3018"/><rect x="592" y="236" width="18" height="14" fill="#cdbb8c" stroke="#5a3f22" stroke-width="1.5"/></g>
    <!-- Market stalls -->
    <g>
      <rect x="262" y="252" width="36" height="26" fill="#8a5a34" stroke="#5a3f22" stroke-width="1.5"/><polygon points="256,254 280,240 304,254" fill="#a84848" stroke="#5a3f22" stroke-width="1"/><rect x="274" y="262" width="10" height="16" fill="#4a3018"/>
      <rect x="310" y="254" width="34" height="24" fill="#8a5a34" stroke="#5a3f22" stroke-width="1.5"/><polygon points="304,256 327,243 350,256" fill="#4a7a4a" stroke="#5a3f22" stroke-width="1"/>
    </g>
    <!-- Well + fence + trees right -->
    <g transform="translate(700,250)"><rect x="-22" y="-6" width="44" height="9" fill="#8a8a78" rx="2"/><path d="M-16 -8 Q0 -18 16 -8" fill="none" stroke="#8a8a78" stroke-width="5"/><rect x="-4" y="-20" width="8" height="12" fill="#6a5a40"/></g>
    <g stroke="#6a4a28" stroke-width="3" opacity="0.6"><line x1="330" y1="316" x2="372" y2="316"/><line x1="330" y1="328" x2="372" y2="328"/><line x1="336" y1="310" x2="336" y2="334"/><line x1="358" y1="310" x2="358" y2="334"/></g>
    <g><ellipse cx="230" cy="330" rx="12" ry="8" fill="#eee4d0"/><circle cx="240" cy="326" r="6" fill="#ddd0b8"/><circle cx="243" cy="325" r="1.5" fill="#333"/></g>
  </svg>`, VILLAGE_SPEC),

  town: seasonalScene(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360">
    <defs>
      <linearGradient id="tSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5a80a8"/><stop offset="58%" stop-color="#a8bcc4"/><stop offset="100%" stop-color="#dcd2b8"/></linearGradient>
      <linearGradient id="tWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9a9488"/><stop offset="100%" stop-color="#6e6a60"/></linearGradient>
    </defs>
    <rect width="800" height="360" fill="url(#tSky)"/>
    <g fill="#ffffff" opacity="0.7"><ellipse cx="160" cy="66" rx="50" ry="12"/><ellipse cx="204" cy="58" rx="28" ry="9"/><ellipse cx="560" cy="90" rx="56" ry="11"/></g>
    <path d="M0 262 Q180 224 400 258 Q600 220 800 260 L800 360 L0 360 Z" fill="#6e8a4e" opacity="0.85"/>
    <path d="M0 290 Q220 252 430 282 Q620 252 800 284 L800 360 L0 360 Z" fill="#4a6e34"/>
    <!-- town walls -->
    <rect x="120" y="120" width="560" height="240" fill="url(#tWall)" opacity="0.55"/>
    <rect x="120" y="120" width="560" height="12" fill="#a8a298" opacity="0.8"/>
    <g fill="#8a8478">
      <rect x="128" y="108" width="18" height="14"/><rect x="156" y="108" width="18" height="14"/><rect x="248" y="108" width="18" height="14"/><rect x="276" y="108" width="18" height="14"/>
      <rect x="368" y="108" width="18" height="14"/><rect x="396" y="108" width="18" height="14"/><rect x="488" y="108" width="18" height="14"/><rect x="516" y="108" width="18" height="14"/><rect x="608" y="108" width="18" height="14"/><rect x="636" y="108" width="18" height="14"/>
    </g>
    <!-- gate -->
    <rect x="360" y="150" width="80" height="210" fill="#4a463e" rx="6"/>
    <path d="M360 152 Q400 96 440 152" fill="none" stroke="#4a463e" stroke-width="10"/>
    <rect x="390" y="210" width="20" height="44" fill="#3a362e" rx="3"/>
    <!-- corner towers -->
    <g>
      <rect x="128" y="52" width="42" height="86" fill="#8a8478" stroke="#5e5a50" stroke-width="2"/><rect x="122" y="44" width="54" height="12" fill="#a8a298"/><polygon points="132,52 149,26 166,52" fill="#8a5a4a" stroke="#5e5a50" stroke-width="1.5"/>
      <rect x="630" y="52" width="42" height="86" fill="#8a8478" stroke="#5e5a50" stroke-width="2"/><rect x="624" y="44" width="54" height="12" fill="#a8a298"/><polygon points="634,52 651,26 668,52" fill="#8a5a4a" stroke="#5e5a50" stroke-width="1.5"/>
    </g>
    <!-- banner on gate -->
    <line x1="400" y1="104" x2="400" y2="78" stroke="#5a3f22" stroke-width="3"/><polygon points="400,78 428,84 400,92" fill="#c8a84e" opacity="0.95"/>
    <!-- church tower behind -->
    <rect x="238" y="96" width="44" height="64" fill="#d8d0b8" stroke="#8a7a5a" stroke-width="2"/><polygon points="232,98 260,60 288,98" fill="#9a8a6a" stroke="#8a7a5a" stroke-width="2"/><circle cx="260" cy="56" r="5" fill="#c8a84e"/><path d="M260 48 v-14 M253 41 h14" stroke="#c8a84e" stroke-width="3"/>
    <!-- houses -->
    <g><rect x="180" y="170" width="58" height="58" fill="#c9b88c" stroke="#6a4a28" stroke-width="2"/><polygon points="174,172 209,138 244,172" fill="#8a5a3a" stroke="#5a3f22" stroke-width="2"/><rect x="202" y="196" width="14" height="32" fill="#4a3018"/><rect x="186" y="188" width="16" height="12" fill="#5a4a2a"/></g>
    <g><rect x="470" y="172" width="58" height="56" fill="#c9b88c" stroke="#6a4a28" stroke-width="2"/><polygon points="464,174 499,140 534,174" fill="#8a5a3a" stroke="#5a3f22" stroke-width="2"/><rect x="492" y="198" width="14" height="30" fill="#4a3018"/><rect x="508" y="190" width="14" height="12" fill="#5a4a2a"/></g>
    <g><rect x="540" y="176" width="52" height="52" fill="#d4c494" stroke="#6a4a28" stroke-width="2"/><polygon points="534,178 566,148 598,178" fill="#9a6a3a" stroke="#5a3f22" stroke-width="2"/><rect x="560" y="200" width="12" height="28" fill="#4a3018"/></g>
    <!-- market square stalls -->
    <g>
      <rect x="300" y="230" width="38" height="28" fill="#8a5a34" stroke="#5a3f22" stroke-width="1.5"/><polygon points="294,232 319,218 344,232" fill="#a84848" stroke="#5a3f22" stroke-width="1"/>
      <rect x="420" y="230" width="38" height="28" fill="#8a5a34" stroke="#5a3f22" stroke-width="1.5"/><polygon points="414,232 439,218 464,232" fill="#4a7a4a" stroke="#5a3f22" stroke-width="1"/>
    </g>
    <rect x="262" y="200" width="276" height="8" fill="#b8a070" opacity="0.6"/>
    <path d="M400 360 Q394 330 402 300 Q410 276 400 258" fill="none" stroke="#b8a070" stroke-width="14" stroke-linecap="round" opacity="0.9"/>
    <g><ellipse cx="200" cy="330" rx="11" ry="7" fill="#eee4d0"/><circle cx="210" cy="327" r="5.5" fill="#ddd0b8"/></g>
    <g stroke="#334" stroke-width="1.6" fill="none" opacity="0.5"><path d="M560 60 q5 -6 10 0 q5 -6 10 0"/><path d="M590 46 q4 -5 8 0 q4 -5 8 0"/></g>
  </svg>`, TOWN_SPEC),

  city: seasonalScene(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360">
    <defs>
      <linearGradient id="cSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3f5f85"/><stop offset="55%" stop-color="#8fa6b8"/><stop offset="100%" stop-color="#d0c6ac"/></linearGradient>
      <linearGradient id="cWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8a8678"/><stop offset="100%" stop-color="#5c584e"/></linearGradient>
      <linearGradient id="cWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5a8aa8"/><stop offset="100%" stop-color="#3a5a78"/></linearGradient>
    </defs>
    <rect width="800" height="360" fill="url(#cSky)"/>
    <circle cx="660" cy="60" r="28" fill="#ffe9a8" opacity="0.85"/>
    <g fill="#ffffff" opacity="0.6"><ellipse cx="130" cy="64" rx="54" ry="12"/><ellipse cx="176" cy="56" rx="30" ry="9"/><ellipse cx="420" cy="86" rx="50" ry="10"/></g>
    <path d="M0 280 Q200 240 420 272 Q620 238 800 276 L800 360 L0 360 Z" fill="#5e7a44" opacity="0.9"/>
    <!-- city walls -->
    <rect x="60" y="104" width="680" height="256" fill="url(#cWall)" opacity="0.7"/>
    <rect x="60" y="104" width="680" height="14" fill="#9a968a" opacity="0.9"/>
    <g fill="#76725f">
      ${Array.from({length:24},(_,i)=>{const x=72+i*28;return `<rect x="${x}" y="90" width="16" height="16"/>`;}).join('')}
    </g>
    <!-- gate -->
    <rect x="352" y="140" width="96" height="220" fill="#403c34" rx="6"/>
    <path d="M352 142 Q400 76 448 142" fill="none" stroke="#403c34" stroke-width="12"/>
    <rect x="390" y="220" width="20" height="48" fill="#302c26" rx="3"/>
    <!-- towers -->
    <g>
      <rect x="70" y="40" width="46" height="82" fill="#8a8678" stroke="#4c4840" stroke-width="2"/><rect x="62" y="30" width="62" height="14" fill="#9a968a"/><polygon points="74,40 93,12 112,40" fill="#6a5a4a" stroke="#4c4840" stroke-width="1.5"/><line x1="93" y1="12" x2="93" y2="-2" stroke="#5a3f22" stroke-width="2"/><polygon points="93,-2 112,4 93,10" fill="#c8a84e"/>
      <rect x="684" y="40" width="46" height="82" fill="#8a8678" stroke="#4c4840" stroke-width="2"/><rect x="676" y="30" width="62" height="14" fill="#9a968a"/><polygon points="688,40 707,12 726,40" fill="#6a5a4a" stroke="#4c4840" stroke-width="1.5"/>
      <rect x="196" y="18" width="38" height="70" fill="#8a8678" stroke="#4c4840" stroke-width="2"/><polygon points="202,18 215,-6 228,18" fill="#6a5a4a" stroke="#4c4840" stroke-width="1.5"/>
      <rect x="566" y="18" width="38" height="70" fill="#8a8678" stroke="#4c4840" stroke-width="2"/><polygon points="572,18 585,-6 598,18" fill="#6a5a4a" stroke="#4c4840" stroke-width="1.5"/>
    </g>
    <!-- cathedral -->
    <g>
      <rect x="292" y="96" width="120" height="110" fill="#ddd4bc" stroke="#8a7a5a" stroke-width="2"/>
      <rect x="252" y="70" width="30" height="64" fill="#c9c0a8" stroke="#8a7a5a" stroke-width="2"/><polygon points="252,72 267,34 282,72" fill="#9a8a6a" stroke="#8a7a5a" stroke-width="1.5"/><circle cx="267" cy="30" r="5" fill="#c8a84e"/><path d="M267 22 v-12 M261 16 h12" stroke="#c8a84e" stroke-width="3"/>
      <rect x="422" y="70" width="30" height="64" fill="#c9c0a8" stroke="#8a7a5a" stroke-width="2"/><polygon points="422,72 437,34 452,72" fill="#9a8a6a" stroke="#8a7a5a" stroke-width="1.5"/><circle cx="437" cy="30" r="5" fill="#c8a84e"/><path d="M437 22 v-12 M431 16 h12" stroke="#c8a84e" stroke-width="3"/>
      <circle cx="352" cy="126" r="22" fill="#cdbb8c" stroke="#8a7a5a" stroke-width="2"/>
      <g stroke="#c8a84e" stroke-width="2" opacity="0.85"><path d="M352 110 v32 M338 126 h28 M340 114 l24 24 M364 114 l-24 24"/></g>
      <rect x="340" y="170" width="24" height="36" fill="#8a6a3a" stroke="#5a3f22" stroke-width="1.5"/>
    </g>
    <!-- dense housing -->
    <g>
      <rect x="470" y="156" width="46" height="52" fill="#c9b88c" stroke="#5a3f22" stroke-width="1.5"/><polygon points="464,158 493,126 522,158" fill="#8a5a3a" stroke="#5a3f22" stroke-width="1.5"/><rect x="488" y="180" width="12" height="28" fill="#4a3018"/>
      <rect x="526" y="162" width="42" height="46" fill="#d4c494" stroke="#5a3f22" stroke-width="1.5"/><polygon points="520,164 547,136 574,164" fill="#9a6a3a" stroke="#5a3f22" stroke-width="1.5"/><rect x="542" y="184" width="10" height="24" fill="#4a3018"/>
      <rect x="250" y="176" width="42" height="46" fill="#c9b88c" stroke="#5a3f22" stroke-width="1.5"/><polygon points="244,178 271,150 298,178" fill="#8a5a3a" stroke="#5a3f22" stroke-width="1.5"/><rect x="266" y="198" width="10" height="24" fill="#4a3018"/>
      <rect x="206" y="186" width="40" height="40" fill="#d4c494" stroke="#5a3f22" stroke-width="1.5"/><polygon points="200,188 226,164 252,188" fill="#9a6a3a" stroke="#5a3f22" stroke-width="1.5"/>
      <rect x="146" y="192" width="40" height="40" fill="#c9b88c" stroke="#5a3f22" stroke-width="1.5"/><polygon points="140,194 166,170 192,194" fill="#8a5a3a" stroke="#5a3f22" stroke-width="1.5"/><rect x="158" y="212" width="10" height="20" fill="#4a3018"/>
    </g>
    <!-- waterfront -->
    <rect x="60" y="286" width="680" height="74" fill="url(#cWater)"/>
    <g stroke="#9fc4d8" stroke-width="2" opacity="0.4"><path d="M70 300 q16 -5 32 0 q16 5 32 0"/><path d="M640 316 q16 -5 32 0 q16 5 32 0"/><path d="M200 340 q16 -5 32 0 q16 5 32 0"/></g>
    <rect x="240" y="282" width="120" height="12" fill="#6a5a40"/>
    <line x1="360" y1="282" x2="360" y2="262" stroke="#5a4a30" stroke-width="4"/>
    <g transform="translate(520,282)">
      <path d="M-26 0 Q-20 -34 6 -38 L4 -10 Z" fill="#5a3f22" stroke="#3a2a14" stroke-width="1.5"/>
      <path d="M-14 -24 L34 -30 L10 -8 Z" fill="#dcd2b8" stroke="#8a7a5a" stroke-width="1"/>
      <path d="M-10 -2 L30 -6 L26 0 L-14 4 Z" fill="#4a463e"/>
    </g>
    <path d="M400 360 Q394 330 402 300 Q410 276 400 258" fill="none" stroke="#b8a070" stroke-width="14" stroke-linecap="round" opacity="0.9"/>
    <g stroke="#334" stroke-width="1.6" fill="none" opacity="0.5"><path d="M90 120 q5 -6 10 0 q5 -6 10 0"/><path d="M600 96 q4 -5 8 0 q4 -5 8 0"/></g>
  </svg>`, CITY_SPEC),

  home: seasonalScene(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360">
    <defs>
      <linearGradient id="sSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4a7098"/><stop offset="55%" stop-color="#9cb4c0"/><stop offset="100%" stop-color="#e0d4b4"/></linearGradient>
      <linearGradient id="sHill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6e9450"/><stop offset="100%" stop-color="#3f6228"/></linearGradient>
      <linearGradient id="sStone" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a8a296"/><stop offset="100%" stop-color="#6e685c"/></linearGradient>
    </defs>
    <rect width="800" height="360" fill="url(#sSky)"/>
    <circle cx="680" cy="64" r="30" fill="#ffe9a8" opacity="0.9"/>
    <circle cx="680" cy="64" r="48" fill="#ffe9a8" opacity="0.2"/>
    <g fill="#ffffff" opacity="0.65"><ellipse cx="140" cy="66" rx="52" ry="12"/><ellipse cx="186" cy="58" rx="30" ry="9"/><ellipse cx="400" cy="92" rx="54" ry="11"/></g>
    <!-- valley -->
    <path d="M0 270 Q150 236 320 262 Q520 230 800 266 L800 360 L0 360 Z" fill="#7fa458" opacity="0.8"/>
    <path d="M0 296 Q200 258 420 288 Q620 256 800 290 L800 360 L0 360 Z" fill="url(#sHill)"/>
    <rect x="30" y="300" width="150" height="60" fill="#9ab858" opacity="0.5" rx="6"/>
    <rect x="620" y="302" width="150" height="58" fill="#8aa84a" opacity="0.5" rx="6"/>
    <g opacity="0.5" stroke="#5a8a38" stroke-width="2"><path d="M40 314 h130 M40 328 h130 M40 342 h130"/><path d="M630 316 h130 M630 330 h130 M630 344 h130"/></g>
    <!-- road to the gate -->
    <path d="M400 360 Q392 330 402 306 Q412 284 404 268" fill="none" stroke="#b8a070" stroke-width="18" stroke-linecap="round" opacity="0.95"/>
    <path d="M400 360 Q392 330 402 306 Q412 284 404 268" fill="none" stroke="#cdbb8c" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
    <!-- outer palisade + gate towers -->
    <rect x="300" y="150" width="200" height="120" fill="url(#sStone)" opacity="0.75"/>
    <rect x="300" y="150" width="200" height="10" fill="#b8b2a6"/>
    <g fill="#948e7e"><rect x="308" y="140" width="14" height="12"/><rect x="334" y="140" width="14" height="12"/><rect x="452" y="140" width="14" height="12"/><rect x="478" y="140" width="14" height="12"/></g>
    <rect x="382" y="118" width="36" height="152" fill="#6a6458"/>
    <rect x="382" y="112" width="36" height="10" fill="#8a8478"/>
    <rect x="386" y="158" width="28" height="40" fill="#3a362e" rx="4"/>
    <line x1="400" y1="112" x2="400" y2="86" stroke="#5a3f22" stroke-width="3"/>
    <polygon points="400,86 432,93 400,101" fill="#c8a84e"/>
    <!-- keep / great hall -->
    <g>
      <rect x="356" y="82" width="88" height="70" fill="#b8b2a6" stroke="#5e5a50" stroke-width="2"/>
      <polygon points="348,84 400,36 452,84" fill="#6a5a4a" stroke="#4c4840" stroke-width="2"/>
      <path d="M352 66 l48 -26 48 26" stroke="#4c4840" stroke-width="2" fill="none" opacity="0.6"/>
      <rect x="376" y="104" width="22" height="34" fill="#4a3018" stroke="#5e5a50" stroke-width="1.5"/>
      <rect x="404" y="104" width="22" height="34" fill="#4a3018" stroke="#5e5a50" stroke-width="1.5"/>
      <rect x="362" y="96" width="16" height="12" fill="#cdbb8c" stroke="#5e5a50" stroke-width="1"/>
      <rect x="422" y="96" width="16" height="12" fill="#cdbb8c" stroke="#5e5a50" stroke-width="1"/>
      <circle cx="400" cy="30" r="4" fill="#c8a84e"/>
    </g>
    <!-- round tower left -->
    <g>
      <rect x="300" y="86" width="30" height="60" fill="#a8a296" stroke="#5e5a50" stroke-width="2"/>
      <ellipse cx="315" cy="86" rx="15" ry="6" fill="#948e7e" stroke="#5e5a50" stroke-width="1.5"/>
      <polygon points="307,86 315,66 323,86" fill="#6a5a4a" stroke="#4c4840" stroke-width="1.5"/>
      <rect x="308" y="116" width="12" height="10" fill="#3a362e"/>
    </g>
    <!-- round tower right -->
    <g>
      <rect x="470" y="86" width="30" height="60" fill="#a8a296" stroke="#5e5a50" stroke-width="2"/>
      <ellipse cx="485" cy="86" rx="15" ry="6" fill="#948e7e" stroke="#5e5a50" stroke-width="1.5"/>
      <polygon points="477,86 485,66 493,86" fill="#6a5a4a" stroke="#4c4840" stroke-width="1.5"/>
    </g>
    <!-- houses inside the walls -->
    <g>
      <rect x="318" y="178" width="40" height="34" fill="#c9b88c" stroke="#5a3f22" stroke-width="1.5"/><polygon points="312,180 338,160 364,180" fill="#8a5a3a" stroke="#5a3f22" stroke-width="1.5"/><rect x="330" y="192" width="10" height="20" fill="#4a3018"/>
      <rect x="444" y="180" width="40" height="34" fill="#d4c494" stroke="#5a3f22" stroke-width="1.5"/><polygon points="438,182 464,162 490,182" fill="#9a6a3a" stroke="#5a3f22" stroke-width="1.5"/><rect x="458" y="194" width="10" height="20" fill="#4a3018"/>
    </g>
    <!-- banners along wall -->
    <line x1="312" y1="150" x2="312" y2="132" stroke="#5a3f22" stroke-width="2"/><polygon points="312,132 326,136 312,141" fill="#c8a84e" opacity="0.9"/>
    <line x1="488" y1="150" x2="488" y2="132" stroke="#5a3f22" stroke-width="2"/><polygon points="488,132 502,136 488,141" fill="#c8a84e" opacity="0.9"/>
    <!-- trees + well -->
    <g><circle cx="110" cy="238" r="26" fill="#2f5a22"/><circle cx="110" cy="238" r="19" fill="#3a7030" opacity="0.9"/><rect x="108" y="262" width="6" height="20" fill="#5a3f22"/><circle cx="690" cy="240" r="22" fill="#2f5a22"/><rect x="688" y="260" width="6" height="16" fill="#5a3f22"/></g>
    <g transform="translate(590,270)"><rect x="-20" y="-6" width="40" height="9" fill="#8a8a78" rx="2"/><path d="M-14 -8 Q0 -18 14 -8" fill="none" stroke="#8a8a78" stroke-width="5"/><rect x="-4" y="-20" width="8" height="12" fill="#6a5a40"/></g>
    <g><ellipse cx="200" cy="330" rx="12" ry="8" fill="#eee4d0"/><circle cx="210" cy="326" r="6" fill="#ddd0b8"/><circle cx="213" cy="325" r="1.5" fill="#333"/><ellipse cx="228" cy="334" rx="10" ry="7" fill="#f2ead8"/><circle cx="237" cy="331" r="5" fill="#ddd0b8"/></g>
    <g stroke="#334" stroke-width="1.6" fill="none" opacity="0.5"><path d="M560 100 q5 -6 10 0 q5 -6 10 0"/><path d="M200 130 q4 -5 8 0 q4 -5 8 0"/></g>
  </svg>`, HOME_SPEC),
};

/* ───── CREATION PORTRAITS ───── */
export const CREATION_PORTRAITS: Record<string, string> = {
  "bearded-chief": svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 96"><defs><radialGradient id="bgBC" cx="50%" cy="40%"><stop offset="0%" stop-color="#2a3a5a"/><stop offset="100%" stop-color="#0a0a1a"/></radialGradient></defs><rect width="80" height="96" fill="url(#bgBC)" rx="8"/><polygon points="20,20 25,8 30,16 35,6 40,14 45,6 50,16 55,8 60,20" fill="#c8a84e" stroke="#8a6a20" stroke-width="0.5"/><ellipse cx="40" cy="50" rx="18" ry="22" fill="#d4b896"/><ellipse cx="33" cy="47" rx="3" ry="2" fill="#3a2a1a"/><ellipse cx="47" cy="47" rx="3" ry="2" fill="#3a2a1a"/><path d="M40 47 Q38 54 40 56" fill="none" stroke="#b8a080" stroke-width="1"/><path d="M26 58 Q40 76 54 58" fill="#8a7050" stroke="#6a5a3a" stroke-width="0.5"/><path d="M22 38 Q20 28 30 26 Q40 22 50 26 Q60 28 58 38" fill="#3a2a1a"/><path d="M15 75 Q10 96 30 96 L50 96 Q70 96 65 75" fill="#4a3a2a"/><circle cx="40" cy="78" r="3" fill="#c8a84e" stroke="#8a6a20" stroke-width="0.5"/></svg>`),
  "young-warrior": svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 96"><defs><radialGradient id="bgYW" cx="50%" cy="40%"><stop offset="0%" stop-color="#3a2a2a"/><stop offset="100%" stop-color="#0a0505"/></radialGradient></defs><rect width="80" height="96" fill="url(#bgYW)" rx="8"/><ellipse cx="40" cy="50" rx="17" ry="21" fill="#c8a896"/><path d="M24 36 Q22 26 32 22 Q40 18 48 22 Q58 26 56 36" fill="#4a2a1a"/><ellipse cx="34" cy="48" rx="2.5" ry="2" fill="#2a1a0a"/><ellipse cx="46" cy="48" rx="2.5" ry="2" fill="#2a1a0a"/><path d="M36 57 Q40 61 44 57" fill="none" stroke="#a08060" stroke-width="0.8"/><path d="M20 72 Q15 96 30 96 L50 96 Q65 96 60 72" fill="#8a3a2a"/><path d="M38 30 L40 22 L42 30" fill="none" stroke="#c8a84e" stroke-width="0.8"/><circle cx="40" cy="80" r="2" fill="#c8a84e" opacity="0.6"/></svg>`),
  "wise-elder": svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 96"><defs><radialGradient id="bgWE" cx="50%" cy="40%"><stop offset="0%" stop-color="#4a3a2a"/><stop offset="100%" stop-color="#1a0a00"/></radialGradient></defs><rect width="80" height="96" fill="url(#bgWE)" rx="8"/><path d="M15 30 Q10 10 30 12 Q40 8 50 12 Q70 10 65 30 Q68 45 60 55 Q40 50 20 55 Q12 45 15 30Z" fill="#4a3a2a" stroke="#3a2a1a" stroke-width="0.5"/><ellipse cx="40" cy="52" rx="14" ry="18" fill="#c8a880"/><ellipse cx="34" cy="50" rx="2.5" ry="1.5" fill="#3a2a1a"/><ellipse cx="46" cy="50" rx="2.5" ry="1.5" fill="#3a2a1a"/><path d="M28 60 Q40 80 52 60" fill="#aaa8a0" stroke="#8a8a80" stroke-width="0.5"/><path d="M15 72 Q10 96 30 96 L50 96 Q70 96 65 75" fill="#3a3a2a"/><line x1="15" y1="50" x2="10" y2="95" stroke="#6a5a3a" stroke-width="2.5"/><circle cx="15" cy="48" r="3" fill="#c8a84e" opacity="0.7"/></svg>`),
  "noble-lady": svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 96"><defs><radialGradient id="bgNL" cx="50%" cy="40%"><stop offset="0%" stop-color="#4a2a3a"/><stop offset="100%" stop-color="#1a0a1a"/></radialGradient></defs><rect width="80" height="96" fill="url(#bgNL)" rx="8"/><path d="M20 36 Q18 22 30 18 Q40 14 50 18 Q62 22 60 36" fill="#6a3a2a"/><path d="M20 36 Q18 50 22 62 Q25 70 28 74" fill="none" stroke="#5a2a1a" stroke-width="4"/><path d="M60 36 Q62 50 58 62 Q55 70 52 74" fill="none" stroke="#5a2a1a" stroke-width="4"/><ellipse cx="40" cy="48" rx="16" ry="20" fill="#e8ccb0"/><ellipse cx="34" cy="46" rx="2.5" ry="2" fill="#3a2a1a"/><ellipse cx="46" cy="46" rx="2.5" ry="2" fill="#3a2a1a"/><path d="M35 56 Q40 60 45 56" fill="none" stroke="#c8a080" stroke-width="0.8"/><circle cx="30" cy="52" r="3" fill="#e8a0a0" opacity="0.3"/><circle cx="50" cy="52" r="3" fill="#e8a0a0" opacity="0.3"/><circle cx="34" cy="38" r="2" fill="#c8a84e"/><circle cx="46" cy="38" r="2" fill="#c8a84e"/><path d="M18 72 Q12 96 28 96 L52 96 Q68 96 62 72" fill="#6a3a4a"/><path d="M30 68 Q40 72 50 68" fill="none" stroke="#c8a84e" stroke-width="1"/></svg>`),
  "scarred-vet": svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 96"><defs><radialGradient id="bgSV" cx="50%" cy="40%"><stop offset="0%" stop-color="#2a2a1a"/><stop offset="100%" stop-color="#0a0a05"/></radialGradient></defs><rect width="80" height="96" fill="url(#bgSV)" rx="8"/><ellipse cx="40" cy="50" rx="18" ry="22" fill="#b8a080"/><path d="M24 36 Q22 26 32 22 Q40 18 48 22 Q58 26 56 36" fill="#2a1a0a"/><ellipse cx="33" cy="47" rx="3" ry="2" fill="#2a1a0a"/><ellipse cx="47" cy="47" rx="3" ry="2" fill="#2a1a0a"/><path d="M35 44 L45 46" fill="none" stroke="#8a6a4a" stroke-width="1" opacity="0.6"/><path d="M26 60 Q40 78 54 60" fill="#6a5a4a" stroke="#4a3a2a" stroke-width="0.5"/><path d="M22 38 Q20 28 30 26 Q40 22 50 26 Q60 28 58 38" fill="#2a1a0a"/><path d="M15 72 Q10 96 30 96 L50 96 Q70 96 65 72" fill="#4a3a2a"/><circle cx="40" cy="80" r="3" fill="#8a6a20"/></svg>`),
  "mystic-seer": svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 96"><defs><radialGradient id="bgMS" cx="50%" cy="40%"><stop offset="0%" stop-color="#1a2a3a"/><stop offset="100%" stop-color="#050a10"/></radialGradient></defs><rect width="80" height="96" fill="url(#bgMS)" rx="8"/><path d="M12 34 Q8 8 30 10 Q40 6 50 10 Q72 8 68 34 Q70 52 62 60 Q40 55 18 60 Q10 52 12 34Z" fill="#2a2a4a" stroke="#1a1a3a" stroke-width="0.5"/><ellipse cx="40" cy="50" rx="15" ry="19" fill="#d8c8b0"/><ellipse cx="34" cy="48" rx="2" ry="2.5" fill="#4a6a8a"/><ellipse cx="46" cy="48" rx="2" ry="2.5" fill="#4a6a8a"/><circle cx="34" cy="47.5" r="0.8" fill="#fff" opacity="0.4"/><circle cx="46" cy="47.5" r="0.8" fill="#fff" opacity="0.4"/><path d="M36 57 Q40 59 44 57" fill="none" stroke="#a09080" stroke-width="0.7"/><path d="M16 72 Q10 96 30 96 L50 96 Q70 96 64 72" fill="#1a1a3a"/><circle cx="40" cy="30" r="4" fill="#c8a84e" opacity="0.4"/></svg>`),
  "hardy-farmer": svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 96"><defs><radialGradient id="bgHF" cx="50%" cy="40%"><stop offset="0%" stop-color="#3a4a2a"/><stop offset="100%" stop-color="#0a1a0a"/></radialGradient></defs><rect width="80" height="96" fill="url(#bgHF)" rx="8"/><ellipse cx="40" cy="50" rx="17" ry="21" fill="#c8a896"/><path d="M24 38 Q22 28 32 24 Q40 20 48 24 Q58 28 56 38" fill="#5a4a2a"/><ellipse cx="34" cy="48" rx="2.5" ry="2" fill="#3a2a1a"/><ellipse cx="46" cy="48" rx="2.5" ry="2" fill="#3a2a1a"/><path d="M36 58 Q40 62 44 58" fill="none" stroke="#a08060" stroke-width="0.8"/><path d="M18 72 Q14 96 30 96 L50 96 Q66 96 62 72" fill="#5a6a3a"/><circle cx="40" cy="82" r="2" fill="#c8a84e" opacity="0.5"/><path d="M38 28 Q40 24 42 28" fill="none" stroke="#5a4a2a" stroke-width="0.8"/></svg>`),
  "sea-captain": svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 96"><defs><radialGradient id="bgSC" cx="50%" cy="40%"><stop offset="0%" stop-color="#1a3a4a"/><stop offset="100%" stop-color="#050a10"/></radialGradient></defs><rect width="80" height="96" fill="url(#bgSC)" rx="8"/><path d="M20 32 Q18 20 30 16 Q40 12 50 16 Q62 20 60 32" fill="#4a3a2a"/><path d="M22 30 L28 22 L34 28 L40 18 L46 28 L52 22 L58 30" fill="#2a2a3a" stroke="#c8a84e" stroke-width="0.5"/><ellipse cx="40" cy="48" rx="16" ry="20" fill="#c8a896"/><ellipse cx="34" cy="46" rx="2.5" ry="2" fill="#2a3a4a"/><ellipse cx="46" cy="46" rx="2.5" ry="2" fill="#2a3a4a"/><path d="M35 56 Q40 60 45 56" fill="none" stroke="#a08060" stroke-width="0.8"/><path d="M26 58 Q40 74 54 58" fill="#5a4a3a" stroke="#3a2a1a" stroke-width="0.5"/><path d="M16 72 Q12 96 28 96 L52 96 Q68 96 64 72" fill="#1a3a5a"/><circle cx="40" cy="82" r="2" fill="#c8a84e"/></svg>`),
};

/* ───── PORTRAITS ───── */
export const PORTRAIT_SVGS = {
  ruler: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 96">
    <defs><radialGradient id="bgR" cx="50%" cy="40%"><stop offset="0%" stop-color="#2a3a5a"/><stop offset="100%" stop-color="#0a0a1a"/></radialGradient></defs>
    <rect width="80" height="96" fill="url(#bgR)" rx="8"/>
    <!-- Crown -->
    <polygon points="20,20 25,8 30,16 35,6 40,14 45,6 50,16 55,8 60,20" fill="#c8a84e" stroke="#8a6a20" stroke-width="0.5"/>
    <!-- Face silhouette -->
    <ellipse cx="40" cy="50" rx="18" ry="22" fill="#d4b896"/>
    <!-- Eyes -->
    <ellipse cx="33" cy="47" rx="3" ry="2" fill="#3a2a1a"/><ellipse cx="47" cy="47" rx="3" ry="2" fill="#3a2a1a"/>
    <circle cx="33" cy="47" r="1" fill="#fff" opacity="0.3"/><circle cx="47" cy="47" r="1" fill="#fff" opacity="0.3"/>
    <!-- Nose -->
    <path d="M40 47 Q38 54 40 56" fill="none" stroke="#b8a080" stroke-width="1"/>
    <!-- Beard -->
    <path d="M26 58 Q40 76 54 58" fill="#8a7050" stroke="#6a5a3a" stroke-width="0.5"/>
    <!-- Hair -->
    <path d="M22 38 Q20 28 30 26 Q40 22 50 26 Q60 28 58 38" fill="#3a2a1a"/>
    <!-- Shoulders/robe -->
    <path d="M15 75 Q10 96 30 96 L50 96 Q70 96 65 75" fill="#4a3a2a"/>
    <!-- Brooch -->
    <circle cx="40" cy="78" r="3" fill="#c8a84e" stroke="#8a6a20" stroke-width="0.5"/>
    <!-- Title -->
    <text x="40" y="92" text-anchor="middle" font-family="serif" font-size="7" fill="#c8a84e" font-style="italic">Ruler</text>
  </svg>`),

  spouse: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 96">
    <defs><radialGradient id="bgS" cx="50%" cy="40%"><stop offset="0%" stop-color="#4a2a3a"/><stop offset="100%" stop-color="#1a0a1a"/></radialGradient></defs>
    <rect width="80" height="96" fill="url(#bgS)" rx="8"/>
    <!-- Hair -->
    <path d="M20 36 Q18 22 30 18 Q40 14 50 18 Q62 22 60 36" fill="#6a3a2a"/>
    <path d="M20 36 Q18 50 22 62 Q25 70 28 74" fill="none" stroke="#5a2a1a" stroke-width="4"/><path d="M60 36 Q62 50 58 62 Q55 70 52 74" fill="none" stroke="#5a2a1a" stroke-width="4"/>
    <!-- Face -->
    <ellipse cx="40" cy="48" rx="16" ry="20" fill="#e8ccb0"/>
    <!-- Eyes -->
    <ellipse cx="34" cy="46" rx="2.5" ry="2" fill="#3a2a1a"/><ellipse cx="46" cy="46" rx="2.5" ry="2" fill="#3a2a1a"/>
    <circle cx="34" cy="45.5" r="1" fill="#fff" opacity="0.3"/><circle cx="46" cy="45.5" r="1" fill="#fff" opacity="0.3"/>
    <!-- Smile -->
    <path d="M35 56 Q40 60 45 56" fill="none" stroke="#c8a080" stroke-width="0.8"/>
    <!-- Rose cheeks -->
    <circle cx="30" cy="52" r="3" fill="#e8a0a0" opacity="0.3"/><circle cx="50" cy="52" r="3" fill="#e8a0a0" opacity="0.3"/>
    <!-- Jewelry -->
    <circle cx="34" cy="38" r="2" fill="#c8a84e"/><circle cx="46" cy="38" r="2" fill="#c8a84e"/>
    <!-- Dress -->
    <path d="M18 72 Q12 96 28 96 L52 96 Q68 96 62 72" fill="#6a3a4a"/>
    <!-- Necklace -->
    <path d="M30 68 Q40 72 50 68" fill="none" stroke="#c8a84e" stroke-width="1"/>
    <!-- Title -->
    <text x="40" y="92" text-anchor="middle" font-family="serif" font-size="7" fill="#d4a0b0" font-style="italic">Lady</text>
  </svg>`),

  heir: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 96">
    <defs><radialGradient id="bgH" cx="50%" cy="40%"><stop offset="0%" stop-color="#3a4a2a"/><stop offset="100%" stop-color="#0a1a0a"/></radialGradient></defs>
    <rect width="80" height="96" fill="url(#bgH)" rx="8"/>
    <!-- Hair -->
    <path d="M24 36 Q22 26 32 22 Q40 18 48 22 Q58 26 56 36" fill="#5a4a2a"/>
    <!-- Face (younger/smaller) -->
    <ellipse cx="40" cy="50" rx="15" ry="18" fill="#d4b896"/>
    <!-- Eyes -->
    <ellipse cx="35" cy="48" rx="2.5" ry="2" fill="#3a2a1a"/><ellipse cx="45" cy="48" rx="2.5" ry="2" fill="#3a2a1a"/>
    <circle cx="35" cy="47.5" r="1" fill="#fff" opacity="0.3"/><circle cx="45" cy="47.5" r="1" fill="#fff" opacity="0.3"/>
    <!-- Youthful smile -->
    <path d="M36 56 Q40 59 44 56" fill="none" stroke="#b8a080" stroke-width="0.8"/>
    <!-- Tunic -->
    <path d="M20 72 Q15 96 30 96 L50 96 Q65 96 60 72" fill="#3a6a2a"/>
    <!-- Small brooch -->
    <circle cx="40" cy="76" r="2" fill="#c8a84e" opacity="0.6"/>
    <!-- Title -->
    <text x="40" y="92" text-anchor="middle" font-family="serif" font-size="7" fill="#8ab86a" font-style="italic">Heir</text>
  </svg>`),

  mentor: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 96">
    <defs><radialGradient id="bgM" cx="50%" cy="40%"><stop offset="0%" stop-color="#4a3a2a"/><stop offset="100%" stop-color="#1a0a00"/></radialGradient></defs>
    <rect width="80" height="96" fill="url(#bgM)" rx="8"/>
    <!-- Hood -->
    <path d="M15 30 Q10 10 30 12 Q40 8 50 12 Q70 10 65 30 Q68 45 60 55 Q40 50 20 55 Q12 45 15 30Z" fill="#4a3a2a" stroke="#3a2a1a" stroke-width="0.5"/>
    <!-- Face (older) -->
    <ellipse cx="40" cy="52" rx="14" ry="18" fill="#c8a880"/>
    <!-- Wise eyes -->
    <ellipse cx="34" cy="50" rx="2.5" ry="1.5" fill="#3a2a1a"/><ellipse cx="46" cy="50" rx="2.5" ry="1.5" fill="#3a2a1a"/>
    <circle cx="34" cy="49.5" r="0.8" fill="#fff" opacity="0.2"/><circle cx="46" cy="49.5" r="0.8" fill="#fff" opacity="0.2"/>
    <!-- Wrinkles -->
    <path d="M30 53 Q34 54 36 53" fill="none" stroke="#a08060" stroke-width="0.3" opacity="0.5"/>
    <path d="M44 53 Q46 54 50 53" fill="none" stroke="#a08060" stroke-width="0.3" opacity="0.5"/>
    <!-- Grey beard -->
    <path d="M28 60 Q40 80 52 60" fill="#aaa8a0" stroke="#8a8a80" stroke-width="0.5"/>
    <!-- Robe -->
    <path d="M15 72 Q10 96 30 96 L50 96 Q70 96 65 72" fill="#3a3a2a"/>
    <!-- Elder staff -->
    <line x1="15" y1="50" x2="10" y2="95" stroke="#6a5a3a" stroke-width="2.5"/>
    <circle cx="15" cy="48" r="3" fill="#c8a84e" opacity="0.7"/>
    <!-- Title -->
    <text x="40" y="92" text-anchor="middle" font-family="serif" font-size="7" fill="#b8a060" font-style="italic">Mentor</text>
  </svg>`),
};

/* ───── SIX PILLARS DEITY EMBLEMS ───── */
export const DEITY_SVGS: Record<string, string> = {
  astra: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <defs><radialGradient id="dgA" cx="50%" cy="42%"><stop offset="0%" stop-color="#7a5a1a"/><stop offset="100%" stop-color="#2a1a05"/></radialGradient></defs>
    <rect width="96" height="96" fill="url(#dgA)" rx="14"/>
    <circle cx="48" cy="48" r="36" fill="none" stroke="#c8a84e" stroke-width="2" opacity="0.5"/>
    <circle cx="48" cy="48" r="30" fill="none" stroke="#c8a84e" stroke-width="0.8" opacity="0.4"/>
    <g stroke="#e8c860" stroke-width="1.6" fill="none">
      <path d="M30 68 Q30 40 48 40 Q66 40 66 68" />
      <path d="M30 52 Q24 40 32 32 Q40 26 46 34" opacity="0.7"/>
      <path d="M66 52 Q72 40 64 32 Q56 26 50 34" opacity="0.7"/>
      <path d="M30 56 L66 56" opacity="0.5"/><path d="M30 62 L66 62" opacity="0.5"/>
      <path d="M44 40 L42 30 M52 40 L54 30" opacity="0.6"/>
    </g>
    <circle cx="48" cy="22" r="4" fill="#e8c860"/>
    <text x="48" y="90" text-anchor="middle" font-family="serif" font-size="10" fill="#e8c860" font-style="italic">Astra</text>
  </svg>`),

  kaelen: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <defs><radialGradient id="dgK" cx="50%" cy="42%"><stop offset="0%" stop-color="#3a3a42"/><stop offset="100%" stop-color="#0a0a0f"/></radialGradient></defs>
    <rect width="96" height="96" fill="url(#dgK)" rx="14"/>
    <circle cx="48" cy="48" r="36" fill="none" stroke="#9a9aa4" stroke-width="2" opacity="0.5"/>
    <g fill="none" stroke="#c8c8d0" stroke-width="1.6">
      <path d="M30 46 L48 30 L66 46" />
      <rect x="38" y="46" width="20" height="14" />
      <path d="M44 46 L44 74 M52 46 L52 74" />
      <path d="M34 74 L62 74" />
      <path d="M36 60 L60 52" opacity="0.5"/>
    </g>
    <path d="M60 20 L72 28 L66 34 L54 26 Z" fill="#c8c8d0" opacity="0.85"/>
    <text x="48" y="90" text-anchor="middle" font-family="serif" font-size="10" fill="#c8c8d0" font-style="italic">Kaelen</text>
  </svg>`),

  verna: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <defs><radialGradient id="dgV" cx="50%" cy="42%"><stop offset="0%" stop-color="#1f4a1f"/><stop offset="100%" stop-color="#071a07"/></radialGradient></defs>
    <rect width="96" height="96" fill="url(#dgV)" rx="14"/>
    <circle cx="48" cy="48" r="36" fill="none" stroke="#5a9a52" stroke-width="2" opacity="0.5"/>
    <g fill="none" stroke="#6db866" stroke-width="1.6">
      <path d="M48 40 L48 74" />
      <path d="M34 50 Q28 42 34 34 Q44 26 48 34 Q52 26 62 34 Q68 42 62 50" />
      <path d="M40 66 Q48 60 56 66" />
      <path d="M42 50 L46 58 L50 50" opacity="0.6"/>
      <path d="M36 58 L44 64 L40 70" opacity="0.5"/>
      <path d="M60 58 L52 64 L56 70" opacity="0.5"/>
    </g>
    <circle cx="48" cy="30" r="4" fill="#8ad47a"/>
    <text x="48" y="90" text-anchor="middle" font-family="serif" font-size="10" fill="#6db866" font-style="italic">Verna</text>
  </svg>`),

  valen: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <defs><radialGradient id="dgL" cx="50%" cy="42%"><stop offset="0%" stop-color="#1a4a5a"/><stop offset="100%" stop-color="#051420"/></radialGradient></defs>
    <rect width="96" height="96" fill="url(#dgL)" rx="14"/>
    <circle cx="48" cy="48" r="36" fill="none" stroke="#4d97a8" stroke-width="2" opacity="0.5"/>
    <g fill="none" stroke="#5ab8cc" stroke-width="1.6">
      <path d="M28 58 Q38 50 48 58 Q58 66 68 58" />
      <path d="M28 66 Q38 58 48 66 Q58 74 68 66" opacity="0.6"/>
      <path d="M48 36 L48 20 M42 26 L48 20 L54 26" opacity="0.8"/>
    </g>
    <circle cx="48" cy="30" r="4" fill="#5ab8cc"/>
    <text x="48" y="90" text-anchor="middle" font-family="serif" font-size="10" fill="#5ab8cc" font-style="italic">Valen</text>
  </svg>`),

  morvath: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <defs><radialGradient id="dgM" cx="50%" cy="42%"><stop offset="0%" stop-color="#4a4a5a"/><stop offset="100%" stop-color="#101018"/></radialGradient></defs>
    <rect width="96" height="96" fill="url(#dgM)" rx="14"/>
    <circle cx="48" cy="48" r="36" fill="none" stroke="#8a8aa4" stroke-width="2" opacity="0.5"/>
    <g fill="none" stroke="#b8b8d0" stroke-width="1.6">
      <path d="M30 62 L30 34 L48 40 L66 34 L66 62 Q48 68 30 62 Z" />
      <path d="M38 62 L38 42 L48 45 L58 42 L58 62" opacity="0.6"/>
    </g>
    <path d="M56 20 L68 30 L60 34 L48 24 Z" fill="#b8b8d0" opacity="0.7"/>
    <text x="48" y="90" text-anchor="middle" font-family="serif" font-size="10" fill="#b8b8d0" font-style="italic">Morvath</text>
  </svg>`),

  sol: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <defs><radialGradient id="dgS" cx="50%" cy="42%"><stop offset="0%" stop-color="#7a4a0a"/><stop offset="100%" stop-color="#1f0f02"/></radialGradient></defs>
    <rect width="96" height="96" fill="url(#dgS)" rx="14"/>
    <circle cx="48" cy="48" r="36" fill="none" stroke="#e0a040" stroke-width="2" opacity="0.5"/>
    <circle cx="48" cy="48" r="14" fill="#e0a040" opacity="0.9"/>
    <g stroke="#e0a040" stroke-width="2" stroke-linecap="round">
      <line x1="48" y1="20" x2="48" y2="28"/><line x1="48" y1="68" x2="48" y2="76"/>
      <line x1="20" y1="48" x2="28" y2="48"/><line x1="68" y1="48" x2="76" y2="48"/>
      <line x1="30" y1="30" x2="36" y2="36"/><line x1="60" y1="60" x2="66" y2="66"/>
      <line x1="30" y1="66" x2="36" y2="60"/><line x1="60" y1="36" x2="66" y2="30"/>
    </g>
    <text x="48" y="90" text-anchor="middle" font-family="serif" font-size="9" fill="#e0a040" font-style="italic">Sol Invictus</text>
  </svg>`),
};
