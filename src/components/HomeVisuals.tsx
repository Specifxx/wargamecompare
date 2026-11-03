import Link from "next/link";
import type { Summary } from "@/lib/data";
import { thumb } from "@/lib/images";
import { formatPrice, type Region } from "@/lib/regions";

// The home pages' pictures (owner, 2026-11-03: "the front page can look much better. It needs images of products"). Every image
// is a store's own listing photo, hotlinked at Shopify's small rendition (lib/images.ts): no copy, no Vercel image work. Every
// tile is a plain server-rendered link (crawlers read it; a plain click opens the quick view, QuickView.tsx).

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

export function HeroMosaic({ items, region, className = "" }: { items: Summary[]; region: Region; className?: string }) {
  if (!items.length) return null;
  return (
    <div className={`grid grid-cols-3 gap-2 sm:gap-3 ${className}`}>
      {items.map((s, i) => {
        const p = s.product;
        const src = thumb(p.image, 400) ?? undefined;
        return (
          <Link
            key={p.id}
            href={`/${region}/p/${p.id}`}
            prefetch={false}
            data-qv={p.id}
            data-qv-region={region}
            data-qv-name={p.name}
            data-qv-img={src}
            title={p.name}
            className="plate group relative block aspect-square rounded-xl"
          >
            {/* The first row is above the fold on a phone: load it at once; the rest lazily. */}
            <img src={src} alt={p.name} loading={i < 3 ? "eager" : "lazy"} decoding="async" className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" />
            <span className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-1">
              <span className="tabular rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-bold text-white sm:text-xs">{formatPrice(s.best!, region)}</span>
              {s.off != null && s.off >= 0.05 && <span className="rounded-md bg-open px-1.5 py-0.5 text-[11px] font-bold text-white sm:text-xs">−{Math.round(s.off * 100)}%</span>}
            </span>
          </Link>
        );
      })}
    </div>
  );
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

/** The category tiles for a region: each with its most-stocked in-stock product's photo (the list is sorted by store count). */
export function categoryTiles(all: Summary[], region: Region): CategoryTile[] {
  const used = new Set<string>();
  return CATEGORIES.map((c) => {
    const items = all.filter(c.has);
    const pic = items.find((s) => s.inStock > 0 && !!s.product.image && !used.has(s.product.image!) && (c.pic ?? (() => true))(s));
    if (pic) used.add(pic.product.image!);
    return { label: c.label, href: `/${region}${c.path}`, count: items.length, image: pic ? thumb(pic.product.image, 400) : null, alt: pic?.product.name };
  }).filter((t) => t.count > 0);
}

export function CategoryTiles({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((t) => (
        <Link key={t.href} href={t.href} prefetch={false} className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lift">
          <div className="plate m-2 mb-0 aspect-[4/3]">
            {t.image ? (
              <img src={t.image} alt={t.alt ?? t.label} loading="lazy" decoding="async" className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" />
            ) : (
              <div className="h-full w-full" />
            )}
          </div>
          <div className="flex items-baseline justify-between gap-2 px-3 py-2.5">
            <span className="text-sm font-semibold leading-snug group-hover:text-brand">{t.label}</span>
            <span className="tabular shrink-0 text-xs text-faint">{t.count.toLocaleString("en")}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
