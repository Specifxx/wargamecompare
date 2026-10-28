// Navigation from the first page (owner, 2026-10-28) and eBay across the site: every menu link is a real page, and every region
// page carries the eBay strip above its footer.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FACTION_BY_SLUG, SYSTEM_BY_SLUG, TYPE_BY_SLUG } from "../src/lib/catalog";
import { navGroups, retargetHref } from "../src/lib/nav";

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("every menu link is a page that exists", () => {
  for (const g of navGroups("uk")) {
    for (const l of g.links) {
      const m = /^\/uk\/(game|faction|type)\/([a-z0-9-]+)$/.exec(l.href);
      if (m) {
        const map = { game: SYSTEM_BY_SLUG, faction: FACTION_BY_SLUG, type: TYPE_BY_SLUG }[m[1] as "game" | "faction" | "type"];
        assert.ok(map.has(m[2]), l.href);
      } else assert.match(l.href, /^\/uk\/(deals|stores)$|^\/(about|contact)$/, l.href);
    }
  }
  assert.equal(retargetHref("/uk/deals", "nz"), "/nz/deals");
  assert.equal(retargetHref("/about", "nz"), "/about");
});

test("no 'continue to region' step: the landing page has shortcuts and the full menu", () => {
  assert.doesNotMatch(read("src/components/RegionSuggest.tsx"), /Compare prices in/);
  assert.match(read("src/app/(site)/layout.tsx"), /SoftSideNav/);
  assert.match(read("src/components/HeaderBar.tsx"), /MobileMenu/);
});

test("eBay strips: above every region page's footer, labelled Ad, never a store's photo", () => {
  assert.match(read("src/app/[region]/layout.tsx"), /<EbayStrip[^>]*placement="ebay-strip-footer"/);
  const strip = read("src/components/EbayStrip.tsx");
  assert.match(strip, /ad-pill/);
  assert.doesNotMatch(strip, /product\.image|p\.image/);
  for (const f of ["src/app/[region]/page.tsx", "src/components/HubPage.tsx", "src/app/[region]/p/[slug]/page.tsx", "src/app/[region]/deals/page.tsx"]) assert.match(read(f), /<EbayStrip/, f);
});

test("eBay goes first: pinned above the store rows and beside the best price, never the Cheapest badge", () => {
  const page = read("src/app/[region]/p/[slug]/page.tsx");
  assert.ok(page.indexOf('placement="product-ebay"') < page.indexOf("offers.map("), "eBay row before the store rows");
  assert.match(page, /Shown first/);
  assert.match(page, /placement="product-best-ebay"/);
  assert.match(page, /o\.in && i === 0 && <span[^>]*>Cheapest</);
  assert.match(read("src/components/Search.tsx"), /placement="browse-ebay"/);
  for (const [f, grid] of [["src/app/[region]/page.tsx", "<ProductGrid"], ["src/components/HubPage.tsx", "<ProductGrid"], ["src/app/[region]/deals/page.tsx", "list.map("]]) {
    const s = read(f);
    assert.ok(s.indexOf("<EbayStrip") < s.indexOf(grid), `${f}: eBay strip above the first list`);
  }
});
