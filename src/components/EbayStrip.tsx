import { EBAY_DISCLOSURE, ebayAffiliateUrl, ebayLabel, ebaySearchUrl, REL_PAID, type Placement } from "@/lib/affiliate";
import { SYSTEM_BY_SLUG } from "@/lib/catalog";
import { ebayFor, type Summary } from "@/lib/data";
import { formatPrice, type Region } from "@/lib/regions";
import { OutboundLink } from "./OutboundLink";

/**
 * A row of eBay tiles for real products (owner, 2026-10-28: eBay is the main commission until Wayland approves us, so eBay ads go
 * across the site). A tile shows the cheapest matching new Buy It Now listing when the eBay pass has one (its photo and price),
 * else a tagged search for that product: never a store's photo, never a price we did not see. Labelled Ad, in its own box, never
 * mixed into the store comparison, and never a pop-up. Server only: it reads data/ebay.json through lib/data.ts.
 */
export function EbayStrip({ region, items, placement, heading, max = 6 }: { region: Region; items: Summary[]; placement: Placement; heading: string; max?: number }) {
  const tiles = pickTiles(region, items, max, placement);
  if (!tiles.length) return null;
  const priceRegion: Region = region === "nz" ? "au" : region; // NZ is shown eBay Australia, in A$
  return (
    <section className="ad-box p-4 sm:p-5" aria-label={`${heading} (advertisement)`} data-ebay-strip={placement}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="ad-pill">Ad</span> {heading}
        </h2>
        <OutboundLink href={ebaySearchUrl("Warhammer", region, placement)} rel={REL_PAID} retailer={ebayLabel(region)} placement={placement} className="text-sm font-semibold text-brand">
          More on {ebayLabel(region)} →
        </OutboundLink>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t) => (
          <li key={t.id}>
            <OutboundLink href={t.href} rel={REL_PAID} retailer={ebayLabel(region)} placement={placement} className="flex h-full flex-col overflow-hidden rounded-xl border border-ad-line bg-surface transition-shadow hover:shadow-lift">
              {t.image ? (
                <div className="plate m-2 aspect-square">
                  <img src={t.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain p-1" />
                </div>
              ) : (
                <div className="m-2 flex aspect-square items-center justify-center rounded-lg bg-ad p-3 text-center text-xs font-semibold text-muted">{t.system}</div>
              )}
              <div className="flex flex-1 flex-col gap-1 px-3 pb-3">
                <p className="line-clamp-2 text-sm font-semibold leading-snug">{t.name}</p>
                <p className="mt-auto pt-1 text-sm">
                  {t.price != null ? <span className="tabular font-bold">{formatPrice(t.price, priceRegion)}</span> : <span className="font-semibold text-brand">Search new listings</span>}
                </p>
              </div>
            </OutboundLink>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-faint">{EBAY_DISCLOSURE} New, Buy It Now. eBay sellers are not part of our store comparison.</p>
    </section>
  );
}

interface Tile {
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
    if (e) withItem.push({ ...base, href: ebayAffiliateUrl(e.u, region, placement), image: e.i, price: e.p });
    else search.push({ ...base, href: ebaySearchUrl(p.name, region, placement), image: null, price: null });
  }
  return [...withItem, ...search].slice(0, max);
}

function systemLabel(system: string | null): string {
  return (system && SYSTEM_BY_SLUG.get(system)?.name) || "Games Workshop";
}
