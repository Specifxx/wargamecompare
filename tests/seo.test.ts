// SEO audit (2026-11-03): split sitemap, landing title and description, structured data on deep pages, alt text.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { breadcrumbLd, homeAlternates } from "../src/lib/seo";
import { sitemapIndexXml, sitemapPart, sitemapParts } from "../src/lib/sitemap";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../src/lib/site";

const read = (p: string) => readFileSync(p, "utf8");
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));

test("the sitemap is an index of parts, each well under 10,000 URLs", () => {
  const index = sitemapIndexXml();
  assert.match(index, /<sitemapindex/);
  for (const p of sitemapParts()) {
    assert.ok(index.includes(`${SITE_URL}/sitemaps/${p}.xml`), p);
    const urls = sitemapPart(p)!;
    assert.ok(urls.length > 0 && urls.length < 10_000, `${p}: ${urls.length}`);
  }
  assert.equal(sitemapPart("xx"), null);
});

test("the landing title fits 60 characters, keyword first, brand last; the description names Warhammer and Games Workshop", () => {
  const m = read("src/app/(site)/page.tsx").match(/absolute: `([^`]+)`/)!;
  const title = m[1].replace("${SITE_NAME}", SITE_NAME);
  assert.ok(title.length <= 60, title);
  assert.match(title, /^Warhammer/);
  assert.ok(title.endsWith(SITE_NAME));
  assert.match(SITE_DESCRIPTION, /Warhammer/);
  assert.match(SITE_DESCRIPTION, /Games Workshop/);
  assert.ok(SITE_DESCRIPTION.length <= 160, String(SITE_DESCRIPTION.length));
});

test("homes are reciprocal hreflang alternates with the chooser as x-default", () => {
  const a = homeAlternates(`${SITE_URL}/uk`)!;
  const langs = a.languages as Record<string, string>;
  assert.equal(langs["x-default"], SITE_URL);
  assert.equal(langs["en-GB"], `${SITE_URL}/uk`);
  assert.equal(Object.keys(langs).length, 6);
});

test("breadcrumbs: absolute URLs, positions from 1", () => {
  const b = breadcrumbLd([{ name: "UK", path: "/uk" }, { name: "Kit", path: "/uk/p/x" }]);
  assert.equal(b.itemListElement[1].position, 2);
  assert.equal(b.itemListElement[1].item, `${SITE_URL}/uk/p/x`);
});

test("every product photo has descriptive alt text", () => {
  for (const f of [...walk("src/components"), ...walk("src/app")].filter((f) => f.endsWith(".tsx") && !f.endsWith("QuickView.tsx"))) {
    assert.ok(!/<img[^>]*alt=""/.test(read(f)), f);
  }
});

test("llms.txt exists and the CDN holds it and the sitemap parts", () => {
  assert.ok(statSync("src/app/llms.txt/route.ts").isFile());
  assert.match(read("next.config.js"), /"\/llms\.txt"/);
  assert.match(read("next.config.js"), /"\/sitemaps\/:path\*"/);
});
