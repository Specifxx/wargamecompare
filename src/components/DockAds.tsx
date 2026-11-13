"use client";

import { useEffect, useState } from "react";
import { REL_PAID, type Placement } from "@/lib/affiliate";
import { MAX_TILES, MIN_WIDTH, type AdTiles } from "@/lib/inline-ads";
import type { Tile } from "@/lib/ebay-tiles";
import { formatPrice, type Region } from "@/lib/regions";
import { OutboundLink } from "./OutboundLink";
import { AdDock, DockGate, DockTile, DOCK_LINK, type DockSide } from "./AdDock";
import { useSoftRegion } from "./SoftRegion";

// The phone dock's feed (owner, 2026-11-06). The side rails that used to share this file are gone (owner, 2026-11-13: one native
// horizontal block inside the page instead, components/InlineAds.tsx). What stays is the dock on a narrow screen: the same eBay
// tiles in one bar along the foot of the window, after a scroll, never on a product page (AdDock.tsx has the rules).

export function DockAds({ tiles }: { tiles: AdTiles }) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`);
    const update = () => setNarrow(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return narrow ? <PhoneDock data={tiles} /> : null;
}

/** The dock on the pages with no region of their own, in the visitor's suggested or picked region (SoftRegion.tsx). */
export function SoftDockAds({ all }: { all: Record<Region, AdTiles> }) {
  return <DockAds tiles={all[useSoftRegion()]} />;
}

/** The block's tag with the dock's placement in it (inline-ebay → dock-ebay), so EPN's customid report tells the two apart. Pure. */
export function dockHref(href: string): string {
  return href.replace(/(customid=wgc-[a-z]+-)inline-ebay/, "$1dock-ebay");
}

/**
 * The phone dock (owner, 2026-11-06: the rails "on mobile … in the best way that doesn't interrupt user experience"): the same
 * tiles, popular kits and today's deals taking turns, in one bar along the foot of a narrow screen. AdDock.tsx has the rules; it
 * yields to every eBay unit on the page (.ad-box) and never shows on a product page (the buy bar, data-sticky-buy).
 */
function PhoneDock({ data }: { data: AdTiles }) {
  const priceRegion: Region = data.region === "nz" ? "au" : data.region;
  const side = (key: string, tiles: Tile[], placement: Placement, brand: string): DockSide => ({
    key,
    items: tiles
      .filter((t) => t.image && t.price != null)
      .slice(0, MAX_TILES)
      .map((t) => (
        <OutboundLink key={t.id} href={dockHref(t.href)} rel={REL_PAID} retailer={data.label} placement={placement} className={DOCK_LINK}>
          <DockTile img={t.image!} alt={`${t.name} on eBay`} brand={<span className="font-black text-ink">{brand}</span>} title={t.name} price={formatPrice(t.price!, priceRegion)} cta="View" plate />
          <span className="sr-only">, on {data.label}</span>
        </OutboundLink>
      )),
  });
  const sides = [side("kits", data.left, "dock-ebay", "eBay · Popular"), side("deals", data.right, "dock-ebay-deals", "eBay · Deal")].filter((s) => s.items.length > 0);
  if (sides.length === 0) return null;
  return (
    <DockGate minWidth={MIN_WIDTH}>
      <AdDock label={`Sponsored: kits on ${data.label}`} sides={sides} placement="dock-ebay" minWidth={MIN_WIDTH} yieldTo=".ad-box, [data-ad]" buybar="[data-sticky-buy]" />
    </DockGate>
  );
}
