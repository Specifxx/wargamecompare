import { test } from "node:test";
import assert from "node:assert/strict";
import { build, cleanName, plausible, slugify, statedRrp, type StoreListing } from "../src/lib/import/build";
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
