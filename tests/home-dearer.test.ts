import { test } from "node:test";
import assert from "node:assert/strict";
import type { Summary } from "../src/lib/data";
import { dearer, homeFloor } from "../src/lib/home";

const s = (id: string, best: number | null): Summary =>
  ({ product: { id } as Summary["product"], best, bestStore: "x", inStock: best == null ? 0 : 1, stores: 2, rrp: null, off: null });

test("the home floor is the median in-stock price and cheaper kits drop off the shelves", () => {
  const all = [s("a", 500), s("b", 1000), s("c", 4000), s("d", 6000), s("e", 9000), s("f", null)];
  assert.equal(homeFloor(all), 4000);
  assert.deepEqual(dearer(all, 4000, 2).map((x) => x.product.id), ["c", "d", "e"]);
});

test("a thin shelf falls back to the whole list", () => {
  const all = [s("a", 500), s("b", 1000), s("c", 4000)];
  assert.equal(dearer(all, 4000).length, 3);
});
