import Link from "@/components/Link";
import type { Summary } from "@/lib/data";
import type { CategoryTile } from "@/lib/home";
import { FACTIONS, TYPES } from "@/lib/catalog";
import { thumb } from "@/lib/images";
import { formatPrice, type Region } from "@/lib/regions";

// The home pages' pictures (owner, 2026-11-03: "the front page can look much better. It needs images of products"), kept through
// the engine port. Every image is a store's own listing photo, hotlinked at Shopify's small rendition (lib/images.ts): no copy, no
// Vercel image work. Every tile is a plain server-rendered link (crawlers read it; a plain click opens the quick view).
// The picks themselves are lib/home.ts.

/**
 * The hero's two featured products (owner, 2026-11-08: KaeYoung and ScentCompare's hero, "feature some products on the hero", as on
 * DexCompare and MTG Compare): big product cards with the photo, the saving on RRP, the type and faction, the cheapest in-stock price
 * and how many stores have it. Plain links to the product pages in the server HTML, with the quick view's data attributes. Nothing
 * here is a heading. Styles: globals.css .hc-*.
 */
export function HeroCards({ items, region }: { items: Summary[]; region: Region }) {
  if (!items.length) return null;
  return (
    <ul role="list" className="grid grid-cols-2 gap-3 sm:gap-4">
      {items.map((s, i) => {
        const p = s.product;
        const src = thumb(p.image, 400) ?? undefined;
        const kind = TYPES.find((t) => t.slug === p.type)?.name;
        const faction = p.faction ? FACTIONS.find((f) => f.slug === p.faction)?.name : null;
        return (
          <li key={p.id} className="min-w-0">
            <Link
              href={`/${region}/p/${p.id}`}
              prefetch={false}
              data-qv={p.id}
              data-qv-region={region}
              data-qv-name={p.name}
              data-qv-img={src}
              className="hc-card group"
            >
              <span className="hc-art plate">
                {src && <img src={src} alt={p.name} width={400} height={400} loading="eager" fetchPriority={i === 0 ? "high" : "auto"} decoding="async" className="h-full w-full object-contain p-3 mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.04] sm:p-4" />}
                {s.off != null && s.off >= 0.05 && <span className="hc-save">Save {Math.round(s.off * 100)}%</span>}
              </span>
              <span className="flex flex-1 flex-col gap-1 border-t border-line p-3 text-left">
                <span className="eyebrow truncate">{faction ?? kind}</span>
                <span className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink group-hover:text-brand sm:text-sm">{p.name}</span>
                <span className="mt-auto pt-1">
                  <span className="tabular font-display text-lg font-bold text-ink sm:text-xl">{formatPrice(s.best!, region)}</span>
                </span>
                <span className="text-xs text-muted">
                  In stock at {s.inStock} store{s.inStock === 1 ? "" : "s"}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** The category tiles: a photo of one in-stock product in the category over its name and count. */
export function CategoryTiles({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {tiles.map((t) => (
        <Link key={t.href} href={t.href} prefetch={false} className="card group relative flex aspect-[4/3] min-w-0 flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lift">
          <div className="plate absolute inset-0 rounded-none ring-0">
            {t.image ? (
              <img src={t.image} alt={t.alt ?? t.label} width={400} height={400} loading="lazy" decoding="async" className="h-full w-full object-contain p-3 pb-10 mix-blend-multiply transition-transform duration-300 group-hover:scale-105" />
            ) : (
              <div className="h-full w-full" />
            )}
          </div>
          <div className="relative mt-auto flex items-baseline justify-between gap-2 bg-gradient-to-t from-black/85 via-black/60 to-transparent px-3 pb-2.5 pt-6 text-white">
            <span className="text-sm font-bold leading-snug">{t.label}</span>
            <span className="tabular shrink-0 text-xs text-white/70">{t.count.toLocaleString("en")}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
