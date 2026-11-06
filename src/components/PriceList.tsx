import type { ReactNode } from "react";
import { isAwinLink } from "@/lib/awin";
import { REL_PAID, storeRel } from "@/lib/affiliate";
import type { PriceListData, StoreRow } from "@/lib/price-rows";
import { AMAZON_PRICE_DISCLAIMER, AmazonPrice } from "./AmazonPrice";
import { OutboundLink } from "./OutboundLink";
import { StockPill } from "./StockPill";
import { StoreVote } from "./StoreVote";

// The engine's price table rows (from MTG Compare's OfferRows): a grid whose cells are placed by grid-area. On a phone, two columns:
// the store and its stock pill; the price; the host line; the button, 44 px, beside the last two. From sm one line: the store over
// its line, then the pill, the price, the button.
const ROW_GRID = "grid grid-cols-[1fr_auto] items-center gap-x-3 px-4 py-3 sm:grid-cols-[1fr_auto_10rem_auto] sm:gap-x-4 sm:px-5 sm:py-3.5";
const ROW_BUTTON = "min-h-11 justify-self-end whitespace-nowrap [grid-area:2/2/4] sm:min-h-10 sm:[grid-area:1/4/3]";
const BADGE = "shrink-0 rounded-full bg-open px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-surface";
/** Rows shown before the "Show N more" fold. */
const SHOWN = 8;

/**
 * One region's price rows (lib/price-rows.ts), drawn the same on the product page and in the quick view. eBay is pinned first and
 * Amazon second, tagged "Ad" (no wording about the order: owner, 2026-10-30), drawn exactly like a store row (no tint, the store's
 * own button: owner, 2026-11-01, "blend in"); the stores under them stay sorted by price and the real cheapest keeps its badge and
 * the one red button. After eight store rows the rest fold under a "Show more" toggle, in-stock first.
 */
export function PriceList({ ebay, amazon, stores, wayland, compact = false }: PriceListData & { compact?: boolean }) {
  const limit = compact ? stores.length : SHOWN;
  const more = stores.slice(limit);
  const moreOpen = more.filter((o) => o.inStock).length;
  return (
    <div className={`divide-y divide-line overflow-hidden ${compact ? "rounded-xl border border-line bg-surface" : "card"}`}>
      <ul className="divide-y divide-line">
        <li className={ROW_GRID} data-row="ebay">
          <div className="flex h-5 items-center gap-2 overflow-hidden sm:h-6">
            <span className="truncate text-[15px] font-semibold sm:text-base">{ebay.label}</span>
            <span className="ad-pill">Ad</span>
          </div>
          <div className="truncate text-[11px] leading-4 text-faint sm:text-xs" title={ebay.title ?? undefined}>
            {ebay.title ?? "New, Buy It Now listings"}
            {ebay.vs && <span className="text-muted"> · {ebay.vs}</span>}
          </div>
          <div className="flex h-5 items-center justify-self-end [grid-area:1/2] sm:[grid-area:1/2/3]">
            {ebay.found ? <StockPill state="open">Listed</StockPill> : <SearchPill />}
          </div>
          <div className="mt-1 flex min-w-0 items-baseline gap-2 [grid-area:2/1] sm:mt-0 sm:block sm:text-right sm:[grid-area:1/3/3]">
            {ebay.price ? (
              <>
                <span className="tabular font-display text-lg font-bold leading-6">{ebay.price}</span>
                <span className="truncate text-[11px] leading-4 text-muted sm:block sm:text-xs">{ebay.ship}</span>
              </>
            ) : (
              <span className="block truncate text-sm leading-6 text-muted sm:text-xs">eBay sellers&rsquo; prices</span>
            )}
          </div>
          <OutboundLink href={ebay.href} rel={REL_PAID} retailer={ebay.label} placement={ebay.placement} className={`btn-soft ${ROW_BUTTON}`}>
            {ebay.found ? "View deal" : "Search"} <span aria-hidden="true">↗</span>
          </OutboundLink>
        </li>
        {amazon && (
          <li className={ROW_GRID} data-row="amazon">
            <div className="flex h-5 items-center gap-2 overflow-hidden sm:h-6">
              <span className="truncate text-[15px] font-semibold sm:text-base">{amazon.label}</span>
              <span className="ad-pill">Ad</span>
            </div>
            <div className="truncate text-[11px] leading-4 text-faint sm:text-xs">
              {amazon.found ? "Amazon\u2019s own listing of this exact product; price and stock are Amazon\u2019s." : "Price and stock are Amazon\u2019s own; we do not check them."}
            </div>
            <div className="flex h-5 items-center justify-self-end [grid-area:1/2] sm:[grid-area:1/2/3]">
              <SearchPill />
            </div>
            <div className="mt-1 flex min-w-0 items-baseline gap-2 [grid-area:2/1] sm:mt-0 sm:block sm:text-right sm:[grid-area:1/3/3]">
              {amazon.live ? (
                <AmazonPrice price={amazon.live.price} at={amazon.live.at} timeZone={amazon.live.timeZone} zoneLabel={amazon.live.zoneLabel} />
              ) : (
                <span className="block truncate text-sm leading-6 text-muted sm:text-xs">Amazon&rsquo;s own price</span>
              )}
            </div>
            <OutboundLink href={amazon.href} rel={REL_PAID} retailer={amazon.label} placement={amazon.placement} className={`btn-soft ${ROW_BUTTON}`}>
              {amazon.found ? "View" : "Search"} <span aria-hidden="true">↗</span>
            </OutboundLink>
          </li>
        )}
        {stores.map((o, i) => (i < limit ? <Row key={o.key} o={o} /> : null))}
      </ul>
      {amazon?.live && <p className="px-4 py-2 text-[11px] leading-4 text-faint sm:px-5">* {AMAZON_PRICE_DISCLAIMER}</p>}
      {more.length > 0 && (
        <MoreRows label={moreOpen > 0 ? `Show ${more.length} more ${more.length === 1 ? "store" : "stores"} (${moreOpen} in stock)` : `Show ${more.length} more sold out`}>
          {more.map((o) => (
            <Row key={o.key} o={o} />
          ))}
        </MoreRows>
      )}
      {wayland && (
        <ul>
          <li className={ROW_GRID} data-row="wayland">
            <div className="flex h-5 items-center gap-2 overflow-hidden sm:h-6">
              <span className="truncate text-[15px] font-semibold sm:text-base">Wayland Games</span>
              <span className="ad-pill">Ad</span>
            </div>
            <div className="truncate text-[11px] leading-4 text-faint sm:text-xs">A UK discounter we cannot read prices from; search it directly.</div>
            <div className="flex h-5 items-center justify-self-end [grid-area:1/2] sm:[grid-area:1/2/3]">
              <SearchPill />
            </div>
            <div className="mt-1 flex min-w-0 items-baseline gap-2 [grid-area:2/1] sm:mt-0 sm:block sm:text-right sm:[grid-area:1/3/3]">
              <span className="block truncate text-sm leading-6 text-muted sm:text-xs">Wayland&rsquo;s own price</span>
            </div>
            <OutboundLink href={wayland.href} rel={REL_PAID} retailer={wayland.label} placement={wayland.placement} className={`btn-soft ${ROW_BUTTON}`}>
              Search <span aria-hidden="true">↗</span>
            </OutboundLink>
          </li>
        </ul>
      )}
    </div>
  );
}

