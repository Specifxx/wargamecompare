import { test } from "node:test";
import assert from "node:assert/strict";
import { regionStats, reportMonth, widelyStocked } from "../src/lib/price-report";
import type { Summary } from "../src/lib/data";

const s = (id: string, best: number | null, rrp: number | null, inStock: number): Summary =>
  ({ product: { id, name: id }, best, bestStore: null, inStock, stores: inStock, rrp, off: best != null && rrp && rrp > best ? (rrp - best) / rrp : null }) as unknown as Summary;

test("region stats count in-stock products and the median saving under RRP", () => {
  const rows = [s("a", 80, 100, 3), s("b", 90, 100, 4), s("c", 100, 100, 2), s("d", null, 100, 0), s("e", 50, null, 5)];
  const r = regionStats(rows, 7);
  assert.equal(r.inStock, 4);
  assert.equal(r.withRrp, 3);
  assert.equal(r.underRrp, 2);
  assert.ok(Math.abs((r.medianOff ?? 0) - 0.15) < 1e-9);
  assert.equal(r.stores, 7);
});

test("widely stocked needs three in-stock stores and ranks by stock", () => {
  const rows = [s("a", 80, 100, 3), s("b", 90, 100, 6), s("c", 10, 100, 2)];
  assert.deepEqual(widelyStocked(rows).map((x) => x.product.id), ["b", "a"]);
});

test("the report month comes from the data date", () => {
  assert.equal(reportMonth("2026-11-02T08:00:00Z"), "November 2026");
});
