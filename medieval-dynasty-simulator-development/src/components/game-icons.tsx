/**
 * Stylized SVG icon set for the game — every icon is a self-contained
 * data:image/svg+xml;base64 URI, no /public files needed.
 *
 * Two variants:
 *  - tile(body): panel icons on the game's dark rounded tile (like the deity emblems)
 *  - glyph(body): transparent artwork for map markers / overlays
 *  - shield(charge, tint): heraldic heater shield wrapping a charge
 */

function u(svg: string): string {
  const bytes = new TextEncoder().encode(svg);
  const binary = Array.from(bytes, b => String.fromCharCode(b)).join("");
  return `data:image/svg+xml;base64,${btoa(binary)}`;
}

function tile(body: string): string {
  return u(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
  <defs><radialGradient id="ib" cx="50%" cy="34%"><stop offset="0%" stop-color="#2b2217"/><stop offset="100%" stop-color="#0e0b07"/></radialGradient></defs>
  <rect width="96" height="96" fill="url(#ib)" rx="14"/>
  <rect x="2.5" y="2.5" width="91" height="91" rx="12" fill="none" stroke="#c8a84e" stroke-width="1.5" opacity="0.45"/>
  ${body}
</svg>`);
}

function glyph(body: string): string {
  return u(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">${body}</svg>`);
}

/* ═════════════════════════ RESOURCES ═════════════════════════ */

const ART_WHEAT = `
<g fill="none" stroke="#e8c860" stroke-width="3" stroke-linecap="round">
  <path d="M48 76 L48 30"/>
  <path d="M40 70 Q30 60 32 44 Q33 36 40 31"/>
  <path d="M56 70 Q66 60 64 44 Q63 36 56 31"/>
  <path d="M48 56 Q38 48 41 33"/>
  <path d="M48 56 Q58 48 55 33"/>
</g>
<g fill="#e8c860"><circle cx="33" cy="29" r="3.4"/><circle cx="40" cy="28" r="3.4"/><circle cx="48" cy="26" r="3.4"/><circle cx="56" cy="28" r="3.4"/><circle cx="63" cy="29" r="3.4"/></g>
<rect x="42" y="72" width="12" height="9" rx="2.5" fill="#8a6a3a"/>`;

const ART_LOGS = `
<g>
  <rect x="20" y="58" width="56" height="13" rx="6.5" fill="#8a5a2a" stroke="#5a3a1a" stroke-width="2.5"/>
  <circle cx="32" cy="64.5" r="4" fill="#e0c890"/><circle cx="32" cy="64.5" r="1.6" fill="#6b4423"/>
  <circle cx="68" cy="64.5" r="4" fill="#e0c890"/><circle cx="68" cy="64.5" r="1.6" fill="#6b4423"/>
  <rect x="28" y="40" width="42" height="13" rx="6.5" fill="#7a4f22" stroke="#5a3a1a" stroke-width="2.5"/>
  <circle cx="42" cy="46.5" r="4" fill="#d8bd80"/><circle cx="42" cy="46.5" r="1.6" fill="#5a3a1a"/>
  <circle cx="62" cy="46.5" r="4" fill="#d8bd80"/><circle cx="62" cy="46.5" r="1.6" fill="#5a3a1a"/>
  <rect x="22" y="22" width="34" height="13" rx="6.5" fill="#6b4423" stroke="#4a3018" stroke-width="2.5"/>
  <circle cx="34" cy="28.5" r="4" fill="#c8ae70"/><circle cx="34" cy="28.5" r="1.6" fill="#4a3018"/>
</g>`;

const ART_FISH = `
<g>
  <path d="M26 48 L14 40 L14 56 Z" fill="#5ab8cc" stroke="#2a6a7a" stroke-width="2.5" stroke-linejoin="round"/>
  <ellipse cx="48" cy="48" rx="24" ry="13" fill="#5ab8cc" stroke="#2a6a7a" stroke-width="2.5"/>
  <path d="M28 48 L56 48" stroke="#2a6a7a" stroke-width="1.5" opacity="0.6"/>
  <circle cx="61" cy="44" r="2.2" fill="#12242a"/><circle cx="61" cy="44" r="1" fill="#dff6fb"/>
  <path d="M44 40 Q48 36 52 40" stroke="#2a6a7a" stroke-width="1.5" fill="none"/>
</g>`;

const ART_HERB = `
<g fill="none" stroke="#6db866" stroke-width="3" stroke-linecap="round">
  <path d="M48 76 L48 42"/>
  <path d="M48 60 Q36 56 34 44 Q38 44 48 50"/>
  <path d="M48 52 Q60 48 62 38 Q56 38 48 44"/>
  <path d="M48 68 Q38 66 36 56"/>
  <path d="M48 56 Q56 52 56 46"/>
</g>
<g fill="#8ad47a"><circle cx="34" cy="42" r="2.6"/><circle cx="62" cy="36" r="2.6"/><circle cx="36" cy="54" r="2.6"/><circle cx="56" cy="44" r="2.6"/></g>`;

const ART_COIN = `
<g>
  <circle cx="48" cy="48" r="21" fill="#d8d4c8" stroke="#8a8578" stroke-width="2.5"/>
  <circle cx="48" cy="48" r="17" fill="none" stroke="#a8a294" stroke-width="1.2"/>
  <path d="M36 40 Q48 32 60 40" stroke="#9a9488" stroke-width="2.5" fill="none"/>
  <path d="M36 40 L60 40 L57 48 L39 48 Z" fill="#c8c2b4" stroke="#9a9488" stroke-width="2"/>
  <path d="M39 48 L48 58 L57 48" fill="none" stroke="#9a9488" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="48" cy="48" r="2" fill="#9a9488"/>
</g>`;

const ART_SWORDS = `
<g fill="none" stroke-linecap="round">
  <g>
    <path d="M30 66 L66 30" stroke="#b8bec4" stroke-width="4.5"/>
    <rect x="40" y="48" width="20" height="7" rx="2" fill="#c8a84e" stroke="#8a6a20" stroke-width="1.5" transform="rotate(-45 50 51)"/>
    <path d="M60 36 L66 30 L70 34" stroke="#c8a84e" stroke-width="3"/>
  </g>
  <g>
    <path d="M66 66 L30 30" stroke="#b8bec4" stroke-width="4.5"/>
    <rect x="36" y="48" width="20" height="7" rx="2" fill="#c8a84e" stroke="#8a6a20" stroke-width="1.5" transform="rotate(-135 46 51)"/>
    <path d="M36 36 L30 30 L26 34" stroke="#c8a84e" stroke-width="3"/>
  </g>
</g>`;

export const RESOURCE_ICONS: Record<string, string> = {
  food: tile(ART_WHEAT),
  wood: tile(ART_LOGS),
  stone: tile(`
    <g>
      <path d="M24 68 L20 44 Q20 38 26 38 L34 32 Q38 30 42 34 L58 34 Q64 34 68 40 L72 50 Q76 56 70 64 L66 68 Z" fill="#9a9488" stroke="#5a564c" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M30 68 L30 42 L44 34 L52 34 L66 44 L66 68 Z" fill="#8a8578" stroke="#5a564c" stroke-width="2" stroke-linejoin="round"/>
      <path d="M36 40 L48 54 M44 38 L52 48 M40 42 L34 52" stroke="#5a564c" stroke-width="1.5" opacity="0.7"/>
      <path d="M44 62 L56 46" stroke="#b8b2a4" stroke-width="2" opacity="0.8" stroke-linecap="round"/>
    </g>`),
  iron: tile(`
    <g>
      <path d="M22 62 L18 42 L34 28 L62 28 L78 42 L74 62 Z" fill="#7a8088" stroke="#3a3e44" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M22 62 L34 28 M62 28 L74 62 M78 42 L18 42" stroke="#3a3e44" stroke-width="2" opacity="0.7"/>
      <path d="M34 30 L60 30 L74 42 L22 42 Z" fill="#9399a1" opacity="0.55"/>
      <path d="M40 52 L56 52" stroke="#c0c6cc" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
    </g>`),
  coal: tile(`
    <g>
      <path d="M32 66 Q24 58 26 48 Q28 38 38 34 Q48 30 56 36 Q68 42 66 54 Q64 66 52 68 L40 69 Q32 69 32 66Z" fill="#3a3f45" stroke="#14161a" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M34 46 Q38 40 44 38 M56 44 Q60 50 58 58" stroke="#6a727c" stroke-width="3" stroke-linecap="round" opacity="0.9"/>
      <path d="M42 60 L52 52" stroke="#20242a" stroke-width="2" stroke-linecap="round"/>
    </g>`),
  fish: tile(ART_FISH),
  wool: tile(`
    <g>
      <circle cx="48" cy="48" r="20" fill="#e8e0cc" stroke="#b8ae92" stroke-width="2.5"/>
      <path d="M34 40 Q42 32 52 36 Q60 40 62 48 Q62 56 54 60 Q44 64 36 58 Q30 52 34 40Z" fill="none" stroke="#c8bea0" stroke-width="2" stroke-linecap="round"/>
      <path d="M40 40 Q48 44 56 40 M40 52 Q48 56 56 52" stroke="#d8d0ba" stroke-width="2" stroke-linecap="round"/>
      <path d="M30 58 Q22 66 30 74 Q38 76 40 68" stroke="#e8e0cc" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>`),
  leather: tile(`
    <g>
      <path d="M30 36 Q46 28 60 32 Q70 36 68 46 Q68 58 58 66 Q44 72 34 66 Q26 60 28 48 Q28 40 30 36Z" fill="#8a5a2a" stroke="#5a3a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M36 44 L36 52 M50 44 L50 52 M40 60 L46 60" stroke="#5a3a1a" stroke-width="2" stroke-linecap="round"/>
      <path d="M60 42 L66 44" stroke="#c8a050" stroke-width="2" stroke-linecap="round"/>
      <path d="M30 46 Q34 50 38 46" stroke="#6b4423" stroke-width="1.5" fill="none"/>
    </g>`),
  herbs: tile(ART_HERB),
  tools: tile(`
    <g>
      <rect x="22" y="22" width="26" height="13" rx="3" fill="#9aa0a8" stroke="#4a4f56" stroke-width="2.5" transform="rotate(-32 35 28)"/>
      <rect x="32" y="34" width="9" height="34" rx="4" fill="#8a5a2a" stroke="#5a3a1a" stroke-width="2" transform="rotate(-32 36 51)"/>
      <rect x="52" y="30" width="7" height="36" rx="3.5" fill="#5a564c" stroke="#3a3834" stroke-width="2"/>
      <path d="M55 44 L64 36" stroke="#9aa0a8" stroke-width="7" stroke-linecap="round"/>
      <path d="M48 28 L62 42" stroke="#3a3834" stroke-width="2"/>
    </g>`),
  weapons: tile(ART_SWORDS),
  medicine: tile(`
    <g>
      <path d="M28 52 Q28 42 42 38 L54 38 Q68 42 68 52 Q68 62 48 62 Q28 62 28 52Z" fill="#7a9a5a" stroke="#4a6a3a" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M48 46 V58 M42 52 L54 52" stroke="#f0f4e8" stroke-width="3" stroke-linecap="round"/>
      <path d="M22 66 Q30 72 48 72 Q66 72 74 66" stroke="#4a6a3a" stroke-width="2" fill="none"/>
    </g>`),
  silver: tile(ART_COIN),
};

