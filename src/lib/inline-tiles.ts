// The ad block's and the phone dock's tiles (components/InlineAds.tsx, DockAds.tsx), computed once per region on the server: the import's own eBay matches for the
// most widely stocked kits (left) and today's deals (right), live listings only. Server-only (reads data/ through lib/data.ts).
import { pickTiles } from "./ebay-tiles";
import { ebayLabel, ebaySearchUrl } from "./affiliate";
import { mediansFor, summariesFor } from "./data";
import { MAX_TILES, type AdTiles } from "./inline-ads";
import { deals } from "./deals";
import type { Region } from "./regions";

const cache = new Map<Region, AdTiles>();

export function adTilesFor(region: Region): AdTiles {
  const hit = cache.get(region);
  if (hit) return hit;
  const summaries = summariesFor(region);
  const popular = summaries.filter((s) => s.inStock > 0).slice(0, 60);
  const left = pickTiles(region, popular, 60, "inline-ebay").filter((t) => t.image).slice(0, MAX_TILES);
  const seen = new Set(left.map((t) => t.id));
  const todays = deals(summaries, mediansFor(region))
    .map((d) => d.s)
    .filter((s) => !seen.has(s.product.id))
    .slice(0, 60);
  const right = pickTiles(region, todays, 60, "inline-ebay-deals").filter((t) => t.image).slice(0, MAX_TILES);
  const tiles: AdTiles = { region, label: ebayLabel(region), all: ebaySearchUrl("Warhammer", region, "inline-ebay-all"), left, right };
  cache.set(region, tiles);
  return tiles;
}
