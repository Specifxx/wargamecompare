// Which games, armies and product types hold at least one product in a market, for the menus (lib/nav.ts navGroups): a menu links
// only to a hub with something on it, so nobody lands on an empty page (Bill, 2026-11-09: no dead ends). Computed from the loaded
// summaries, once per region per instance; no new read. A page with no region of its own uses every market together.
import { summariesFor } from "./data";
import type { LiveHubs } from "./nav";
import { REGION_LIST, type Region } from "./regions";

const memo = new Map<string, LiveHubs>();

export function liveHubs(region: Region | null): LiveHubs {
  const key = region ?? "*";
  const hit = memo.get(key);
  if (hit) return hit;
  const game = new Set<string>();
  const faction = new Set<string>();
  const type = new Set<string>();
  for (const r of region ? [region] : REGION_LIST.map((x) => x.region)) {
    for (const s of summariesFor(r)) {
      if (s.product.system) game.add(s.product.system);
      if (s.product.faction) faction.add(s.product.faction);
      if (s.product.type) type.add(s.product.type);
    }
  }
  const live = { game, faction, type };
  memo.set(key, live);
  return live;
}