/* ═════════════════════════ DEITY GLYPHS ═════════════════════════ */

const ART_ANVIL = `
<g>
  <path d="M30 34 L24 48 L72 48 L66 34 Z" fill="#6a7078" stroke="#3a3e44" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M24 48 Q24 54 30 54 L66 54 Q72 54 72 48" fill="#565b62" stroke="#3a3e44" stroke-width="2.5"/>
  <path d="M36 54 L36 66 L60 66 L60 54 Z" fill="#4a4f56" stroke="#2a2d32" stroke-width="2.5"/>
  <path d="M20 52 L38 40" stroke="#9aa0a8" stroke-width="7" stroke-linecap="round"/>
  <path d="M40 40 L72 40" stroke="#c8a84e" stroke-width="4" stroke-linecap="round" opacity="0.9"/>
  <circle cx="30" cy="56" r="7" fill="#e0a040" opacity="0.5"/>
</g>`;

const ART_TREE = `
<g>
  <path d="M48 78 L48 40" stroke="#6b4423" stroke-width="4" stroke-linecap="round"/>
  <g fill="none" stroke="#4a7a42" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M24 46 Q36 40 48 46 Q60 40 72 46"/>
    <path d="M26 36 Q36 28 48 34 Q60 28 70 36"/>
    <path d="M32 26 Q40 18 48 22 Q56 18 64 26"/>
  </g>
  <g fill="#5a9a52"><circle cx="24" cy="42" r="5"/><circle cx="72" cy="42" r="5"/><circle cx="26" cy="32" r="5"/><circle cx="70" cy="32" r="5"/><circle cx="32" cy="22" r="5"/><circle cx="64" cy="22" r="5"/></g>
  <circle cx="48" cy="22" r="6" fill="#6db866"/>
</g>`;

const ART_SCALES = `
<g>
  <rect x="26" y="30" width="44" height="8" rx="2" fill="#c8a84e" stroke="#8a6a20" stroke-width="1.5"/>
  <path d="M48 38 L48 50" stroke="#c8a84e" stroke-width="3"/>
  <path d="M36 50 Q48 62 60 50 L54 42 L42 42 Z" fill="#c8a84e" stroke="#8a6a20" stroke-width="1.5"/>
  <path d="M32 52 Q48 60 64 52" stroke="#5ab8cc" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M30 58 Q48 68 66 58" stroke="#3d7788" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</g>`;

const ART_BOOK = `
<g>
  <path d="M48 30 Q40 22 26 24 Q18 26 18 36 L18 68 Q18 74 26 72 Q38 70 48 74 Z" fill="#7a7268" stroke="#4a4844" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M48 30 Q56 22 70 24 Q78 26 78 36 L78 68 Q78 74 70 72 Q58 70 48 74 Z" fill="#8a8278" stroke="#4a4844" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M48 30 L48 74" stroke="#c8a84e" stroke-width="2.5"/>
  <path d="M26 40 L40 38 M26 48 L40 46 M60 38 L70 38 M60 46 L70 46" stroke="#4a4844" stroke-width="2" stroke-linecap="round"/>
</g>`;

const ART_SUN = `
<g>
  <circle cx="48" cy="48" r="15" fill="#e0a040" stroke="#b07820" stroke-width="2.5"/>
  <g stroke="#e0a040" stroke-width="3.5" stroke-linecap="round">
    <line x1="48" y1="16" x2="48" y2="26"/><line x1="48" y1="70" x2="48" y2="80"/>
    <line x1="16" y1="48" x2="26" y2="48"/><line x1="70" y1="48" x2="80" y2="48"/>
    <line x1="25" y1="25" x2="32" y2="32"/><line x1="64" y1="64" x2="71" y2="71"/>
    <line x1="25" y1="71" x2="32" y2="64"/><line x1="64" y1="32" x2="71" y2="25"/>
  </g>
  <circle cx="42" cy="44" r="3.5" fill="#f6d38a"/>
</g>`;

export const DEITY_GLYPHS: Record<string, string> = {
  astra: tile(`<g><circle cx="48" cy="46" r="34" fill="none" stroke="#c8a84e" stroke-width="1.5" opacity="0.5"/>${ART_WHEAT}</g>`),
  kaelen: tile(ART_ANVIL),
  verna: tile(ART_TREE),
  valen: tile(ART_SCALES),
  morvath: tile(ART_BOOK),
  sol: tile(ART_SUN),
};

/* ═════════════════════════ BUILDINGS ═════════════════════════ */

