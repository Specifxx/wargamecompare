"use client";
// The quick view's eBay ads (owner, 2026-11-18: "ads can show in the quick view"): up to six live eBay listings of other kits
// from the same game, under the quick view's price list. The quick view opens only after a visitor clicks a product, so this
// comes after engagement and is never in a crawled page's HTML. Labelled "Ad", rel sponsored, tagged `quickview-ebay-more`;
// never a price row, never "the cheapest", never Amazon. Tiles come from /api/quick (lib/ebay-tiles.ts), no eBay call.
import { EBAY_DISCLOSURE, REL_PAID } from "@/lib/affiliate";
import type { Tile } from "@/lib/ebay-tiles";
import { formatPrice, type Region } from "@/lib/regions";
import { OutboundLink } from "./OutboundLink";

export interface QuickEbayAdsData {
  label: string;
  tiles: Tile[];
}

export function QuickEbayAds({ data, region }: { data: QuickEbayAdsData; region: Region }) {
  if (data.tiles.length < 3) return null;
  const priceRegion: Region = region === "nz" ? "au" : region;
  return (
    <aside data-ad="quickview" aria-label={`Sponsored listings on ${data.label}`} className="card mt-4 p-3">
      <p className="flex items-center gap-2 text-xs text-muted">
        <span className="ad-pill">Ad</span>
        <span className="truncate">More from this game on {data.label}</span>
      </p>
      <ul role="list" className="scroller mt-2 items-start gap-2">
        {data.tiles.map((t) => (
          <li key={t.id} className="w-[112px]">
            <OutboundLink href={t.href} rel={REL_PAID} retailer={data.label} placement="quickview-ebay-more" className="group flex h-full flex-col rounded-lg border border-line bg-surface p-1.5 transition-colors hover:border-ink/40">
              <span className="plate relative block aspect-square w-full">
                {t.image && <img src={t.image} alt={`${t.name} on eBay`} width={100} height={100} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-contain p-1" />}
              </span>
              <span className="mt-1 line-clamp-2 h-8 text-[11px] font-semibold leading-4 group-hover:text-brand">{t.name}</span>
              <span className="tabular block truncate text-sm font-bold">{t.price != null ? formatPrice(t.price, priceRegion) : ""}</span>
            </OutboundLink>
          </li>
        ))}
      </ul>
      <p className="mt-1.5 text-[10px] leading-[13px] text-muted">{EBAY_DISCLOSURE} New, Buy It Now, prices include postage.</p>
    </aside>
  );
}
