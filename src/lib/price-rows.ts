// One region's price list as plain data, shared by the product page and the quick view (/api/quick/<region>/<id>), so
// both draw the same rows: eBay pinned first and Amazon second (labelled ads, owner 2026-10-28 and 2026-10-30), then
// the stores sorted by price, in stock first, then Wayland. Paid rows are never counted as a store, never "Cheapest",
// and never re-rank the stores. Server-only (reads data/).
import {
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
import { ebayFor, offersFor } from "./data";
import { formatPrice, type Region } from "./regions";
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
}
export interface PriceListData {
  ebay: PaidRow & { title: string | null; price: string | null; ship: string | null; vs: string | null; found: boolean };
  amazon: PaidRow | null;
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
  const amazon = amazonSearchUrl(p.name, region, at("amazon"));
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
    },
    amazon: amazon ? { label: amazonLabel(region), href: amazon, placement: at("amazon") } : null,
    stores: offers.map((o, i) => ({
      key: o.s,
      name: storeName(o.s),
      title: o.t,
      inStock: o.in,
      cheapest: o.in && i === 0,
      price: o.in || !isBook ? formatPrice(o.p, region) : null,
      was: o.w && o.w > o.p && (o.in || !isBook) ? formatPrice(o.w, region) : null,
      code: activeStoreCode(o.u),
      href: storeUrl(o.u, dealForHost(new URL(o.u).hostname)?.ref),
      placement: at("table"),
    })),
    wayland: wayland ? { label: "Wayland Games", href: wayland, placement: at("wayland") } : null,
  };
}