export const BUILDING_ICONS: Record<string, string> = {
  homes: tile(`
    <g>
      <path d="M22 50 L48 26 L74 50" fill="none" stroke="#a0553f" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="28" y="50" width="40" height="30" fill="#7a6a4a" stroke="#4a3a2a" stroke-width="2.5"/>
      <rect x="30" y="50" width="36" height="7" fill="#8a7a5a"/>
      <rect x="42" y="62" width="12" height="18" fill="#4a3a2a"/>
      <rect x="31" y="57" width="8" height="8" fill="#e8c860" opacity="0.8"/>
      <path d="M64 55 L64 46" stroke="#4a3a2a" stroke-width="3"/>
      <path d="M60 42 Q64 36 68 42" stroke="#c8c4b8" stroke-width="2" fill="none" opacity="0.5"/>
    </g>`),
  lumber: tile(`
    <g>
      <rect x="20" y="60" width="56" height="14" rx="7" fill="#8a5a2a" stroke="#5a3a1a" stroke-width="2.5"/>
      <circle cx="33" cy="67" r="4" fill="#e0c890"/><circle cx="33" cy="67" r="1.6" fill="#6b4423"/>
      <circle cx="65" cy="67" r="4" fill="#e0c890"/><circle cx="65" cy="67" r="1.6" fill="#6b4423"/>
      <path d="M70 30 L40 52 L48 60 L78 38 Z" fill="#c8c4b8" stroke="#7a7268" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M40 52 L36 58 L48 60" fill="none" stroke="#7a7268" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M44 56 L58 56" stroke="#5a3a1a" stroke-width="5" stroke-linecap="round"/>
    </g>`),
  farm: tile(`
    <g>
      <path d="M20 62 L48 34 L76 62 Z" fill="#a0453a" stroke="#6b2820" stroke-width="3" stroke-linejoin="round"/>
      <path d="M20 62 L48 34 L76 62 L76 68 L20 68 Z" fill="#a0453a"/>
      <rect x="28" y="48" width="40" height="24" fill="#c8c4b8" stroke="#8a8578" stroke-width="2.5"/>
      <path d="M48 48 L48 72" stroke="#8a8578" stroke-width="2"/>
      <path d="M20 58 L76 58" stroke="#6b2820" stroke-width="2.5"/>
      <rect x="31" y="64" width="12" height="8" fill="#8a8578"/><rect x="53" y="64" width="12" height="8" fill="#8a8578"/>
    </g>`),
  mill: tile(`
    <g>
      <rect x="20" y="32" width="30" height="38" fill="#7a6a4a" stroke="#4a3a2a" stroke-width="2.5"/>
      <polygon points="16,32 35,16 54,32" fill="#8a7a5a" stroke="#4a3a2a" stroke-width="2.5"/>
      <circle cx="68" cy="48" r="18" fill="none" stroke="#8a6a3a" stroke-width="3"/>
      <circle cx="68" cy="48" r="3" fill="#8a6a3a"/>
      <g stroke="#8a6a3a" stroke-width="2.5"><path d="M50 48 L68 30 L86 48 M50 48 L68 66 L86 48 M68 30 L68 66"/></g>
      <path d="M38 70 Q68 86 94 70" stroke="#5ab8cc" stroke-width="4" fill="none" stroke-linecap="round"/>
      <rect x="26" y="42" width="8" height="8" fill="#e8c860" opacity="0.7"/>
    </g>`),
  mine: tile(`
    <g>
      <path d="M26 70 L26 40 Q48 24 70 40 L70 70 Z" fill="#5a564c" stroke="#3a3834" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M30 70 L30 44 Q48 30 66 44 L66 70 Z" fill="#14161a"/>
      <path d="M30 44 L66 44 M34 34 L62 34 M32 39 L64 39" stroke="#8a5a2a" stroke-width="3"/>
      <path d="M36 58 L60 58 L58 62 L38 62 Z" fill="#9aa0a8" stroke="#5a5f66" stroke-width="2"/>
      <circle cx="44" cy="60" r="6" fill="none" stroke="#4a4f56" stroke-width="2.5"/>
      <circle cx="52" cy="60" r="6" fill="none" stroke="#4a4f56" stroke-width="2.5"/>
    </g>`),
  smith: tile(ART_ANVIL),
  market: tile(`
    <g>
      <path d="M22 40 L74 40 L66 24 L30 24 Z" fill="#a0553f" stroke="#6b2820" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M22 40 L74 40" stroke="#e0c890" stroke-width="3"/>
      <rect x="30" y="40" width="36" height="28" fill="#7a6a4a" stroke="#4a3a2a" stroke-width="2.5"/>
      <line x1="48" y1="40" x2="48" y2="68" stroke="#4a3a2a" stroke-width="2"/>
      <path d="M34 50 Q40 46 44 50 M52 50 Q58 46 62 50" stroke="#e8c860" stroke-width="2.5" fill="none"/>
      <circle cx="36" cy="60" r="4" fill="#6db866"/><circle cx="60" cy="60" r="4" fill="#d8b06a"/>
    </g>`),
  shrine: tile(`
    <g>
      <path d="M36 26 L40 76 L52 76 L56 26 Z" fill="#8a8578" stroke="#5a564c" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M42 34 L50 34 M42 42 L50 42 M40 50 L46 50" stroke="#c8a84e" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="46" cy="82" rx="26" ry="5" fill="#5a564c" opacity="0.5"/>
      <path d="M46 66 L52 76" stroke="#c8a84e" stroke-width="2"/>
    </g>`),
  watch: tile(`
    <g>
      <rect x="34" y="36" width="28" height="40" fill="#8a8578" stroke="#4a4844" stroke-width="2.5"/>
      <path d="M30 36 L48 24 L66 36 Z" fill="#a0553f" stroke="#6b2820" stroke-width="2.5"/>
      <rect x="42" y="58" width="12" height="18" fill="#4a4844"/>
      <rect x="36" y="42" width="8" height="8" fill="#e8c860" opacity="0.8"/>
      <path d="M48 24 L48 16" stroke="#4a4844" stroke-width="2.5"/>
      <path d="M48 16 L62 20 L48 24" fill="#c8a84e"/>
      <path d="M24 78 L72 78" stroke="#4a4844" stroke-width="3" stroke-linecap="round"/>
    </g>`),
  temple_astra: DEITY_GLYPHS.astra,
  temple_kaelen: DEITY_GLYPHS.kaelen,
  temple_verna: DEITY_GLYPHS.verna,
  temple_valen: DEITY_GLYPHS.valen,
  temple_morvath: DEITY_GLYPHS.morvath,
  temple_sol: DEITY_GLYPHS.sol,
};

export const BUILDING_FALLBACK = BUILDING_ICONS.homes;

/* ═════════════════════════ OCCUPATIONS ═════════════════════════ */

export const OCCUPATION_ICONS: Record<string, string> = {
  farmer: tile(`
    <g>
      <path d="M30 70 L30 40" stroke="#8a6a3a" stroke-width="4" stroke-linecap="round"/>
      <path d="M30 40 Q46 36 58 44 L30 56 Z" fill="none" stroke="#9aa0a8" stroke-width="4" stroke-linejoin="round"/>
      <path d="M58 44 L62 48" stroke="#6b4423" stroke-width="4" stroke-linecap="round"/>
      <g fill="none" stroke="#e8c860" stroke-width="3" stroke-linecap="round">
        <path d="M52 34 L52 26"/><path d="M60 34 L60 26"/><path d="M44 38 L44 28"/>
      </g>
      <g fill="#e8c860"><circle cx="52" cy="24" r="3"/><circle cx="60" cy="24" r="3"/><circle cx="44" cy="26" r="3"/></g>
    </g>`),
  woodcutter: tile(`
    <g>
      <rect x="24" y="58" width="48" height="13" rx="6.5" fill="#8a5a2a" stroke="#5a3a1a" stroke-width="2.5"/>
      <circle cx="34" cy="64.5" r="4" fill="#e0c890"/><circle cx="58" cy="64.5" r="4" fill="#e0c890"/>
      <path d="M60 30 L36 50" stroke="#6b4423" stroke-width="5" stroke-linecap="round"/>
      <path d="M64 22 L38 44 L44 50 L70 28 Z" fill="#c8c4b8" stroke="#7a7268" stroke-width="2.5" stroke-linejoin="round"/>
    </g>`),
  herbalist: tile(`
    <g>
      <circle cx="48" cy="48" r="30" fill="#4a6a3a" opacity="0.2"/>
      <g fill="none" stroke="#6db866" stroke-width="3" stroke-linecap="round">
        <path d="M48 72 L48 40"/><path d="M48 58 Q36 54 34 44 Q38 44 48 50"/>
        <path d="M48 50 Q60 46 62 36 Q56 36 48 42"/>
      </g>
      <path d="M52 30 L52 22" stroke="#6db866" stroke-width="3" stroke-linecap="round"/>
      <path d="M52 22 L46 22 M52 22 L58 22" stroke="#6db866" stroke-width="3" stroke-linecap="round"/>
    </g>`),
  smith: tile(`
    <g>
      <rect x="28" y="58" width="40" height="12" rx="3" fill="#5a5f66" stroke="#3a3e44" stroke-width="2.5"/>
      <path d="M32 58 L36 44 L60 44 L64 58" fill="#6a7078" stroke="#3a3e44" stroke-width="2.5"/>
      <path d="M34 48 L62 48" stroke="#c8a84e" stroke-width="3"/>
      <path d="M48 44 L48 30" stroke="#6b4423" stroke-width="5" stroke-linecap="round"/>
      <path d="M48 30 L44 22 L52 22 Z" fill="#9aa0a8" stroke="#4a4f56" stroke-width="2"/>
    </g>`),
  fletcher: tile(`
    <g>
      <path d="M24 40 Q48 28 74 40 Q70 48 56 48" fill="none" stroke="#8a5a2a" stroke-width="3.5"/>
      <path d="M24 40 Q48 52 74 40 Q70 32 56 32" fill="none" stroke="#8a5a2a" stroke-width="3.5"/>
      <path d="M62 36 L62 44 L50 40 Z" fill="#c8a84e" stroke="#8a6a20" stroke-width="1.5"/>
      <path d="M34 40 L34 26" stroke="#6b4423" stroke-width="3"/>
      <path d="M34 26 L28 30 M34 26 L40 30" stroke="#6b4423" stroke-width="2.5"/>
    </g>`),
  trapper: tile(`
    <g>
      <path d="M24 30 Q24 52 48 60 Q72 52 72 30" fill="none" stroke="#4a3a2a" stroke-width="3"/>
      <path d="M48 60 L48 40 M48 40 Q42 36 42 30 Q42 24 48 24 Q54 24 54 30 Q54 36 48 40" fill="none" stroke="#4a3a2a" stroke-width="3"/>
      <circle cx="48" cy="44" r="3" fill="#c8a84e"/>
    </g>`),
  scribe: tile(`
    <g>
      <path d="M48 34 Q42 28 30 30 Q24 32 24 40 L24 66 Q24 70 30 68 Q40 66 48 70 Z" fill="#7a7268" stroke="#4a4844" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M32 40 L42 40 M32 48 L42 48 M32 56 L40 56" stroke="#c8a84e" stroke-width="2" stroke-linecap="round"/>
      <path d="M56 28 Q58 34 52 38 L30 58" fill="none" stroke="#c8c4b8" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M52 38 L56 42 M30 58 L26 62" stroke="#c8c4b8" stroke-width="2.5" stroke-linecap="round"/>
    </g>`),
  potter: tile(`
    <g>
      <path d="M34 28 L62 28 L66 42 Q66 58 56 62 L40 62 Q30 58 30 42 Z" fill="#c08050" stroke="#8a5a2a" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M30 42 Q48 50 66 42" fill="none" stroke="#8a5a2a" stroke-width="2.5"/>
      <path d="M38 62 Q36 68 40 70 Q48 74 56 70 Q60 68 58 62" fill="#c08050" stroke="#8a5a2a" stroke-width="2.5"/>
    </g>`),
  goatherd: tile(`
    <g>
      <path d="M34 42 Q34 30 42 26 Q48 23 52 28 L60 24 L56 32 Q58 34 58 42 Q58 52 48 52 Q34 52 34 42Z" fill="#e8e0cc" stroke="#b8ae92" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M42 26 L42 20 M52 28 L52 22" stroke="#b8ae92" stroke-width="3" stroke-linecap="round"/>
      <path d="M40 40 L44 40 M50 40 L54 40" stroke="#6a5a3a" stroke-width="2.5"/>
      <path d="M42 46 Q48 50 54 46" fill="none" stroke="#8a7a5a" stroke-width="2"/>
      <path d="M48 52 L48 66" stroke="#b8ae92" stroke-width="2.5"/>
    </g>`),
  miller: tile(`
    <g>
      <circle cx="48" cy="48" r="24" fill="#c8bea0" stroke="#8a8070" stroke-width="3"/>
      <circle cx="48" cy="48" r="9" fill="none" stroke="#8a8070" stroke-width="2.5"/>
      <g stroke="#8a8070" stroke-width="2.5"><path d="M48 24 L48 34 M48 62 L48 72 M24 48 L34 48 M62 48 L72 48 M41 41 L48 48 L55 55"/></g>
      <path d="M40 72 L56 72 M42 74 L54 74" stroke="#6b4423" stroke-width="3" stroke-linecap="round"/>
    </g>`),
  guard: tile(`
    <g>
      <path d="M34 22 L34 68 Q34 78 48 80 Q62 78 62 68 L62 22" fill="none" stroke="#c8a84e" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M30 24 L66 24" stroke="#c8a84e" stroke-width="3.5"/>
      <path d="M48 36 L48 62" stroke="#8a8578" stroke-width="3"/>
      <path d="M42 52 Q48 58 54 52" fill="none" stroke="#8a8578" stroke-width="3"/>
    </g>`),
  merchant: tile(`
    <g>
      <rect x="26" y="34" width="44" height="7" rx="2" fill="#c8a84e" stroke="#8a6a20" stroke-width="1.5"/>
      <path d="M48 41 L48 50" stroke="#c8a84e" stroke-width="3"/>
      <path d="M36 50 Q48 60 60 50 L55 44 L41 44 Z" fill="#c8a84e" stroke="#8a6a20" stroke-width="1.5"/>
      <circle cx="66" cy="30" r="4" fill="#d8d4c8" stroke="#8a8578" stroke-width="1.5"/>
    </g>`),
};

