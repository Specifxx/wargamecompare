import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { priceGap, productShareText, shareUrl } from "../src/lib/share-link";

// Word of mouth (DECISIONS.md, "Share buttons", 2026-11-02).
const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("every shared link carries utm_source=share", () => {
  assert.equal(shareUrl("https://wargamecompare.com", "/uk/p/x", "product"), "https://wargamecompare.com/uk/p/x?utm_source=share&utm_medium=product");
});

test("the share message names the real gap between two in-stock stores, else no numbers", () => {
  const name = (k: string) => k.toUpperCase();
  const fmt = (c: number) => `£${c / 100}`;
  assert.match(productShareText("Kit", [{ s: "a", p: 4000, in: true }, { s: "b", p: 5000, in: true }, { s: "c", p: 100, in: false }], name, fmt), /£40 at A, up to £50 elsewhere \(20% less\)/);
  assert.equal(priceGap([{ priceCents: 1, storeName: "A" }]), null);
  assert.doesNotMatch(productShareText("Kit", [{ s: "a", p: 4000, in: true }], name, fmt), /£/);
});

test("the share pieces are wired in, and share events are the only new Vercel events", () => {
  assert.match(read("src/app/[region]/p/[slug]/page.tsx"), /<ShareButton /);
  assert.match(read("src/components/QuickView.tsx"), /<ShareButton /);
  assert.match(read("src/app/layout.tsx"), /<ShareArrival \/>/);
  assert.match(read("src/lib/track.ts"), /new Set\(\["buy_click", "share", "share_visit", "share_unlock"\]\)/);
  assert.match(read("src/app/[region]/p/[slug]/opengraph-image.tsx"), /export const dynamic = "force-dynamic";/);
});

// Share-for-a-deal (owner, 2026-11-18).
import { pickShareArm } from "../src/components/ShareThanks";
test("the share-for-a-deal arm is drawn once, half and half, and kept; the thank-you points to the region's free deals page", () => {
  assert.equal(pickShareArm(null, 0.2), "reward");
  assert.equal(pickShareArm(null, 0.8), "plain");
  assert.match(read("src/components/ShareButton.tsx"), /<ShareThanks href=\{`\/\$\{path\.split\("\/"\)\[1\] \|\| "us"\}\/deals`\}/);
});
