import { test } from "node:test";
import assert from "node:assert/strict";
import { checkEbay, checkImport, checkLive } from "../src/lib/ops";

const now = new Date("2026-10-28T12:00:00Z");

test("import: stale, small or failing reads fail the run", () => {
  assert.equal(checkImport(null, 30, now)[0].status, "fail");
  const meta = (age: number, products: number, failing: number) => ({
    updatedAt: new Date(now.getTime() - age * 3_600_000).toISOString(),
    products,
    stores: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`s${i}`, { ok: i >= failing, lastOkAt: now.toISOString(), listed: 1, inStock: 1 }])),
  });
  assert.deepEqual(checkImport(meta(2, 5000, 0) as never, 10, now).map((c) => c.status), ["ok", "ok", "ok"]);
  assert.equal(checkImport(meta(31, 5000, 0) as never, 10, now)[0].status, "fail");
  assert.equal(checkImport(meta(2, 100, 0) as never, 10, now)[1].status, "fail");
  assert.equal(checkImport(meta(2, 5000, 3) as never, 10, now)[2].status, "fail");
});

test("eBay and the live site: unknown is never a false ok", () => {
  assert.equal(checkEbay(null, false, 4000, now, "2026-10-28")[0].status, "unknown");
  assert.equal(checkEbay(null, true, 4000, now, "2026-10-28")[0].status, "fail");
  assert.equal(checkEbay({ updatedAt: now.toISOString(), items: {}, calls: { "2026-10-28": 4100 } }, true, 4000, now, "2026-10-28")[1].status, "fail");
  assert.equal(checkLive(null, null).status, "unknown");
  assert.equal(checkLive(200, "<title>WargameCompare</title>").status, "ok");
  assert.equal(checkLive(200, "Vercel 404").status, "fail");
});

test("family feed: fresh ok, stale only warns, missing unknown", async () => {
  const { checkFamilyFeed } = await import("../src/lib/ops");
  const now = new Date("2026-11-02T12:00:00Z");
  assert.equal(checkFamilyFeed("2026-11-02T06:00:00Z", now).status, "ok");
  assert.equal(checkFamilyFeed("2026-10-25T06:00:00Z", now).status, "warn");
  assert.equal(checkFamilyFeed(null, now).status, "unknown");
});