export const OCCUPATION_FALLBACK = OCCUPATION_ICONS.farmer;

/* ═════════════════════════ SETTLEMENT MARKERS ═════════════════════════ */

const ART_HUT = `
<g>
  <polygon points="26,50 48,30 70,50" fill="#a0553f" stroke="#6b2820" stroke-width="3" stroke-linejoin="round"/>
  <rect x="30" y="50" width="36" height="26" fill="#8a7a5a" stroke="#4a3a2a" stroke-width="2.5"/>
  <rect x="42" y="60" width="12" height="16" fill="#4a3a2a"/>
  <rect x="33" y="55" width="8" height="8" fill="#e8c860" opacity="0.8"/>
</g>`;

const ART_CASTLE = `
<g>
  <rect x="24" y="34" width="48" height="42" fill="#8a8578" stroke="#4a4844" stroke-width="2.5"/>
  <rect x="28" y="28" width="14" height="18" fill="#8a8578" stroke="#4a4844" stroke-width="2.5"/>
  <rect x="54" y="28" width="14" height="18" fill="#8a8578" stroke="#4a4844" stroke-width="2.5"/>
  <path d="M24 34 L24 30 L30 30 M30 28 L30 24 L36 24 M28 24 L28 22 M34 30 L34 28" stroke="#4a4844" stroke-width="2"/>
  <path d="M60 28 L60 24 M54 30 L54 28 M66 34 L66 30 M62 24 L62 22" stroke="#4a4844" stroke-width="2"/>
  <path d="M40 46 L56 46 L52 60 L44 60 Z" fill="#4a3a2a"/>
  <rect x="30" y="40" width="8" height="8" fill="#e8c860" opacity="0.7"/>
</g>`;

export const SETTLEMENT_ICONS: Record<string, string> = {
  hamlet: glyph(ART_HUT),
  village: glyph(`
    <g>
      <polygon points="18,58 36,42 54,58" fill="#a0553f" stroke="#6b2820" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="22" y="58" width="28" height="22" fill="#8a7a5a" stroke="#4a3a2a" stroke-width="2.5"/>
      <rect x="33" y="64" width="8" height="16" fill="#4a3a2a"/>
      <polygon points="52,54 62,46 72,54" fill="#a0553f" stroke="#6b2820" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="56" y="54" width="12" height="16" fill="#8a7a5a" stroke="#4a3a2a" stroke-width="2"/>
      <polygon points="62,36 66,26 70,36" fill="#8a7a6a" stroke="#4a3a2a" stroke-width="2"/>
      <path d="M66 26 L66 20" stroke="#c8a84e" stroke-width="2"/><circle cx="66" cy="19" r="2.5" fill="#c8a84e"/>
      <path d="M18 78 L78 78" stroke="#5a4a2a" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
    </g>`),
  town: glyph(`
    <g>
      <path d="M18 76 L18 50 L48 34 L78 50 L78 76 Z" fill="none" stroke="#8a8578" stroke-width="3" stroke-linejoin="round"/>
      <path d="M18 52 L78 52" stroke="#8a8578" stroke-width="2"/>
      <path d="M42 76 L42 52 L54 52 L54 76" fill="#4a3a2a"/>
      <rect x="28" y="46" width="12" height="12" fill="#8a8578" stroke="#4a4844" stroke-width="2"/>
      <path d="M60 44 L60 30 L64 34 L64 20 L68 34 L68 30 L72 44" fill="#8a8578" stroke="#4a4844" stroke-width="2"/>
      <path d="M64 20 L64 16" stroke="#c8a84e" stroke-width="2"/>
    </g>`),
  city: glyph(ART_CASTLE),
  home: glyph(`
    <g>${ART_CASTLE}
      <path d="M48 34 L48 12" stroke="#5a4a2a" stroke-width="2.5"/>
      <path d="M48 12 L66 18 L48 24" fill="#c8a84e" stroke="#8a6a20" stroke-width="1.5"/>
    </g>`),
};

/* ═════════════════════════ BATTLE UNITS ═════════════════════════ */

export const UNIT_ICONS: Record<string, string> = {
  militia: tile(`
    <g>
      <path d="M48 24 L48 66" stroke="#b8bec4" stroke-width="4.5" stroke-linecap="round"/>
      <rect x="34" y="40" width="28" height="8" rx="2.5" fill="#c8a84e" stroke="#8a6a20" stroke-width="1.5"/>
      <path d="M42 62 L48 74 L54 62" fill="none" stroke="#b8bec4" stroke-width="3" stroke-linejoin="round"/>
    </g>`),
  spearmen: tile(`
    <g>
      <path d="M48 22 L48 70" stroke="#6b4423" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M40 22 L56 22 L48 12 Z" fill="#b8bec4" stroke="#7a7268" stroke-width="2"/>
      <path d="M34 46 L62 46" stroke="#c8a84e" stroke-width="3"/>
    </g>`),
  archers: tile(`
    <g>
      <path d="M24 44 Q48 30 74 44 Q68 52 52 52" fill="none" stroke="#8a5a2a" stroke-width="3.5"/>
      <path d="M24 44 Q48 56 74 44 Q68 36 52 36" fill="none" stroke="#8a5a2a" stroke-width="3.5"/>
      <path d="M56 42 L56 48 L48 45 Z" fill="#c8a84e"/>
      <path d="M48 44 L48 24" stroke="#b8bec4" stroke-width="2.5"/>
      <path d="M48 24 L44 30 M48 24 L52 30" stroke="#c8a84e" stroke-width="2"/>
    </g>`),
  knights: tile(`
    <g>
      <path d="M30 44 Q30 30 48 26 Q66 30 66 44 Q66 52 60 56 L36 56 Q30 52 30 44Z" fill="#7a8088" stroke="#3a3e44" stroke-width="2.5"/>
      <path d="M36 44 Q48 36 60 44" fill="none" stroke="#3a3e44" stroke-width="2.5"/>
      <path d="M42 56 L42 66 M54 56 L54 66 M44 66 L52 66" stroke="#3a3e44" stroke-width="2.5"/>
      <path d="M48 26 L48 18 L58 22" fill="#c8a84e" stroke="#8a6a20" stroke-width="1.5"/>
    </g>`),
  royalGuard: tile(`
    <g>
      <path d="M34 24 L48 16 L62 24 L58 28 L52 26 L52 32 L44 32 L44 26 L38 28 Z" fill="#c8a84e" stroke="#8a6a20" stroke-width="1.5"/>
      <path d="M34 40 L62 40 L58 66 Q48 72 38 66 Z" fill="#a0553f" stroke="#6b2820" stroke-width="2.5"/>
      <path d="M48 46 L48 62 M42 54 L54 54" stroke="#e8d8a0" stroke-width="2.5"/>
    </g>`),
};

/* ═════════════════════════ CHARACTER PATHS ═════════════════════════ */

