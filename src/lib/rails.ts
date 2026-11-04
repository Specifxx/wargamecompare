// The side rails' geometry (components/SideAds.tsx draws them, lib/side-rails.ts fills them). Pure: no data, no DOM, so the
// server and the client import the same numbers. (A value imported from a "use client" module into server code is a client
// reference, not the value: that is why these do not live in SideAds.tsx.)
import type { Tile } from "@/components/EbayStrip";
import type { Region } from "./regions";

/** The shell is 1480px; each rail is RAIL_W wide with GUTTER on both sides of it. */
const SHELL_W = 1480;
export const RAIL_W = 160;
export const GUTTER = 16;
export const MIN_WIDTH = SHELL_W + 2 * (RAIL_W + 2 * GUTTER); // 1864: the RAIL class in SideAds.tsx says the same
/** Vertical budget: the sticky header (--hdr, 64px from lg) and a gutter above, a gutter below, the rail's own top line and note. */
const TOP = 64 + GUTTER;
const HEAD = 30;
const NOTE = 34;
const PAD = 2 * 8;
const GAP = 8;
/** One tile: 8px padding, a (RAIL_W - 16 - 16)px square picture, two title lines (36px) and a price line (20px). */
export const TILE_H = 8 + (RAIL_W - PAD - 16) + 6 + 36 + 20 + 8;
export const MAX_TILES = 6;
export const MIN_TILES = 2;
/** Where a rail's outer edge sits: outside the shell, a gutter in. */
export const RAIL_EDGE = `calc(50% - ${SHELL_W / 2 + GUTTER + RAIL_W}px)`;

/** How many tiles a window of this height fits (0: no rail). Pure, for the tests. */
export function tilesThatFit(innerHeight: number): number {
  const room = innerHeight - TOP - GUTTER - HEAD - NOTE - PAD;
  return Math.max(0, Math.min(MAX_TILES, Math.floor((room + GAP) / (TILE_H + GAP))));
}

export interface SideRails {
  region: Region;
  label: string; // "eBay UK"
  all: string; // the tagged "More on eBay" search
  left: Tile[]; // popular kits with a live listing
  right: Tile[]; // today's deals with a live listing
}
