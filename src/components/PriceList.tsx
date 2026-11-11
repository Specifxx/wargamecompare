import type { ReactNode } from "react";
import { isAwinLink } from "@/lib/awin";
import { REL_PAID, storeRel } from "@/lib/affiliate";
import type { PriceListData, StoreRow } from "@/lib/price-rows";
import { AMAZON_PRICE_DISCLAIMER, AmazonPrice } from "./AmazonPrice";
import { OutboundLink } from "./OutboundLink";
import { StockPill } from "./StockPill";
import { StoreVote } from "./StoreVote";
import { CartAddButton } from "./cart/CartAddButton";

// The engine's price table rows (from MTG Compare's OfferRows): a grid whose cells are placed by grid-area. On a phone, two columns:
// the store and its stock pill; the price; the host line; the button, 44 px, beside the last two. From sm one line: the store over
// its line, then the pill, the price, the button.
// Short classes from globals.css (.or-*, site review X1 2026-11-10), built from the same utilities: a table repeated them on every row.
const ROW_GRID = "or-row";
const ROW_BUTTON = "min-h-11 justify-self-end whitespace-nowrap [grid-area:2/2/4] sm:min-h-10 sm:[grid-area:1/4/3]";
const ROW_ACTIONS = "or-act";
const ROW_LINK = "or-btn";
/** The pinned rows' outlines (owner, 2026-11-06): eBay green, Amazon amber; the cheapest store row (owner, 2026-11-07) sky blue with
 *  the tint. Inset, so the row keeps its grid. */
export const PIN_OUTLINE = {
  ebay: "or-ebay",
  amazon: "or-amz",
  cheapest: "or-hl",
} as const;
const BADGE = "or-badge";
/** Store rows past this many (price order) are drawn lean: store, stock, price, button (site review X1, 2026-11-10). */
export const FULL_ROWS = 20;
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
        {/* eBay and Amazon work like a store row (owner, 2026-11-06): stock pill, thumbs, cart; on top, green and amber outlines. */}
        <li className={`${ROW_GRID} ${PIN_OUTLINE.ebay}`} data-row="ebay">
          <div className="or-top">
            <span className="or-name">{ebay.label}</span>
            <span className="ad-pill">Ad</span>
          </div>
          <div className="or-host" title={ebay.title ?? undefined}>
            <StoreVote url={ebay.cart?.productUrl ?? ebay.href} name="eBay" className="-ml-1 mr-1 text-muted" />
            {ebay.title ?? "New, Buy It Now listings"}
            {ebay.vs && <span className="text-muted"> · {ebay.vs}</span>}
          </div>
          <div className="or-stock">
            {ebay.found ? <StockPill state="open">In stock</StockPill> : <SearchPill />}
          </div>
          <div className="or-pc">
            {ebay.price ? (
              <>
                <span className="tabular font-display text-lg font-bold leading-6">{ebay.price}</span>
                <span className="truncate text-[11px] leading-4 text-muted sm:block sm:text-xs">{ebay.ship}</span>
              </>
            ) : (
              <span className="block truncate text-sm leading-6 text-muted sm:text-xs">eBay sellers&rsquo; prices</span>
            )}
          </div>
          <div className={ROW_ACTIONS}>
            {ebay.cart && <CartAddButton href={ebay.href} productUrl={ebay.cart.productUrl} storeName="eBay" title={ebay.cart.title} priceCents={ebay.cart.priceCents} currency={ebay.cart.currency} image={ebay.cart.image} className="text-muted" />}
            <OutboundLink href={ebay.href} rel={REL_PAID} retailer={ebay.label} placement={ebay.placement} className={`btn-ad ${ROW_LINK}`}>
              {ebay.found ? "View deal" : "Search"} <span aria-hidden="true">↗</span>
            </OutboundLink>
          </div>
        </li>
        {amazon && (
          <li className={`${ROW_GRID} ${PIN_OUTLINE.amazon}`} data-row="amazon">
            <div className="or-top">
              <span className="or-name">{amazon.label}</span>
              <span className="ad-pill">Ad</span>
            </div>
            <div className="or-host">
              <StoreVote url={amazon.href} name="Amazon" className="-ml-1 mr-1 text-muted" />
              {amazon.found ? "Amazon\u2019s own listing of this exact product; price and stock are Amazon\u2019s." : "Also check the price on Amazon: price and stock are Amazon\u2019s own."}
            </div>
            <div className="or-stock">
              {amazon.live ? <StockPill state="open">In stock</StockPill> : <SearchPill />}
            </div>
            <div className="or-pc">
              {amazon.live ? (
                <AmazonPrice price={amazon.live.price} at={amazon.live.at} timeZone={amazon.live.timeZone} zoneLabel={amazon.live.zoneLabel} />
              ) : (
                <span className="block truncate text-sm leading-6 text-muted sm:text-xs">Also check on Amazon</span>
              )}
            </div>
            <div className={ROW_ACTIONS}>
              {amazon.cart && <CartAddButton href={amazon.href} productUrl={amazon.cart.productUrl} storeName="Amazon" title={amazon.cart.title} priceCents={amazon.cart.priceCents} currency={amazon.cart.currency} image={amazon.cart.image} className="text-muted" />}
              <OutboundLink href={amazon.href} rel={REL_PAID} retailer={amazon.label} placement={amazon.placement} className={`btn-primary ${ROW_LINK}`}>
                {amazon.found ? "View deal" : "Check Amazon"} <span aria-hidden="true">↗</span>
              </OutboundLink>
            </div>
          </li>
        )}
        {stores.map((o, i) => (i < limit ? <Row key={o.key} o={o} lean={i >= FULL_ROWS} /> : null))}
      </ul>
      {amazon?.live && <p className="px-4 py-2 text-[11px] leading-4 text-faint sm:px-5">* {AMAZON_PRICE_DISCLAIMER}</p>}
      {more.length > 0 && (
        <MoreRows label={moreOpen > 0 ? `Show ${more.length} more ${more.length === 1 ? "store" : "stores"} (${moreOpen} in stock)` : `Show ${more.length} more sold out`}>
          {more.map((o, i) => (
            <Row key={o.key} o={o} lean={limit + i >= FULL_ROWS} />
          ))}
        </MoreRows>
      )}
      {wayland && (
        <ul>
          <li className={ROW_GRID} data-row="wayland">
            <div className="or-top">
              <span className="or-name">Wayland Games</span>
              <span className="ad-pill">Ad</span>
            </div>
            <div className="or-host">A UK discounter we cannot read prices from; search it directly.</div>
            <div className="or-stock">
              <SearchPill />
            </div>
            <div className="or-pc">
              <span className="block truncate text-sm leading-6 text-muted sm:text-xs">Wayland&rsquo;s own price</span>
            </div>
            <OutboundLink href={wayland.href} rel={REL_PAID} retailer={wayland.label} placement={wayland.placement} className={`btn-primary ${ROW_BUTTON}`}>
              Search <span aria-hidden="true">↗</span>
            </OutboundLink>
          </li>
        </ul>
      )}
    </div>
  );
}