function Row({ o }: { o: StoreRow }) {
  return (
    <li data-offer-row="" className={`${ROW_GRID} ${o.cheapest ? "bg-open-soft/40" : ""}`}>
      <div className="flex h-5 items-center gap-2 overflow-hidden sm:h-6">
        <span className="truncate text-[15px] font-semibold sm:text-base">{o.name}</span>
        {o.cheapest && <span className={BADGE}>Cheapest</span>}
        {isAwinLink(o.href) && <span className="text-[11px] text-faint">Paid link</span>}
      </div>
      <div className="truncate text-[11px] leading-4 text-faint sm:text-xs" title={o.title}>
        <StoreVote url={o.vote} name={o.name} className="-ml-1 mr-1 text-muted" />
        {o.title}
        {o.code && (
          <span className="font-semibold text-brand-strong" title={`Checked ${o.code.checked}`}>
            {" "}· {o.code.offer}, code <span className="font-mono">{o.code.code}</span>
          </span>
        )}
      </div>
      <div className="flex h-5 items-center justify-self-end [grid-area:1/2] sm:[grid-area:1/2/3]">
        <StockPill state={o.inStock ? "open" : "soldout"}>{o.inStock ? "In stock" : "Sold out"}</StockPill>
      </div>
      <div className="mt-1 flex min-w-0 items-baseline gap-2 [grid-area:2/1] sm:mt-0 sm:block sm:text-right sm:[grid-area:1/3/3]">
        {o.price ? (
          <span className={`tabular font-display text-lg font-bold leading-6 ${o.inStock ? "" : "text-faint line-through decoration-1"}`}>{o.price}</span>
        ) : (
          <span className="block text-sm leading-6 text-muted sm:text-xs">No price</span>
        )}
        {o.was && <span className="tabular truncate text-[11px] leading-4 text-muted line-through sm:block sm:text-xs">was {o.was}</span>}
      </div>
      <OutboundLink href={o.href} rel={storeRel(o.href)} retailer={o.name} placement={o.placement} className={`${o.cheapest ? "btn-primary" : o.inStock ? "btn-soft" : "btn-ghost"} ${ROW_BUTTON}`}>
        {o.inStock ? "View deal" : "View"} <span aria-hidden="true">↗</span>
      </OutboundLink>
    </li>
  );
}

function SearchPill() {
  return <span className="block h-5 rounded-full border border-line bg-surface px-2.5 text-xs font-semibold leading-[18px] text-muted sm:h-6 sm:leading-[22px]">Search</span>;
}

function MoreRows({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="group/more px-4 py-1 sm:px-5">
      <summary className="btn-ghost min-h-11 w-full cursor-pointer list-none justify-center [&::-webkit-details-marker]:hidden">
        <span className="group-open/more:hidden">{label}</span>
        <span className="hidden group-open/more:inline">Show fewer</span>
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 transition-transform group-open/more:rotate-180 motion-reduce:transition-none">
          <path d="m5 7.5 5 5 5-5" />
        </svg>
      </summary>
      <ul className="-mx-4 -mb-1 mt-1 divide-y divide-line border-t border-line sm:-mx-5">{children}</ul>
    </details>
  );
}

/** "How these prices work", folded under the table (the engine's note): what a row is, what the paid rows are. */
export function PriceListNote({ children }: { children?: ReactNode }) {
  return (
    <details className="mt-3 text-sm text-muted">
      <summary className="cursor-pointer font-semibold text-ink">How these prices work</summary>
      <div className="mt-2 space-y-2 leading-6">
        <p>Store rows are the stores&rsquo; own listed prices, read from their websites today and sorted by price with in-stock stores first. The cheapest store you can buy from now is marked. Prices are in the country&rsquo;s own currency and never converted.</p>
        <p>eBay and Amazon are paid links, labelled Ad: they are never counted as a store, never the &ldquo;cheapest&rdquo;, and never change the stores&rsquo; order. Some store links carry a store&rsquo;s own referral code; what we earn never decides the order.</p>
        {children}
      </div>
    </details>
  );
}
