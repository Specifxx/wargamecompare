// Affiliates are how the site earns: every paid link carries a per-region, per-placement tag so earnings can be
// measured, and never changes the order of the store rows.
import { test } from "node:test";
import assert from "node:assert/strict";
import { amazonSearchUrl, amazonTags, ebaySearchUrl, ebayAffiliateUrl, storeUrl, subId, waylandSearchUrl } from "../src/lib/affiliate";
import { activeStoreCode, codesNeedingRecheck, partnerRefUrl } from "../src/lib/store-partner-deals";

test("eBay links: right site per region, campaign and customid", () => {
  const uk = new URL(ebaySearchUrl("Combat Patrol: Necrons", "uk", "product-ebay"));
  assert.equal(uk.hostname, "www.ebay.co.uk");
  assert.equal(uk.searchParams.get("customid"), "wgc-uk-product-ebay");
  assert.equal(uk.searchParams.get("LH_ItemCondition"), "1000");
  assert.ok(uk.searchParams.get("campid"));
  assert.equal(new URL(ebaySearchUrl("x", "nz", "header")).hostname, "www.ebay.com.au");
  const item = new URL(ebayAffiliateUrl("https://www.ebay.ca/itm/1", "ca", "product-ebay"));
  assert.equal(item.searchParams.get("mkrid"), "706-53473-19255-0");
  assert.equal(subId("au", "deals"), "wgc-au-deals");
});

test("Amazon: tag per store, hidden where none is set", () => {
  const tags = amazonTags({ AMAZON_TAG_UK: "wgc-21" });
  assert.equal(tags.uk, "wgc-21");
  assert.equal(tags.ca, null);
  assert.equal(amazonSearchUrl("x", "ca", "product-amazon", tags), null);
  const us = new URL(amazonSearchUrl("Codex: Orks", "us", "product-amazon", amazonTags({}))!);
  assert.equal(us.searchParams.get("tag"), "riftcompare-20");
  assert.equal(us.searchParams.get("ascsubtag"), "wgc-us-product-amazon");
  assert.equal(amazonTags({ AMAZON_TAG_US: "bad tag!" }).us, "riftcompare-20");
});

test("Wayland: only a waylandgames.co.uk template with {q}", () => {
  assert.equal(waylandSearchUrl("x", undefined), null);
  assert.equal(waylandSearchUrl("x", "https://evil.example/?q={q}"), null);
  assert.equal(waylandSearchUrl("x", "https://www.waylandgames.co.uk/search?q=x"), null);
  assert.match(waylandSearchUrl("Codex: Orks", "https://www.waylandgames.co.uk/search?q={q}&aff=1")!, /q=Codex/);
  const awin = waylandSearchUrl("Kill Team", "https://www.awin1.com/cread.php?awinmid=1&awinaffid=2&ued=https%3A%2F%2Fwww.waylandgames.co.uk%2Fsearch%3Fq%3D{q}")!;
  assert.equal(new URL(new URL(awin).searchParams.get("ued")!).searchParams.get("q"), "Kill Team");
  assert.equal(waylandSearchUrl("x", "https://www.awin1.com/cread.php?ued=https%3A%2F%2Fevil.example%2F{q}"), null);
});

test("store links: utm_source, plus a partner's ref; codes expire", () => {
  const u = new URL(storeUrl("https://store.example/p?a=1", { param: "ref", value: "wgc" }));
  assert.equal(u.searchParams.get("utm_source"), "wargamecompare.com");
  assert.equal(u.searchParams.get("ref"), "wgc");
  const deal = [{ host: "store.example", name: "S", since: "2026-10-01", code: "WGC5", offer: "5% off", checked: "2026-10-20", ref: { param: "r", value: "1" } }];
  assert.equal(activeStoreCode("https://www.store.example/x", new Date("2026-10-28"), deal)?.code, "WGC5");
  assert.equal(activeStoreCode("https://store.example/x", new Date("2026-11-30"), deal), null);
  assert.equal(codesNeedingRecheck(new Date("2026-11-15"), 7, deal).length, 1);
  assert.match(partnerRefUrl(new URL("https://store.example/x"), deal)!, /r=1/);
});