function Row({ o, lean = false }: { o: StoreRow; lean?: boolean }) {
  if (lean && !o.cheapest) return <LeanRow o={o} />;
  return (
    <li data-offer-row="" className={o.cheapest ? "or-row or-hl" : "or-row"}>
      <div className="or-top">
        <span className="or-name">{o.name}</span>
        {o.cheapest && <span className={BADGE}>Cheapest</span>}
        {isAwinLink(o.href) && <span className="text-[11px] text-faint">Paid link</span>}
      </div>
      <div className="or-host" title={o.title}>
        <StoreVote url={o.vote} name={o.name} className="-ml-1 mr-1 text-muted" />
        {o.title}
        {o.code && (
          <span className="font-semibold text-brand-strong" title={`Checked ${o.code.checked}`}>
            {" "}· {o.code.offer}, code <span className="font-mono">{o.code.code}</span>
          </span>
        )}
      </div>
      <div className="or-stock">
        <StockPill state={o.inStock ? "open" : "soldout"}>{o.inStock ? "In stock" : "Sold out"}</StockPill>
      </div>
      <div className="or-pc">
        {o.price ? (
          <span className={o.inStock ? "or-price" : "or-price text-faint line-through decoration-1"}>{o.price}</span>
        ) : (
          <span className="block text-sm leading-6 text-muted sm:text-xs">No price</span>
        )}
        {o.was && <span className="or-sub text-muted line-through">was {o.was}</span>}
      </div>
      {/* The row's button, and beside it the cart list's "Add to cart" (components/cart) on an in-stock row. */}
      <div className={ROW_ACTIONS}>
        {o.cart && (
          <CartAddButton href={o.href} productUrl={o.vote} storeName={o.name} title={o.cart.title} priceCents={o.cart.priceCents} currency={o.cart.currency} image={o.cart.image} className="text-muted" />
        )}
        <OutboundLink href={o.href} rel={storeRel(o.href)} retailer={o.name} placement={o.placement} className={`${o.cheapest ? "btn-primary" : o.inStock ? "btn-soft" : "btn-ghost"} or-btn`}>
          {o.inStock ? "View deal" : "View"} <span aria-hidden="true">↗</span>
        </OutboundLink>
      </div>
    </li>
  );
}

/**
 * A store row past FULL_ROWS: the store, its stock, its price and its button (no thumbs, cart or listing title; a paid link's label and a store's code stay). Still a real
 * row with its link in the server HTML, on the full row's grid so the columns line up (site review X1, 2026-11-10).
 */
function LeanRow({ o }: { o: StoreRow }) {
  return (
    <li data-offer-row="" data-lean="" data-open={o.inStock ? "" : undefined} className="or-row or-lean">
      <div className="or-top">
        <span className="or-name">{o.name}</span>
        {/* The disclosure stays beside a paid link, and a store's code stays beside its price, lean or not. */}
        {isAwinLink(o.href) && <span className="text-[11px] text-faint">Paid link</span>}
        {o.code && (
          <span className="truncate text-[11px] font-semibold text-brand-strong" title={`Checked ${o.code.checked}`}>
            {o.code.offer}, code <span className="font-mono">{o.code.code}</span>
          </span>
        )}
      </div>
      <div className="or-stock">
        <StockPill state={o.inStock ? "open" : "soldout"}>{o.inStock ? "In stock" : "Sold out"}</StockPill>
      </div>
      <div className="or-pc">
        {o.price ? <span className={o.inStock ? "or-price" : "or-price text-faint line-through decoration-1"}>{o.price}</span> : <span className="block text-sm leading-6 text-muted sm:text-xs">No price</span>}
      </div>
      <div className="or-act">
        <OutboundLink href={o.href} rel={storeRel(o.href)} retailer={o.name} placement={o.placement} className={`${o.inStock ? "btn-soft" : "btn-ghost"} or-btn`}>
          {o.inStock ? "View deal" : "View"} <span aria-hidden="true">↗</span>
        </OutboundLink>
      </div>
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
