// Temporary: which stores carry Games Workshop product, and in which collections. Two stores at a time.
import fs from "node:fs";
const lines = fs.readFileSync(new URL("./candidates.txt", import.meta.url), "utf8").trim().split("\n").map(l => l.split(/\s+/));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
async function get(url, kind = "json") {
  for (let i = 0; i < 3; i++) {
    let r;
    try { r = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(20000) }); } catch { return null; }
    if (r.status === 429) { await sleep(15000 * (i + 1)); continue; }
    if (!r.ok) return null;
    try { return kind === "json" ? await r.json() : await r.text(); } catch { return null; }
  }
  return null;
}
const GWH = /warhammer|games-?workshop|citadel|40k|40-?000|age-?of-?sigmar|kill-?team|horus|old-?world|necromunda|blood-?bowl|middle-?earth|gw-|-gw\b|^gw$/i;
const isGW = p => /games workshop|warhammer|citadel|black library|forge ?world/i.test(`${p.vendor} ${p.product_type} ${p.title}`);
async function probe([market, key, base]) {
  const r = { market, key, base, collections: [], best: null, gwFirstPage: 0, currency: null };
  const meta = await get(`${base}/meta.json`);
  r.currency = meta?.currency ?? null;
  let handles = new Set();
  const idx = await get(`${base}/sitemap.xml`, "text");
  let maps = idx ? [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(/&amp;/g, "&")).filter(u => /sitemap_collections/i.test(u)) : [];
  if (!maps.length) maps = [`${base}/sitemap_collections_1.xml`];
  for (const u of maps.slice(0, 3)) { const x = await get(u, "text"); if (x) for (const m of x.matchAll(/\/collections\/([^<\/?#"\s]+)/g)) handles.add(decodeURIComponent(m[1])); await sleep(500); }
  const cands = [...handles].filter(h => GWH.test(h)).sort((a, b) => a.length - b.length);
  r.handles = cands.slice(0, 40);
  for (const h of cands.slice(0, 6)) {
    const j = await get(`${base}/collections/${h}/products.json?limit=250`);
    await sleep(700);
    if (!j?.products) continue;
    const gw = j.products.filter(isGW).length;
    r.collections.push({ h, n: j.products.length, gw });
  }
  if (!r.collections.length) {
    const j = await get(`${base}/products.json?limit=250`);
    if (j?.products) r.gwFirstPage = j.products.filter(isGW).length;
  }
  r.best = r.collections.sort((a, b) => b.gw - a.gw)[0] ?? null;
  return r;
}
const results = [];
for (let i = 0; i < lines.length; i += 2) {
  const batch = await Promise.all(lines.slice(i, i + 2).map(probe));
  for (const r of batch) { results.push(r); console.log(`R ${JSON.stringify({ m: r.market, k: r.key, b: r.base, c: r.currency, best: r.best, all: r.collections, fp: r.gwFirstPage, hs: r.handles?.slice(0, 15) })}`); }
}
