import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Owner, 2026-11-17 (final): eBay, then Amazon, then Wayland above the stores.
test("the price list draws eBay, Amazon and Wayland above the stores, in that order", () => {
  const s = readFileSync(new URL("../src/components/PriceList.tsx", import.meta.url), "utf8");
  assert.match(s, /\{ k: "ebay", node: ebayRow \},\s+\{ k: "amazon", node: amazonRow \},\s+\{ k: "wayland", node: waylandRow \}/);
  assert.ok(s.indexOf("byPrice.map") < s.indexOf("stores.map"), "paid rows come before the store rows");
});
