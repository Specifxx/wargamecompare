// Temporary: samples of refused and unmatched listings from the trial import's cache.
import fs from "node:fs";
import zlib from "node:zlib";
import { codesOf } from "@/lib/identify";
import { refuse } from "@/lib/listing-filter";
const out: Record<string, string[]> = {};
const add = (k: string, s: string) => { (out[k] ??= []).length < 400 && Math.random() < 0.05 && out[k].push(s); };
for (const f of fs.readdirSync("data/cache")) {
  const c = JSON.parse(zlib.gunzipSync(fs.readFileSync(`data/cache/${f}`)).toString());
  for (const l of c.listings) {
    const codes = codesOf(l.title, l.skus);
    const why = refuse({ title: l.title, vendor: l.vendor, productType: l.productType, tags: l.tags, hasCode: codes.length > 0, gwCollection: l.gwCollection });
    add(why ?? (codes.length ? "coded" : "codeless"), `${l.store} | ${l.title} | ${l.vendor} | ${l.skus.join(",")}`);
  }
}
fs.writeFileSync("trial/report.json", JSON.stringify(out, null, 1));
