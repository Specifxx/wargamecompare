// Navigation from the first page (owner, 2026-10-28) and eBay across the site: every menu link is a real page, and every region
// page carries the eBay strip above its footer.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FACTION_BY_SLUG, SYSTEM_BY_SLUG, TYPE_BY_SLUG } from "../src/lib/catalog";
import { navGroups, retargetHref } from "../src/lib/nav";
import { GUIDE_BY_SLUG } from "../src/lib/guides";

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("every menu link is a page that exists", () => {
  for (const g of navGroups("uk")) {
    for (const l of g.links) {
      const m = /^\/uk\/(game|faction|type)\/([a-z0-9-]+)$/.exec(l.href);
      if (m) {
        const map = { game: SYSTEM_BY_SLUG, faction: FACTION_BY_SLUG, type: TYPE_BY_SLUG }[m[1] as "game" | "faction" | "type"];
        assert.ok(map.has(m[2]), l.href);
      } else if (l.href.startsWith("/uk/guides/")) assert.ok(GUIDE_BY_SLUG.has(l.href.slice("/uk/guides/".length)), l.href);
      else assert.match(l.href, /^\/uk\/(deals|new-releases|black-friday|cyber-monday|stores)$|^\/(about|contact|creators|forum)$/, l.href);
    }
  }
  assert.equal(retargetHref("/uk/deals", "nz"), "/nz/deals");
  assert.equal(retargetHref("/about", "nz"), "/about");
});

test("no 'continue to region' step: the landing page has shortcuts and the full menu", () => {
  assert.doesNotMatch(read("src/components/RegionSuggest.tsx"), /Compare prices in/);
  assert.match(read("src/app/(site)/layout.tsx"), /SoftSideNav/);
  assert.match(read("src/components/Header.tsx"), /MobileMenu/);
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
  // The rows are drawn by PriceList (shared with the quick view) from lib/price-rows.ts.
  assert.match(page, /<PriceList \{\.\.\.priceRows\(p, region, "product"\)\} \/>/);
  const list = read("src/components/PriceList.tsx");
  const ebayRow = list.indexOf("placement={ebay.placement}");
  const amazonRow = list.indexOf("placement={amazon.placement}");
  assert.ok(ebayRow > 0 && ebayRow < amazonRow && amazonRow < list.indexOf("stores.map("), "eBay first, Amazon second, then the stores");
  for (const s of [page, list]) assert.doesNotMatch(s, /Shown first/); // owner, 2026-10-30: no wording about the order
  assert.match(page, /placement="product-best-ebay"/);
  assert.match(read("src/lib/price-rows.ts"), /cheapest: o\.in && i === 0/);
  assert.match(list, /o\.cheapest && <span[^>]*>Cheapest</);
  assert.match(read("src/components/Search.tsx"), /placement="browse-ebay"/);
  for (const [f, grid] of [["src/app/[region]/page.tsx", "<ProductGrid"], ["src/components/HubPage.tsx", "<ProductGrid"], ["src/app/[region]/deals/page.tsx", "list.map("]]) {
    const s = read(f);
    assert.ok(s.indexOf("<EbayStrip") < s.indexOf(grid), `${f}: eBay strip above the first list`);
  }
});

test("header: Games, Armies and Products dropdowns, seven items at most, every dropdown link a real hub (Bill, 2026-11-09)", async () => {
  const { headerNavItems } = await import("../src/components/Header");
  for (const today of ["2026-06-01", "2026-11-20"]) {
    const items = headerNavItems("uk", today);
    // Below xl the xl-only items hide, and the row must stay short enough to hold the search box.
    assert.ok(items.length <= 8 && items.filter((i) => !i.xl).length <= 7, `${today}: ${items.map((i) => i.label)}`);
    for (const label of ["Games", "Armies", "Products"]) {
      const it = items.find((i) => i.label === label);
      assert.ok(it?.menu?.[0]?.links.length, label);
      assert.equal(it.href, it.menu[0].links[0].href, `${label} goes to its first hub`);
    }
  }
});

test("menus link only hubs that hold products (no dead ends)", () => {
  const live = { game: new Set(["warhammer-40k"]), faction: new Set(["necrons"]), type: new Set(["paints"]) };
  const links = navGroups("au", live).flatMap((g) => g.links.map((l) => l.href));
  assert.ok(links.includes("/au/game/warhammer-40k") && links.includes("/au/faction/necrons") && links.includes("/au/type/paints"));
  assert.ok(!links.includes("/au/game/warcry") && !links.includes("/au/faction/orks") && !links.includes("/au/type/terrain"));
  assert.ok(navGroups("au").flatMap((g) => g.links).length > links.length, "no filter: the whole list");
});

test("hub pages say where to go next: the game, the other armies, the kinds of kit", () => {
  assert.match(read("src/app/[region]/faction/[faction]/page.tsx"), /title: "Game"/);
  assert.match(read("src/app/[region]/game/[system]/page.tsx"), /By kind of kit/);
  assert.match(read("src/app/[region]/type/[type]/page.tsx"), /By game/);
  assert.match(read("src/components/HubPage.tsx"), /more\?\.map/);
});
