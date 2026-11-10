// The nearest paid price under the cheapest store (lib/price-rows.ts paidAlternative, 2026-11-10).
import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { PAID_ALTERNATIVE_BAND, paidAlternative, type PaidCandidate } from "../src/lib/price-rows";
import { PLACEMENTS } from "../src/lib/affiliate";

const c = (name: string, p: number): PaidCandidate => ({ name, p, href: `https://x/${name}` });

test("names the cheapest paid row within 20% of an unpaid cheapest store, with how much more it is", () => {
  const alt = paidAlternative({ p: 2000, paid: false }, [c("Amazon", 2300), c("eBay", 2200)]);
  assert.equal(alt?.c.name, "eBay");
  assert.equal(alt?.pctMore, 10);
  assert.equal(PAID_ALTERNATIVE_BAND, 1.2);
  assert.equal(paidAlternative({ p: 2000, paid: false }, [c("eBay", 2400)])?.pctMore, 20);
});

test("nothing when the cheapest store pays, nothing qualifies, or there is no store price", () => {
  assert.equal(paidAlternative({ p: 2000, paid: true }, [c("eBay", 2100)]), null);
  assert.equal(paidAlternative({ p: 2000, paid: false }, [c("eBay", 2401)]), null);
  assert.equal(paidAlternative(null, [c("eBay", 2100)]), null);
  assert.equal(paidAlternative({ p: 2000, paid: false }, [c("eBay", 1900)])?.pctMore, 0, "never a percentage below");
});

test("the best-price card and the phone buy bar carry it under their own placements", () => {
  for (const p of ["product-best-alt", "product-sticky-alt"]) assert.ok((PLACEMENTS as readonly string[]).includes(p));
  const page = fs.readFileSync("src/app/[region]/p/[slug]/page.tsx", "utf8");
  assert.match(page, /"product-best-alt", false/, "eBay has its own button on the card");
  assert.match(page, /"product-sticky-alt", true/);
});
