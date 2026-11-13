// The ad block's geometry and its pure picker (components/InlineAds.tsx draws it, lib/inline-tiles.ts fills it). Pure: no data, no
// DOM, so the server and the client import the same numbers. (A value imported from a "use client" module into server code is a
// client reference, not the value: that is why these do not live in the component.)
//
// Owner, 2026-11-13: ONE native horizontal block inside the page in place of the side rails and the strips. Games Workshop has no
// TCGplayer, so it is eBay only (the import's own live matches, data/ebay.json): popular kits and today's deals taking turns.
import type { Tile } from "@/lib/ebay-tiles";
import type { Region } from "./regions";

export const INLINE_MAX = 6;
export const INLINE_MIN = 3;
/** The block's height in px, reserved in the server HTML so it never moves the page (CLS 0). */
export const INLINE_H = 368;
/** Up to ten tiles per list: the block shows six, the phone dock (components/DockAds.tsx) up to ten. */
export const MAX_TILES = 10;
export const MIN_TILES = 2;
/** The phone dock shows below this width (it was the rails' width, and stays 1280px). */
export const MIN_WIDTH = 1280;

export interface AdTiles {
  region: Region;
  label: string; // "eBay UK"
  all: string; // the tagged "More on eBay" search
  left: Tile[]; // popular kits with a live listing
  right: Tile[]; // today's deals with a live listing
}

/** The block's tiles: popular kits and today's deals taking turns, no product twice, at most INLINE_MAX. */
export function pickInline(t: Pick<AdTiles, "left" | "right">): Tile[] {
  const out: Tile[] = [];
  const seen = new Set<string>();
  for (let i = 0; out.length < INLINE_MAX && (i < t.left.length || i < t.right.length); i++) {
    for (const x of [t.left[i], t.right[i]]) {
      if (x && !seen.has(x.id) && out.length < INLINE_MAX) {
        seen.add(x.id);
        out.push(x);
      }
    }
  }
  return out;
}

export function inlineReady(t: Pick<AdTiles, "left" | "right"> | undefined): boolean {
  return !!t && pickInline(t).length >= INLINE_MIN;
}
