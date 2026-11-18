// The home pages' ranking input and how a product summary reads into it (lib/home-rank.ts; DECISIONS.md "Home pages rank items by
// demand", 2026-11-18). data/demand.json is written by refresh-prices.yml (scripts/pull-demand.sh, from RiftCompare's
// /api/demand/wgc: product page views, last 28 and 7 days) and rides the daily data commit: imported, so a page reads no file for it.
import raw from "../../data/demand.json";
import type { Summary } from "./data";
import { rankItems, type DemandFile, type RankFacts } from "./home-rank";

export const HOME_DEMAND = raw as DemandFile;

/** What the ranking reads of a product: any region's page of it, stock, price, saving, and how new it is to the stores. */
export function summaryFacts(s: Summary): RankFacts {
  return {
    pathSuffix: `/p/${s.product.id}`,
    clickKey: s.product.id,
    priceCents: s.best,
    inStock: s.inStock,
    // firstSeen stands in for a release date: a box the stores started listing lately is a new release.
    releaseDate: s.product.firstSeen ? s.product.firstSeen.slice(0, 10) : null,
    dropPct: s.off,
  };
}

/** Summaries, most likely to earn first. */
export const rankSummaries = (list: readonly Summary[]) => rankItems(list, summaryFacts, HOME_DEMAND);
