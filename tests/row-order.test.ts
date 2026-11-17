import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Owner, 2026-11-17: all affiliated rows at the top, cheapest first, unpriced ones after (eBay, Amazon, Wayland), then the stores.
test("the price list orders its paid rows by price above the stores", () => {
  const s = readFileSync(new URL("../src/components/PriceList.tsx", import.meta.url), "utf8");
  assert.match(s, /const byPrice = \[\.\.\.paidRows\.filter\(\(r\) => r\.cents > 0\)\.sort\(\(a, b\) => a\.cents - b\.cents\), \.\.\.paidRows\.filter\(\(r\) => r\.cents <= 0\)\]/);
  assert.ok(s.indexOf("byPrice.map") < s.indexOf("stores.map"), "paid rows come before the store rows");
  assert.match(s, /k: "wayland"/);
});
