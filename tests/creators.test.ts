// /creators (owner, 2026-10-31): a static list, every avatar on disk under public/img/creators/, no follower counts,
// linked from the landing page, the footer, the menu and the sitemap.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { CREATORS, featuredCreators, initials } from "../src/lib/creators";

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("every creator is complete, https-only, with an avatar on disk and no follower count", () => {
  assert.ok(CREATORS.length >= 1);
  const slugs = new Set<string>();
  for (const c of CREATORS) {
    assert.match(c.slug, /^[a-z0-9-]+$/);
    assert.ok(!slugs.has(c.slug), c.slug);
    slugs.add(c.slug);
    assert.ok(c.links.length >= 1 && c.links.every((l) => l.url.startsWith("https://")), c.slug);
    assert.match(c.since, /^\d{4}-\d{2}-\d{2}$/);
    if (c.avatar) {
      assert.match(c.avatar, /^\/img\/creators\/[a-z0-9-]+\.webp$/);
      assert.ok(existsSync(new URL(`../public${c.avatar}`, import.meta.url)), c.avatar);
    }
    assert.doesNotMatch(JSON.stringify(c), /followers?\b|\d[\d,.]*\s*k\b/i, `${c.slug}: no follower counts`);
  }
});

test("newest first; initials", () => {
  const list = featuredCreators([
    { slug: "a", name: "A", blurb: "", about: "", links: [], tags: [], since: "2026-01-01" },
    { slug: "b", name: "B", blurb: "", about: "", links: [], tags: [], since: "2026-02-01" },
  ]);
  assert.deepEqual(list.map((c) => c.slug), ["b", "a"]);
  assert.equal(initials("Kevin Lepage"), "KL");
});

test("linked from the landing page, footer, menu and sitemap, and held by the CDN", () => {
  assert.match(read("src/app/(site)/page.tsx"), /<CreatorsTeaser/);
  assert.match(read("src/components/Footer.tsx"), /href="\/creators"/);
  assert.match(read("src/lib/nav.ts"), /href: "\/creators"/);
  assert.match(read("src/app/sitemap.ts"), /"\/creators"/);
  assert.match(read("next.config.js"), /"\/creators"/);
});
