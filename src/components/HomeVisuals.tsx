import Link from "@/components/Link";
import type { Summary } from "@/lib/data";
import type { CategoryTile } from "@/lib/home";
import { thumb } from "@/lib/images";
import { formatPrice, type Region } from "@/lib/regions";

// The home pages' pictures (owner, 2026-11-03: "the front page can look much better. It needs images of products"), kept through
// the engine port. Every image is a store's own listing photo, hotlinked at Shopify's small rendition (lib/images.ts): no copy, no
// Vercel image work. Every tile is a plain server-rendered link (crawlers read it; a plain click opens the quick view).
// The picks themselves are lib/home.ts.

/** Six kits with a photo, on plates: the hero's aside on a desktop, a 3×2 wall under the hero on a phone. */
export function HeroMosaic({ items, region, className = "" }: { items: Summary[]; region: Region; className?: string }) {
  if (!items.length) return null;
  return (
    <ul role="list" className={`grid grid-cols-3 gap-2 sm:gap-3 ${className}`}>
      {items.map((s, i) => {
        const p = s.product;
        const src = thumb(p.image, 400) ?? undefined;
        return (
          <li key={p.id} className="min-w-0">
            <Link
              href={`/${region}/p/${p.id}`}
              prefetch={false}
              data-qv={p.id}
              data-qv-region={region}
              data-qv-name={p.name}
              data-qv-img={src}
              title={p.name}
              className="plate group relative block aspect-square overflow-hidden rounded-xl shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              {/* The first row is above the fold on a phone: load it at once; the rest lazily. */}
              <img src={src} alt={p.name} width={400} height={400} loading={i < 3 ? "eager" : "lazy"} fetchPriority={i < 3 ? "high" : "auto"} decoding="async" className="h-full w-full object-contain p-2 mix-blend-multiply transition-transform duration-300 group-hover:scale-105" />
              <span className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-1">
                <span className="tabular rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-bold text-white sm:text-xs">{formatPrice(s.best!, region)}</span>
                {s.off != null && s.off >= 0.05 && <span className="rounded-md bg-open px-1.5 py-0.5 text-[11px] font-bold text-white sm:text-xs">−{Math.round(s.off * 100)}%</span>}
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
