import Link from "next/link";
import { ebayLabel, ebaySearchUrl, REL_PAID } from "@/lib/affiliate";
import type { NavGroup } from "@/lib/nav";
import { REGION_LIST, type Region } from "@/lib/regions";
import { OutboundLink } from "./OutboundLink";

/**
 * The phone and tablet menu (below xl): the same groups as the sidebar (lib/nav.ts), then the countries. A <details> panel, so it
 * opens without script and the links are plain <a> in the HTML. Never opens by itself (pop-up policy).
 */
export function MobileMenu({ region, groups }: { region: Region; groups: NavGroup[] }) {
  return (
    <details className="group relative shrink-0 xl:hidden" data-menu="mobile">
      <summary className="chip cursor-pointer list-none" aria-label="Menu">
        <span aria-hidden="true">☰</span>
        <span className="hidden sm:inline">Menu</span>
      </summary>
      <div className="fixed inset-x-0 top-[var(--hdr)] z-50 max-h-[calc(100dvh-var(--hdr))] overflow-y-auto border-b border-line bg-surface shadow-lift">
        <div className="page grid gap-6 py-5 sm:grid-cols-2 lg:grid-cols-4">
          <form action={`/${region}/search`} role="search" className="flex gap-2 sm:hidden">
            <label htmlFor="menu-q" className="sr-only">Search products</label>
            <input id="menu-q" name="q" type="search" placeholder="Search kits, paints, codexes…" className="h-11 min-w-0 flex-1 rounded-full border border-line bg-bg px-4 text-base" />
            <button className="btn-primary h-11 px-4">Search</button>
          </form>
          {groups.map((g) => (
            <div key={g.title}>
              <p className="eyebrow mb-2">{g.title}</p>
              <ul className="space-y-0.5">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} prefetch={false} className="block rounded-lg px-2 py-2 text-sm hover:bg-raised">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="eyebrow mb-2">Countries</p>
            <ul className="space-y-0.5">
              {REGION_LIST.map((x) => (
                <li key={x.region}>
                  <Link href={`/${x.region}`} prefetch={false} data-region-pick={x.region} className="block rounded-lg px-2 py-2 text-sm hover:bg-raised">
                    {x.name} <span className="text-faint">({x.currency})</span>
                  </Link>
                </li>
              ))}
            </ul>
            <OutboundLink href={ebaySearchUrl("Warhammer", region, "menu-ebay")} rel={REL_PAID} retailer={ebayLabel(region)} placement="menu-ebay" className="btn-ad mt-4">
              <span className="ad-pill">Ad</span> Search {ebayLabel(region)}
            </OutboundLink>
          </div>
        </div>
      </div>
    </details>
  );
}
