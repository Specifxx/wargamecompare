// The eBay side rails (components/SideAds.tsx, lib/side-rails.ts): browser-only, outside the shell, only on a wide, tall
// window, live listings only, every link tagged and rel sponsored. Nothing of them is in the server HTML, so no SEO change.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MAX_TILES, MIN_WIDTH, tilesThatFit } from "../src/lib/rails";
import { sideRailsFor } from "../src/lib/side-rails";
import { REGIONS, type Region } from "../src/lib/regions";

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("the side rails fit only a wide, tall window and never a clipped tile", () => {
  assert.equal(MIN_WIDTH, 1864);
  assert.equal(tilesThatFit(300), 0);
  assert.equal(tilesThatFit(1080), 4);
  assert.equal(tilesThatFit(5000), MAX_TILES);
  const src = read("src/components/SideAds.tsx");
  assert.match(src, /^"use client"/);
  assert.match(src, /min-\[1864px\]:flex/);
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
