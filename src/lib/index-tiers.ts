// Which pages Google is asked to index (lesson from the sister sites: thousands of thin pages split a new domain's
// crawl budget and its rankings). Pure, tested. A page that fails its tier is still served, noindex, out of the sitemap.
import type { Summary } from "./data";

/**
 * Stores that must list a product in a market before its page there is indexable (SEO audit, 2026-11-07: the same
 * product at five region URLs, and a one- or two-store copy reads as thin; DECISIONS.md 2026-11-07).
 */
export const MIN_INDEX_STORES = 3;

/** A product page in a market: a real comparison (three or more stores list it) and at least one in stock. */
export function productIndexable(s: Summary | null): boolean {
  return !!s && s.stores >= MIN_INDEX_STORES && s.inStock >= 1;
}

/** A hub (game, faction, type, store) page: enough indexable products to be worth a visit. */
export function hubIndexable(items: Summary[], min = 6): boolean {
  return items.filter(productIndexable).length >= min;
}

/**
 * The regions whose product and guide pages Google is asked to index (2026-11-08, ported from DexCompare after the owner's
 * Search Console audit there: a new site with no outside links offering a near-identical copy of every product and guide in
 * every region gets cautious treatment). New Zealand keeps every page for visitors, but its product and guide pages are
 * `noindex`, out of the sitemap and out of every hreflang set; its home, game, faction, type, store and sale hubs stay
 * indexable. Add it back once the core is indexed (recheck ~2026-11-25).
 */
export const INDEXED_DETAIL_REGIONS: readonly string[] = ["uk", "au", "ca", "us"];
export const detailIndexed = (region: string): boolean => INDEXED_DETAIL_REGIONS.includes(region);

/**
 * Product pages listed in each region's sitemap (SEO-5, 2026-11-10): 12,015 of the sitemap's 12,625 URLs were products,
 * Google held 7,540 and had 7,197 queued, for 44 clicks a week. A region lists at most this many (450: with each region's ~130 hub URLs the whole sitemap stays under 2,500), first every product
 * with search demand (a click or 10+ impressions), then the rest by stores with it in stock. A product left out stays
 * live and indexable under the three-store rule; it just isn't announced.
 */
export const SITEMAP_PRODUCTS = 450;

/** The products a region's sitemap lists, in order: demand first, then stock breadth, then id (stable). */
export function sitemapProducts(items: readonly Summary[], demand: ReadonlySet<string>, cap = SITEMAP_PRODUCTS): Summary[] {
  return items
    .filter(productIndexable)
    .map((s) => ({ s, d: demand.has(s.product.id) ? 1 : 0 }))
    .sort((a, b) => b.d - a.d || b.s.inStock - a.s.inStock || (a.s.product.id < b.s.product.id ? -1 : 1))
    .slice(0, cap)
    .map((x) => x.s);
}
