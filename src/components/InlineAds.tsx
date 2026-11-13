"use client";
// The ONE ad block of a page (owner, 2026-11-13: "one bigger, subtler horizontal ad … inside the page content … native", in place of
// the side rails and the eBay strips): a full-column-width card of up to six larger tiles, popular kits and today's deals taking
// turns, scrolling sideways where the column is narrow. Games Workshop has no TCGplayer and Amazon and Wayland have no stored
// prices, so it is eBay only: the import's own live Buy It Now matches (data/ebay.json, lib/inline-tiles.ts), no request, no extra
// eBay call.
//
//   • Calm: the site's own card, border and surface tokens, a small muted "Ad" pill, no brand colours, nothing floating or fixed.
//   • Browser only, like the rails it replaces: the server sends an empty box of the block's exact height (INLINE_H), so no crawler
//     sees it and the page never moves (CLS 0). It draws after hydration, and only when there are enough tiles.
//   • One per page, from the two layouts: below the page's main content and above the footer, never beside a buy button, never above
//     a price, never in the quick view. Every link is rel sponsored under `inline-ebay`, `inline-ebay-deals` or `inline-ebay-all`.
import { useEffect, useState } from "react";
import { EBAY_DISCLOSURE, REL_PAID, type Placement } from "@/lib/affiliate";
import { INLINE_H, inlineReady, pickInline, type AdTiles } from "@/lib/inline-ads";
import { formatPrice, X_DEFAULT_REGION, type Region } from "@/lib/regions";
import { OutboundLink } from "./OutboundLink";
import { useSoftRegion } from "./SoftRegion";

const TILE = "group flex h-full flex-col rounded-lg border border-line bg-surface p-2 transition-colors hover:border-ink/40";

export function InlineAds({ tiles: data }: { tiles: AdTiles }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!inlineReady(data)) return null;
  if (!mounted) return <div aria-hidden="true" style={{ minHeight: INLINE_H }} />;
  return <Block data={data} />;
}

/** The same block on the pages with no region of their own (the home page, About…), in the visitor's suggested or picked region. */
export function SoftInlineAds({ all }: { all: Record<Region, AdTiles> }) {
  const region = useSoftRegion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!inlineReady(all[X_DEFAULT_REGION])) return null;
  if (!mounted) return <div aria-hidden="true" style={{ minHeight: INLINE_H }} />;
  return inlineReady(all[region]) ? <Block data={all[region]} /> : null;
}

function Block({ data }: { data: AdTiles }) {
  const priceRegion: Region = data.region === "nz" ? "au" : data.region;
  const dealIds = new Set(data.right.map((t) => t.id));
  const picked = pickInline(data);
  return (
    <aside data-ad="inline" aria-label={`Sponsored listings on ${data.label}`} className="card p-4" style={{ minHeight: INLINE_H }}>
      <div className="flex h-8 items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-xs text-muted">
          <span className="ad-pill">Ad</span>
          <span className="truncate">Sponsored listings</span>
        </p>
        <OutboundLink href={data.all} rel={REL_PAID} retailer={data.label} placement="inline-ebay-all" className="shrink-0 whitespace-nowrap text-xs font-semibold text-muted hover:text-ink hover:underline">
          All on {data.label} →
        </OutboundLink>
      </div>
      <ul role="list" className="scroller mt-3 h-[252px] items-start gap-3">
        {picked.map((t) => {
          const placement: Placement = dealIds.has(t.id) ? "inline-ebay-deals" : "inline-ebay";
          return (
            <li key={t.id} className="w-[172px]">
              <OutboundLink href={t.href} rel={REL_PAID} retailer={data.label} placement={placement} className={TILE}>
                <span className="plate relative block aspect-square w-full">
                  {t.image && <img src={t.image} alt={`${t.name} on eBay`} width={154} height={154} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-contain p-1.5" />}
                </span>
                <span className="mt-1.5 line-clamp-2 h-9 text-xs font-semibold leading-[18px] group-hover:text-brand">{t.name}</span>
                <span className="tabular block h-5 truncate text-[15px] font-bold leading-5">{t.price != null ? formatPrice(t.price, priceRegion) : ""}</span>
                <span className="block h-4 truncate text-[10px] font-semibold uppercase leading-4 tracking-wide text-muted">{dealIds.has(t.id) ? "eBay · deal" : "eBay · delivered"}</span>
                <span className="sr-only">, on {data.label}</span>
              </OutboundLink>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 min-h-[28px] text-[11px] leading-[14px] text-muted">{EBAY_DISCLOSURE} New, Buy It Now, prices include postage.</p>
    </aside>
  );
}
