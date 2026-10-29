import { readFileSync } from "node:fs";
import { join } from "node:path";

// The share images' brand (owner, 2026-10-29): the iron-black, bone, aged gold and blood palette of globals.css, the
// shield-and-die mark of components/Logo.tsx, and the Cinzel wordmark. Text and an original drawing only: nothing of
// Games Workshop's.
export const OG = {
  bg: "#0b0b0d",
  panel: "#161416",
  line: "#383030",
  ink: "#f2eadb",
  muted: "#b6ac9d",
  gold: "#e0b252",
  blood: "#b01824",
  green: "#7fd39a",
};

export const DISPLAY = "Cinzel";
export const SANS = "Inter";

/** Cinzel 900 for the wordmark and headlines, Inter 700 (Latin subset) for everything else, both bundled by
 *  next.config.js. A font that cannot be read is left out (satori's default), never a 500. */
export function ogFonts(): { name: string; data: Buffer; weight: 700 | 900; style: "normal" }[] {
  const out: { name: string; data: Buffer; weight: 700 | 900; style: "normal" }[] = [];
  for (const [name, file, weight] of [[DISPLAY, "Cinzel-900.ttf", 900], [SANS, "Inter-700.ttf", 700]] as const) {
    try {
      out.push({ name, data: readFileSync(join(process.cwd(), "src/app/fonts", file)), weight, style: "normal" });
    } catch {
      // drawn in the default face
    }
  }
  return out;
}

/** The site mark: crossed swords behind a gold-rimmed blood-red shield bearing a bone die. */
export function OgMark({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs>
        <linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c8222d" />
          <stop offset="1" stopColor="#6a0c13" />
        </linearGradient>
      </defs>
      <path d="M3 3l5 1.6L46 43l-3 3L4.6 8z" fill="#d5d9de" />
      <path d="M61 3l-5 1.6L18 43l3 3L59.4 8z" fill="#d5d9de" />
      <path d="M41 53l12-12M47.5 47.5l6 6M23 53 11 41M16.5 47.5l-6 6" stroke={OG.gold} strokeWidth="3.6" strokeLinecap="round" />
      <circle cx="57" cy="57" r="3.4" fill={OG.gold} />
      <circle cx="7" cy="57" r="3.4" fill={OG.gold} />
      <path d="M32 7 52 13v16c0 13-8 22.5-20 27.5C20 51.5 12 42 12 29V13z" fill="url(#s)" stroke={OG.gold} strokeWidth="3.5" strokeLinejoin="round" />
      <rect x="21.5" y="18.5" width="21" height="21" rx="4.5" fill="#f1e6cf" />
      <circle cx="26.6" cy="23.6" r="2.3" fill="#7a0f17" />
      <circle cx="37.4" cy="23.6" r="2.3" fill="#7a0f17" />
      <circle cx="32" cy="29" r="2.3" fill="#7a0f17" />
      <circle cx="26.6" cy="34.4" r="2.3" fill="#7a0f17" />
      <circle cx="37.4" cy="34.4" r="2.3" fill="#7a0f17" />
    </svg>
  );
}

/** The wordmark beside the mark, as on the site's header. */
export function OgWordmark({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: Math.round(size * 0.35) }}>
      <OgMark size={Math.round(size * 1.6)} />
      <div style={{ display: "flex", fontFamily: DISPLAY, fontWeight: 900, fontSize: size, letterSpacing: 2, color: OG.ink }}>
        WARGAME<span style={{ color: OG.gold }}>COMPARE</span>
      </div>
    </div>
  );
}

/** The background every share card sits on: iron black lit blood red from the top left, with a gold rule at the foot. */
export const OG_BACKDROP = {
  backgroundColor: OG.bg,
  backgroundImage: "radial-gradient(circle at 0% 0%, rgba(176,24,36,0.45), rgba(11,11,13,0) 55%)",
  borderBottom: `10px solid ${OG.blood}`,
} as const;
