// The side rails' geometry (components/SideAds.tsx draws them, lib/side-rails.ts fills them). Pure: no data, no DOM, so the
// server and the client import the same numbers. (A value imported from a "use client" module into server code is a client
// reference, not the value: that is why these do not live in SideAds.tsx.)
import type { Tile } from "@/components/EbayStrip";
import type { Region } from "./regions";

/**
 * From MIN_WIDTH (1280px: every common 16:9 and 16:10 laptop and monitor, owner 2026-11-06: "it should appear on regular 16:9
 * screens … 16:10 even") a rail RAIL_W wide sits flush against each side of the window (owner, 2026-11-07: no gaps), the shell
 * keeping GUTTER clear beside it. Below 1864px the shell gives up that room (globals.css: max-width min(1480px, 100vw - 2 × RAIL_ROOM)); from 1864px it is
 * its full 1480px and the rails sit just outside it.
 */
export const RAIL_W = 136;
export const GUTTER = 12;
/** The room one rail takes from the shell's side (globals.css says the same: 160px). */
export const RAIL_ROOM = RAIL_W + 2 * GUTTER;
export const MIN_WIDTH = 1280; // the RAIL class in SideAds.tsx and the globals.css shell rule say the same
/** Up to ten tiles, popular first; the list scrolls inside the rail (owner, 2026-11-06: "scrollable … up to 10 products"). */
export const MAX_TILES = 10;
export const MIN_TILES = 2;
/** Vertical budget: the sticky header (--hdr, 64px from lg) and a gutter above, a gutter below, the rail's own top line and note. */
const TOP = 64;
const HEAD = 30;
const NOTE = 34;
const PAD = 0;
/** One tile: 8px padding, a (RAIL_W - 16 - 16)px square picture, two title lines (36px) and a price line (20px). */
export const TILE_H = 8 + (RAIL_W - 1 - 16) + 6 + 36 + 20 + 8;
/** Where a rail's outer edge sits: flush against the window's edge (owner, 2026-11-07). */
export const RAIL_EDGE = "0px";

/** Whether a window this tall holds a rail with at least one whole tile in view (the rest scroll). Pure, for the tests. */
export function railFits(innerHeight: number): boolean {
  return innerHeight - TOP - HEAD - NOTE - PAD >= TILE_H;
}

export interface SideRails {
  region: Region;
  label: string; // "eBay UK"
  all: string; // the tagged "More on eBay" search
  left: Tile[]; // popular kits with a live listing
  right: Tile[]; // today's deals with a live listing
}
