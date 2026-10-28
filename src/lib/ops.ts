// The site watches itself (the sister sites' rule: the owner is not watching). Pure checks over the data files and a
// fetch of the live site, run every six hours by .github/workflows/ops-monitor.yml (scripts/ops-monitor.ts). A failing
// check fails the run and GitHub emails the owner. A source that cannot be read is "unknown": shown, never a false ok.
// A new scheduled job, external API or limit gets a check here and a test in tests/ops.test.ts.
import { codesNeedingRecheck } from "./store-partner-deals";
import type { EbayFile, Meta } from "./types";

export type Status = "ok" | "warn" | "fail" | "unknown";
export interface Check {
  name: string;
  status: Status;
  detail: string;
}

const H = 3_600_000;

export function checkImport(meta: Meta | null, storeCount: number, now: Date): Check[] {
  if (!meta || !meta.updatedAt) return [{ name: "Price import", status: storeCount ? "fail" : "unknown", detail: "No import has written data/meta.json yet." }];
  const age = (now.getTime() - Date.parse(meta.updatedAt)) / H;
  const out: Check[] = [
    { name: "Price import", status: age > 30 ? "fail" : "ok", detail: `Last import ${age.toFixed(1)} h ago (daily, refresh-prices.yml).` },
    { name: "Products", status: meta.products < 300 ? "fail" : "ok", detail: `${meta.products} products in data/products.json.` },
  ];
  const stores = Object.entries(meta.stores);
  const failing = stores.filter(([, h]) => !h.ok);
  const share = stores.length ? failing.length / stores.length : 0;
  const longDead = failing.filter(([, h]) => !h.lastOkAt || now.getTime() - Date.parse(h.lastOkAt) > 72 * H);
  out.push({
    name: "Store reads",
    status: share > 0.25 ? "fail" : longDead.length ? "warn" : "ok",
    detail: failing.length
      ? `${failing.length} of ${stores.length} stores failed: ${failing.map(([k, h]) => `${k} (${h.error ?? "error"})`).join("; ").slice(0, 600)}`
      : `All ${stores.length} stores read.`,
  });
  return out;
}

export function checkEbay(ebay: EbayFile | null, enabled: boolean, cap: number, now: Date, pacificToday: string): Check[] {
  if (!enabled) return [{ name: "eBay listings", status: "unknown", detail: "eBay keys not set yet: eBay rows are search links only." }];
  if (!ebay?.updatedAt) return [{ name: "eBay listings", status: "fail", detail: "Keys are set but no eBay pass has written data/ebay.json." }];
  const age = (now.getTime() - Date.parse(ebay.updatedAt)) / H;
  const used = ebay.calls?.[pacificToday] ?? 0;
  return [
    { name: "eBay listings", status: age > 30 ? "fail" : "ok", detail: `Last eBay pass ${age.toFixed(1)} h ago.` },
    { name: "eBay calls", status: used > cap ? "fail" : used > cap * 0.95 ? "warn" : "ok", detail: `${used} of ${cap} Browse calls used today (Pacific time).` },
  ];
}

export function checkLive(status: number | null, body: string | null): Check {
  if (status == null) return { name: "Live site", status: "unknown", detail: "SITE_URL not set (the domain is not live yet), or the request failed to connect." };
  const ok = status === 200 && !!body && body.includes("WargameCompare");
  return { name: "Live site", status: ok ? "ok" : "fail", detail: `GET /uk answered ${status}${ok ? "" : body ? ", without the site's name" : ""}.` };
}

export function checkCodes(now: Date): Check {
  const soon = codesNeedingRecheck(now);
  return soon.length
    ? { name: "Store partner codes", status: "warn", detail: `Re-check at checkout: ${soon.map((c) => `${c.name} hides ${c.hidesOn}`).join("; ")}` }
    : { name: "Store partner codes", status: "ok", detail: "No code needs a re-check this week." };
}
