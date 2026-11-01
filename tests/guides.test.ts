// Region guides (lib/guides.ts): real numbers only, a real comparison only.
import { test } from "node:test";
import assert from "node:assert/strict";
import type { Summary } from "../src/lib/data";
import { cheapestOfType, fill, GUIDES, storeSavings } from "../src/lib/guides";

const sum = (id: string, type: string, best: number | null, stores: number, rrp: number | null = null, system = "warhammer-40k"): Summary =>
  ({ product: { id, name: id, system, faction: null, type, ean: null, codes: [], code: null, image: null, firstSeen: "2026-10-01" }, best, bestStore: "a", inStock: stores, stores, rrp, off: null }) as Summary;

test("titles and descriptions fill the region and fit", () => {
  for (const g of GUIDES) {
    const t = fill(g.title, "New Zealand");
    assert.ok(!t.includes("{in}") && t.length <= 90, t);
    assert.ok(fill(g.description, "New Zealand").length <= 160, g.slug);
  }
});

test("cheapestOfType: in stock at two or more stores, one game, cheapest first", () => {
  const all = [sum("Combat Patrol: A", "combat-patrols", 9000, 3), sum("Combat Patrol: B", "combat-patrols", 8000, 1), sum("Combat Patrol: C", "combat-patrols", null, 4), sum("Spearhead: D", "combat-patrols", 7000, 2, null, "age-of-sigmar"), sum("Combat Patrol: E", "combat-patrols", 8500, 2), sum("Orks: Boyz (Combat Patrol)", "combat-patrols", 100, 9), sum("Combat Patrol: Battlezone", "combat-patrols", 100, 9), sum("Combat Patrol Companion", "combat-patrols", 100, 9), sum("Spearhead: City of Ash Gaming Pack", "combat-patrols", 100, 9)];
  assert.deepEqual(cheapestOfType(all, "combat-patrols", 5, "warhammer-40k").map((s) => s.product.id), ["Combat Patrol: E", "Combat Patrol: A"]);
});

test("storeSavings: median saving per store, in-stock offers with an RRP only, small stores left out", () => {
  const all = [sum("x", "miniatures", 8000, 2, 10000), sum("y", "miniatures", 9000, 2, 10000), sum("z", "miniatures", 9000, 2, null)];
  const offers: Record<string, { s: string; p: number; in: boolean }[]> = {
    x: [{ s: "a", p: 8000, in: true }, { s: "b", p: 10500, in: true }, { s: "c", p: 1, in: false }],
    y: [{ s: "a", p: 9000, in: true }, { s: "b", p: 10000, in: true }],
    z: [{ s: "a", p: 1, in: true }],
  };
  const rows = storeSavings(all, (id) => offers[id] ?? [], 2);
  assert.deepEqual(rows.map((r) => r.store), ["a", "b"]);
  assert.ok(Math.abs(rows[0].typical - 0.15) < 1e-9);
  assert.equal(rows[0].under, 1);
  assert.ok(Math.abs(rows[1].typical - -0.025) < 1e-9);
  assert.equal(rows[1].under, 0);
});
