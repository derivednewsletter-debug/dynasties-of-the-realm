/**
 * High-quality SVG placeholder images for the game.
 * Each export is a data:image/svg+xml;base64 URI that works without any /public/image files.
 */

function svgUri(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
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

/* ───── SETTLEMENT SCENES ───── */
export const SETTLEMENT_SVGS = {
  hamlet: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4a6070"/><stop offset="100%" stop-color="#7a8a9a"/></linearGradient></defs>
    <rect width="400" height="160" fill="url(#sky)"/>
    <!-- Ground -->
    <ellipse cx="200" cy="160" rx="250" ry="50" fill="#3a5a2a"/>
    <ellipse cx="200" cy="165" rx="230" ry="40" fill="#4a6a3a"/>
    <!-- Trees -->
    <g opacity="0.6">
      <circle cx="50" cy="75" r="22" fill="#2a4a1a"/><rect x="47" y="92" width="6" height="20" fill="#3a2a1a"/>
      <circle cx="340" cy="80" r="18" fill="#2a4a1a"/><rect x="337" y="94" width="6" height="18" fill="#3a2a1a"/>
      <circle cx="370" cy="70" r="14" fill="#2a4a1a"/><rect x="367" y="80" width="6" height="15" fill="#3a2a1a"/>
    </g>
    <!-- Huts -->
    <g>
      <rect x="130" y="85" width="50" height="35" fill="#5a4a2a" stroke="#3a2a1a" stroke-width="1.5" rx="2"/>
      <polygon points="125,85 155,60 185,85" fill="#6a5a3a" stroke="#3a2a1a" stroke-width="1"/>
      <rect x="145" y="95" width="12" height="15" fill="#4a3a2a" rx="1"/>
      <!-- Smoke -->
      <circle cx="160" cy="55" r="4" fill="#aaa" opacity="0.3"/>
      <circle cx="155" cy="48" r="3" fill="#aaa" opacity="0.2"/>
    </g>
    <g>
      <rect x="215" y="90" width="35" height="25" fill="#5a4a2a" stroke="#3a2a1a" stroke-width="1.5" rx="2"/>
      <polygon points="210,90 232,70 255,90" fill="#6a5a3a" stroke="#3a2a1a" stroke-width="1"/>
    </g>
    <!-- Small fence -->
    <g stroke="#4a3a2a" stroke-width="1.5" opacity="0.5">
      <line x1="90" y1="110" x2="90" y2="130"/><line x1="110" y1="112" x2="110" y2="132"/><line x1="88" y1="118" x2="112" y2="120"/>
    </g>
    <!-- Path -->
    <path d="M200 130 Q180 150 160 170" fill="none" stroke="#5a4a2a" stroke-width="3" opacity="0.3"/>
    <!-- Label -->
    <text x="200" y="150" text-anchor="middle" font-family="serif" font-size="20" fill="#c8a84e" opacity="0.6">♜ Hearthmere</text>
  </svg>`),

  village: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160">
    <defs><linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5a6a80"/><stop offset="100%" stop-color="#9ab0c0"/></linearGradient></defs>
    <rect width="400" height="160" fill="url(#sky2)"/>
    <!-- Ground -->
    <ellipse cx="200" cy="160" rx="260" ry="45" fill="#5a7a4a"/>
    <ellipse cx="200" cy="163" rx="240" ry="35" fill="#6a8a5a"/>
    <!-- Fields -->
    <rect x="20" y="105" width="75" height="50" fill="#7a9a3a" opacity="0.5" rx="3"/>
    <rect x="300" y="100" width="85" height="50" fill="#7a9a3a" opacity="0.4" rx="3"/>
    <g stroke="#6a8a3a" stroke-width="0.5" opacity="0.4">
      <line x1="35" y1="110" x2="80" y2="110"/><line x1="35" y1="120" x2="80" y2="120"/><line x1="35" y1="130" x2="80" y2="130"/>
      <line x1="315" y1="105" x2="370" y2="105"/><line x1="315" y1="115" x2="370" y2="115"/><line x1="315" y1="125" x2="370" y2="125"/>
    </g>
    <!-- Village houses -->
    <g>
      ${[100,155,210,265].map((x,i) => `
        <rect x="${x}" y="${75+i*3}" width="40" height="30" fill="#6a5a3a" stroke="#3a2a1a" stroke-width="1" rx="2"/>
        <polygon points="${x-5},${75+i*3} ${x+20},${55+i*3} ${x+45},${75+i*3}" fill="#7a6a4a" stroke="#3a2a1a" stroke-width="0.8"/>
        <rect x="${x+10}" y="${84+i*3}" width="10" height="14" fill="#3a2a1a" rx="1"/>
        <circle cx="${x+20}" cy="${48+i*3}" r="3" fill="#aaa" opacity="0.2"/>
        `).join('')}
    </g>
    <!-- Church/shrine -->
    <g transform="translate(190,50)">
      <rect x="0" y="15" width="22" height="28" fill="#7a6a5a" stroke="#4a3a2a" stroke-width="1" rx="1"/>
      <polygon points="-3,15 11,-2 25,15" fill="#8a7a6a" stroke="#4a3a2a" stroke-width="0.8"/>
      <line x1="11" y1="-2" x2="11" y2="-12" stroke="#4a3a2a" stroke-width="1"/>
      <circle cx="11" cy="-12" r="3" fill="#c8a84e" opacity="0.7"/>
    </g>
    <!-- Path -->
    <path d="M190 100 Q200 130 220 160" fill="none" stroke="#5a4a2a" stroke-width="4" opacity="0.25"/>
    <!-- Label -->
    <text x="200" y="152" text-anchor="middle" font-family="serif" font-size="20" fill="#c8a84e" opacity="0.6">🏠 The Village</text>
  </svg>`),

  town: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160">
    <defs><linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4a5070"/><stop offset="100%" stop-color="#8a90b0"/></linearGradient></defs>
    <rect width="400" height="160" fill="url(#sky3)"/>
    <!-- Ground -->
    <ellipse cx="200" cy="165" rx="260" ry="40" fill="#5a5a4a"/>
    <ellipse cx="200" cy="168" rx="240" ry="30" fill="#6a6a5a"/>
    <!-- Walls -->
    <rect x="40" y="60" width="320" height="100" fill="#7a7a6a" opacity="0.3" rx="2"/>
    <rect x="45" y="65" width="310" height="5" fill="#8a8a7a" opacity="0.5"/>
    <!-- Gate -->
    <rect x="170" y="75" width="60" height="85" fill="#4a4a3a" rx="3"/>
    <path d="M170 75 Q200 50 230 75" fill="none" stroke="#4a4a3a" stroke-width="4"/>
    <rect x="190" y="90" width="20" height="30" fill="#3a3a2a" rx="1"/>
    <!-- Market square -->
    <rect x="120" y="100" width="160" height="50" fill="#8a8a6a" opacity="0.4" rx="2"/>
    <!-- Stalls -->
    <g opacity="0.6">
      <rect x="130" y="95" width="20" height="20" fill="#6a4a2a" rx="1"/><polygon points="125,95 140,85 155,95" fill="#7a5a3a"/>
      <rect x="250" y="95" width="20" height="20" fill="#6a4a2a" rx="1"/><polygon points="245,95 260,85 275,95" fill="#7a5a3a"/>
    </g>
    <!-- Buildings -->
    <g>
      ${[65,105,295,335].map((x,i) => `
        <rect x="${x}" y="${65+i*2}" width="30" height="45" fill="${['#6a5a4a','#7a6a5a','#6a5a4a','#7a6a5a'][i]}" stroke="#3a2a1a" stroke-width="0.8" rx="1"/>
        <rect x="${x+5}" y="${68+i*2}" width="8" height="8" fill="#3a2a1a"/><rect x="${x+17}" y="${68+i*2}" width="8" height="8" fill="#3a2a1a"/>
        <rect x="${x+5}" y="${82+i*2}" width="8" height="8" fill="#3a2a1a" opacity="0.7"/><rect x="${x+17}" y="${82+i*2}" width="8" height="8" fill="#3a2a1a" opacity="0.7"/>
      `).join('')}
    </g>
    <!-- Church spire -->
    <g transform="translate(220,35)">
      <rect x="0" y="20" width="16" height="30" fill="#8a7a6a" stroke="#4a3a2a" stroke-width="0.8" rx="1"/>
      <polygon points="-3,20 8,0 19,20" fill="#9a8a7a" stroke="#4a3a2a" stroke-width="0.8"/>
      <line x1="8" y1="0" x2="8" y2="-14" stroke="#c8a84e" stroke-width="1"/>
      <circle cx="8" cy="-16" r="3" fill="#c8a84e" opacity="0.8"/>
    </g>
    <!-- Road -->
    <path d="M200 135 Q230 150 260 170" fill="none" stroke="#6a6a4a" stroke-width="6" opacity="0.3"/>
    <text x="200" y="155" text-anchor="middle" font-family="serif" font-size="20" fill="#c8a84e" opacity="0.6">🏰 Market Town</text>
  </svg>`),

  city: svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160">
    <defs><linearGradient id="sky4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3a4050"/><stop offset="100%" stop-color="#6a7090"/></linearGradient>
    <filter id="glow2"><feGaussianBlur stdDeviation="2"/></filter></defs>
    <rect width="400" height="160" fill="url(#sky4)"/>
    <!-- Ground -->
    <ellipse cx="200" cy="168" rx="260" ry="35" fill="#4a4a3a"/>
    <ellipse cx="200" cy="170" rx="240" ry="25" fill="#5a5a4a"/>
    <!-- City walls -->
    <rect x="20" y="40" width="360" height="120" fill="#6a6a5a" opacity="0.25" rx="3"/>
    <rect x="25" y="45" width="350" height="6" fill="#8a8a7a" opacity="0.5"/>
    <!-- Battlements -->
    <g fill="#7a7a6a" opacity="0.4">
      ${Array.from({length:17},(_,i)=>`<rect x="${25+i*21}" y="40" width="12" height="8"/>`).join('')}
    </g>
    <!-- Towers -->
    <g>
      <rect x="35" y="10" width="25" height="50" fill="#7a7a6a" stroke="#5a5a4a" stroke-width="1" rx="1"/><rect x="30" y="5" width="35" height="8" fill="#8a8a7a" rx="1"/>
      <rect x="180" y="0" width="40" height="60" fill="#7a7a6a" stroke="#5a5a4a" stroke-width="1" rx="1"/><rect x="175" y="-5" width="50" height="8" fill="#8a8a7a" rx="1"/>
      <rect x="340" y="10" width="25" height="50" fill="#7a7a6a" stroke="#5a5a4a" stroke-width="1" rx="1"/><rect x="335" y="5" width="35" height="8" fill="#8a8a7a" rx="1"/>
    </g>
    <!-- Flag on center tower -->
    <line x1="200" y1="-5" x2="200" y2="-25" stroke="#5a4a2a" stroke-width="1"/><polygon points="200,-25 225,-18 200,-11" fill="#c8a84e" opacity="0.8"/>
    <!-- Cathedral -->
    <g transform="translate(155,30)">
      <rect x="0" y="10" width="30" height="40" fill="#7a6a5a" stroke="#4a3a2a" stroke-width="0.8" rx="1"/>
      <polygon points="-5,10 15,-10 35,10" fill="#8a7a6a" stroke="#4a3a2a" stroke-width="0.8"/>
      <line x1="15" y1="-10" x2="15" y2="-25" stroke="#c8a84e" stroke-width="1.5"/>
      <circle cx="15" cy="-27" r="4" fill="#c8a84e" opacity="0.9" filter="url(#glow2)"/>
      <!-- Rose window -->
      <circle cx="15" cy="25" r="6" fill="#c8a84e" opacity="0.5" stroke="#4a3a2a" stroke-width="0.5"/>
    </g>
    <!-- Dense buildings -->
    <g opacity="0.7">
      ${[70,90,110,260,285,310].map((x,i) => `
        <rect x="${x}" y="${60+i}" width="22" height="${30-i*2}" fill="${['#5a4a3a','#6a5a4a','#5a4a3a','#6a5a4a','#5a4a3a','#6a5a4a'][i]}" stroke="#3a2a1a" stroke-width="0.5" rx="1"/>
        <rect x="${x+4}" y="${63+i}" width="6" height="5" fill="${i%2?'#c8a84e':'#8a7a6a'}" opacity="0.4" rx="0.5"/>
        <rect x="${x+12}" y="${63+i}" width="6" height="5" fill="${i%2?'#c8a84e':'#8a7a6a'}" opacity="0.4" rx="0.5"/>
      `).join('')}
    </g>
    <!-- Roads -->
    <path d="M200 90 Q210 110 220 135 L225 145" fill="none" stroke="#7a7a4a" stroke-width="5" opacity="0.25"/>
    <!-- Label -->
    <text x="200" y="155" text-anchor="middle" font-family="serif" font-size="20" fill="#c8a84e" opacity="0.7">🏛 Great City</text>
  </svg>`),
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
