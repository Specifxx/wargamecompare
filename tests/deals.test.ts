import { test } from "node:test";
import assert from "node:assert/strict";
import { deals, median } from "../src/lib/deals";
import { hubIndexable, productIndexable } from "../src/lib/index-tiers";
import type { Summary } from "../src/lib/data";

const S = (id: string, o: Partial<Summary>): Summary => ({
  product: { id, name: id, system: null, faction: null, type: "miniatures", ean: null, codes: [], code: null, image: null, firstSeen: "2026-10-28" },
  best: 1000, bestStore: "a", inStock: 1, stores: 2, rrp: null, off: null, ...o,
});

test("deals: 10% off a stated RRP or the median, never over half, never sold out", () => {
  const m = new Map([["med", 10000]]);
  const out = deals([S("rrp", { best: 8000, rrp: 10000 }), S("small", { best: 9500, rrp: 10000 }), S("silly", { best: 3000, rrp: 10000 }), S("med", { best: 8500, stores: 4 }), S("gone", { best: null, inStock: 0, rrp: 10000 })], m);
  assert.deepEqual(out.map((d) => [d.s.product.id, d.basis]), [["rrp", "rrp"], ["med", "median"]]);
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([]), null);
});

test("index tiers: two stores and one in stock; hubs need six", () => {
  assert.equal(productIndexable(S("a", { stores: 1 })), false);
  assert.equal(productIndexable(S("a", { inStock: 0, best: null })), false);
  assert.equal(productIndexable(S("a", {})), true);
  assert.equal(productIndexable(null), false);
  const six = Array.from({ length: 6 }, (_, i) => S(`p${i}`, {}));
  assert.equal(hubIndexable(six), true);
  assert.equal(hubIndexable(six.slice(1).concat(S("x", { stores: 1 }))), false);
});
