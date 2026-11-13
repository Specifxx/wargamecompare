// The ONE in-content ad block (owner, 2026-11-13: components/InlineAds.tsx, lib/inline-ads.ts, lib/inline-tiles.ts) and the phone dock
// that stays (components/DockAds.tsx): browser-only, eBay only (Games Workshop has no TCGplayer; Amazon and Wayland have no stored
// prices), live listings only, every link tagged and rel sponsored. Nothing of the block is in the server HTML, so no SEO change.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { INLINE_H, INLINE_MAX, INLINE_MIN, MAX_TILES, MIN_WIDTH, inlineReady, pickInline } from "../src/lib/inline-ads";
import { adTilesFor } from "../src/lib/inline-tiles";
import { REGIONS, type Region } from "../src/lib/regions";
import { PLACEMENTS } from "../src/lib/affiliate";
import { dockHref } from "../src/components/DockAds";
import { DOCK_ARM, dockShows, interleave, type DockState } from "../src/components/AdDock";
const src = (p: string) => read(`src/${p}`);

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const t = (id: string) => ({ id, name: id, system: "x", href: "https://www.ebay.com/itm/1", image: "x.jpg", price: 1000 });

test("the block takes popular kits and today's deals in turns, no product twice, at most six, and needs three", () => {
  const tiles = pickInline({ left: ["a", "b", "c", "d"].map(t), right: ["e", "f", "a", "g"].map(t) });
  assert.deepEqual(tiles.map((x) => x.id), ["a", "e", "b", "f", "c", "d"]);
  assert.equal(tiles.length, INLINE_MAX);
  assert.ok(!inlineReady({ left: [t("a"), t("b")], right: [] }));
  assert.ok(inlineReady({ left: [t("a"), t("b")], right: [t("c")] }));
  assert.equal(INLINE_MIN, 3);
  assert.equal(INLINE_H, 368);
  assert.equal(MIN_WIDTH, 1280);
  assert.equal(MAX_TILES, 10);
});

