// How pages are cached (the sister sites' lesson: ISR writes and per-request renders were the biggest lines of the
// bill). Every data page is force-dynamic and Vercel's CDN keeps its response for a day (next.config.js CDN_PAGES);
// that is only safe because no page reads a cookie, a header or the session, so one CDN copy serves every visitor.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const SOURCES = walk(join(ROOT, "src"))
  .filter((f) => /\.tsx?$/.test(f))
  .map((f) => ({ path: relative(ROOT, f).split("\\").join("/"), text: readFileSync(f, "utf8") }));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const config = require(join(ROOT, "next.config.js")) as { headers: () => Promise<{ source: string; headers: { key: string; value: string }[] }[]>; images?: { unoptimized?: boolean } };

function matches(source: string, path: string): boolean {
  const re = "^" + source.replace(/\/:(\w+)\(([^)]+)\)/g, "/($2)").replace(/\/:\w+\*/g, "(?:/.*)?").replace(/\/:\w+/g, "/[^/]+") + "$";
  return new RegExp(re).test(path);
}

test("no server code reads a cookie, a header or the session", () => {
  for (const s of SOURCES.filter((x) => !x.text.startsWith('"use client"'))) {
    assert.doesNotMatch(s.text, /from ["']next\/headers["']|\bcookies\(\)|\bheaders\(\)\s*\.|unstable_noStore|cache:\s*["']no-store["']/, `${s.path} reads the request`);
  }
});

test("no ISR anywhere but the share image, and that at a day", () => {
  for (const s of SOURCES) {
    const m = /^export const revalidate\s*=\s*([^;\n]+)/m.exec(s.text);
    if (!m) continue;
    assert.equal(s.path, "src/app/opengraph-image.tsx", `${s.path}: no revalidate on pages (CDN-cached instead)`);
    assert.ok(Number(m[1]) >= 86400);
  }
  for (const s of SOURCES) assert.doesNotMatch(s.text, /generateStaticParams\s*\(\)\s*\{[^}]*\S[^}]*return\s*\[[^\]]/, `${s.path}: no prewarming`);
});

test("every data page is force-dynamic and covered by a CDN rule of a day", async () => {
  const pages = SOURCES.filter((s) => s.path.startsWith("src/app/[region]/") && s.path.endsWith("/page.tsx"));
  assert.ok(pages.length >= 9, `found ${pages.length}`);
  const rules = (await config.headers()).filter((r) => r.headers.some((h) => h.key === "Vercel-CDN-Cache-Control"));
  for (const r of rules) assert.match(r.headers[0].value, /s-maxage=86400/);
  for (const p of pages) {
    assert.match(p.text, /^export const dynamic\s*=\s*["']force-dynamic["']/m, `${p.path} is force-dynamic`);
    const url = "/" + p.path.replace("src/app/", "").replace(/\/page\.tsx$/, "").replace("[region]", "uk").replace(/\[[^\]]+\]/g, "x");
    assert.ok(rules.some((r) => matches(r.source, url)), `${url} has a CDN rule`);
  }
  for (const u of ["/", "/sitemap.xml", "/uk", "/nz/p/x"]) assert.ok(rules.some((r) => matches(r.source, u)), u);
});

test("the search index API is held by the CDN for a day", () => {
  const r = SOURCES.find((s) => s.path === "src/app/api/index/[region]/route.ts")!;
  assert.match(r.text, /vercel-cdn-cache-control["']:\s*["']public, s-maxage=86400/);
});

test("images are never sent through Vercel's metered optimiser", () => {
  assert.equal(config.images?.unoptimized, true);
  for (const s of SOURCES) assert.doesNotMatch(s.text, /from ["']next\/image["']/, `${s.path} uses next/image`);
});

test("the importer's per-store cache is never bundled into a function", () => {
  const next = readFileSync(join(ROOT, "next.config.js"), "utf8");
  const includes = /outputFileTracingIncludes:\s*(\{[^}]*\})/.exec(next)?.[1] ?? "";
  assert.match(includes, /"\.\/data\/\*\.json"/);
  assert.doesNotMatch(includes.replace(`"/**"`, ""), /cache|\*\*/);
});
