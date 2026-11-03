// New releases and pre-orders (lib/releases.ts): a title's own pre-order date, stale "pre-order" titles refused, arrivals that
// are really new (never the import's first day), soonest release first.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { firstImportDay, preorderInfo, releases, titleDate } from "../src/lib/releases";
import type { Offer, Product } from "../src/lib/types";

const TODAY = "2026-11-03";
const o = (s: string, t: string, p = 5000): Offer => ({ s, t, p, in: true, u: "/products/x" });
const prod = (id: string, firstSeen = "2026-10-28"): Product => ({ id, name: id, system: null, faction: null, type: "kit", ean: null, codes: [], code: null, image: null, firstSeen });

test("dates come from the stores' own titles, month first in the US and Canada, day first elsewhere", () => {
  assert.equal(titleDate("(PRE-ORDER 07/11/26) DA RED GOBBO'S SQUIGMOBILE", "uk", TODAY), "2026-11-07");
  assert.equal(titleDate("Necromunda: Orlock Road Warriors (Pre-Order 14/11/26)", "au", TODAY), "2026-11-14");
  assert.equal(titleDate("Gyrfalcon Jetbike Sodality Pre-Order For 10/17/2026", "us", TODAY), "2026-10-17");
  assert.equal(titleDate("Kroot Farstalkers Pre-Order 11/14/2026", "ca", TODAY), "2026-11-14");
  assert.equal(titleDate("Kroot Farstalkers 14/11/2026 pre-order", "us", TODAY), "2026-11-14", "impossible month-first: read day-first");
  assert.equal(titleDate("Orks Boyz 07/11/26", "uk", TODAY), null, "no pre-order word, no date");
  assert.equal(titleDate("Pre-order 48-75-21 Intercessors", "uk", TODAY), null, "a box code is not a date");
});

test("a pre-order needs a date still to come, or two stores saying so; a passed date is a store that never edited its title", () => {
  assert.deepEqual(preorderInfo([o("a", "Squigmobile (Pre-Order 07/11/26)", 4500), o("b", "Squigmobile [Pre-Order]", 4200), o("c", "Squigmobile", 4000)], "uk", TODAY), {
    stores: 2,
    releaseDate: "2026-11-07",
    cents: 4200,
  });
  assert.equal(preorderInfo([o("a", "Telemon Heavy Dreadnought Pre-Order For 10/17/2026")], "us", TODAY), null, "released: stale title");
  assert.equal(preorderInfo([o("a", "Land Speeder Preorder")], "us", TODAY), null, "one undated title is not enough");
  assert.deepEqual(preorderInfo([o("a", "Land Speeder Preorder"), o("b", "Land Speeder (pre-order)")], "us", TODAY)?.releaseDate, null);
  assert.equal(preorderInfo([o("a", "Box (Pre-Order 07/11/26)"), o("b", "Box (Pre-Order 14/11/26)")], "au", TODAY)?.releaseDate, "2026-11-14", "the latest date any store states");
});

test("arrivals are first seen in the last 45 days, never on the import's first day; pre-orders soonest first", () => {
  const items = [
    { product: prod("old"), offers: [o("a", "Old kit")] },
    { product: prod("new-a", "2026-11-01"), offers: [o("a", "New kit")] },
    { product: prod("new-b", "2026-11-03"), offers: [o("a", "Newer kit")] },
    { product: prod("pre-late"), offers: [o("a", "X (Pre-Order 14/11/26)")] },
    { product: prod("pre-soon"), offers: [o("a", "Y (Pre-Order 07/11/26)")] },
    { product: prod("pre-undated"), offers: [o("a", "Z pre-order"), o("b", "Z preorder")] },
  ];
  assert.equal(firstImportDay(items.map((i) => i.product)), "2026-10-28");
  const { preorders, arrivals } = releases(items, "uk", TODAY, "2026-10-28");
  assert.deepEqual(
    preorders.map((x) => x.product.id),
    ["pre-soon", "pre-late", "pre-undated"],
  );
  assert.deepEqual(
    arrivals.map((x) => x.product.id),
    ["new-b", "new-a"],
  );
});

test("the page is linked from the nav, the region home and the sitemap, and reads no request", () => {
  const page = readFileSync("src/app/[region]/new-releases/page.tsx", "utf8");
  assert.doesNotMatch(page, /cookies\(|headers\(|searchParams|revalidate/);
  assert.match(readFileSync("src/lib/nav.ts", "utf8"), /\/new-releases`/);
  assert.match(readFileSync("src/lib/sitemap.ts", "utf8"), /at\("\/new-releases"\)/);
  assert.match(readFileSync("src/app/[region]/page.tsx", "utf8"), /\/new-releases`/);
});
