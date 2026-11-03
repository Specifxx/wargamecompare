import Link from "@/components/Link";
import { TYPE_BY_SLUG } from "@/lib/catalog";
import type { Summary } from "@/lib/data";
import { thumb } from "@/lib/images";
import { formatPrice, type Region } from "@/lib/regions";
import { StockPill } from "./StockPill";

// The grid and the rail live in their own files; re-exported here so existing `import { ProductGrid } from "./ProductCard"` lines keep
// working.
export { ProductGrid } from "./ProductGrid";

// The type pill sits over the photo, so it says the type the way hobbyists do. A label not here is short already.
const SHORT_TYPE: Record<string, string> = {
  "starter-sets": "Starter set",
  "combat-patrols": "Combat Patrol",
  "army-sets": "Army set",
  books: "Book",
  "paint-sets": "Paint set",
  paints: "Paint",
  tools: "Hobby",
  terrain: "Terrain",
  accessories: "Accessory",
  miniatures: "Miniatures",
};

/** "combat-patrols" → "Combat Patrol"; a type with no short form shows its catalogue name. */
export function shortTypeLabel(type: string): string {
  return SHORT_TYPE[type] ?? TYPE_BY_SLUG.get(type)?.name ?? type;
}

/** The card's stock line, as [words, count unit]: "In stock · 12 of 15 stores", or "Sold out · all 5 stores". */
export function cardStockLabel(s: Summary): [string, string] {
  if (s.inStock > 0) return [`In stock · ${s.inStock} of ${s.stores}`, s.stores === 1 ? " store" : " stores"];
  if (s.stores === 0) return ["Not in stock", ""];
  return [`Sold out · all ${s.stores}`, s.stores === 1 ? " store" : " stores"];
}

/**
 * A product tile (the engine's card, from Dex and MTG Compare): the store's photo on its plate with the type pill over it, the name,
 * the saving under RRP, the stock pill, then "From <best in-stock price>", and a "Compare N prices →" cue. A plain click opens the
 * quick view (QuickView.tsx); the link itself stays for crawlers, new tabs and modified clicks.
 */
export function ProductCard({ s, region, priority = false }: { s: Summary; region: Region; priority?: boolean }) {
  const p = s.product;
  const img = thumb(p.image, 400);
  const open = s.best != null;
  const [stock, unit] = cardStockLabel(s);
  const type = shortTypeLabel(p.type);
  return (
    <div className="flex flex-col">
      <Link
        href={`/${region}/p/${p.id}`}
        prefetch={false}
        data-qv={p.id}
        data-qv-region={region}
        data-qv-name={p.name}
        data-qv-img={img ?? undefined}
        className="group card flex flex-1 flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lift"
      >
        {/* The photo on its plate (globals.css .plate): white in light mode, where multiply melts a photo's own white into it; a
            light plate in dark mode, so a store's white-backed photo is never a glaring square on a dark card. */}
        <div className="plate relative m-2 aspect-square lg:mb-0 lg:aspect-[8/7]">
          {img ? (
            <img
              src={img}
              alt={p.name}
              width={400}
              height={400}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
              className="absolute inset-0 h-full w-full object-contain p-3 mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm font-semibold text-[#5c606c]">{type}</div>
          )}
          <span title={TYPE_BY_SLUG.get(p.type)?.name ?? type} className="absolute left-2 top-2 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-semibold text-muted shadow-card backdrop-blur">
            {type}
          </span>
        </div>
        <div className="card-body flex flex-1 flex-col gap-2 px-3 pb-3 pt-1 sm:px-4 sm:pb-4 lg:pt-3">
          <div className="min-h-[2.5rem]">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-brand sm:text-[15px]">{p.name}</h3>
            {p.code && <p className="mt-0.5 text-xs text-faint">{p.code}</p>}
          </div>
          {s.off != null && s.off >= 0.05 && (
            <p className="text-[11px] font-semibold leading-4 text-open">
              {Math.round(s.off * 100)}% under RRP{s.rrp != null && <span className="font-medium text-muted"> ({formatPrice(s.rrp, region)})</span>}
            </p>
          )}
          <div className="mt-auto">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5" title={`${stock}${unit}`}>
              <StockPill state={open ? "open" : "soldout"} size="sm">
                {stock}
                {unit && <span className="stock-unit">{unit}</span>}
              </StockPill>
            </div>
            {open ? (
              <p className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-xs font-medium text-muted">From</span>
                <span className="tabular font-display text-lg font-bold">{formatPrice(s.best!, region)}</span>
              </p>
            ) : (
              <p className="mt-1.5 text-xs font-medium text-faint">No price while sold out</p>
            )}
          </div>
          {/* What the click opens: always there on a phone (the cue that a card opens a comparison), on hover or focus on a desktop. */}
          <p aria-hidden="true" className="h-4 truncate text-[11px] font-semibold leading-4 text-brand-strong lg:h-5 lg:text-xs lg:leading-5 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100">
            {s.stores > 1 ? `Compare ${s.stores} prices` : "See the price"}&nbsp;→
          </p>
        </div>
      </Link>
    </div>
  );
}
