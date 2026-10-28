// Temporary: what do Warhammer listings look like in each store's products.json? Two stores at a time.
import fs from "node:fs";
const lines = fs.readFileSync(new URL("./stores.txt", import.meta.url), "utf8").trim().split("\n").map(l => l.split(/\s+/));
const GW = /warhammer|games workshop|citadel|combat patrol|age of sigmar|kill team|horus heresy|necromunda|blood bowl|old world|space marine|astra militarum|aeldari|tyranid|ork|necron|stormcast|chaos|sororitas|t'au|tau empire|custodes|grey knights|imperial|skaven|seraphon/i;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(url) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; WargameCompareProbe/1.0; +https://wargamecompare.com)", accept: "application/json" } }).catch(e => ({ ok: false, status: String(e) }));
    if (r.ok) return r.json();
    if (r.status === 429) { await sleep(10000 * (i + 1)); continue; }
    return { error: r.status };
  }
  return { error: 429 };
}
async function probe([market, key, base]) {
  const out = { market, key, base, scanned: 0, gw: 0, gwVariants: 0, ean5011921: 0, ean13: 0, gwCode: 0, compareAt: 0, inStock: 0, currency: null, vendors: {}, types: {}, samples: [], error: null };
  for (let page = 1; page <= 30; page++) {
    const j = await get(`${base}/products.json?limit=250&page=${page}`);
    if (j.error) { out.error = j.error; break; }
    const ps = j.products || [];
    if (!ps.length) break;
    out.scanned += ps.length;
    for (const p of ps) {
      const text = `${p.title} ${p.vendor} ${p.product_type} ${(p.tags || []).join(" ")}`;
      if (!/games workshop|warhammer|citadel/i.test(text) && !GW.test(p.vendor || "")) continue;
      out.gw++;
      out.vendors[p.vendor] = (out.vendors[p.vendor] || 0) + 1;
      out.types[p.product_type] = (out.types[p.product_type] || 0) + 1;
      for (const v of p.variants || []) {
        out.gwVariants++;
        const sku = String(v.sku || "").trim();
        if (/^5011921\d{6}$/.test(sku)) out.ean5011921++;
        else if (/^\d{13}$/.test(sku)) out.ean13++;
        else if (/^99\d{9}$/.test(sku)) out.gwCode++;
        if (v.compare_at_price) out.compareAt++;
        if (v.available) out.inStock++;
      }
      if (out.samples.length < 25 && Math.random() < 0.15) out.samples.push({ t: p.title, h: p.handle, v: p.vendor, pt: p.product_type, vars: (p.variants || []).slice(0, 2).map(v => ({ t: v.title, sku: v.sku, p: v.price, c: v.compare_at_price, a: v.available, bc: v.barcode })), tags: (p.tags || []).slice(0, 8) });
    }
    await sleep(1500);
  }
  return out;
}
const results = [];
for (let i = 0; i < lines.length; i += 2) {
  const batch = await Promise.all(lines.slice(i, i + 2).map(probe));
  for (const r of batch) {
    results.push(r);
    console.log(`${r.market} ${r.key}: scanned ${r.scanned}, GW ${r.gw}, variants ${r.gwVariants}, EAN5011921 ${r.ean5011921}, other EAN13 ${r.ean13}, 99-code ${r.gwCode}, compareAt ${r.compareAt}, inStock ${r.inStock}${r.error ? " ERROR " + r.error : ""}`);
  }
}
fs.writeFileSync("probe-results.json", JSON.stringify(results, null, 1));
for (const r of results) { console.log(`\n### ${r.key} vendors ${JSON.stringify(r.vendors).slice(0, 300)} types ${JSON.stringify(r.types).slice(0, 300)}`); for (const s of r.samples.slice(0, 12)) console.log(JSON.stringify(s)); }
