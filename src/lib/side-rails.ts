// The side rails' tiles (components/SideAds.tsx), computed once per region on the server: the import's own eBay matches for the
// most widely stocked kits (left) and today's deals (right), live listings only. Server-only (reads data/ through lib/data.ts).
import { pickTiles } from "@/components/EbayStrip";
import { ebayLabel, ebaySearchUrl } from "./affiliate";
import { mediansFor, summariesFor } from "./data";
import { MAX_TILES, type SideRails } from "./rails";
import { deals } from "./deals";
import type { Region } from "./regions";

const cache = new Map<Region, SideRails>();

export function sideRailsFor(region: Region): SideRails {
  const hit = cache.get(region);
  if (hit) return hit;
  const summaries = summariesFor(region);
  const popular = summaries.filter((s) => s.inStock > 0).slice(0, 60);
  const left = pickTiles(region, popular, 60, "side-ebay").filter((t) => t.image).slice(0, MAX_TILES);
  const seen = new Set(left.map((t) => t.id));
  const todays = deals(summaries, mediansFor(region))
    .map((d) => d.s)
    .filter((s) => !seen.has(s.product.id))
    .slice(0, 60);
  const right = pickTiles(region, todays, 60, "side-ebay-deals").filter((t) => t.image).slice(0, MAX_TILES);
  const rails: SideRails = { region, label: ebayLabel(region), all: ebaySearchUrl("Warhammer", region, "side-ebay"), left, right };
  cache.set(region, rails);
  return rails;
}
