// Owner, 2026-11-18: a cheapest row that is a plain store gets a small neutral "Best price" tag, not the green highlight, "Cheapest"
// badge or red button; an affiliate (Awin) cheapest row keeps all three; the hint shows only when the list has an eBay row.
import test from "node:test";
import assert from "node:assert/strict";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PriceList } from "../src/components/PriceList";
import { bestPriceHint, isPlainBest } from "../src/lib/best-tag";
import type { PriceListData, StoreRow } from "../src/lib/price-rows";

// tsx compiles the components with the classic JSX transform (tsconfig "preserve"): give them React.
(globalThis as unknown as { React: typeof React }).React = React;

const store = (over: Partial<StoreRow>): StoreRow => ({
  key: "shop",
  name: "Plain Shop",
  title: "Combat Patrol",
  inStock: true,
  cheapest: true,
  price: "$100.00",
  was: null,
  code: null,
  href: "https://plainshop.example.com/p",
  placement: "table" as StoreRow["placement"],
  vote: "https://plainshop.example.com/p",
  ...over,
});
const data = (stores: StoreRow[]): PriceListData => ({
  ebay: { label: "eBay", href: "https://www.ebay.com/sch/i.html?_nkw=x", placement: "ebay" as never, title: null, price: null, ship: null, vs: null, found: false, cheapest: false },
  amazon: null,
  stores,
  wayland: null,
});
const html = (stores: StoreRow[]) => renderToStaticMarkup(createElement(PriceList, data(stores)));

test("a plain cheapest store has the Best price tag, no highlight, no Cheapest badge, no red button, and its price", () => {
  const out = html([store({})]);
  assert.match(out, /data-best-tag/);
  assert.match(out, />Best price</);
  assert.doesNotMatch(out, /or-hl|or-badge|btn-primary/);
  assert.match(out, /\$100\.00/);
});

test("an affiliate cheapest store keeps the highlight, the badge and the button", () => {
  const out = html([store({ href: "https://www.awin1.com/cread.php?awinmid=1&ued=x" })]);
  assert.match(out, /or-row or-hl/);
  assert.match(out, /or-badge[^>]*>Cheapest</);
  assert.match(out, /btn-primary/);
  assert.doesNotMatch(out, /data-best-tag/);
});

test("the hint names eBay (the list has an eBay row), never claims it is cheaper, and is on the row for a tap", () => {
  const out = html([store({})]);
  assert.match(out, /aria-label="Prices and stock change: also check eBay"/);
  assert.match(out, /title="Prices and stock change: also check eBay"/);
  assert.match(out, /class="or-hint"/);
  assert.doesNotMatch(out, /cheaper/i);
});

test("the hint helper names only the rows that exist", () => {
  assert.equal(bestPriceHint([]), null);
  assert.equal(bestPriceHint([{ brand: "amazon" }]), null);
  assert.equal(bestPriceHint([{ brand: "ebay" }]), "Prices and stock change: also check eBay");
  assert.equal(isPlainBest({ paid: false }), true);
  assert.equal(isPlainBest({ paid: true }), false);
});
