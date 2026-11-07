// Refreshes data/focus/demand.json (lib/focus.ts) from the `demand` branch's gsc-pages.json, which RiftCompare's sister-demand
// job writes daily. Run by refresh-prices.yml before the data commit. Keeps the last file when the branch can't be read.
//
//   npx tsx scripts/focus-demand.ts
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { demandIds } from "../src/lib/focus";

const OUT = path.join(process.cwd(), "data", "focus", "demand.json");
try {
  execFileSync("git", ["fetch", "--quiet", "--depth=1", "origin", "demand"], { stdio: "ignore", timeout: 60_000 });
  const j = JSON.parse(execFileSync("git", ["show", "FETCH_HEAD:gsc-pages.json"], { encoding: "utf8" })) as { updatedAt?: string; pages?: Record<string, number[]> };
  const ids = demandIds(j.pages ?? {});
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify({ updatedAt: j.updatedAt ?? null, ids }, null, 1)}\n`);
  console.log(`[focus] ${ids.length} product pages with search demand`);
} catch (e) {
  console.log(`[focus] demand branch unreadable (${(e as Error).message.slice(0, 80)}); keeping the last file`);
}
