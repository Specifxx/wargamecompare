"use client";

import Link from "@/components/Link";
import { REGION_LIST, type Region } from "@/lib/regions";
import { Flag } from "./Flag";
import { pickRegion, useSoftRegion } from "./SoftRegion";

// The hero's country row (owner, 2026-11-02: "the region switcher must be more prevalent … on the main home page hero … and have
// the flags as well"): every country's home as a flag chip, the current one marked. On a region home (`region` set) each chip is
// a plain link to that country's home. On the landing page (no region) a click picks the country in place, as the header's soft
// switcher does (SoftRegion.tsx pickRegion); without script the links still go to each country's home. data-region-pick: region-boot
// remembers the pick (lib/region-boot.ts).
export function RegionChips({ region = null, className = "" }: { region?: Region | null; className?: string }) {
  const soft = useSoftRegion();
  const current = region ?? soft;
  return (
    <nav aria-label="Choose your country" className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm font-semibold text-muted">Prices for</span>
      {REGION_LIST.map((x) => {
        const on = x.region === current;
        return (
          <Link
            key={x.region}
            href={`/${x.region}`}
            data-region-pick={x.region}
            aria-current={on ? "page" : undefined}
            title={`${x.name} · ${x.currency}`}
            onClick={(e) => {
              if (!region && !(e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)) {
                e.preventDefault();
                pickRegion(x.region);
              }
            }}
            className={`chip min-h-11 ${on ? "border-brand bg-brand-soft font-semibold text-brand-strong" : ""}`}
          >
            <Flag code={x.region} />
            <span className="sm:hidden">{x.short}</span>
            <span className="hidden sm:inline">{x.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
