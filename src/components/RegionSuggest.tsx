"use client";

import Link from "@/components/Link";
import { useEffect } from "react";
import { Icon } from "./Icon";
import { useSoftRegion } from "./SoftRegion";
import { RegionChips } from "./RegionChips";

const SHORTCUTS: [string, string][] = [
  ["/deals", "Today's deals"],
  ["/type/combat-patrols", "Combat Patrols"],
  ["/game/kill-team", "Kill Team"],
  ["/type/paints", "Paints"],
  ["/game/age-of-sigmar", "Age of Sigmar"],
  ["/type/books", "Codexes"],
];

/**
 * The landing hero's search, country row and shortcuts, in the visitor's country (owner, 2026-10-28: no "Continue to <region>"
 * step before any navigation; the most-used pages straight from the first screen). The country comes from the browser (SoftRegion);
 * nothing redirects. The search is a plain GET form, so it works without script; the links move to the picked country in place.
 */
export function RegionSuggest() {
  const region = useSoftRegion();
  useEffect(() => {
    document.getElementById("landing-search")?.setAttribute("action", `/${region}/search`);
  }, [region]);
  return (
    <div className="mt-6">
      <form
        id="landing-search"
        action={`/${region}/search`}
        method="get"
        role="search"
        className="mx-auto flex max-w-md items-center gap-2 rounded-full border border-line bg-surface p-1.5 pl-4 shadow-card focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15"
      >
        <Icon name="search" size={18} className="text-faint" />
        <label htmlFor="landing-q" className="sr-only">
          Search
        </label>
        <input id="landing-q" name="q" type="search" placeholder="Combat Patrol, Intercessors, Contrast paint…" className="min-w-0 flex-1 bg-transparent py-1.5 text-base outline-none placeholder:text-faint sm:text-sm" />
        <button type="submit" className="btn-ghost min-h-11 px-4">
          Search
        </button>
      </form>
      <RegionChips className="mt-5 justify-center" />
      <ul className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Popular pages">
        {SHORTCUTS.map(([path, label], i) => (
          <li key={path}>
            <Link href={`/${region}${path}`} className={i === 0 ? "btn-primary min-h-11 px-4" : "chip min-h-11"}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