export const PATH_ICONS: Record<string, string> = {
  "Forest & Beast": tile(`
    <g>
      <path d="M40 76 L40 46" stroke="#6b4423" stroke-width="4" stroke-linecap="round"/>
      <g fill="none" stroke="#4a7a42" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 54 Q32 48 40 54 Q48 48 58 54"/>
        <path d="M26 44 Q34 36 40 42 Q46 36 54 44"/>
        <path d="M32 34 Q40 28 48 34"/>
      </g>
      <g fill="#5a9a52"><circle cx="22" cy="50" r="4.5"/><circle cx="58" cy="50" r="4.5"/><circle cx="26" cy="40" r="4.5"/><circle cx="54" cy="40" r="4.5"/></g>
      <circle cx="40" cy="34" r="4" fill="#6db866"/>
      <path d="M62 64 Q66 60 70 64 Q66 70 62 64Z" fill="#6b4423" stroke="#4a3018" stroke-width="1.5"/>
      <circle cx="65" cy="63" r="1.2" fill="#c8a84e"/>
    </g>`),
  Iron: tile(`
    <g>
      <path d="M28 32 L22 46 L52 46 L46 32 Z" fill="#6a7078" stroke="#3a3e44" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M22 46 Q22 52 28 52 L46 52 Q52 52 52 46" fill="#565b62" stroke="#3a3e44" stroke-width="2.5"/>
      <path d="M31 52 L31 64 L43 64 L43 52 Z" fill="#4a4f56" stroke="#2a2d32" stroke-width="2.5"/>
      <path d="M18 50 L32 40" stroke="#9aa0a8" stroke-width="6" stroke-linecap="round"/>
      <path d="M50 34 L72 34" stroke="#c8a84e" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 44 L70 44" stroke="#c8a84e" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
    </g>`),
  Scholar: tile(`
    <g>
      <path d="M48 28 Q40 22 28 24 Q22 26 22 34 L22 62 Q22 66 28 64 Q40 62 48 66 Z" fill="#7a7268" stroke="#4a4844" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M28 34 L38 34 M28 42 L38 42 M28 50 L36 50" stroke="#c8a84e" stroke-width="2" stroke-linecap="round"/>
      <path d="M58 26 Q62 34 56 40 L48 48 L44 46 L50 38 Q56 30 52 22 L58 26 Z" fill="#c8c4b8" stroke="#7a7268" stroke-width="2"/>
      <path d="M70 24 Q74 32 68 38 L62 44 L58 42 L64 36 Q68 30 66 22 Z" fill="#c8c4b8" stroke="#7a7268" stroke-width="2"/>
    </g>`),
  Warrior: tile(`
    <g>
      <path d="M36 22 L60 40 L60 46 L38 30 Z" fill="#b8bec4" stroke="#7a7268" stroke-width="2"/>
      <path d="M60 40 L66 48 L64 52 L56 44 Z" fill="#c8a84e" stroke="#8a6a20" stroke-width="1.5"/>
      <rect x="36" y="46" width="16" height="8" rx="2" fill="#c8a84e" stroke="#8a6a20" stroke-width="1.5"/>
      <path d="M28 58 L34 58 L34 72 L30 72 Z" fill="#a0553f" stroke="#6b2820" stroke-width="2"/>
      <path d="M30 60 L40 66 L40 72 L32 66 Z" fill="#c8a84e" opacity="0.7"/>
    </g>`),
  Sea: tile(`
    <g>
      <path d="M26 54 L26 34 L50 40 L70 34 L70 54 Z" fill="none" stroke="#8a5a2a" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M26 34 Q48 26 70 34" fill="none" stroke="#6b4423" stroke-width="2.5"/>
      <path d="M34 40 L34 54 M50 40 L50 54 M62 40 L62 54" stroke="#8a5a2a" stroke-width="3"/>
      <path d="M24 60 Q40 66 48 60 Q56 54 72 60" stroke="#5ab8cc" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>`),
  Land: tile(ART_WHEAT),
};

/* ═════════════════════════ HERALDRY ═════════════════════════ */

