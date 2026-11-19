import { test } from "node:test";
import assert from "node:assert/strict";
import { cheapestInStock, dayIndex, dayIso, emptyHistory, historyStats, recordDay, seriesFor } from "../src/lib/price-history";
import type { Offer } from "../src/lib/types";

const o = (s: string, p: number, inStock = true): Offer => ({ s, p, in: inStock, u: "/x", t: "t" });
const known = (s: string) => s !== "gone";

test("days count from the first import", () => {
  assert.equal(dayIndex("2026-10-28"), 0);
  assert.equal(dayIso(dayIndex("2026-11-19")), "2026-11-19");
});

test("the headline price is the cheapest in-stock offer of a known store", () => {
  assert.equal(cheapestInStock([o("a", 5000), o("b", 4000, false), o("gone", 100), o("c", 4500)], known), 4500);
  assert.equal(cheapestInStock([o("a", 5000, false)], known), 0);
});

test("only changes are stored, sold-out days are 0, and an old day is ignored", () => {
  const f = emptyHistory();
  recordDay(f, "2026-11-01", { UK: { kit: [o("a", 5000)], never: [o("a", 900, false)] } }, known);
  recordDay(f, "2026-11-02", { UK: { kit: [o("a", 5000), o("b", 6000)] } }, known);
  recordDay(f, "2026-11-03", { UK: { kit: [o("a", 4800)] } }, known);
  recordDay(f, "2026-11-04", { UK: {} }, known);
  recordDay(f, "2026-11-05", { UK: { kit: [o("a", 4900)] } }, known);
  recordDay(f, "2026-11-04", { UK: { kit: [o("a", 1)] } }, known);
  assert.deepEqual(f.m.UK!.kit, [
    [dayIndex("2026-11-01"), 5000],
    [dayIndex("2026-11-03"), 4800],
    [dayIndex("2026-11-04"), 0],
    [dayIndex("2026-11-05"), 4900],
  ]);
  assert.equal(f.m.UK!.never, undefined);
  assert.equal(f.last, "2026-11-05");

  const pts = seriesFor(f, "UK", "kit");
  assert.deepEqual(pts.map((p) => p.cents), [5000, 5000, 4800, null, 4900]);
  const st = historyStats(pts)!;
  assert.equal(st.low.cents, 4800);
  assert.equal(st.high.cents, 5000);
  assert.equal(st.last.cents, 4900);
  assert.equal(st.priced, 4);
});

test("the window keeps the last days only, and one priced day is nothing to chart", () => {
  const f = emptyHistory();
  recordDay(f, "2026-11-01", { US: { kit: [o("a", 1000)] } }, known);
  recordDay(f, "2026-11-10", { US: { kit: [o("a", 1200)] } }, known);
  const pts = seriesFor(f, "US", "kit", 3);
  assert.deepEqual(pts.map((p) => p.day), ["2026-11-08", "2026-11-09", "2026-11-10"]);
  assert.equal(seriesFor(f, "US", "missing").length, 0);
  assert.equal(historyStats([{ day: "2026-11-01", cents: 100 }, { day: "2026-11-02", cents: null }]), null);
});
