import { test } from "node:test";
import assert from "node:assert/strict";
import { ebayRowShown, endUserContext, intervalHours, listingMatches, pickBest, plan, searchFilter, searchQuery, SHARE } from "../src/lib/import/ebay";
import type { Product } from "../src/lib/types";

const P = (name: string, id = name): Product => ({ id, name, system: null, faction: null, type: "miniatures", ean: null, codes: [], code: null, image: null, firstSeen: "2026-10-28" });

test("the matcher wants the same kit, new and whole", () => {
  const p = P("Combat Patrol: Necrons");
  assert.ok(listingMatches(p, "Warhammer 40k Combat Patrol Necrons NEW SEALED"));
  assert.ok(!listingMatches(p, "Combat Patrol Necrons painted"));
  assert.ok(!listingMatches(p, "Necrons bits lot combat patrol"));
  assert.ok(!listingMatches(p, "Combat Patrol Space Marines"));
  assert.ok(!listingMatches(P("Kill Team: Death Korps (2024)"), "Kill Team Death Korps 2021"));
});

test("pickBest: cheapest total in the price window and currency", () => {
  const p = P("Combat Patrol: Necrons");
  const it = (v: string, ship: string, cur = "GBP", title = "Combat Patrol Necrons new") => ({ title, price: { value: v, currency: cur }, shippingOptions: [{ shippingCost: { value: ship } }], itemWebUrl: `https://ebay/${v}` });
  const best = pickBest(p, [it("70.00", "5.00"), it("68.00", "9.00"), it("20.00", "0"), it("60.00", "0", "USD")], "GBP", 9000, "now");
  assert.equal(best?.p, 7000);
  assert.equal(best?.sh, 500);
});

test("plan: shares sum to one, cheap items skipped, fresh items wait", () => {
  assert.equal(Object.values(SHARE).reduce((a, b) => a + b, 0).toFixed(2), "1.00");
  assert.equal(intervalHours(150, 1), 24);
  assert.equal(intervalHours(20, 1), 96);
  const now = new Date("2026-10-28T12:00:00Z");
  const c = (id: string, ref: number) => ({ product: P(id), market: "UK" as const, ref, stores: 3 });
  const out = plan([c("cheap", 900), c("fresh", 9000), c("due", 9000)], { updatedAt: null, items: { UK: { fresh: { p: 1, sh: 0, u: "", t: "", i: null, at: "2026-10-28T06:00:00Z", l: "GB" } } } } as never, 100, now);
  assert.deepEqual(out.map((x) => x.product.id), ["due"]);
  assert.equal(searchQuery(P("Kill Team: Death Korps (2024)")), "Kill Team Death Korps");
});

test("plan: the US searches first, has the largest share and takes the slots other sites leave", () => {
  const now = new Date("2026-10-28T12:00:00Z");
  assert.ok(Object.entries(SHARE).every(([m, v]) => m === "US" || v < SHARE.US!), "the US has the largest share");
  const c = (id: string, market: "US" | "UK" | "AU" | "CA") => ({ product: P(id), market, ref: 9000, stores: 3 });
  const cands = [...Array.from({ length: 50 }, (_, i) => c(`us${i}`, "US")), c("uk1", "UK"), c("au1", "AU"), ...Array.from({ length: 50 }, (_, i) => c(`ca${i}`, "CA"))];
  const out = plan(cands, { updatedAt: null, items: {} } as never, 20, now);
  assert.equal(out.length, 20);
  assert.equal(out[0].market, "US");
  const firstOther = out.findIndex((x) => x.market !== "US");
  assert.ok(out.slice(firstOther).every((x) => x.market !== "US"), "every US search runs before any other site's");
  // US 7 + UK 1 + AU 1 + CA 3 = 12 by share; the 8 spare go to the US.
  assert.equal(out.filter((x) => x.market === "US").length, 15);
  assert.equal(out.filter((x) => x.market === "CA").length, 3);
});

test("eBay rows come from local sellers with known postage (visitor feedback, 2026-10-31)", () => {
  const f = searchFilter("AU", 10000);
  assert.ok(f.includes("itemLocationCountry:AU") && f.includes("deliveryCountry:AU"));
  assert.ok(searchFilter("UK", 10000).includes("itemLocationCountry:GB"));
  const ctx = endUserContext("AU", "5339155912", "wgc-au-ebay-x");
  assert.ok(ctx.startsWith("affiliateCampaignId=5339155912,affiliateReferenceId=wgc-au-ebay-x,contextualLocation="));
  assert.equal(decodeURIComponent(ctx.split("contextualLocation=")[1]), "country=AU,zip=2000");

  // An overseas seller and a listing with unknown (calculated) postage are never picked; the stored row is the local one.
  const p = P("Combat Patrol: Necrons");
  const it = (v: string, ship: string | null, country: string) => ({
    title: "Combat Patrol Necrons new", price: { value: v, currency: "AUD" }, itemLocation: { country },
    shippingOptions: ship == null ? [{ shippingCostType: "CALCULATED" }] : [{ shippingCost: { value: ship } }], itemWebUrl: `https://ebay/${v}`,
  });
  const best = pickBest(p, [it("150.00", "35.00", "GB"), it("140.00", null, "AU"), it("160.00", "12.00", "AU")], "AUD", 17000, "now", "AU");
  assert.equal(best?.p, 16000);
  assert.equal(best?.sh, 1200);
  assert.equal(best?.l, "AU");

  // Rows from the older worldwide search: shown only with known, local-sized postage, and searched again first.
  const row = (sh: number | null, l?: string) => ({ p: 10000, sh, u: "", t: "", i: null, at: "2026-10-30T00:00:00Z", ...(l ? { l } : {}) });
  assert.ok(ebayRowShown(row(3500, "AU"), "AU"));
  assert.ok(ebayRowShown(row(1000), "AU"));
  assert.ok(!ebayRowShown(row(3500), "AU"));
  assert.ok(!ebayRowShown(row(null), "US"));
  const now = new Date("2026-10-30T06:00:00Z");
  const c = (id: string) => ({ product: P(id), market: "AU" as const, ref: 9000, stores: 3 });
  const out = plan([c("old"), c("local")], { updatedAt: null, items: { AU: { old: row(800), local: row(800, "AU") } } } as never, 100, now);
  assert.deepEqual(out.map((x) => x.product.id), ["old"]);
});
