// The eBay side rails (components/SideAds.tsx, lib/side-rails.ts): browser-only, outside the shell, only on a wide, tall
// window, live listings only, every link tagged and rel sponsored. Nothing of them is in the server HTML, so no SEO change.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MAX_TILES, MIN_WIDTH, RAIL_ROOM, railFits } from "../src/lib/rails";
import { sideRailsFor } from "../src/lib/side-rails";
import { REGIONS, type Region } from "../src/lib/regions";

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("the side rails show on every regular 16:9 and 16:10 screen and scroll through up to ten tiles", () => {
  assert.equal(MIN_WIDTH, 1280, "1280×720, 1280×800, 1366, 1440, 1536, 1600, 1680, 1920 and up (owner, 2026-11-06)");
  assert.equal(MAX_TILES, 10);
  assert.equal(RAIL_ROOM, 160);
  assert.ok(!railFits(300), "too short for one whole tile: no rail");
  assert.ok(railFits(720) && railFits(800), "a 1280×720 window has a rail");
  const src = read("src/components/SideAds.tsx");
  assert.match(src, /^"use client"/);
  assert.match(src, /min-\[1280px\]:flex/);
  assert.match(src, /overflow-y-auto/, "the list scrolls inside the rail");
  const css = read("src/app/globals.css");
  assert.match(css, /@media \(min-width: 1280px\) \{\s*[\s\S]*?\.max-w-shell \{\s*max-width: min\(1480px, calc\(100vw - 320px\)\);/, "the shell leaves the rails their room");
  assert.match(src, /rel=\{REL_PAID\}/);
  assert.doesNotMatch(src, /from "@\/lib\/data"/, "the client rail never reads data/");
  // A value imported from a "use client" module into server code is a client reference, not the value (it emptied the rails once).
  assert.doesNotMatch(read("src/lib/side-rails.ts"), /from "@\/components\/SideAds"/);
});

test("every region's rails are the import's own live listings, tagged per placement", () => {
  for (const region of Object.keys(REGIONS) as Region[]) {
    const r = sideRailsFor(region);
    for (const [side, tiles] of [["left", r.left], ["right", r.right]] as const) {
      assert.ok(tiles.length <= MAX_TILES, `${region} ${side}`);
      for (const t of tiles) {
        assert.ok(t.image && t.price != null, `${region} ${side}: ${t.id} has no live listing`);
        assert.match(t.href, /ebay\./);
        assert.match(t.href, side === "left" ? /customid=wgc-[a-z]+-side-ebay&/ : /customid=wgc-[a-z]+-side-ebay-deals&/);
      }
    }
    const ids = new Set(r.left.map((t) => t.id));
    for (const t of r.right) assert.ok(!ids.has(t.id), `${region}: ${t.id} is in both rails`);
  }
});

test("the region layout mounts the rails outside the shell", () => {
  const layout = read("src/app/[region]/layout.tsx");
  assert.ok(layout.indexOf("<SideAds ") > layout.indexOf("<Footer"), "rails after the footer, outside the shell div");
});

test("the pages with no region (the home page, About…) get the same rails, in the visitor's region", () => {
  const site = read("src/app/(site)/layout.tsx");
  assert.ok(site.indexOf("<SoftSideAds ") > site.indexOf("<Footer"), "after the footer, outside the shell");
  assert.match(site, /sideRailsFor\(r\)/, "every region's rails, picked in the browser");
  assert.match(read("src/components/SideAds.tsx"), /export function SoftSideAds[\s\S]*?useSoftRegion\(\)/);
});

