// One region's price list as plain data, shared by the product page and the quick view (/api/quick/<region>/<id>), so
// both draw the same rows: eBay pinned first and Amazon second (labelled ads, owner 2026-10-28 and 2026-10-30), then
// the stores sorted by price, in stock first, then Wayland. Paid rows are never counted as a store, never "Cheapest",
// and never re-rank the stores. Server-only (reads data/).
import {
  amazonItemUrl,
  amazonLabel,
  amazonSearchUrl,
  ebayAffiliateUrl,
  ebayLabel,
  ebaySearchUrl,
  storeUrl,
  WAYLAND_REGIONS,
  waylandSearchUrl,
  type Placement,
} from "./affiliate";
import { AMAZON_CLOCK, amazonLive, storeFor } from "./amazon-live";
import { ebayFor, offersFor } from "./data";
import { formatPrice, REGIONS, type Region } from "./regions";
import { STORE_BY_KEY } from "./stores";
import { activeStoreCode, dealForHost, type ActiveStoreCode } from "./store-partner-deals";
import type { Product } from "./types";

export interface PaidRow {
  label: string;
  href: string;
  placement: Placement;
}
export interface StoreRow {
  key: string;
  name: string;
  title: string;
  inStock: boolean;
  cheapest: boolean;
  /** null for a sold-out book: its last price is not one anyone can pay (visitor feedback, 2026-10-31). */
  price: string | null;
  was: string | null;
  code: ActiveStoreCode | null;
  href: string;
  placement: Placement;
  /** the store's own listing URL, for the shared thumbs up / down (components/StoreVote.tsx) */
  vote: string;
  /** The cart list (components/cart, owner 2026-11-06): an in-stock row's product name, price and currency. */
  cart?: { title: string; image: string | null; priceCents: number; currency: string };
}
/** Amazon's own price from the Creators API at this build (lib/amazon-live.ts): shown with its time, 24 hours at most. */
export interface AmazonLiveRow {
  price: string;
  at: string;
  timeZone: string;
  zoneLabel: string;
}
/** The cart list's line for an eBay or Amazon row (owner, 2026-11-06: they work like a store row): a manual line on its tagged link. */
export interface PaidCart {
  title: string;
  image: string | null;
  priceCents: number;
  currency: string;
  /** The listing's own page, for the thumbs' domain and the cart list. */
  productUrl: string;
}

export interface PriceListData {
  ebay: PaidRow & { title: string | null; price: string | null; ship: string | null; vs: string | null; found: boolean; cart?: PaidCart };
  /** `found`: Amazon's own listing of this exact barcode (a /dp/ link), else a tagged search. */
  amazon: (PaidRow & { found: boolean; live: AmazonLiveRow | null; cart?: PaidCart }) | null;
  stores: StoreRow[];
  wayland: PaidRow | null;
}

export function priceRows(p: Product, region: Region, surface: "product" | "quickview"): PriceListData {
  const offers = offersFor(p.id, region);
  const best = offers.find((o) => o.in) ?? null;
  const ebay = ebayFor(p.id, region);
  const ebayRegion: Region = region === "nz" ? "au" : region;
  // eBay's row shows the DELIVERED price (item + postage; visitor feedback 2026-10-31), the stores' rows their item
  // price, so the comparison line says which it compares.
  const total = ebay ? ebay.p + (ebay.sh ?? 0) : 0;
  const vs =
    ebay && best && ebayRegion === region
      ? total > best.p
        ? `+${Math.round(((total - best.p) / best.p) * 100)}% vs cheapest store`
        : total < best.p
          ? `${Math.round(((best.p - total) / best.p) * 100)}% under the cheapest store`
          : "same as the cheapest store"
      : null;
  const at = <T extends string>(x: T) => `${surface}-${x}` as Placement;
  // The Creators API's own listing when this build fetched one (owner, 2026-11-05), else the tagged search; the price is
  // Amazon's row's alone, never a sort, the cheapest badge, a deal or the feed. The quick view carries the same tagged
  // link (owner, 2026-11-06: a visitor-opened view of this one product is the Associates policy's "pop-up windows in
  // conjunction with your Site promoting Products closely associated with the materials on your Site"), but never
  // Amazon's price: that stays on the product page (24-hour licence, CLAUDE.md).
  const found = amazonLive(p.ean, region);
  const liveHref = found && amazonItemUrl(found.asin, region, at("amazon"));
  const live = surface === "quickview" ? null : found;
  const amazon = liveHref ?? amazonSearchUrl(p.name, region, at("amazon"));
  const clock = AMAZON_CLOCK[storeFor(region)];
  const wayland = WAYLAND_REGIONS.includes(region) ? waylandSearchUrl(p.name) : null;
  const isBook = p.system === "black-library";
  const storeName = (k: string) => STORE_BY_KEY.get(k)?.name ?? k;
  return {
    ebay: {
      label: ebayLabel(region),
      href: ebay ? ebayAffiliateUrl(ebay.u, region, at("ebay")) : ebaySearchUrl(p.name, region, at("ebay")),
      placement: at("ebay"),
      found: !!ebay,
      title: ebay ? ebay.t : null,
      price: ebay ? formatPrice(total, ebayRegion) : null,
      ship: ebay ? (ebay.sh ? `Delivered, incl. ${formatPrice(ebay.sh, ebayRegion)} postage` : ebay.sh === 0 ? "Delivered, free postage" : "plus postage") : null,
      vs,
      // The price the row shows (delivered), in the eBay site's currency.
      ...(ebay ? { cart: { title: p.name, image: p.image ?? null, priceCents: total, currency: REGIONS[ebayRegion].currency, productUrl: ebay.u } } : {}),
    },
    amazon: amazon
      ? {
          label: amazonLabel(region),
          href: amazon,
          placement: at("amazon"),
          found: !!liveHref,
          live: live && liveHref ? { price: formatPrice(live.p, storeFor(region)), at: live.at, timeZone: clock.timeZone, zoneLabel: clock.label } : null,
          ...(live && liveHref ? { cart: { title: p.name, image: p.image ?? null, priceCents: live.p, currency: REGIONS[storeFor(region)].currency, productUrl: liveHref } } : {}),
        }
      : null,
    stores: offers.map((o, i) => ({
      key: o.s,
      name: storeName(o.s),
      title: o.t,
      inStock: o.in,
      cheapest: o.in && i === 0,
      price: o.in || !isBook ? formatPrice(o.p, region) : null,
      was: o.w && o.w > o.p && (o.in || !isBook) ? formatPrice(o.w, region) : null,
      code: activeStoreCode(o.u),
      href: storeUrl(o.u, dealForHost(new URL(o.u).hostname)?.ref, { checkout: o.in }),
      placement: at("table"),
      vote: o.u,
      ...(o.in ? { cart: { title: p.name, image: p.image ?? null, priceCents: o.p, currency: REGIONS[region].currency } } : {}),
    })),
    wayland: wayland ? { label: "Wayland Games", href: wayland, placement: at("wayland") } : null,
  };
}
