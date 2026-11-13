// The eBay tiles of the ad block and the phone dock (components/InlineAds.tsx, DockAds.tsx): real products with their live eBay
// listing (photo and delivered price), else a tagged search. Server-only (reads data/ebay.json through lib/data.ts).
import { ebayAffiliateUrl, ebaySearchUrl, type Placement } from "@/lib/affiliate";
import { SYSTEM_BY_SLUG } from "@/lib/catalog";
import { ebayFor, type Summary } from "@/lib/data";
import type { Region } from "@/lib/regions";

export interface Tile {
  id: string;
  name: string;
  system: string;
  href: string;
  image: string | null;
  price: number | null;
}

/** The tiles: products with a live eBay listing first (they carry a photo and a price), then searches, in the order given. */
export function pickTiles(region: Region, items: Summary[], max: number, placement: Placement): Tile[] {
  const seen = new Set<string>();
  const withItem: Tile[] = [];
  const search: Tile[] = [];
  for (const s of items) {
    const p = s.product;
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    const e = ebayFor(p.id, region);
    const base = { id: p.id, name: p.name, system: systemLabel(p.system) };
    if (e) withItem.push({ ...base, href: ebayAffiliateUrl(e.u, region, placement), image: e.i, price: e.p + (e.sh ?? 0) });
    else search.push({ ...base, href: ebaySearchUrl(p.name, region, placement), image: null, price: null });
  }
  return [...withItem, ...search].slice(0, max);
}

function systemLabel(system: string | null): string {
  return (system && SYSTEM_BY_SLUG.get(system)?.name) || "Games Workshop";
}
