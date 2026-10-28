// Games Workshop's IP policy is strict: our name and logo never use its trademarks, we show no GW art of our own, and
// every page says we are not affiliated. Product photos are the stores' own listing photos, hotlinked.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { GW_DISCLAIMER, SITE_DOMAIN, SITE_NAME } from "../src/lib/site";

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const code = (s: string) => s.replace(/^\s*\/\/.*$/gm, "");

test("no GW trademark in the site's name, domain or logo", () => {
  for (const s of [SITE_NAME, SITE_DOMAIN, code(read("src/components/Logo.tsx")), read("src/app/icon.svg")]) {
    assert.doesNotMatch(s, /warhammer|40k|40,000|games workshop|citadel|sigmar/i);
  }
});

test("the footer carries the not-affiliated line", () => {
  assert.match(GW_DISCLAIMER, /not affiliated with, endorsed or sponsored by Games Workshop/);
  assert.match(read("src/components/Footer.tsx"), /GW_DISCLAIMER/);
  assert.match(read("src/app/(site)/terms/page.tsx") + read("src/app/(site)/about/page.tsx"), /GW_DISCLAIMER|Games Workshop/);
});

test("the share image is text only (no product or GW art)", () => {
  assert.doesNotMatch(read("src/app/opengraph-image.tsx"), /<img|src=\{?["']https?:/);
});

test("the hub share cards are text only, force-dynamic and CDN-held, never ISR", () => {
  assert.doesNotMatch(read("src/lib/og/hub-image.tsx"), /<img|src=\{?["']https?:|\.image\b/);
  for (const r of ["type/[type]", "faction/[faction]", "game/[system]"]) {
    const f = read(`src/app/[region]/${r}/opengraph-image.tsx`);
    assert.match(f, /export const dynamic = "force-dynamic"/);
    assert.doesNotMatch(f, /revalidate/);
    assert.match(read(`src/app/[region]/${r}/page.tsx`), /\/opengraph-image`\)/, `${r} page points og:image at its own card`);
  }
});
