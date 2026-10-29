"use client";

import Link from "next/link";
import { REGIONS } from "@/lib/regions";
import { useSoftRegion } from "./SoftRegion";

const SHORTCUTS: [string, string][] = [
  ["/deals", "Today's deals"],
  ["/type/combat-patrols", "Combat Patrols"],
  ["/game/kill-team", "Kill Team"],
  ["/type/paints", "Paints"],
  ["/game/age-of-sigmar", "Age of Sigmar"],
  ["/type/books", "Codexes"],
];

/**
 * The landing page's shortcuts, in the visitor's region (owner, 2026-10-28: no "Continue to <region>" step before any navigation;
 * the most-used pages straight from the first screen). The region comes from the browser's time zone; nothing redirects.
 */
export function RegionSuggest() {
  const region = useSoftRegion();
  return (
    <div className="mt-6">
      <form action={`/${region}/search`} role="search" className="mb-4 flex max-w-xl gap-2">
        <label htmlFor="landing-q" className="sr-only">Search</label>
        <input id="landing-q" name="q" type="search" placeholder="Combat Patrol, Intercessors, Contrast paint…" className="h-12 min-w-0 flex-1 rounded-md border border-line bg-surface px-5 text-base" />
        <button className="btn-primary h-12 px-6">Search</button>
      </form>
      <div className="flex flex-wrap gap-2">
        {SHORTCUTS.map(([path, label], i) => (
          <Link key={path} href={`/${region}${path}`} className={i === 0 ? "btn-soft h-11 px-5" : "chip h-11 px-4"}>
            {label}
          </Link>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted">
        Showing prices in {REGIONS[region].name} ({REGIONS[region].currency}). Another country? Pick it below.
      </p>
    </div>
  );
}
