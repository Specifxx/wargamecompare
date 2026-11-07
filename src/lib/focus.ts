// What WargameCompare lists (the low-traction cull, owner 2026-11-07: "any products that are not trendy, or very low traction or
// conversion, we probably want to get rid of", as Compare Empire's focus cull did). DECISIONS.md, 2026-11-07.
//
// A product gets a page when any of these holds:
//   - Search Console shows people finding its page (a click, or 10+ impressions in 56 days, any region: data/focus/demand.json,
//     refreshed by refresh-prices.yml from the `demand` branch);
//   - it is on pre-order in a region, or newly arrived and in stock somewhere (lib/releases.ts): new releases are the demand;
//   - two or more stores have it in stock in one region (it is a comparison).
// Everything else (on 2026-11-07: 1,464 of 6,701 products in stock nowhere, 1,578 at one store only) is culled: lib/data.ts
// leaves it out of every list, the sitemap and search, and its URL 301s to its type page. Nothing is deleted: the import still
// reads it, so a product that qualifies again is back at the same URL the next release. PURE (tests/focus.test.ts).
import { ARRIVAL_DAYS, preorderInfo } from "./releases";
import { REGIONS, type Region } from "./regions";
import type { OffersFile, Product } from "./types";

export const DEMAND_MIN_IMPRESSIONS = 10;

/** Product ids with real search demand, from gsc-pages.json's `pages` (paths like /au/p/<id>). */
export function demandIds(pages: Record<string, number[]>): string[] {
  const out = new Set<string>();
  for (const [path, [clicks = 0, impressions = 0]] of Object.entries(pages)) {
    const m = /^\/[a-z]{2}\/p\/([^/]+)$/.exec(path);
    if (m && (clicks > 0 || impressions >= DEMAND_MIN_IMPRESSIONS)) out.add(decodeURIComponent(m[1]));
  }
  return [...out].sort();
}

export function focusCatalog(products: readonly Product[], offers: OffersFile, demand: ReadonlySet<string>, today: string, importDay: string | null) {
  const from = new Date(Date.parse(`${today}T00:00:00Z`) - ARRIVAL_DAYS * 86_400_000).toISOString().slice(0, 10);
  const keep = new Set<string>();
  const culled = new Map<string, string>();
  for (const p of products) {
    let ok = demand.has(p.id);
    const seen = p.firstSeen.slice(0, 10);
    const arrived = seen >= from && (!importDay || seen > importDay);
    for (const r of Object.keys(REGIONS) as Region[]) {
      if (ok) break;
      const list = offers[REGIONS[r].market]?.[p.id] ?? [];
      if (!list.length) continue;
      const inStock = new Set(list.filter((o) => o.in).map((o) => o.s)).size;
      // A new arrival needs one store selling it now (a store read for the first time brings its old stock in as "new").
      if (inStock >= 2 || (arrived && inStock >= 1) || preorderInfo(list, r, today)) ok = true;
    }
    if (ok) keep.add(p.id);
    else culled.set(p.id, p.type);
  }
  return { keep, culled };
}
