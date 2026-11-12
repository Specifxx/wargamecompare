// Owner, 2026-11-12: no Amazon row without a live Amazon price.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("the Amazon row exists only with a live price, never as a bare search row", () => {
  const src = readFileSync(new URL("../src/lib/price-rows.ts", import.meta.url), "utf8");
  assert.match(src, /const amazon = live && liveHref \? liveHref : null;/);
  assert.doesNotMatch(src, /amazonSearchUrl/);
});
