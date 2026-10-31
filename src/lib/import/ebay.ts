// eBay Browse API: the cheapest NEW Buy It Now listing that is really this product, per eBay site, for the products
// worth a call. GitHub Actions only (scripts/ebay.ts); the website never calls eBay and holds no eBay credential.
//
// THE KEYSET is the owner's second eBay account's app, shared with FigureCompare and nothing else (owner, 2026-10-29):
// 5,000 Browse calls a day, 2,500 each. The run spends at most EBAY_DAILY_CAP (default 2,500) and never more than the
// app's own remaining count minus a reserve.
//
// THE ROWS are display only: shown as a labelled marketplace row pinned above the stores, never counted as a store, never
// the "best price", never in deals.
import { titleTokens } from "@/lib/identify";
import { refuse } from "@/lib/listing-filter";
import type { Market } from "@/lib/regions";
import type { EbayFile, EbayItem, Product } from "@/lib/types";

// Local sellers only (visitor feedback, 2026-10-31: "a lot of these are OS shipping costs ... a lot of wasted clicks").
// `country` limits the search to items located in the market's own country and delivered there, and `zip` (a central
// postcode) lets eBay quote real postage instead of "calculated": a row without a known postage cost is never kept.
export const EBAY_SITES: Partial<Record<Market, { id: string; currency: string; country: string; zip: string }>> = {
  UK: { id: "EBAY_GB", currency: "GBP", country: "GB", zip: "B1 1AA" },
  US: { id: "EBAY_US", currency: "USD", country: "US", zip: "64101" },
  AU: { id: "EBAY_AU", currency: "AUD", country: "AU", zip: "2000" },
  CA: { id: "EBAY_CA", currency: "CAD", country: "CA", zip: "M5V 2T6" },
};

/** The Browse search's filter: new, Buy It Now, in the price window, from a seller in the market's own country. */
export function searchFilter(market: Market, ref: number): string {
  const site = EBAY_SITES[market]!;
  return [
    "buyingOptions:{FIXED_PRICE}",
    "conditionIds:{1000}",
    `price:[${Math.floor((ref * 0.5) / 100)}..${Math.ceil((ref * 1.4) / 100)}]`,
    `priceCurrency:${site.currency}`,
    `itemLocationCountry:${site.country}`,
    `deliveryCountry:${site.country}`,
  ].join(",");
}

/** The end-user context header: the affiliate campaign, and where the buyer is (so eBay quotes postage to there). */
export function endUserContext(market: Market, campaign: string | null, ref: string): string {
  const site = EBAY_SITES[market]!;
  const parts = [`contextualLocation=${encodeURIComponent(`country=${site.country},zip=${site.zip}`)}`];
  if (campaign) parts.unshift(`affiliateCampaignId=${campaign}`, `affiliateReferenceId=${ref}`);
  return parts.join(",");
}

export { ebayRowShown, LOCAL_POSTAGE_MAX } from "@/lib/ebay-rows";
/** Share of each run's budget per eBay site (UK first: the biggest Warhammer market we compare). */
export const SHARE: Partial<Record<Market, number>> = { UK: 0.35, AU: 0.25, US: 0.25, CA: 0.15 };
/** Under this reference price (in the site's currency units) a buyer saves pennies: no call. */
export const MIN_REF_UNITS = 15;

export interface Candidate {
  product: Product;
  market: Market;
  ref: number; // cents: the best store price (or RRP) in that market
  stores: number;
}

/** Hours between checks: big-ticket and widely stocked products more often. */
export function intervalHours(refUnits: number, stores: number): number {
  if (refUnits >= 100 || stores >= 8) return 24;
  if (refUnits >= 40 || stores >= 4) return 48;
  return 96;
}

