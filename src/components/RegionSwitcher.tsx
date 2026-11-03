"use client";

import Link from "@/components/Link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { REGION_LIST, isRegion, type Region } from "@/lib/regions";
import { pickRegion } from "./SoftRegion";
import { Flag } from "./Flag";

/** The path after the region segment: "/au/game/kill-team" → "/game/kill-team", "/au" → "", "/about" → "/about". */
export function pathAfterRegion(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length && isRegion(parts[0])) parts.shift();
  return parts.length ? `/${parts.join("/")}` : "";
}

/**
 * The same page in another country. On a region page (`current` set) that is the same path with the first segment swapped;
 * on a page with no region of its own (About, the legal pages, a 404 even under /au/…) it is the country's home.
 */
export function regionSwitchHref(pathname: string, to: Region, current: Region | null): string {
  const first = pathname.split("/").filter(Boolean)[0];
  return current && isRegion(first) ? `/${to}${pathAfterRegion(pathname)}` : `/${to}`;
}

/**
 * Follow the switch link only to a page every country has (its home, a section like /deals). A deeper page (a product, a game,
 * a store) exists only where something is listed: elsewhere it is a 404, and the switcher would hand crawlers five of those per
 * page. Those links are nofollow; the page's own hreflang set (lib/seo.ts regionAlternates) names the copies that do exist.
 */
export function regionSwitchFollow(pathname: string, current: Region | null): boolean {
  return !current || pathAfterRegion(pathname).split("/").filter(Boolean).length < 2;
}

// The engine's country switcher (from MTG Compare): plain links, not a redirect, each country its own set of pages.
//
// `compact`: a flag-only, 44×44 button below lg (the phone header's one row has room for the logo mark, the search box, this and
// the menu button), the flag-and-code chip from lg up. `soft`: a page with no region of its own showing the visitor's
// (HeaderNav.tsx SoftRegionSwitcher): a pick switches the page's links in place (SoftRegion.tsx pickRegion) instead of leaving
// it; the links still go to each country's home without script. data-region-pick: region-boot remembers a pick (lib/region-boot.ts).
export function RegionSwitcher({ region, compact = false, soft = false }: { region: Region; compact?: boolean; soft?: boolean }) {
  const pathname = usePathname() || "/";
  const ref = useRef<HTMLDetailsElement>(null);
  const current = REGION_LIST.find((r) => r.region === region)!;
  const from = soft ? null : region;

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) ref.current.open = false;
    };
    // Escape closes the list and gives focus back to its button (a <details> has no Escape of its own).
    const esc = (e: KeyboardEvent) => {
      const d = ref.current;
      if (e.key !== "Escape" || !d?.open) return;
      d.open = false;
      d.querySelector("summary")?.focus();
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  const label = `Country: ${current.name}. Change country`;
  return (
    <details ref={ref} className="relative shrink-0" data-menu="country">
      <summary
        aria-label={label}
        title={label}
        className={`chip cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden ${
          compact ? "h-11 w-11 justify-center px-0 lg:h-9 lg:w-auto lg:px-3" : "h-11 lg:h-9"
        }`}
      >
        <Flag code={current.region} className={compact ? "lg:text-base" : ""} />
        <span className={compact ? "hidden lg:inline" : ""}>{current.short}</span>
        <svg viewBox="0 0 20 20" className={`h-3.5 w-3.5 text-faint ${compact ? "hidden lg:block" : ""}`} aria-hidden="true">
          <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </summary>
      <div className="card absolute right-0 z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] p-1.5 shadow-lift">
        <p className="px-3 pb-1 pt-2 text-xs font-semibold text-muted">Each country compares its own stores, in its own currency</p>
        <ul>
          {REGION_LIST.map((r) => (
            <li key={r.region}>
              <Link
                href={regionSwitchHref(pathname, r.region, from)}
                data-region-pick={r.region}
                rel={r.region !== region && !regionSwitchFollow(pathname, from) ? "nofollow" : undefined}
                aria-current={r.region === region ? "true" : undefined}
                onClick={(e) => {
                  if (soft && !(e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)) {
                    e.preventDefault();
                    pickRegion(r.region);
                  }
                  if (ref.current) ref.current.open = false;
                }}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-raised ${r.region === region ? "bg-raised font-semibold" : ""}`}
              >
                <Flag code={r.region} className="text-lg" />
                <span className="flex-1">{r.name}</span>
                <span className="text-xs text-muted">{r.currency}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