function shield(charge: string, tint: string): string {
  return u(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 112">
  <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${tint}"/><stop offset="100%" stop-color="${shade(tint, -28)}"/></linearGradient></defs>
  <path d="M16 8 L80 8 L80 52 Q80 84 48 106 Q16 84 16 52 Z" fill="url(#sg)" stroke="#c8a84e" stroke-width="2.5"/>
  <path d="M22 14 L74 14 L74 50 Q74 78 48 98 Q22 78 22 50 Z" fill="none" stroke="#c8a84e" stroke-width="1.2" opacity="0.5"/>
  <g transform="translate(48 48) scale(0.82) translate(-48 -48)">${charge}</g>
</svg>`);
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/** Emoji charge → (artwork, shield field tincture). Keys match the PROVINCE_BANNER pools. */
const CHARGES: Record<string, { body: string; tint: string }> = {
  "🛡": { body: `<path d="M48 20 L68 30 L68 54 Q68 74 48 84 Q28 74 28 54 L28 30 Z" fill="none" stroke="#c8c4b8" stroke-width="4" stroke-linejoin="round"/><path d="M48 30 L48 74" stroke="#c8c4b8" stroke-width="2"/>`, tint: "#4a3a2a" },
  "❄": { body: `<g stroke="#bfe3f0" stroke-width="3.5" stroke-linecap="round"><path d="M48 20 L48 76 M28 32 L68 64 M28 64 L68 32"/><path d="M48 20 L42 28 M48 20 L54 28 M48 76 L42 68 M48 76 L54 68 M28 32 L36 36 M28 32 L34 42 M68 64 L60 60 M68 64 L62 54 M28 64 L36 60 M28 64 L34 54 M68 32 L60 36 M68 32 L62 42"/></g>`, tint: "#1f3545" },
  "🐺": { body: `<path d="M34 34 L30 22 L40 30 L48 26 L56 30 L66 22 L62 34 Q74 46 72 58 Q70 70 48 74 Q26 70 24 58 Q22 46 34 34Z" fill="#9aa0a8" stroke="#4a5056" stroke-width="2.5" stroke-linejoin="round"/><circle cx="40" cy="48" r="3" fill="#14161a"/><circle cx="56" cy="48" r="3" fill="#14161a"/><path d="M36 60 Q48 68 60 60" stroke="#4a5056" stroke-width="2.5" fill="none"/>`, tint: "#3a3f45" },
  "🗡": { body: `<path d="M44 14 L44 50 L34 44 L38 56 L44 52 L44 66 L40 62 L46 74 L52 62 L48 66 L48 52 L54 56 L50 44 Z" fill="#b8bec4" stroke="#6a7078" stroke-width="2" stroke-linejoin="round"/>`, tint: "#4a3a2a" },
  "⚓": { body: `<path d="M48 20 L48 30 M48 78 L48 84" stroke="#b8bec4" stroke-width="3"/><path d="M48 30 Q66 30 66 44 Q66 52 58 52 L38 52 Q30 52 30 44 Q30 30 48 30Z" fill="none" stroke="#b8bec4" stroke-width="4" stroke-linejoin="round"/><path d="M30 44 L20 44 L22 38 L30 40 M66 44 L76 44 L74 38 L66 40 M30 52 L20 62 L28 66 L38 58 M66 52 L76 62 L68 66 L58 58" stroke="#b8bec4" stroke-width="3" stroke-linecap="round"/>`, tint: "#1f3545" },
  "🪵": { body: `<g><rect x="26" y="56" width="44" height="12" rx="6" fill="#8a5a2a" stroke="#4a3018" stroke-width="2.5"/><circle cx="35" cy="62" r="4" fill="#e0c890"/><circle cx="61" cy="62" r="4" fill="#e0c890"/><rect x="32" y="42" width="34" height="12" rx="6" fill="#6b4423" stroke="#4a3018" stroke-width="2.5"/><circle cx="40" cy="48" r="4" fill="#c8ae70"/></g>`, tint: "#3a2c16" },
  "💀": { body: `<ellipse cx="48" cy="50" rx="20" ry="22" fill="#d8d4c8" stroke="#8a8578" stroke-width="2.5"/><circle cx="40" cy="48" r="6" fill="#14161a"/><circle cx="56" cy="48" r="6" fill="#14161a"/><path d="M42 62 Q48 66 54 62" fill="none" stroke="#8a8578" stroke-width="2"/><rect x="40" y="62" width="16" height="10" fill="#d8d4c8" stroke="#8a8578" stroke-width="2"/>`, tint: "#3a3230" },
  "🌉": { body: `<path d="M20 72 L20 56 Q48 30 76 56 L76 72 Z" fill="#8a8578" stroke="#4a4844" stroke-width="2.5" stroke-linejoin="round"/><path d="M34 64 Q48 50 62 64" stroke="#c8a84e" stroke-width="2" fill="none"/><path d="M30 66 L30 60 Q48 44 66 60 L66 66" stroke="#4a4844" stroke-width="2" fill="none"/><path d="M20 62 Q48 34 76 62" stroke="#4a4844" stroke-width="2" fill="none"/>`, tint: "#4a3a2a" },
  "🐑": { body: `<path d="M34 40 Q34 30 44 28 Q54 28 54 36 Q64 36 64 48 Q64 58 50 60 Q34 58 34 48 Q30 46 34 40Z" fill="#e8e0cc" stroke="#9a9080" stroke-width="2.5" stroke-linejoin="round"/><circle cx="60" cy="38" r="5" fill="#e0c890" stroke="#8a7a50" stroke-width="2"/><path d="M42 46 L44 46 M50 46 L52 46" stroke="#5a4a3a" stroke-width="2.5"/><path d="M44 50 Q48 53 52 50" fill="none" stroke="#8a7a50" stroke-width="1.5"/>`, tint: "#4a4238" },
  "🏰": { body: `<g><rect x="26" y="36" width="44" height="38" fill="#8a8578" stroke="#4a4844" stroke-width="2.5"/><rect x="30" y="28" width="12" height="16" fill="#8a8578" stroke="#4a4844" stroke-width="2.5"/><rect x="54" y="28" width="12" height="16" fill="#8a8578" stroke="#4a4844" stroke-width="2.5"/><path d="M40 46 L56 46 L52 60 L44 60 Z" fill="#3a322a"/><rect x="32" y="40" width="7" height="7" fill="#e8c860" opacity="0.7"/><rect x="58" y="40" width="7" height="7" fill="#e8c860" opacity="0.7"/></g>`, tint: "#3a3f45" },
  "♜": { body: `<path d="M32 24 L34 30 L30 34 L34 38 L38 34 L40 44 L42 34 L46 38 L50 34 L52 44 L54 34 L58 38 L62 34 L58 30 L60 24 Z M30 48 L66 48 L64 54 L32 54 Z" fill="#c8a84e" stroke="#8a6a20" stroke-width="2" stroke-linejoin="round"/>`, tint: "#6b2820" },
  "♚": { body: `<path d="M32 24 L34 30 L30 34 L34 38 L38 34 L40 44 L42 34 L46 38 L50 34 L52 44 L54 34 L58 38 L62 34 L58 30 L60 24 Z M30 48 L66 48 L64 54 L32 54 Z" fill="#c8a84e" stroke="#8a6a20" stroke-width="2" stroke-linejoin="round"/>`, tint: "#6b2820" },
  "♛": { body: `<path d="M32 24 L34 30 L30 34 L34 38 L38 34 L40 44 L42 34 L46 38 L50 34 L52 44 L54 34 L58 38 L62 34 L58 30 L60 24 Z M30 48 L66 48 L64 54 L32 54 Z" fill="#c8a84e" stroke="#8a6a20" stroke-width="2" stroke-linejoin="round"/>`, tint: "#6b2820" },
  "🌹": { body: `<path d="M48 44 Q34 44 32 34 Q40 26 48 32 Q56 26 64 34 Q62 44 48 44Z" fill="#c05040" stroke="#8a3028" stroke-width="2"/><path d="M42 32 Q48 36 54 32 Q48 24 42 32Z" fill="#e07060"/><path d="M34 40 Q30 52 34 62 Q40 64 48 60" fill="none" stroke="#4a7a42" stroke-width="3"/><path d="M48 60 Q52 66 48 74" stroke="#4a7a42" stroke-width="3"/>`, tint: "#3a1a24" },
  "🛶": { body: `<path d="M26 50 L70 50 L74 62 L22 62 Z" fill="#6b4423" stroke="#4a3018" stroke-width="2.5" stroke-linejoin="round"/><path d="M26 50 Q48 42 70 50" fill="none" stroke="#4a3018" stroke-width="2"/><path d="M48 50 L48 34" stroke="#4a3018" stroke-width="2.5"/><path d="M48 34 L60 40 L48 46" fill="#c8a84e" stroke="#8a6a20" stroke-width="1.5"/><path d="M24 66 Q48 72 72 66" stroke="#5ab8cc" stroke-width="2.5" fill="none"/>`, tint: "#2a4038" },
  "🌳": { body: `<path d="M48 74 L48 40" stroke="#6b4423" stroke-width="4" stroke-linecap="round"/><g fill="none" stroke="#5a9a52" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M24 48 Q36 40 48 46 Q60 40 72 48"/><path d="M28 36 Q38 28 48 34 Q58 28 68 36"/><path d="M34 26 Q42 18 48 22 Q54 18 62 26"/></g><g fill="#5a9a52"><circle cx="24" cy="44" r="4.5"/><circle cx="72" cy="44" r="4.5"/><circle cx="28" cy="32" r="4.5"/><circle cx="68" cy="32" r="4.5"/></g><circle cx="48" cy="24" r="4.5" fill="#6db866"/>`, tint: "#2a3c20" },
  "⛪": { body: `<rect x="34" y="44" width="28" height="34" fill="#c8c4b8" stroke="#7a7268" stroke-width="2.5"/><path d="M30 44 L48 28 L66 44 Z" fill="#a0553f" stroke="#6b2820" stroke-width="2.5"/><path d="M48 28 L48 16" stroke="#7a7268" stroke-width="2.5"/><circle cx="48" cy="15" r="3" fill="#c8a84e"/><rect x="42" y="60" width="12" height="18" fill="#4a3a2a"/><circle cx="48" cy="52" r="5" fill="#e8c860" opacity="0.7"/>`, tint: "#3a3f45" },
  "🌾": { body: `<g fill="none" stroke="#e8c860" stroke-width="3" stroke-linecap="round"><path d="M48 70 L48 30"/><path d="M40 66 Q30 56 32 42 Q33 34 40 31"/><path d="M56 66 Q66 56 64 42 Q63 34 56 31"/><path d="M48 52 Q38 46 40 34"/><path d="M48 52 Q58 46 56 34"/></g><g fill="#e8c860"><circle cx="33" cy="29" r="3.4"/><circle cx="40" cy="28" r="3.4"/><circle cx="48" cy="26" r="3.4"/><circle cx="56" cy="28" r="3.4"/><circle cx="63" cy="29" r="3.4"/></g>`, tint: "#6b5a20" },
  "🥀": { body: `<path d="M48 40 Q34 40 32 32 Q40 26 48 32 Q56 26 64 32 Q62 40 48 40Z" fill="#9a3a32" stroke="#6b2820" stroke-width="2"/><path d="M42 30 Q48 34 54 30 Q48 22 42 30Z" fill="#c05040"/><path d="M40 40 Q30 58 36 74" fill="none" stroke="#4a7a42" stroke-width="3"/><path d="M56 40 Q50 52 52 62" fill="none" stroke="#3a5a32" stroke-width="2.5"/><path d="M44 56 Q42 66 46 70" fill="none" stroke="#4a7a42" stroke-width="2"/>`, tint: "#3a2420" },
  "🐟": { body: `<g><path d="M26 48 L14 40 L14 56 Z" fill="#5ab8cc" stroke="#2a6a7a" stroke-width="2.5"/><ellipse cx="48" cy="48" rx="24" ry="13" fill="#5ab8cc" stroke="#2a6a7a" stroke-width="2.5"/><circle cx="61" cy="44" r="2.2" fill="#12242a"/><path d="M28 48 L56 48" stroke="#2a6a7a" stroke-width="1.5" opacity="0.6"/></g>`, tint: "#1f3545" },
  "⛏": { body: `<path d="M48 74 L30 34 L22 44 L40 76 Z" fill="#7a8088" stroke="#3a3e44" stroke-width="2.5" stroke-linejoin="round"/><path d="M22 44 Q18 48 24 52 Q30 48 22 44Z" fill="#7a8088"/><path d="M56 76 L66 70 L70 74 L62 80 Z" fill="#6b4423" stroke="#4a3018" stroke-width="2"/>`, tint: "#3a3f45" },
  "🐎": { body: `<path d="M40 26 Q32 30 32 40 Q36 42 40 40 Q42 46 48 44 Q54 48 60 44 Q68 42 68 32 Q64 26 56 28 Q52 22 46 26 Q44 30 40 26Z" fill="#7a5a3a" stroke="#4a3a20" stroke-width="2.5" stroke-linejoin="round"/><circle cx="60" cy="30" r="3" fill="#14161a"/><path d="M34 40 Q30 46 34 50" stroke="#4a3a20" stroke-width="2.5" fill="none"/><path d="M60 44 Q62 52 60 58" stroke="#4a3a20" stroke-width="3"/>`, tint: "#5a4a20" },
  "🍎": { body: `<circle cx="48" cy="50" r="20" fill="#c05040" stroke="#8a3028" stroke-width="2.5"/><path d="M48 32 Q40 24 34 28 Q32 32 40 34 Q44 30 48 32Z" fill="#4a7a42" stroke="#3a5a32" stroke-width="2"/><path d="M48 32 L54 24" stroke="#6b4423" stroke-width="3" stroke-linecap="round"/>`, tint: "#3a1a20" },
  "🌿": { body: `<g fill="none" stroke="#6db866" stroke-width="3" stroke-linecap="round"><path d="M48 72 L48 40"/><path d="M48 56 Q36 52 34 42 Q38 42 48 48"/><path d="M48 48 Q60 44 62 34 Q56 34 48 40"/></g><g fill="#8ad47a"><circle cx="34" cy="40" r="2.6"/><circle cx="62" cy="32" r="2.6"/></g>`, tint: "#2a3c20" },
  "🧵": { body: `<rect x="30" y="32" width="36" height="34" rx="8" fill="#c08050" stroke="#8a5a2a" stroke-width="2.5"/><path d="M40 36 L40 62 M52 36 L52 62" stroke="#8a5a2a" stroke-width="2"/><path d="M48 24 L48 32" stroke="#c8a84e" stroke-width="2.5"/><path d="M44 24 Q48 20 52 24 Q48 26 44 24Z" fill="#c8a84e"/><path d="M42 66 Q48 72 54 66" stroke="#c8c4b8" stroke-width="2" fill="none"/>`, tint: "#4a3a2a" },
  "⛰": { body: `<path d="M18 68 L44 26 L54 42 L64 30 L78 68 Z" fill="#8a8578" stroke="#4a4844" stroke-width="2.5" stroke-linejoin="round"/><path d="M40 26 Q42 22 44 26" fill="#c8d4e0"/><path d="M60 30 Q62 26 64 30" fill="#c8d4e0"/><path d="M30 54 L52 40" stroke="#c8d4e0" stroke-width="2"/>`, tint: "#3a4046" },
  "☁": { body: `<path d="M30 60 Q22 60 22 50 Q22 42 30 42 Q30 32 42 32 Q54 32 56 40 Q66 40 66 50 Q66 58 58 60 Z" fill="#c8d4e0" stroke="#8a98a8" stroke-width="2.5" stroke-linejoin="round"/>`, tint: "#3a464e" },
  "🪙": { body: `<g><circle cx="48" cy="48" r="21" fill="#d8d4c8" stroke="#8a8578" stroke-width="2.5"/><path d="M36 40 Q48 32 60 40 L60 50 Q48 58 36 50 Z" fill="#c8c2b4" stroke="#9a9488" stroke-width="2"/><circle cx="48" cy="48" r="2.5" fill="#9a9488"/></g>`, tint: "#6b5a20" },
  "🐐": { body: `<path d="M36 40 Q36 30 44 28 L48 24 L54 30 Q56 34 56 40 Q56 50 46 50 Q36 50 36 40Z" fill="#e0d8c8" stroke="#a89c88" stroke-width="2.5" stroke-linejoin="round"/><path d="M44 26 L40 20 M48 24 L44 18" stroke="#a89c88" stroke-width="2.5" stroke-linecap="round"/><path d="M40 40 L44 40 M50 40 L54 40" stroke="#6a5a3a" stroke-width="2.5"/><path d="M44 44 L48 46 L52 44" stroke="#8a7a50" stroke-width="2" fill="none"/>`, tint: "#4a4238" },
  "🕳": { body: `<ellipse cx="48" cy="52" rx="26" ry="16" fill="#14161a" stroke="#3a3834" stroke-width="3"/><ellipse cx="48" cy="48" rx="14" ry="8" fill="#0a0a0c"/><path d="M30 68 L24 60 M66 68 L72 60" stroke="#6b6f66" stroke-width="3" stroke-linecap="round"/>`, tint: "#2a2c30" },
  "⚡": { body: `<path d="M54 18 L30 52 L44 52 L40 78 L66 44 L50 44 Z" fill="#e8c860" stroke="#b09020" stroke-width="2" stroke-linejoin="round"/>`, tint: "#3a3a20" },
  "🐻": { body: `<path d="M36 36 L28 28 L38 36 L46 32 L56 32 L64 36 L70 28 L60 38 Q74 46 72 60 Q70 70 48 72 Q26 70 24 60 Q22 46 36 36Z" fill="#6b4a2a" stroke="#3a2a14" stroke-width="2.5" stroke-linejoin="round"/><circle cx="40" cy="48" r="3" fill="#14161a"/><circle cx="56" cy="48" r="3" fill="#14161a"/><circle cx="40" cy="50" r="1.2" fill="#fff" opacity="0.5"/><circle cx="56" cy="50" r="1.2" fill="#fff" opacity="0.5"/><ellipse cx="48" cy="58" rx="6" ry="4" fill="#14161a"/>`, tint: "#3a2a16" },
  "🦅": { body: `<path d="M48 26 L60 18 L54 30 L70 28 L60 38 Q66 46 66 56 Q66 68 48 70 Q30 68 30 56 Q30 46 36 38 L26 28 L42 30 L36 18 Z" fill="#9aa0a8" stroke="#4a5056" stroke-width="2.5" stroke-linejoin="round"/><path d="M40 46 L42 46 M54 46 L56 46" stroke="#c8a84e" stroke-width="2"/><path d="M48 48 L48 52 M46 50 L50 50" stroke="#c8a84e" stroke-width="1.5"/>`, tint: "#3a3f45" },
  "🌫": { body: `<path d="M20 40 L76 40" stroke="#c8c4b8" stroke-width="5" stroke-linecap="round" opacity="0.5"/><path d="M26 52 L70 52" stroke="#c8c4b8" stroke-width="4" stroke-linecap="round" opacity="0.35"/><path d="M34 64 L62 64" stroke="#c8c4b8" stroke-width="3" stroke-linecap="round" opacity="0.22"/>`, tint: "#3a4046" },
  "🕊": { body: `<path d="M44 50 Q34 40 24 44 Q28 54 40 56 Q34 62 30 66 Q42 62 48 58 Q62 56 72 44 Q62 46 54 40 Q52 48 44 50Z" fill="#e8e4d8" stroke="#a8a294" stroke-width="2.5" stroke-linejoin="round"/><path d="M46 52 L44 60 L42 56" fill="none" stroke="#a8a294" stroke-width="2"/><circle cx="30" cy="44" r="2" fill="#14161a"/>`, tint: "#4a4238" },
  "🦪": { body: `<path d="M28 50 Q28 36 48 34 Q68 36 68 50 Q68 64 48 66 Q28 64 28 50Z" fill="#d8c4a8" stroke="#8a7a5a" stroke-width="2.5"/><path d="M34 50 Q48 44 62 50" stroke="#8a7a5a" stroke-width="2" fill="none"/><circle cx="48" cy="48" r="8" fill="#e8e0d8" stroke="#b8a88a" stroke-width="1.5"/><circle cx="48" cy="48" r="3.5" fill="#e8c8c8"/>`, tint: "#2a4038" },
  "🌊": { body: `<path d="M14 42 Q30 30 46 42 Q62 54 82 42" fill="none" stroke="#5ab8cc" stroke-width="4.5" stroke-linecap="round"/><path d="M14 58 Q30 46 46 58 Q62 70 82 58" fill="none" stroke="#3d7788" stroke-width="4.5" stroke-linecap="round"/>`, tint: "#1f3545" },
  "🐚": { body: `<path d="M48 30 Q66 34 68 52 Q66 70 48 72 Q30 70 28 52 Q30 34 48 30Z" fill="#e8d4b8" stroke="#a89060" stroke-width="2.5"/><path d="M48 72 L44 62 L52 56 L46 48 L54 42 L48 34" stroke="#a89060" stroke-width="2" fill="none"/><path d="M34 46 Q48 44 60 48" stroke="#a89060" stroke-width="1.5" fill="none"/>`, tint: "#2a4038" },
  "🐋": { body: `<path d="M24 48 Q24 36 48 34 Q72 36 72 48 Q72 56 60 58 Q54 62 48 58 Q42 62 36 58 Q24 56 24 48Z" fill="#5ab8cc" stroke="#2a6a7a" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 48 L16 42 L16 56 Z" fill="#5ab8cc" stroke="#2a6a7a" stroke-width="2.5"/><circle cx="66" cy="44" r="2.5" fill="#0a2a34"/><path d="M30 40 L36 44 M60 40 L54 44" stroke="#8ad4e0" stroke-width="2" fill="none"/>`, tint: "#1f3545" },
  "🌀": { body: `<path d="M52 22 Q70 28 66 44 Q62 60 44 56 Q32 52 36 40 Q40 30 50 34 Q56 38 54 46 Q52 52 46 50" fill="none" stroke="#8a8578" stroke-width="4" stroke-linecap="round"/><circle cx="46" cy="50" r="3" fill="#8a8578"/>`, tint: "#3a4046" },
  "⚔": { body: `<g fill="none" stroke-linecap="round"><path d="M30 66 L66 30" stroke="#b8bec4" stroke-width="4.5"/><rect x="40" y="48" width="20" height="7" rx="2" fill="#c8a84e" transform="rotate(-45 50 51)"/><path d="M66 66 L30 30" stroke="#b8bec4" stroke-width="4.5"/><rect x="36" y="48" width="20" height="7" rx="2" fill="#c8a84e" transform="rotate(-135 46 51)"/></g>`, tint: "#3a3f45" },
  "🌲": { body: `<path d="M48 22 L64 38 L56 38 L70 52 L60 52 L72 62 L24 62 L36 52 L26 52 L40 38 L32 38 Z" fill="#4a7a42" stroke="#2a4a22" stroke-width="2.5" stroke-linejoin="round"/><rect x="42" y="62" width="12" height="12" fill="#6b4423" stroke="#4a3018" stroke-width="2"/>`, tint: "#2a3c20" },
  "🗿": { body: `<rect x="32" y="24" width="32" height="50" fill="#8a8578" stroke="#4a4844" stroke-width="2.5"/><circle cx="48" cy="38" r="4" fill="#4a4844"/><rect x="42" y="44" width="12" height="4" fill="#4a4844"/><ellipse cx="48" cy="78" rx="20" ry="4" fill="#5a564c" opacity="0.6"/>`, tint: "#3a4046" },
  "🐗": { body: `<path d="M38 34 L30 26 L40 32 L48 28 L56 32 L66 26 L58 36 Q70 44 68 56 Q66 68 48 72 Q30 68 28 56 Q26 44 38 34Z" fill="#5a4a3a" stroke="#2a2018" stroke-width="2.5" stroke-linejoin="round"/><circle cx="40" cy="48" r="2.5" fill="#14161a"/><circle cx="56" cy="48" r="2.5" fill="#14161a"/><path d="M40 52 Q44 58 48 52" stroke="#8a7050" stroke-width="2" fill="none"/><path d="M34 42 L32 46 M62 42 L64 46" stroke="#c8ae70" stroke-width="2.5"/>`, tint: "#3a2f22" },
  "🌌": { body: `<path d="M30 40 Q48 32 66 40 L66 62 Q48 70 30 62 Z" fill="#141a2a" stroke="#3a4a6a" stroke-width="2"/><circle cx="36" cy="46" r="2" fill="#c8d4f0"/><circle cx="58" cy="48" r="2" fill="#c8d4f0"/><circle cx="44" cy="54" r="1.5" fill="#e8c860"/><circle cx="60" cy="58" r="1.5" fill="#e8c860"/><circle cx="38" cy="58" r="1.2" fill="#fff"/><path d="M48 42 Q50 44 52 42" stroke="#e8c860" stroke-width="2" fill="none"/>`, tint: "#20263c" },
  "🦁": { body: `<path d="M36 32 L30 22 L40 28 L48 24 L56 28 L66 22 L60 34 Q74 44 72 58 Q70 70 48 74 Q26 70 24 58 Q22 44 36 32Z" fill="#c8a050" stroke="#8a6a20" stroke-width="2.5" stroke-linejoin="round"/><path d="M34 28 L32 20 M44 26 L44 18 M54 24 L56 16" stroke="#c8a050" stroke-width="2.5" stroke-linecap="round"/><circle cx="40" cy="48" r="3" fill="#14161a"/><circle cx="56" cy="48" r="3" fill="#14161a"/><path d="M36 58 Q48 68 60 58" fill="none" stroke="#8a6a20" stroke-width="2.5"/>`, tint: "#6b5220" },
};

const DEFAULT_TINT = "#4a3a2a";

export const BANNER_URI: Record<string, string> = {};
for (const [emoji, c] of Object.entries(CHARGES)) {
  BANNER_URI[emoji] = shield(c.body, c.tint);
}
export const BANNER_FALLBACK = shield(CHARGES["🛡"].body, DEFAULT_TINT);

export const PLAYER_SHIELDS: Record<string, string> = {
  Lion: shield(CHARGES["🦁"].body, "#6b5220"),
  Eagle: shield(CHARGES["🦅"].body, "#3a3f45"),
  Oak: shield(CHARGES["🌳"].body, "#2a3c20"),
  Wolf: shield(CHARGES["🐺"].body, "#3a3f45"),
  Crown: shield(CHARGES["♚"].body, "#6b2820"),
};

/* ═════════════════════════ FACTION ACTIONS ═════════════════════════ */

const ART_TROPHY = `
<g>
  <path d="M30 22 L30 34 Q30 50 48 54 Q66 50 66 34 L66 22" fill="none" stroke="#e8c860" stroke-width="4" stroke-linecap="round"/>
  <path d="M30 22 L22 20 L26 34 L34 31" fill="none" stroke="#e8c860" stroke-width="3" stroke-linejoin="round"/>
  <path d="M66 22 L74 20 L70 34 L62 31" fill="none" stroke="#e8c860" stroke-width="3" stroke-linejoin="round"/>
  <rect x="42" y="54" width="12" height="9" fill="#e8c860"/>
  <rect x="37" y="63" width="22" height="6" rx="2" fill="#e8c860"/>
</g>`;

const ART_HEART_BROKEN = `
<g fill="none" stroke="#c05050" stroke-width="4" stroke-linejoin="round">
  <path d="M48 74 Q30 58 28 46 Q26 36 36 34 Q44 33 48 42 Q52 33 60 34 Q70 36 68 46 Q66 58 48 74Z"/>
  <path d="M48 42 L52 52 L46 56 L50 64" stroke="#c05050" stroke-width="3"/>
</g>`;

const ART_BUBBLE = `
<g>
  <rect x="18" y="26" width="60" height="36" rx="11" fill="none" stroke="#c8a84e" stroke-width="4"/>
  <path d="M34 44 L44 44 M52 44 L62 44" stroke="#c8a84e" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M40 62 L46 72 L42 72 L36 66" fill="#c8a84e"/>
</g>`;

const ART_CRATE = `
<g>
  <path d="M22 42 L48 30 L74 42 L74 66 L48 78 L22 66 Z" fill="none" stroke="#b8a04a" stroke-width="4" stroke-linejoin="round"/>
  <path d="M22 42 L48 54 L74 42 M48 54 L48 78" fill="none" stroke="#b8a04a" stroke-width="4"/>
  <path d="M34 36 L62 36" stroke="#b8a04a" stroke-width="3"/>
</g>`;

const ART_RING = `<g fill="none" stroke="#e8c860" stroke-width="4"><circle cx="40" cy="48" r="14"/><circle cx="58" cy="48" r="14"/></g>`;

export const ACTION_ICONS: Record<string, string> = {
  raid: glyph(ART_SWORDS),
  war_victory: glyph(ART_TROPHY),
  war_defeat: glyph(CHARGES["💀"].body),
  alliance_formed: glyph(`
    <g fill="none" stroke="#c8a84e" stroke-width="4" stroke-linecap="round">
      <path d="M32 52 Q32 40 40 36 Q48 32 52 40"/>
      <path d="M64 52 Q64 40 56 36 Q48 32 44 40"/>
      <path d="M40 36 L52 40 M44 40 L56 36"/>
    </g>`),
  alliance_broken: glyph(ART_HEART_BROKEN),
  peace: glyph(CHARGES["🕊"].body),
  negotiate: glyph(ART_BUBBLE),
  trade_gift: glyph(ART_CRATE),
  betrothal: glyph(ART_RING),
  vassal: glyph(CHARGES["♚"].body),
  betrayal: glyph(CHARGES["🗡"].body),
};

/* ═════════════════════════ TOP-BAR UI ═════════════════════════ */

export const UI_ICONS = {
  pop: glyph(`
    <g fill="none" stroke="#c8c4b8" stroke-width="3.5" stroke-linecap="round">
      <circle cx="36" cy="34" r="9"/>
      <path d="M22 62 Q22 50 36 50 Q50 50 50 62"/>
      <circle cx="64" cy="38" r="8"/>
      <path d="M52 62 Q52 52 64 52 Q76 52 76 62"/>
    </g>`),
  host: glyph(`
    <g fill="none" stroke="#c8c4b8" stroke-width="3.5" stroke-linejoin="round">
      <path d="M48 18 L68 28 L68 54 Q68 74 48 86 Q28 74 28 54 L28 28 Z"/>
    </g>`),
  warning: glyph(`
    <g>
      <path d="M48 14 L84 78 L12 78 Z" fill="none" stroke="#e8c860" stroke-width="5" stroke-linejoin="round"/>
      <path d="M48 36 L48 58" stroke="#e8c860" stroke-width="5" stroke-linecap="round"/>
      <circle cx="48" cy="66" r="3.5" fill="#e8c860"/>
    </g>`),
  hourglass: glyph(`
    <g fill="none" stroke="#c8a84e" stroke-width="4" stroke-linecap="round">
      <path d="M30 18 L66 18 M30 78 L66 78 M30 18 L30 30 L48 48 L66 30 L66 18"/>
      <path d="M34 18 L34 32 L48 48 L62 32 L62 18"/>
      <path d="M40 54 Q48 62 56 54" />
    </g>`),
  caravan: glyph(`
    <g>
      <path d="M42 26 Q36 30 36 38 Q38 42 42 40 Q46 46 52 42 Q60 40 60 30 Q58 24 52 26 Q50 22 46 26 Q44 28 42 26Z" fill="#7a5a3a" stroke="#4a3a20" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="56" cy="30" r="2.5" fill="#14161a"/>
      <path d="M36 40 Q32 46 36 50" stroke="#4a3a20" stroke-width="2.5" fill="none"/>
      <path d="M56 42 Q58 50 56 56" stroke="#4a3a20" stroke-width="3"/>
    </g>`),
  save: glyph(`
    <g fill="none" stroke="#c8c4b8" stroke-width="3.5" stroke-linecap="round">
      <path d="M30 62 Q22 62 22 52 Q22 42 30 42 Q30 32 42 32 Q52 32 54 40 Q64 40 64 50 Q64 58 56 60"/>
    </g>`),
  map: glyph(`
    <g fill="none" stroke="#c8a84e" stroke-width="3.5" stroke-linejoin="round">
      <path d="M18 24 L42 18 L66 26 L78 22 L78 70 L54 78 L30 68 L18 74 Z"/>
      <path d="M42 18 L42 68 M66 26 L66 78"/>
    </g>`),
  key: glyph(`
    <g fill="none" stroke="#c8a84e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="30" cy="66" r="11"/>
      <path d="M39 57 L70 26 M64 32 L70 26 L76 32"/>
      <path d="M56 42 L62 36 M48 50 L54 44"/>
    </g>`),
};

/* ═════════════════════════ DOCK NAVIGATION ═════════════════════════ */

const ART_CANDLE = `
<g>
  <rect x="44" y="36" width="8" height="22" rx="3" fill="#e8e0cc" stroke="#b8ae92" stroke-width="1.5"/>
  <path d="M48 34 Q44 26 48 18 Q52 26 48 34Z" fill="#e0a040"/>
  <ellipse cx="48" cy="54" rx="10" ry="3" fill="#e0a040" opacity="0.5"/>
</g>`;

export const DOCK_ICONS = {
  Build: glyph(`
    <g>
      <rect x="40" y="34" width="10" height="38" rx="4" fill="#8a5a2a" stroke="#4a3018" stroke-width="1.5"/>
      <path d="M36 32 L64 32 L58 44 L42 44 Z" fill="#9aa0a8" stroke="#4a4f56" stroke-width="2"/>
      <rect x="40" y="30" width="26" height="5" rx="2" fill="#6b4423"/>
    </g>`),
  Training: glyph(ART_SWORDS),
  Council: glyph(CHARGES["♚"].body),
  Trade: glyph(ART_SCALES),
  War: glyph(CHARGES["🗡"].body),
  Faith: glyph(ART_CANDLE),
  Factions: glyph(`
    <g fill="none" stroke="#c8a84e" stroke-width="4" stroke-linecap="round">
      <path d="M32 52 Q32 40 40 36 Q48 32 52 40"/>
      <path d="M64 52 Q64 40 56 36 Q48 32 44 40"/>
      <path d="M40 36 L52 40 M44 40 L56 36"/>
    </g>`),
  Resources: glyph(ART_CRATE),
  Chronicle: glyph(ART_BOOK),
  Crown: glyph(CHARGES["♚"].body),
  Home: glyph(`
    <polygon points="30,52 48,30 66,52" fill="none" stroke="#c8a84e" stroke-width="4" stroke-linejoin="round"/>
    <rect x="34" y="52" width="28" height="24" fill="none" stroke="#c8a84e" stroke-width="3.5"/>
    <rect x="44" y="62" width="9" height="14" fill="#c8a84e"/>
  `),
};
