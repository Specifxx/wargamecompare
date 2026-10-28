// Which pages Google is asked to index (lesson from the sister sites: thousands of thin pages split a new domain's
// crawl budget and its rankings). Pure, tested. A page that fails its tier is still served, noindex, out of the sitemap.
import type { Summary } from "./data";

/** A product page in a market: a real comparison (two or more stores list it) and at least one in stock. */
export function productIndexable(s: Summary | null): boolean {
  return !!s && s.stores >= 2 && s.inStock >= 1;
}

/** A hub (game, faction, type, store) page: enough indexable products to be worth a visit. */
export function hubIndexable(items: Summary[], min = 6): boolean {
  return items.filter(productIndexable).length >= min;
}
