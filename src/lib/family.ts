// This site's side of the Compare Empire network (lib/family-network.ts, DECISIONS.md "Sites that grow
// each other", 2026-11-02): the feed the daily data job commits, and the cluster file it copies from the
// hobby sisters (Gunpla on Gundam Compare, FigureCompare), both in data/family/. Pages read the committed
// cluster file and nothing else: no fetch at request time.
import fs from "node:fs";
import path from "node:path";
import { mediansFor, summariesFor } from "./data";
import { deals } from "./deals";
import { thumb } from "./images";
import { REGIONS, type Region } from "./regions";
import { SITE_URL } from "./site";
import { STORE_BY_KEY } from "./stores";
import { CLUSTER_FILE, pickTiles, toFamilyRegion, validCluster, type FamilyFeed, type FamilyItem, type FamilyTile } from "./family-network";

export const FAMILY_ID = "wargame" as const;
export const FAMILY_DIR = path.join(process.cwd(), "data", "family");

let cluster: FamilyFeed[] | null = null;
export function familyFeeds(now = Date.now()): FamilyFeed[] {
  if (cluster) return cluster;
  try {
    cluster = validCluster(JSON.parse(fs.readFileSync(path.join(FAMILY_DIR, CLUSTER_FILE), "utf8")), FAMILY_ID, now);
  } catch {
    cluster = [];
  }
  return cluster;
}

/** One tile per hobby sister, the visitor's region first, else the US. Empty when no sister has anything real. */
export function familyTiles(region: Region): FamilyTile[] {
  return pickTiles(familyFeeds(), { self: FAMILY_ID, cluster: "hobby", kind: "deal", region: toFamilyRegion(region), max: 6 });
}

/** Today's deals per region (lib/deals.ts: 10–50% under RRP or the median of 3+ stores), the cheapest store named. */
export function familyItems(): FamilyItem[] {
  const out: FamilyItem[] = [];
  for (const r of Object.values(REGIONS)) {
    for (const d of deals(summariesFor(r.region), mediansFor(r.region)).slice(0, 12)) {
      const store = STORE_BY_KEY.get(d.s.bestStore ?? "")?.name;
      if (!store || d.s.best == null) continue;
      out.push({
        kind: "deal",
        cluster: "hobby",
        region: toFamilyRegion(r.region),
        title: d.s.product.name,
        url: `${SITE_URL}/${r.region}/p/${d.s.product.id}`,
        image: thumb(d.s.product.image, 200),
        cents: d.s.best,
        currency: r.currency,
        store,
        refCents: d.ref,
        refLabel: d.basis === "rrp" ? "RRP" : "median store price",
      });
    }
  }
  return out;
}

export function familyLinks(): FamilyFeed["links"] {
  const links: FamilyFeed["links"] = {};
  for (const r of Object.values(REGIONS)) links[toFamilyRegion(r.region)] = { deals: `${SITE_URL}/${r.region}/deals` };
  return links;
}
