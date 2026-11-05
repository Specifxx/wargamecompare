// Amazon's Creators API prices (2026-11-05): fetched by the build, by EAN, shown 24 hours, never committed.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { credentialsFor, itemsOf, pickListing, tokenEndpoint, type Item } from "../src/lib/amazon-creators";
import { isFreshAmazonPrice, storeFor } from "../src/lib/amazon-live";
import { amazonItemUrl } from "../src/lib/affiliate";

test("the token endpoint follows the credential version, else the store's home region", () => {
  assert.equal(tokenEndpoint("3.1", "au"), "https://api.amazon.com/auth/o2/token");
  assert.equal(tokenEndpoint("3.3", "us"), "https://api.amazon.co.jp/auth/o2/token");
  assert.equal(tokenEndpoint(undefined, "uk"), "https://api.amazon.co.uk/auth/o2/token");
  assert.equal(tokenEndpoint(undefined, "au"), "https://api.amazon.co.jp/auth/o2/token");
});

test("one credential serves every store: the AU-named variables are the default, a store's own win", () => {
  const au = { AMAZON_CREATORS_AU_CLIENT_ID: " a ", AMAZON_CREATORS_AU_CLIENT_SECRET: "b", AMAZON_CREATORS_AU_VERSION: "3.3" };
  assert.equal(credentialsFor("us", {}), null);
  assert.equal(credentialsFor("us", { AMAZON_CREATORS_AU_CLIENT_ID: "a" }), null);
  assert.deepEqual(credentialsFor("au", au), { id: "a", secret: "b", version: "3.3" });
  assert.deepEqual(credentialsFor("us", au), { id: "a", secret: "b", version: "3.3" });
  assert.deepEqual(credentialsFor("us", { ...au, AMAZON_CREATORS_US_CLIENT_ID: "u", AMAZON_CREATORS_US_CLIENT_SECRET: "v" }), { id: "u", secret: "v", version: "3.1" });
});

const listing = (amount: number, o: Partial<{ cond: string; avail: string; cur: string; box: boolean; seller: string }> = {}) => ({
  price: { money: { amount, currency: o.cur ?? "GBP" } },
  condition: { value: o.cond ?? "New" },
  availability: { type: o.avail ?? "IN_STOCK" },
  isBuyBoxWinner: o.box,
  merchantInfo: { name: o.seller ?? "Amazon.co.uk" },
});
const item = (...listings: ReturnType<typeof listing>[]): Item => ({ asin: "B000000001", offersV2: { listings } });

test("the shown price is the new, in-stock buy box in the store's currency, else the cheapest such listing", () => {
  assert.deepEqual(pickListing(item(listing(30), listing(25, { box: true })), "GBP"), { amount: 25, seller: undefined });
  assert.deepEqual(pickListing(item(listing(30, { seller: "Hobby Shop" }), listing(28)), "GBP"), { amount: 28, seller: undefined });
  assert.equal(pickListing(item(listing(30, { seller: "Hobby Shop" })), "GBP")!.seller, "Hobby Shop");
  assert.equal(pickListing(item(listing(10, { cond: "Used" })), "GBP"), null, "used is never shown");
  assert.equal(pickListing(item(listing(10, { avail: "OUT_OF_STOCK" })), "GBP"), null);
  assert.equal(pickListing(item(listing(10, { cur: "USD" })), "GBP"), null, "another currency is another store");
  assert.equal(pickListing({ asin: "B000000001", offersV2: null }, "GBP"), null);
  assert.deepEqual(itemsOf({ itemResults: { items: [item()] } }).length, 1);
});

test("a price is shown for 24 hours after it was fetched, never from the future; NZ reads Amazon AU", () => {
  const now = Date.parse("2026-11-05T12:00:00Z");
  assert.ok(isFreshAmazonPrice("2026-11-05T00:00:00Z", now));
  assert.ok(!isFreshAmazonPrice("2026-11-04T11:00:00Z", now));
  assert.ok(!isFreshAmazonPrice("2026-11-06T00:00:00Z", now));
  assert.ok(!isFreshAmazonPrice(undefined, now));
  assert.equal(storeFor("nz"), "au");
  assert.equal(storeFor("uk"), "uk");
});

test("an item link goes to Amazon's own page with the region's tag and the sub id", () => {
  assert.match(amazonItemUrl("B0ABCDEFGH", "us", "product-amazon")!, /^https:\/\/www\.amazon\.com\/dp\/B0ABCDEFGH\?tag=riftcompare-20&ascsubtag=wgc-us-product-amazon$/);
  assert.match(amazonItemUrl("B0ABCDEFGH", "nz", "product-amazon")!, /amazon\.com\.au\/dp\/.*tag=wargamecomp-22/);
  assert.equal(amazonItemUrl("not-an-asin", "us", "product-amazon"), null);
});

const walk = (d: string): string[] => fs.readdirSync(d).flatMap((f) => (fs.statSync(path.join(d, f)).isDirectory() ? walk(path.join(d, f)) : [path.join(d, f)]));

test("the Creators API client stays build-side; only the price rows read live Amazon prices; prices are never committed", () => {
  for (const f of [...walk("src/app"), ...walk("src/components"), ...walk("src/lib")].filter((f) => /\.tsx?$/.test(f))) {
    const s = fs.readFileSync(f, "utf8");
    if (f !== "src/lib/amazon-creators.ts") assert.ok(!/amazon-creators/.test(s), `${f} imports the Creators API client`);
    if (/from "(\.|@\/lib)\/amazon-live"/.test(s)) assert.ok(f === "src/lib/price-rows.ts" || f === "src/lib/amazon-creators.ts", `${f} reads live Amazon prices`);
    assert.ok(!/AMAZON_CREATORS/.test(s) || f === "src/lib/amazon-creators.ts", `${f} names the credentials`);
  }
  assert.match(fs.readFileSync(".gitignore", "utf8"), /^\/data\/amazon-live\/$/m);
  assert.match(JSON.parse(fs.readFileSync("package.json", "utf8")).scripts.build, /^\(tsx scripts\/fetch-amazon-prices\.ts \|\| true\) && next build/);
  assert.match(fs.readFileSync("next.config.js", "utf8"), /\.\/data\/amazon-live\/\*\.json/);
});
