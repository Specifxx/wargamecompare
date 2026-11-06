import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { awinProgrammeFor, awinUrl, AWIN_PUBLISHER_ID } from "../src/lib/awin";

const JOINED = [{ id: 1599, name: "Example", domains: ["example-store.co.uk"] }];

test("a joined advertiser's link becomes a tracked Awin deep link to the same page", () => {
  const url = "https://www.example-store.co.uk/p/1?utm_source=x";
  const u = new URL(awinUrl(url, "row", JOINED)!);
  assert.equal(u.hostname, "www.awin1.com");
  assert.equal(u.searchParams.get("awinmid"), "1599");
  assert.equal(u.searchParams.get("awinaffid"), String(AWIN_PUBLISHER_ID));
  assert.equal(u.searchParams.get("ued"), url);
});

test("other stores, look-alikes, eBay and Amazon are left alone", () => {
  assert.equal(awinUrl("https://other.example/p", "row", JOINED), null);
  assert.equal(awinUrl("https://example-store.co.uk.evil.example/p", "row", JOINED), null);
  assert.equal(awinProgrammeFor("https://www.ebay.com/itm/1", [{ id: 2, name: "x", domains: ["ebay.com"] }]), null);
  assert.equal(awinProgrammeFor("https://www.amazon.com/dp/B0", [{ id: 2, name: "x", domains: ["amazon.com"] }]), null);
});

test("the committed Awin list is an empty, public-only default and the build fetches the real one first", () => {
  const f = JSON.parse(readFileSync("src/lib/awin-programmes.json", "utf8"));
  assert.equal(f.publisherId, AWIN_PUBLISHER_ID);
  assert.ok(Array.isArray(f.joined));
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  assert.match(pkg.scripts.build, /tsx scripts\/fetch-awin\.ts \|\| true/);
});

test("store links go through Awin when no partner code applies, and earn the sponsored rel", async () => {
  const { storeRel, REL_PAID, REL_STORE } = await import("../src/lib/affiliate");
  assert.equal(storeRel("https://www.awin1.com/cread.php?awinmid=1&awinaffid=3144410&ued=x"), REL_PAID);
  assert.equal(storeRel("https://www.elementgames.co.uk/x"), REL_STORE);
  const src = readFileSync("src/lib/affiliate.ts", "utf8");
  assert.match(src, /const awin = awinUrl\(u\.toString\(\), clickref\("wgc"[^\n]*\n\s*if \(awin\) return awin;/);
  for (const f of ["src/components/PriceList.tsx", "src/components/StickyBuyBar.tsx"]) assert.doesNotMatch(readFileSync(f, "utf8"), /rel=\{REL_STORE\}/, f);
});
