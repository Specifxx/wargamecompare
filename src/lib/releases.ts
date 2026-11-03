// NEW RELEASES AND PRE-ORDERS (2026-11-03; owner: "We need a fresh pipeline of new products for all our sites, that's where our
// demand is"). Games Workshop opens pre-orders every Saturday; the stores we read title them "(Pre-Order 14/11/26)",
// "[Pre-order]", "Pre-Order For 10/17/2026". This reads those titles, and the day the import first saw each product, into two
// lists per region for /<region>/new-releases and the region home:
//
// - On pre-order: a store's title says pre-order AND either a release date it states is still to come, or (no date in any title)
//   two or more stores say pre-order. A title whose stated date has passed is a store that never edited it: not a pre-order.
// - Just arrived: first seen by the import in the last ARRIVAL_DAYS days, never on the import's first day (when everything was
//   "new"), and not on pre-order.
//
// Facts only: every date shown is one a store's own title states (the latest any store states, so a delayed batch is not shown
// early), and every price is a store's own. Pure (no data read), so tests/releases.test.ts checks it directly.
import type { Offer, Product } from "./types";
import type { Region } from "./regions";

export const ARRIVAL_DAYS = 45;

const PRE = /\bpre[\s-]?order|\bpreorder/i;
// d/m/y or m/d/y, with / . or -, a 2- or 4-digit year.
const DATE = /\b(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4}|\d{2})\b/;

function iso(y: number, m: number, d: number): string | null {
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const t = Date.UTC(y, m - 1, d);
  const dt = new Date(t);
  if (dt.getUTCMonth() !== m - 1) return null;
  return dt.toISOString().slice(0, 10);
}

function addDays(isoDay: string, days: number): string {
  return new Date(Date.parse(`${isoDay}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

/**
 * The release date a pre-order title states, or null. US and Canadian stores write month first, the others day first; a date
 * impossible that way round is read the other way. Only dates from 60 days ago to a year ahead count (a code like 48-75-21 is not).
 */
export function titleDate(title: string, region: Region, today: string): string | null {
  if (!PRE.test(title)) return null;
  const m = DATE.exec(title);
  if (!m) return null;
  const a = Number(m[1]);
  const b = Number(m[2]);
  const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  const monthFirst = region === "us" || region === "ca";
  const d = (monthFirst ? iso(y, a, b) : iso(y, b, a)) ?? (monthFirst ? iso(y, b, a) : iso(y, a, b));
  if (!d || d < addDays(today, -60) || d > addDays(today, 365)) return null;
  return d;
}

export interface PreorderInfo {
  /** Stores whose title says pre-order. */
  stores: number;
  /** The release date the stores state (the latest still to come), or null when none states one. */
  releaseDate: string | null;
  /** The cheapest pre-order price among them, cents. */
  cents: number;
}

/** Is this product on pre-order in a region (see the top of the file)? */
export function preorderInfo(offers: readonly Offer[], region: Region, today: string): PreorderInfo | null {
  const marked = offers.filter((o) => PRE.test(o.t));
  if (!marked.length) return null;
  const dates = marked.map((o) => titleDate(o.t, region, today)).filter((d): d is string => !!d);
  const future = dates.filter((d) => d >= today).sort();
  const stores = new Set(marked.map((o) => o.s)).size;
  if (dates.length && !future.length) return null;
  if (!dates.length && stores < 2) return null;
  return { stores, releaseDate: future.length ? future[future.length - 1] : null, cents: Math.min(...marked.map((o) => o.p)) };
}

export interface ReleaseItem {
  product: Product;
  preorder: PreorderInfo | null;
  /** Cheapest price any store asks (pre-order or in stock), cents. */
  cents: number;
  stores: number;
}

/** The day the import first ran: everything it saw that day was "new" to it, so nothing first seen then is an arrival. */
export function firstImportDay(products: readonly Pick<Product, "firstSeen">[]): string | null {
  let min: string | null = null;
  for (const p of products) {
    const d = p.firstSeen.slice(0, 10);
    if (!min || d < min) min = d;
  }
  return min;
}

/** A region's two lists: pre-orders (soonest stated date first, undated after, more stores first) and arrivals (newest first). */
export function releases(
  items: readonly { product: Product; offers: readonly Offer[] }[],
  region: Region,
  today: string,
  importDay: string | null,
): { preorders: ReleaseItem[]; arrivals: ReleaseItem[] } {
  const from = addDays(today, -ARRIVAL_DAYS);
  const preorders: ReleaseItem[] = [];
  const arrivals: ReleaseItem[] = [];
  for (const { product, offers } of items) {
    if (!offers.length) continue;
    const pre = preorderInfo(offers, region, today);
    const row: ReleaseItem = { product, preorder: pre, cents: Math.min(...offers.map((o) => o.p)), stores: new Set(offers.map((o) => o.s)).size };
    if (pre) preorders.push(row);
    else {
      const seen = product.firstSeen.slice(0, 10);
      if (seen >= from && (!importDay || seen > importDay)) arrivals.push(row);
    }
  }
  preorders.sort(
    (a, b) =>
      (a.preorder!.releaseDate ?? "9999").localeCompare(b.preorder!.releaseDate ?? "9999") ||
      b.preorder!.stores - a.preorder!.stores ||
      a.product.name.localeCompare(b.product.name),
  );
  arrivals.sort((a, b) => b.product.firstSeen.localeCompare(a.product.firstSeen) || b.stores - a.stores || a.product.name.localeCompare(b.product.name));
  return { preorders, arrivals };
}
