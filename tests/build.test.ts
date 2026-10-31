import { test } from "node:test";
import assert from "node:assert/strict";
import { bookFormat, bookOffers, build, cleanName, oneBookFormat, plausible, slugify, statedRrp, untrackedStockStores, type StoreListing } from "../src/lib/import/build";
import type { Product } from "../src/lib/types";

const L = (o: Partial<StoreListing> & Pick<StoreListing, "store" | "title">): StoreListing => ({
  market: "UK", url: `https://${o.store}.example/p`, cents: 3000, wasCents: null, inStock: true, image: null,
  skus: [], vendor: "Games Workshop", productType: "", tags: [], ...o,
});

test("display names drop store noise and never invent", () => {
  assert.equal(cleanName("Games Workshop - Combat Patrol: Necrons (41-63) [PRE-ORDER]"), "Combat Patrol: Necrons");
  assert.equal(cleanName("Citadel Shade: Nuln Oil 18ml"), "Citadel Shade: Nuln Oil");
  assert.equal(slugify("Kill Team: Death Korps (2024)"), "kill-team-death-korps-2024");
});

test("stated RRP needs two stores agreeing; implausible prices are dropped", () => {
  assert.equal(statedRrp([{ s: "a", w: 9000 }, { s: "b", w: 9000 }, { s: "c", w: 9500 }]), 9000);
  assert.equal(statedRrp([{ s: "a", w: 9000 }, { s: "a", w: 9000 }]), null);
  const o = (s: string, p: number) => ({ s, p, in: true, u: "", t: "" });
  assert.deepEqual(plausible([o("a", 8000), o("b", 7500), o("c", 900), o("d", 20000)], 9000).map((x) => x.s), ["a", "b"]);
});

test("one product per box code across stores and markets; second-hand and merch refused", () => {
  const r = build(
    [
      L({ store: "a", title: "Combat Patrol: Necrons (41-63)", cents: 8000, wasCents: 9000 }),
      L({ store: "b", title: "Warhammer 40k Combat Patrol Necrons (41-63)", cents: 7650, wasCents: 9000 }),
      L({ store: "c", market: "AU", title: "Combat Patrol: Necrons", skus: ["99120110081"], cents: 15000 }),
      L({ store: "d", market: "AU", title: "Necrons Combat Patrol (41-63)", skus: ["99120110081"], cents: 14500 }), // bridges the codes
      L({ store: "e", title: "Combat Patrol Necrons (41-63) - painted, pre-owned", cents: 4000 }),
      L({ store: "f", title: "Warhammer 40k mug", cents: 1200, productType: "Merchandise" }),
    ],
    [],
    "2026-10-28",
  );
  assert.equal(r.products.length, 1);
  const p = r.products[0];
  assert.equal(p.code, "41-63");
  assert.equal(p.system, "warhammer-40k");
  assert.equal(p.faction, "necrons");
  assert.deepEqual(r.offers.UK![p.id].map((o) => o.s), ["b", "a"]);
  assert.deepEqual(r.offers.AU![p.id].map((o) => o.s), ["d", "c"]);
  assert.equal(r.rrp.UK![p.id], 9000);
  assert.ok((r.refused["not-new"] ?? 0) >= 1);
});

test("a product keeps yesterday's slug while it shares a code", () => {
  const prev: Product[] = [{ id: "necrons-combat-patrol", name: "x", system: null, faction: null, type: "miniatures", ean: null, codes: ["short:41-63"], code: "41-63", image: null, firstSeen: "2026-01-01" }];
  const r = build([L({ store: "a", title: "Combat Patrol: Necrons (41-63)" }), L({ store: "b", title: "Combat Patrol Necrons (41-63)" })], prev, "2026-10-28");
  assert.equal(r.products[0].id, "necrons-combat-patrol");
  assert.equal(r.products[0].firstSeen, "2026-01-01");
});

test("Black Library books: one format per product, no stock-blind stores (visitor feedback, 2026-10-31)", () => {
  assert.deepEqual(["Ghost Legion (Hb)", "Interceptor City (PB)", "Above And Beyond (Pb) Black Library Book", "Cold Covenant (Hardback) - Black Library", "Lords of Silence Limited Edition", "Dark Imperium"].map(bookFormat), ["hb", "pb", "pb", "hb", "ltd", null]);
  // Real titles from one SKU group in Canada: two paperbacks, two hardbacks, one unlabelled; the slug names the paperback.
  const g = [
    { store: "a", title: "black library ~ The Infinite and The Divine (Paperback)" },
    { store: "b", title: "The Infinite and the Divine (Paperback)" },
    { store: "c", title: "Black Library - The Infinite and the Divine (Hardback)" },
    { store: "d", title: "BLACK LIBRARY: THE INFINITE AND THE DIVINE [HB]" },
    { store: "e", title: "The Infinite and the Divine" },
  ];
  assert.deepEqual(oneBookFormat(g, "the-infinite-and-the-divine-paperback").map((x) => x.store), ["a", "b", "e"]);
  assert.deepEqual(oneBookFormat(g.slice(0, 1)).map((x) => x.store), ["a"]);

  // A store that reports every listing in stock does not track stock.
  const many = (store: string, n: number, inN: number) => Array.from({ length: n }, (_, i) => ({ store, inStock: i < inN }));
  assert.deepEqual([...untrackedStockStores([...many("blind", 60, 60), ...many("real", 60, 40), ...many("small", 10, 10)])], ["blind"]);

  // Book offers: the stock-blind store goes, an unlabelled outlier goes, a sold-out row stays (its price is hidden on the page).
  const o = (s: string, p: number, t: string, inStock = true) => ({ s, p, in: inStock, u: "", t });
  const kept = bookOffers([o("a", 1700, "X (Paperback)"), o("b", 1800, "X (PB)"), o("c", 3500, "X"), o("d", 1750, "X"), o("blind", 1500, "X (PB)"), o("e", 1600, "X (Paperback)", false)], new Set(["blind"]));
  assert.deepEqual(kept.map((x) => x.s), ["a", "b", "d", "e"]);
});

test("build keeps one format of a novel and drops its audiobook", () => {
  const r = build(
    [
      L({ store: "a", title: "Black Library - Ghost Legion (PB)", skus: ["60100181001"], cents: 1720 }),
      L({ store: "b", title: "Warhammer 40000: Ghost Legion (PB)", skus: ["60100181001"], cents: 2200 }),
      L({ store: "c", title: "Black Library: Ghost Legion (Hardback)", skus: ["60100181001"], cents: 3555 }),
      L({ store: "d", title: "Ghost Legion (Audio Book)", skus: ["60100181001"], cents: 2500 }),
    ],
    [],
    "2026-10-31",
  );
  assert.equal(r.products.length, 1);
  assert.deepEqual(r.offers.UK![r.products[0].id].map((x) => x.s), ["a", "b"]);
  assert.equal(r.refused.digital, 1);
});
