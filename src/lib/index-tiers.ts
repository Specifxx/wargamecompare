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
