// ONE-OFF (2026-11-19): fills data/history.json from every committed data/offers.json on main since launch, oldest first,
// one point per day (a day's last commit wins). Run from a full clone: npx tsx scripts/backfill-history.ts
// Our own daily records, never an estimate. Kept for the record; the daily import uses scripts/record-history.ts.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { emptyHistory, recordDay } from "../src/lib/price-history";
import { STORE_BY_KEY } from "../src/lib/stores";
import type { Meta, OffersFile } from "../src/lib/types";

const git = (...args: string[]) => execFileSync("git", args, { maxBuffer: 1 << 30, encoding: "utf8" });
const ref = process.argv[2] ?? "origin/main";
const commits = git("log", "--reverse", "--format=%H", ref, "--", "data/offers.json").trim().split("\n").filter(Boolean);
const byDay = new Map<string, string>();
for (const c of commits) {
  let meta: Meta;
  try {
    meta = JSON.parse(git("show", `${c}:data/meta.json`)) as Meta;
  } catch {
    continue;
  }
  if (meta.updatedAt) byDay.set(meta.updatedAt.slice(0, 10), c);
}
const file = emptyHistory();
for (const [day, c] of [...byDay].sort(([a], [b]) => a.localeCompare(b))) {
  const offers = JSON.parse(git("show", `${c}:data/offers.json`)) as OffersFile;
  recordDay(file, day, offers, (s) => STORE_BY_KEY.has(s));
  console.log(day, c.slice(0, 7));
}
fs.writeFileSync(path.join(process.cwd(), "data", "history.json"), JSON.stringify(file));
