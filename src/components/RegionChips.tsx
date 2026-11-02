import Link from "next/link";
import { REGION_LIST, type Region } from "@/lib/regions";
import { Flag } from "./Flag";

// The hero's country row (owner, 2026-11-02: "the region switcher must be more prevalent … on the main home page hero … and have
// the flags as well"): every country's home as a flag chip, `current` marked. Plain links with data-region-pick, so region-boot
// remembers the pick (lib/region-boot.ts). No hooks: the region homes render it on the server, the landing page's RegionSuggest
// with the visitor's region.
export function RegionChips({ current, className = "" }: { current: Region; className?: string }) {
  return (
    <nav aria-label="Choose your country" className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm font-semibold text-muted">Prices for</span>
      {REGION_LIST.map((x) => {
        const on = x.region === current;
        return (
          <Link
            key={x.region}
            href={`/${x.region}`}
            prefetch={false}
            data-region-pick={x.region}
            aria-current={on ? "page" : undefined}
            title={`${x.name} · ${x.currency}`}
            className={`chip h-11 px-4 ${on ? "border-brand bg-brand-soft font-semibold text-brand-strong" : ""}`}
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
