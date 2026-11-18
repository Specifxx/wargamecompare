// Owner, 2026-11-18: the eBay row may carry "Cheapest" (new listing, genuinely under the cheapest store, not more than 25% under). Source guard.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("the eBay row is Cheapest only when its delivered price is under the cheapest store and not a wrong product", () => {
  const s = readFileSync(new URL("../src/lib/price-rows.ts", import.meta.url), "utf8");
  assert.match(s, /export const EBAY_MAX_UNDER_STORES = 0\.75;/);
  assert.match(s, /total < best\.p && total >= best\.p \* EBAY_MAX_UNDER_STORES/);
  assert.match(s, /cheapest: o\.in && i === 0 && !ebayCheapest,/, "one Cheapest badge only");
  assert.match(readFileSync(new URL("../src/components/PriceList.tsx", import.meta.url), "utf8"), /\{ebay\.cheapest && <span className=\{BADGE\}>Cheapest<\/span>\}/);
});