export function plan(cands: Candidate[], state: EbayFile, budget: number, now: Date): Candidate[] {
  const out: Candidate[] = [];
  for (const [market, share] of Object.entries(SHARE) as [Market, number][]) {
    const slots = Math.floor(budget * share);
    const pool = cands
      .filter((c) => c.market === market && c.ref / 100 >= MIN_REF_UNITS)
      .map((c) => {
        const row = state.items[market]?.[c.product.id];
        // A row from the older worldwide search is due now: it may be an overseas seller's.
        const at = row ? (row.l ? row.at : undefined) : state.checked?.[market]?.[c.product.id];
        const age = at ? (now.getTime() - Date.parse(at)) / 3_600_000 : Infinity;
        const interval = intervalHours(c.ref / 100, c.stores);
        const overdue = Math.min(3, age / interval);
        return { c, due: age >= interval, score: Math.log10(c.ref) * (1 + Math.log2(1 + c.stores)) * (Number.isFinite(overdue) ? overdue : 3) };
      })
      .filter((x) => x.due)
      .sort((a, b) => b.score - a.score);
    out.push(...pool.slice(0, slots).map((x) => x.c));
  }
  return out;
}

const JUNK = /\blot\b|\bjob lot\b|\bbundle\b|\bx\s?[2-9]\b|\b[2-9]\s?x\b|\bbits?\b|\bsprues?\b|\bunbuilt\b|\bopened\b|\bspares?\b|\bcustom\b|\bpainted\b|\bstl\b|\b3d\b|\bresin\b|\bproxy\b|\bcompatible\b|\balternative\b|\bnot gw\b|\bdecals?\b|\btransfers?\b|\bcards? only\b|\bbox only\b|\bempty\b|\bjapanese\b|\bgerman\b|\bfrench\b|\bspanish\b|\bitalian\b/i;

/** Does an eBay title describe this product (new, whole, the same kit)? */
export function listingMatches(p: Product, title: string): boolean {
  if (JUNK.test(title)) return false;
  if (refuse({ title, vendor: "", productType: "", tags: [], hasCode: true }) === "not-new") return false;
  const want = [...new Set(titleTokens(p.name))].filter((t) => t.length > 1 || /\d/.test(t));
  if (!want.length) return false;
  const have = new Set(titleTokens(title).map((t) => t.replace(/s$/, "")));
  const hit = want.filter((t) => have.has(t.replace(/s$/, ""))).length;
  if (hit / want.length < 0.8) return false;
  // A number in the product's name (Tone Pro "Khemri Sands 3", "Combat Patrol 2024") must be in the listing too.
  for (const n of want.filter((t) => /^\d+$/.test(t))) if (!have.has(n)) return false;
  return true;
}

interface ItemSummary {
  title: string;
  price?: { value: string; currency: string };
  shippingOptions?: { shippingCost?: { value: string; currency?: string }; shippingCostType?: string }[];
  itemLocation?: { country?: string };
  itemWebUrl: string;
  itemAffiliateWebUrl?: string;
  image?: { imageUrl?: string };
}

/**
 * The cheapest matching listing, item plus postage, among one search's results. Only a seller in `country` (when given)
 * and only a listing whose postage is known: the row shows the delivered price, so an unknown postage is no row.
 */
export function pickBest(p: Product, items: ItemSummary[], currency: string, ref: number, now: string, country?: string): EbayItem | null {
  let best: EbayItem | null = null;
  for (const it of items) {
    if (!it.price || it.price.currency !== currency) continue;
    if (country && it.itemLocation?.country && it.itemLocation.country !== country) continue;
    const cents = Math.round(Number(it.price.value) * 100);
    if (!Number.isFinite(cents) || cents < ref * 0.5 || cents > ref * 1.4) continue;
    if (!listingMatches(p, it.title)) continue;
    const ship = it.shippingOptions?.[0]?.shippingCost?.value;
    const sh = ship != null && (it.shippingOptions?.[0]?.shippingCost?.currency ?? currency) === currency ? Math.round(Number(ship) * 100) : null;
    if (sh == null || !Number.isFinite(sh)) continue;
    const total = cents + sh;
    if (!best || total < best.p + (best.sh ?? 0)) {
      best = { p: cents, sh, u: it.itemAffiliateWebUrl || it.itemWebUrl, t: it.title.slice(0, 120), i: it.image?.imageUrl ?? null, at: now, ...(country ? { l: country } : {}) };
    }
  }
  return best;
}

export function searchQuery(p: Product): string {
  return p.name
    .replace(/\([^)]*\)|\[[^\]]*\]/g, " ")
    .replace(/[:|,–—-]/g, " ")
    .replace(/['’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
