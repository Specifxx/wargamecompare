// Every six hours (ops-monitor.yml): run the checks in src/lib/ops.ts and fail the run when one fails, so GitHub
// emails the owner. Runs in GitHub Actions on purpose: it works when the deploy is what broke.
import fs from "node:fs";
import path from "node:path";
import { readAsinStatus } from "@/lib/amazon-asins";
import { AMAZON_STORES } from "@/lib/amazon-creators";
import { checkAmazon, checkCodes, checkEbay, checkFamilyFeed, checkImport, checkLive, type Check } from "@/lib/ops";
import { SITE_URL } from "@/lib/site";
import { STORES } from "@/lib/stores";
import type { EbayFile, Meta } from "@/lib/types";

const read = <T>(f: string): T | null => {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", f), "utf8")) as T;
  } catch {
    return null;
  }
};

async function main() {
  const now = new Date();
  const checks: Check[] = [];
  checks.push(...checkImport(read<Meta>("meta.json"), STORES.length, now));
  const pacific = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(now);
  checks.push(...checkEbay(read<EbayFile>("ebay.json"), process.env.EBAY_ENABLED === "true", Number(process.env.EBAY_DAILY_CAP || 2500), now, pacific));
  // The repository variable SITE_URL was never set, so the live-site check said "unknown" for weeks; the site's own
  // canonical origin is the default (DECISIONS.md, 2026-11-07).
  const site = process.env.SITE_URL?.trim() || SITE_URL;
  if (site) {
    try {
      const res = await fetch(`${site.replace(/\/$/, "")}/uk`, { signal: AbortSignal.timeout(30_000) });
      checks.push(checkLive(res.status, await res.text()));
    } catch {
      checks.push(checkLive(0, null));
    }
  } else checks.push(checkLive(null, null));
  checks.push(checkAmazon(Object.fromEntries(AMAZON_STORES.map((s) => [s, readAsinStatus(s)])), now));
  checks.push(checkCodes(now));
  checks.push(checkFamilyFeed(read<{ generatedAt?: string }>("family/family-feed.json")?.generatedAt ?? null, now));

  const icon = { ok: "✅", warn: "⚠️", fail: "❌", unknown: "❔" };
  const lines = checks.map((c) => `| ${icon[c.status]} | ${c.name} | ${c.detail.replace(/\|/g, "/")} |`);
  const md = `## WargameCompare health\n\n| | Check | Detail |\n|---|---|---|\n${lines.join("\n")}\n`;
  console.log(md);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
  // Empire HQ's copy (riftcompare.com/admin/hq and the one Monday report; owner, 2026-11-02): the
  // workflow publishes it on the public `ops-status` branch. Status and our own sentences only.
  const overall = checks.some((c) => c.status === "fail") ? "fail" : checks.some((c) => c.status === "warn") ? "warn" : "ok";
  fs.writeFileSync(process.env.OPS_STATUS_FILE || "ops-status.json", JSON.stringify({ v: 1, site: "wargamecompare.com", at: now.toISOString(), overall, checks }, null, 1) + "\n");
  if (checks.some((c) => c.status === "fail")) {
    console.error("A check failed: see above.");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