test("the block is native and calm, browser-only with its height reserved, eBay only, tagged under its own placements; the rails and strips are gone", () => {
  const b = read("src/components/InlineAds.tsx").split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
  assert.match(b, /^"use client"/);
  assert.match(b, /className="ad-pill">Ad</, "a small muted Ad label");
  assert.match(b, /className="card p-4"/, "the site's own card");
  assert.match(b, /className="scroller /, "scrolls sideways in a narrow column");
  assert.match(b, /rel=\{REL_PAID\}/);
  assert.match(b, /if \(!mounted\) return <div aria-hidden="true" style=\{\{ minHeight: INLINE_H \}\} \/>;/, "nothing in the server HTML but the reserved box");
  assert.doesNotMatch(b, /amazon|wayland|tcgplayer|fixed|sticky|#[0-9a-f]{3,6}/i, "eBay only, calm, nothing floating");
  assert.doesNotMatch(b, /from "@\/lib\/data"/, "the client block never reads data/");
  assert.doesNotMatch(read("src/lib/inline-tiles.ts"), /from "@\/components\//, "a client reference is not a value");
  for (const p of ["inline-ebay", "inline-ebay-deals", "inline-ebay-all"]) assert.ok((PLACEMENTS as readonly string[]).includes(p), `${p} is a placement`);
  for (const gone of ["side-ebay", "side-ebay-deals", "ebay-strip-home", "ebay-strip-hub", "ebay-strip-product", "ebay-strip-deals", "ebay-strip-footer", "home-ebay", "category-ebay", "landing-ebay", "guide-ebay"]) assert.ok(!(PLACEMENTS as readonly string[]).includes(gone), `${gone} is retired`);
  for (const f of ["src/components/SideAds.tsx", "src/components/EbayStrip.tsx", "src/components/EbayBox.tsx", "src/components/SoftEbayBox.tsx", "src/lib/rails.ts", "src/lib/side-rails.ts"]) assert.ok(!existsSync(f), `${f} is deleted`);
  assert.doesNotMatch(read("src/app/globals.css"), /rail-scroll/);
});

test("every region's tiles are the import's own live listings, tagged per placement", () => {
  for (const region of Object.keys(REGIONS) as Region[]) {
    const r = adTilesFor(region);
    for (const [side, tiles] of [["left", r.left], ["right", r.right]] as const) {
      assert.ok(tiles.length <= MAX_TILES, `${region} ${side}`);
      for (const x of tiles) {
        assert.ok(x.image && x.price != null, `${region} ${side}: ${x.id} has no live listing`);
        assert.match(x.href, /ebay\./);
        assert.match(x.href, side === "left" ? /customid=wgc-[a-z]+-inline-ebay&/ : /customid=wgc-[a-z]+-inline-ebay-deals&/);
      }
    }
    const ids = new Set(r.left.map((x) => x.id));
    for (const x of r.right) assert.ok(!ids.has(x.id), `${region}: ${x.id} is in both lists`);
    assert.match(r.all, /customid=wgc-[a-z]+-inline-ebay-all$/);
  }
});

test("the region layout mounts the block above the footer and the dock after it; pages with no region do the same in the visitor's region", () => {
  const layout = read("src/app/[region]/layout.tsx");
  assert.ok(layout.indexOf("<DockAds ") > layout.indexOf("<Footer"), "the dock after the footer");
  const site = read("src/app/(site)/layout.tsx");
  assert.ok(site.indexOf("<SoftDockAds ") > site.indexOf("<Footer"));
  assert.match(site, /adTilesFor\(r\)/, "every region's tiles, picked in the browser");
  assert.match(read("src/components/InlineAds.tsx"), /export function SoftInlineAds[\s\S]*?useSoftRegion\(\)/);
});

test("the phone dock: narrow screens only, never on the first screen, never beside another unit, the buy bar or a dialog", () => {
  const ok: DockState = { narrow: true, scrolled: 1000, screen: 800, blockers: 0, buybar: false, modal: false, typing: false, dismissed: false };
  assert.ok(dockShows(ok));
  assert.ok(!dockShows({ ...ok, narrow: false }), "wide screens have no dock");
  assert.ok(!dockShows({ ...ok, scrolled: 800 * DOCK_ARM - 1 }), "not on the first screen");
  assert.ok(!dockShows({ ...ok, blockers: 1 }), "another unit or the footer in view");
  assert.ok(!dockShows({ ...ok, buybar: true }), "never on a page with the buy bar");
  assert.ok(!dockShows({ ...ok, modal: true }), "never over a dialog or the menu");
  assert.ok(!dockShows({ ...ok, typing: true }), "never over the keyboard");
  assert.ok(!dockShows({ ...ok, dismissed: true }));
  assert.deepEqual(interleave([{ items: ["e1", "e2", "e3"] }, { items: ["t1"] }]), ["e1", "t1", "e2", "e3"], "the sides take turns");
  const d = src("components/AdDock.tsx");
  assert.match(d, /^"use client";/);
  assert.match(d, /return armed \? <>\{children\}<\/> : null;/, "nothing rendered or fetched before the visitor scrolls");
  assert.match(d, /translate-y-full/, "slides on transform only (CLS 0)");
  assert.match(d, /querySelectorAll\(`footer, \[data-dock-yield\], \[data-rate-card\], \$\{yieldTo\}`\)/, "hides beside every other unit, the rating card and the footer");
  assert.match(d, /yieldTo = "\[data-ad\]"/, "every [data-ad] unit by default");
  assert.match(d, /sessionStorage\.setItem\(DISMISS_KEY, "1"\)/, "✕ hides it for the visit");
  assert.match(d, />Ad<\/span>/, "labelled Ad");
  const s = src("components/DockAds.tsx");
  for (const p of ["dock-ebay", "dock-ebay-deals"]) assert.ok((PLACEMENTS as readonly string[]).includes(p), `${p} is a placement`);
  assert.equal(dockHref("https://ebay.com/x?customid=wgc-uk-inline-ebay-deals&a=1"), "https://ebay.com/x?customid=wgc-uk-dock-ebay-deals&a=1");
  assert.match(s, /buybar="\[data-sticky-buy\]"/, "never on a product page");
  assert.doesNotMatch(d + s, /amazon/i, "no Amazon in the dock");
});
