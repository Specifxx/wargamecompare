"use client";

import { useEffect, useState } from "react";
import { EBAY_DISCLOSURE, REL_PAID, type Placement } from "@/lib/affiliate";
import { GUTTER, MAX_TILES, MIN_TILES, MIN_WIDTH, RAIL_EDGE, RAIL_W, railFits, type SideRails } from "@/lib/rails";
import { formatPrice, type Region } from "@/lib/regions";
import type { Tile } from "./EbayStrip";
import { OutboundLink } from "./OutboundLink";
import { useSoftRegion } from "./SoftRegion";

// The two side rails (ported from the Dex / MTG Compare engine, owner 2026-11-04: "the new ad change … as much juice out of the
// eBay API as possible"): real eBay Buy It Now listings stacked down the far left and far right of a wide screen, OUTSIDE the
// page shell (max-w-shell, 1480px), fixed beside it under the sticky header. Left: the most widely stocked kits; right: today's
// deals. Games Workshop has no TCGplayer, so both rails are eBay's (the import's own matches, data/ebay.json, through
// EbayStrip.pickTiles in lib/side-rails.ts on the server): no request, no extra eBay call.
//
//   • Browser only, from 1280px wide (owner 2026-11-06: every regular 16:9 and 16:10 screen). Nothing is in the server HTML: the
//     rails mount after hydration and only while the viewport is at least MIN_WIDTH wide, so crawlers, tablets and phones never
//     see them (no SEO change, CLS 0: a fixed element takes no space; the room beside the shell is CSS, globals.css).
//   • Each rail runs from under the header to the window's foot and scrolls through up to ten tiles (owner 2026-11-06), popular
//     first; a window too short for one whole tile shows no rail. Only tiles with a live listing (a photo and a delivered price):
//     a rail of bare searches is noise.
//   • Labelled "Ad" with the affiliate note, every link rel sponsored under its own placement tag (side-ebay, side-ebay-deals).
//     Not a pop-up: nothing moves, covers content or asks for anything.

export { MAX_TILES, MIN_WIDTH, TILE_H, railFits, type SideRails } from "@/lib/rails";

export function SideAds({ rails }: { rails: SideRails }) {
  const [fit, setFit] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`);
    const update = () => setFit(mq.matches && railFits(window.innerHeight));
    update();
    mq.addEventListener("change", update);
    window.addEventListener("resize", update, { passive: true });
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  if (!fit) return null;
  return (
    <>
      <Rail side="left" rails={rails} tiles={rails.left} placement="side-ebay" heading="Popular kits" />
      <Rail side="right" rails={rails} tiles={rails.right} placement="side-ebay-deals" heading="Top deals" />
    </>
  );
}

/**
 * The same rails on the pages with no region of their own (the home page, About…; owner 2026-11-06: "the home page must have this
 * as well"), in the visitor's suggested or picked region (SoftRegion.tsx), like their header and sidebar. `all`: every region's
 * rails, computed on the server (lib/side-rails.ts sideRailsFor).
 */
export function SoftSideAds({ all }: { all: Record<Region, SideRails> }) {
  return <SideAds rails={all[useSoftRegion()]} />;
}

const RAIL = "fixed z-30 hidden flex-col rounded-xl border border-ad-line bg-surface p-2 shadow-card min-[1280px]:flex";
const TILE = "group flex flex-col rounded-lg border border-line bg-surface p-2 transition-colors hover:border-ink/40";

function Rail({ side, rails, tiles, placement, heading }: { side: "left" | "right"; rails: SideRails; tiles: Tile[]; placement: Placement; heading: string }) {
  if (tiles.length < MIN_TILES) return null;
  const priceRegion: Region = rails.region === "nz" ? "au" : rails.region;
  return (
    <div
      role="group"
      data-ad={placement}
      aria-label={`Sponsored: ${heading.toLowerCase()} on ${rails.label}`}
      className={RAIL}
      style={{ top: `calc(var(--hdr) + ${GUTTER}px)`, bottom: GUTTER, width: RAIL_W, ...(side === "left" ? { left: RAIL_EDGE } : { right: RAIL_EDGE }) }}
    >
      <div className="mb-2 flex h-[22px] shrink-0 items-center justify-between px-1">
        <span className="truncate text-[13px] font-black tracking-tight" aria-hidden="true">
          {heading}
        </span>
        <span className="ad-pill">Ad</span>
      </div>
      <ul role="list" className="rail-scroll grid min-h-0 flex-1 content-start gap-2 overflow-y-auto overscroll-contain">
        {tiles.slice(0, MAX_TILES).map((t) => (
          <li key={t.id}>
            <OutboundLink href={t.href} rel={REL_PAID} retailer={rails.label} placement={placement} className={TILE}>
              <span className="plate relative block aspect-square w-full overflow-hidden rounded-md">
                {t.image && <img src={t.image} alt={`${t.name} on eBay`} width={128} height={128} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-contain p-1" />}
              </span>
              <span className="mt-1.5 line-clamp-2 h-9 text-xs font-semibold leading-[18px] group-hover:text-brand">{t.name}</span>
              <span className="tabular block h-5 truncate text-[15px] font-bold leading-5">{t.price != null ? formatPrice(t.price, priceRegion) : ""}</span>
              <span className="sr-only">, on {rails.label}</span>
            </OutboundLink>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex h-[26px] shrink-0 flex-col justify-center px-1 text-[10px] leading-[13px] text-muted" title={EBAY_DISCLOSURE}>
        <OutboundLink href={rails.all} rel={REL_PAID} retailer={rails.label} placement={placement} className="truncate font-bold text-brand">
          More on {rails.label} →
        </OutboundLink>
        <span className="truncate">Affiliate · delivered</span>
      </p>
    </div>
  );
}
