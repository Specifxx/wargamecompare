import { REL_PAID, REL_STORE } from "@/lib/affiliate";
import type { PriceListData } from "@/lib/price-rows";
import { OutboundLink } from "./OutboundLink";
import { StoreCode } from "./StoreCode";

/** One region's price rows (lib/price-rows.ts), drawn the same on the product page and in the quick view. eBay is pinned
 *  first and Amazon second, tagged "Ad" (no wording about the order: owner, 2026-10-30); the stores under them stay
 *  sorted by price and the real cheapest keeps its badge. */
export function PriceList({ ebay, amazon, stores, wayland, compact = false }: PriceListData & { compact?: boolean }) {
  if (compact) return <CompactList ebay={ebay} amazon={amazon} stores={stores} wayland={wayland} />;
  return (
    <div className="card divide-y divide-line overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-ad px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 font-semibold">
            {ebay.label} <span className="ad-pill">Ad</span>
          </p>
          <p className="truncate text-xs text-faint">{ebay.title ?? "New, Buy It Now listings"}</p>
        </div>
        {ebay.price && (
          <div className="text-right">
            <span className="tabular font-bold">{ebay.price}</span>
            <p className="text-xs text-faint">
              {ebay.ship}
              {ebay.vs && ` · ${ebay.vs}`}
            </p>
          </div>
        )}
        <OutboundLink href={ebay.href} rel={REL_PAID} retailer={ebay.label} placement={ebay.placement} className="btn-ad">
          {ebay.found ? "View on eBay" : "Search eBay"}
        </OutboundLink>
      </div>
      {amazon && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-ad px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 font-semibold">
              {amazon.label} <span className="ad-pill">Ad</span>
            </p>
            <p className="text-xs text-faint">Price and stock are Amazon&rsquo;s own; we do not check them.</p>
          </div>
          <OutboundLink href={amazon.href} rel={REL_PAID} retailer={amazon.label} placement={amazon.placement} className="btn-amazon">
            Check Amazon
          </OutboundLink>
        </div>
      )}
      {stores.map((o) => (
        <div key={o.key} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 font-semibold">
              {o.name}
              {o.cheapest && <span className="rounded-full bg-open-soft px-2 py-0.5 text-xs font-bold text-open">Cheapest</span>}
            </p>
            <p className="truncate text-xs text-faint" title={o.title}>{o.title}</p>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${o.inStock ? "bg-open-soft text-open" : "bg-sold-soft text-sold"}`}>{o.inStock ? "In stock" : "Sold out"}</span>
          <div className="w-24 text-right">
            <span className="tabular font-bold">{o.price}</span>
            {o.was && <p className="tabular text-xs text-faint line-through">{o.was}</p>}
          </div>
          <div className="flex items-center gap-2">
            {o.code && <StoreCode code={o.code} />}
            <OutboundLink href={o.href} rel={REL_STORE} retailer={o.name} placement={o.placement} className={o.cheapest ? "btn-primary" : o.inStock ? "btn-soft" : "btn-ghost"}>
              {o.inStock ? "Buy" : "View"}
            </OutboundLink>
          </div>
        </div>
      ))}
      {wayland && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-ad px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 font-semibold">
              Wayland Games <span className="ad-pill">Ad</span>
            </p>
            <p className="text-xs text-faint">A UK discounter we cannot read prices from; search it directly.</p>
          </div>
          <OutboundLink href={wayland.href} rel={REL_PAID} retailer={wayland.label} placement={wayland.placement} className="btn-ghost">
            Search Wayland
          </OutboundLink>
        </div>
      )}
    </div>
  );
}

/** The quick view's narrower rows: one line per row (name and status left, price and button right), so a phone shows
 *  six or seven stores at once. Same rows, same order, same labels as the page. */
function CompactList({ ebay, amazon, stores, wayland }: PriceListData) {
  const row = "flex items-center gap-3 px-3.5 py-2.5";
  return (
    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
      <div className={`${row} bg-ad`}>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-semibold">
            <span className="truncate">{ebay.label}</span> <span className="ad-pill">Ad</span>
          </p>
          <p className="truncate text-xs text-faint">{ebay.price ? [ebay.ship, ebay.vs].filter(Boolean).join(" · ") : "New, Buy It Now listings"}</p>
        </div>
        {ebay.price && <span className="tabular font-bold">{ebay.price}</span>}
        <OutboundLink href={ebay.href} rel={REL_PAID} retailer={ebay.label} placement={ebay.placement} className="btn-ad shrink-0 px-3.5 py-1.5">
          {ebay.found ? "View" : "Search"}
        </OutboundLink>
      </div>
      {amazon && (
        <div className={`${row} bg-ad`}>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 font-semibold">
              <span className="truncate">{amazon.label}</span> <span className="ad-pill">Ad</span>
            </p>
            <p className="truncate text-xs text-faint">Amazon&rsquo;s own price and stock</p>
          </div>
          <OutboundLink href={amazon.href} rel={REL_PAID} retailer={amazon.label} placement={amazon.placement} className="btn-amazon shrink-0 px-3.5 py-1.5">
            Check
          </OutboundLink>
        </div>
      )}
      {stores.map((o) => (
        <div key={o.key} className={`${row} ${o.inStock ? "" : "opacity-70"}`}>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{o.name}</p>
            <p className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className={o.inStock ? "font-semibold text-open" : "text-sold"}>{o.inStock ? "In stock" : "Sold out"}</span>
              {o.cheapest && <span className="rounded-full bg-open-soft px-2 py-px font-bold text-open">Cheapest</span>}
              {o.code && <span className="font-semibold text-brand-strong">Code {o.code.code}</span>}
            </p>
          </div>
          <div className="text-right">
            <span className="tabular font-bold">{o.price}</span>
            {o.was && <p className="tabular text-xs text-faint line-through">{o.was}</p>}
          </div>
          <OutboundLink href={o.href} rel={REL_STORE} retailer={o.name} placement={o.placement} className={`${o.cheapest ? "btn-primary" : o.inStock ? "btn-soft" : "btn-ghost"} shrink-0 px-3.5 py-1.5`}>
            {o.inStock ? "Buy" : "View"}
          </OutboundLink>
        </div>
      ))}
      {wayland && (
        <div className={`${row} bg-ad`}>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 font-semibold">
              Wayland Games <span className="ad-pill">Ad</span>
            </p>
            <p className="truncate text-xs text-faint">We can&rsquo;t read its prices: search it</p>
          </div>
          <OutboundLink href={wayland.href} rel={REL_PAID} retailer={wayland.label} placement={wayland.placement} className="btn-ghost shrink-0 px-3.5 py-1.5">
            Search
          </OutboundLink>
        </div>
      )}
    </div>
  );
}
