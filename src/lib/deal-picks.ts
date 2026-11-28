// The deals card's products (components/DealsPopup.tsx; owner, 2026-11-28: "the sites without TCGplayer … eBay or Amazon
// pop-ups, especially with Black Friday deals … with actual products"), computed on the server for the page's region:
//
//   • Amazon first: products of OUR catalogue (Amazon's exception for pop-ups promoting "Products closely associated with the
//     materials on your Site") whose Amazon item the build priced (lib/amazon-live.ts, under 24 hours old), with that price's
//     time; the browser drops it after 24 hours. A link to that item only (/dp/), never a deals or category page. Not in New
//     Zealand, whose Amazon is Australia's in another currency.
//   • eBay to fill: the import's live Buy It Now matches (a photo and a delivered price), most widely stocked first.
//   • Nothing is invented: no "was" price, no saving of ours, no countdown. Server-only: reads data/.
import { amazonItemUrl, ebayAffiliateUrl } from "./affiliate";
import { AMAZON_CLOCK, amazonLive, storeFor } from "./amazon-live";
import { ebayFor, summariesFor } from "./data";
import { formatPrice, type Region } from "./regions";

export const MAX_PICKS = 4;
export const MIN_PICKS = 2;

export interface DealPick {
  id: string;
  brand: "amazon" | "ebay";
  name: string;
  img: string;
  price: string;
  href: string;
  at?: string;
  deal?: string;
  off?: number;
  until?: string;
}

export interface DealPicks {
  region: string;
  picks: DealPick[];
  clock: { timeZone: string; label: string } | null;
}

const cache = new Map<Region, DealPicks>();

export function dealPicksFor(region: Region): DealPicks {
  const hit = cache.get(region);
  if (hit) return hit;
  const popular = summariesFor(region).filter((s) => s.inStock > 0).slice(0, 300);
  const picks: DealPick[] = [];
  if (region !== "nz") {
    for (const s of popular) {
      if (picks.length >= 2) break;
      const p = s.product;
      if (!p.image) continue;
      const a = amazonLive(p.ean, region);
      if (!a) continue;
      const href = amazonItemUrl(a.asin, region, "deals-popup-amazon");
      if (!href) continue;
      picks.push({ id: p.id, brand: "amazon", name: p.name, img: p.image, price: formatPrice(a.p, region), href, at: a.at });
    }
  }
  for (const s of popular) {
    if (picks.length >= MAX_PICKS) break;
    const p = s.product;
    if (picks.some((x) => x.id === p.id)) continue;
    const e = ebayFor(p.id, region);
    const img = e?.i ?? null;
    if (!e || !img) continue;
    picks.push({ id: p.id, brand: "ebay", name: p.name, img, price: formatPrice(e.p + (e.sh ?? 0), region === "nz" ? "au" : region), href: ebayAffiliateUrl(e.u, region, "deals-popup-ebay") });
  }
  const out: DealPicks = { region, picks: picks.length >= MIN_PICKS ? picks : [], clock: region === "nz" ? null : AMAZON_CLOCK[storeFor(region)] };
  cache.set(region, out);
  return out;
}
