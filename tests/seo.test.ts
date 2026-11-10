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
  for (const f of [...walk("src/components"), ...walk("src/app")].filter((f) => f.endsWith(".tsx") && !f.endsWith("QuickView.tsx") && !f.endsWith("Flag.tsx"))) {
    // Flag.tsx: a decorative flag beside its region's written name (alt="" so the name is not read twice), not a product photo.
    assert.ok(!/<img[^>]*alt=""/.test(read(f)), f);
  }
});

test("llms.txt exists and the CDN holds it and the sitemap parts", () => {
  assert.ok(statSync("src/app/llms.txt/route.ts").isFile());
  assert.match(read("next.config.js"), /"\/llms\.txt"/);
  assert.match(read("next.config.js"), /"\/sitemaps\/:path\*"/);
});

test("New Zealand product and guide pages are noindex and out of the sitemap; its hubs stay (2026-11-08)", async () => {
  const { INDEXED_DETAIL_REGIONS, detailIndexed } = await import("../src/lib/index-tiers");
  assert.deepEqual([...INDEXED_DETAIL_REGIONS], ["uk", "au", "ca", "us"]);
  assert.equal(detailIndexed("nz"), false);
  const nz = (sitemapPart("nz") ?? []).map((u) => u.url);
  assert.ok(nz.includes(`${SITE_URL}/nz`), "the NZ home stays");
  assert.ok(!nz.some((u) => u.includes("/nz/p/") || u.includes("/nz/guides/")), "no NZ product or guide page");
  const uk = (sitemapPart("uk") ?? []).map((u) => u.url);
  assert.ok(uk.some((u) => u.includes("/uk/guides/")), "UK guides listed");
  const src = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
  assert.match(src("src/app/[region]/p/[slug]/page.tsx"), /const indexable = detailIndexed\(r\.region\) && productIndexable\(s\)/);
  assert.match(src("src/app/[region]/guides/[slug]/page.tsx"), /robots: detailIndexed\(r\.region\) \? undefined : \{ index: false, follow: true \}/);
});

test("each region's sitemap lists at most SITEMAP_PRODUCTS products, demand first (SEO-5, 2026-11-10)", async () => {
  const { SITEMAP_PRODUCTS, sitemapProducts } = await import("../src/lib/index-tiers");
  assert.equal(SITEMAP_PRODUCTS, 450);
  const mk = (id: string, inStock: number) => ({ product: { id }, stores: 3, inStock }) as never;
  const items = [mk("a", 9), mk("b", 1), mk("c", 5), mk("d", 3)];
  assert.deepEqual(sitemapProducts(items, new Set(["b"]), 3).map((s) => (s as { product: { id: string } }).product.id), ["b", "a", "c"]);
  let total = 0;
  for (const p of sitemapParts()) {
    const urls = sitemapPart(p)!;
    total += urls.length;
    assert.ok(urls.filter((u) => u.url.includes("/p/")).length <= SITEMAP_PRODUCTS, `${p} product cap`);
  }
  assert.ok(total < 2500, `sitemap has ${total} URLs`);
});
