"use client";

import { useEffect, useState } from "react";
import { EBAY_DISCLOSURE, REL_PAID, type Placement } from "@/lib/affiliate";
import { MAX_TILES, MIN_TILES, MIN_WIDTH, RAIL_EDGE, RAIL_W, railFits, type SideRails } from "@/lib/rails";
import { formatPrice, type Region } from "@/lib/regions";
import type { Tile } from "./EbayStrip";
import { OutboundLink } from "./OutboundLink";
import { AdDock, DockGate, DockTile, DOCK_LINK, type DockSide } from "./AdDock";
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

/**
 * The side rails are OFF (owner, 2026-11-13: "banner ads on the side … doesn't look as good … fill in that space on the side again").
 * The ads are the horizontal strips inside the page (and the phone dock on small screens). The rail code below stays so a rail can
 * be tried again; nothing renders it while this is false, and globals.css gives the page column the whole width.
 */
export const SIDE_RAILS = false;

export function SideAds({ rails }: { rails: SideRails }) {
  const [fit, setFit] = useState(false);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`);
    const update = () => {
      setFit(mq.matches && railFits(window.innerHeight));
      setNarrow(!mq.matches);
    };
    update();
    mq.addEventListener("change", update);
    window.addEventListener("resize", update, { passive: true });
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  // Too narrow for the rails (phones, tablets, a small window): the same tiles in the phone dock (AdDock.tsx).
  if (narrow) return <PhoneDock rails={rails} />;
  if (!SIDE_RAILS || !fit) return null;
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

const RAIL = "fixed z-30 hidden flex-col border-ad-line bg-surface min-[1280px]:flex";
const TILE = "group flex flex-col border-b border-line bg-surface p-2 transition-colors hover:bg-raised";

function Rail({ side, rails, tiles, placement, heading }: { side: "left" | "right"; rails: SideRails; tiles: Tile[]; placement: Placement; heading: string }) {
  if (tiles.length < MIN_TILES) return null;
  const priceRegion: Region = rails.region === "nz" ? "au" : rails.region;
  return (
    <div
      role="group"
      data-ad={placement}
      aria-label={`Sponsored: ${heading.toLowerCase()} on ${rails.label}`}
      className={RAIL}
      style={{ top: "var(--hdr)", bottom: 0, width: RAIL_W, ...(side === "left" ? { left: RAIL_EDGE, borderRightWidth: 1 } : { right: RAIL_EDGE, borderLeftWidth: 1 }) }}
    >
      <div className="flex h-[30px] shrink-0 items-center justify-between px-2">
        <span className="truncate text-[13px] font-black tracking-tight" aria-hidden="true">
          {heading}
        </span>
        <span className="ad-pill">Ad</span>
      </div>
      <ul role="list" className="rail-scroll grid min-h-0 flex-1 content-start overflow-y-auto overscroll-contain border-t border-line">
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
      <p className="flex h-[34px] shrink-0 flex-col justify-center px-2 text-[10px] leading-[13px] text-muted" title={EBAY_DISCLOSURE}>
        <OutboundLink href={rails.all} rel={REL_PAID} retailer={rails.label} placement={placement} className="truncate font-bold text-brand">
          More on {rails.label} →
        </OutboundLink>
        <span className="truncate">Affiliate · delivered</span>
      </p>
    </div>
  );
}

/** The rails' tag with the dock's placement in it (side-ebay → dock-ebay), so EPN's customid report tells the two apart. Pure. */
export function dockHref(href: string): string {
  return href.replace(/(customid=wgc-[a-z]+-)side-ebay/, "$1dock-ebay");
}

/**
 * The phone dock (owner, 2026-11-06: the rails "on mobile … in the best way that doesn't interrupt user experience"): the rails'
 * tiles, popular kits and today's deals taking turns, in one bar along the foot of a narrow screen. AdDock.tsx has the rules; it
 * yields to every eBay unit on the page (.ad-box) and never shows on a product page (the buy bar, data-sticky-buy).
 */
function PhoneDock({ rails }: { rails: SideRails }) {
  const priceRegion: Region = rails.region === "nz" ? "au" : rails.region;
  const side = (key: string, tiles: Tile[], placement: Placement, brand: string): DockSide => ({
    key,
    items: tiles
      .filter((t) => t.image && t.price != null)
      .slice(0, MAX_TILES)
      .map((t) => (
        <OutboundLink key={t.id} href={dockHref(t.href)} rel={REL_PAID} retailer={rails.label} placement={placement} className={DOCK_LINK}>
          <DockTile img={t.image!} alt={`${t.name} on eBay`} brand={<span className="font-black text-ink">{brand}</span>} title={t.name} price={formatPrice(t.price!, priceRegion)} cta="View" plate />
          <span className="sr-only">, on {rails.label}</span>
        </OutboundLink>
      )),
  });
  const sides = [side("kits", rails.left, "dock-ebay", "eBay · Popular"), side("deals", rails.right, "dock-ebay-deals", "eBay · Deal")].filter((s) => s.items.length > 0);
  if (sides.length === 0) return null;
  return (
    <DockGate minWidth={MIN_WIDTH}>
      <AdDock label={`Sponsored: kits on ${rails.label}`} sides={sides} placement="dock-ebay" minWidth={MIN_WIDTH} yieldTo=".ad-box, [data-ad], [data-ebay-strip]" buybar="[data-sticky-buy]" />
    </DockGate>
  );
}
