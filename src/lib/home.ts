// The home pages' picks (moved from components/HomeVisuals.tsx in the engine port, 2026-11-03): pure selection over the day's
// summaries. Every image they point at is a store's own listing photo, hotlinked at Shopify's small rendition (lib/images.ts).
import type { Summary } from "./data";
import { thumb } from "./images";
import type { Region } from "./regions";

const BOXES = new Set(["combat-patrols", "starter-sets", "army-sets", "miniatures", "paint-sets", "terrain"]);

/** Six kits for the hero: in stock with a photo, a real saving first, one per faction so the wall isn't six Space Marine boxes. */
export function heroPicks(all: Summary[], dealt: Summary[], n = 6): Summary[] {
  const ok = (s: Summary) => s.best != null && s.inStock > 0 && !!s.product.image && BOXES.has(s.product.type);
  const out: Summary[] = [];
  const seen = new Set<string>();
  for (const s of [...dealt.filter((x) => x.stores >= 3), ...all]) {
    if (out.length >= n) break;
    if (!ok(s)) continue;
    const key = s.product.faction ?? s.product.id;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

interface Category {
  label: string;
  path: string;
  /** Which products the tile counts (the hub page's own filter). */
  has: (s: Summary) => boolean;
  /** Which of them may be its picture (a game's tile shows a box of models, not its codex). */
  pic?: (s: Summary) => boolean;
}

const MODELS = (s: Summary) => ["combat-patrols", "starter-sets", "army-sets", "miniatures"].includes(s.product.type);

const CATEGORIES: Category[] = [
  { label: "Combat Patrols & Spearheads", path: "/type/combat-patrols", has: (s) => s.product.type === "combat-patrols" },
  { label: "Starter sets", path: "/type/starter-sets", has: (s) => s.product.type === "starter-sets" },
  { label: "Warhammer 40,000", path: "/game/warhammer-40k", has: (s) => s.product.system === "warhammer-40k", pic: MODELS },
  { label: "Age of Sigmar", path: "/game/age-of-sigmar", has: (s) => s.product.system === "age-of-sigmar", pic: MODELS },
  { label: "Kill Team", path: "/game/kill-team", has: (s) => s.product.system === "kill-team", pic: MODELS },
  { label: "The Horus Heresy", path: "/game/horus-heresy", has: (s) => s.product.system === "horus-heresy", pic: MODELS },
  { label: "Paints & paint sets", path: "/type/paints", has: (s) => s.product.type === "paints" || s.product.type === "paint-sets", pic: (s) => s.product.type === "paint-sets" },
  { label: "Codexes & battletomes", path: "/type/books", has: (s) => s.product.type === "books" },
];

export interface CategoryTile {
  label: string;
  href: string;
  count: number;
  image: string | null;
  /** The pictured product's name. */
  alt?: string;
}

export function categoryTiles(all: Summary[], region: Region): CategoryTile[] {
  const used = new Set<string>();
  return CATEGORIES.map((c) => {
    const items = all.filter(c.has);
    const pic = items.find((s) => s.inStock > 0 && !!s.product.image && !used.has(s.product.image!) && (c.pic ?? (() => true))(s));
    if (pic) used.add(pic.product.image!);
    return { label: c.label, href: `/${region}${c.path}`, count: items.length, image: pic ? thumb(pic.product.image, 400) : null, alt: pic?.product.name };
  }).filter((t) => t.count > 0);
}
