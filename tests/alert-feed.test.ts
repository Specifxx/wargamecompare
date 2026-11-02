import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildAlertFeed, ALERT_SITE_KEY } from "../src/lib/alert-feed";
import { summariesFor } from "../src/lib/data";
import { parseAmount, suggestTarget, ALERT_SERVICE } from "../src/components/PriceAlertForm";

// Price alerts through RiftCompare's shared service (DECISIONS.md, 2026-11-02).

test("the feed's price is each region's in-stock best store price, with a {r} path", () => {
  const f = buildAlertFeed(new Date("2026-11-02T00:00:00Z"));
  assert.equal(f.site, ALERT_SITE_KEY);
  const s = summariesFor("uk").find((x) => x.best != null);
  if (s) {
    assert.equal(f.items[s.product.id]!.p.UK, s.best);
    assert.equal(f.items[s.product.id]!.u, `/{r}/p/${s.product.id}`);
  }
  for (const d of f.deals) {
    assert.ok(d.ref! > d.p, "a deal is under its reference");
    assert.match(d.refLabel!, /^(RRP|store median)$/);
  }
});

test("the form posts only to the shared service and the feed is a static file", () => {
  assert.equal(ALERT_SERVICE, "https://riftcompare.com/api/sister-alerts");
  assert.equal(parseAmount("45"), 4500);
  assert.equal(parseAmount("£12,50"), 1250);
  assert.equal(parseAmount("x"), null);
  assert.equal(suggestTarget(13999), 12500);
  const src = fs.readFileSync("src/components/PriceAlertForm.tsx", "utf8");
  assert.ok(!/localStorage|document\.cookie/.test(src));
  assert.match(fs.readFileSync("src/app/alert-feed.json/route.ts", "utf8"), /export const dynamic = "force-static";/);
});
