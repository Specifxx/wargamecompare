import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isCheckoutLink, shopifyCartUrl } from "../src/lib/checkout-link";
import { storeUrl } from "../src/lib/affiliate";

// Straight to checkout (owner, 2026-11-06), as RiftCompare #340 and OP Compare #99.
const URL_V = "https://www.example-store.co.uk/products/combat-patrol-space-marines?variant=44123456789012";

test("an in-stock Shopify row opens the store's cart, tagged; otherwise the product page", () => {
  const out = storeUrl(URL_V, null, { checkout: true });
  const u = new URL(out);
  assert.equal(u.pathname, "/cart/44123456789012:1");
  assert.equal(u.searchParams.get("utm_source"), "wargamecompare.com");
  assert.equal(u.searchParams.get("utm_content"), "checkout");
  assert.ok(isCheckoutLink(out));
  assert.equal(new URL(storeUrl(URL_V)).pathname, "/products/combat-patrol-space-marines", "sold out / not asked → product page");
  assert.equal(new URL(storeUrl(URL_V, { param: "ref", value: "wgc" }, { checkout: true })).pathname, "/products/combat-patrol-space-marines", "a partner code keeps the page its tracking runs on");
  assert.equal(shopifyCartUrl("https://www.example-store.co.uk/products/x"), null);
});

test("Awin wins over checkout; the import names every Shopify listing's variant; rows pass their stock", () => {
  const src = readFileSync(new URL("../src/lib/affiliate.ts", import.meta.url), "utf8");
  const body = src.slice(src.indexOf("export function storeUrl("));
  assert.ok(body.indexOf("if (awin) return awin;") > 0 && body.indexOf("shopifyCartUrl(") > body.indexOf("if (awin) return awin;"));
  assert.match(readFileSync(new URL("../scripts/import.ts", import.meta.url), "utf8"), /\$\{v\.id \? `\?variant=\$\{v\.id\}` : ""\}/);
  assert.match(readFileSync(new URL("../src/lib/price-rows.ts", import.meta.url), "utf8"), /\{ checkout: o\.in \}/);
});
