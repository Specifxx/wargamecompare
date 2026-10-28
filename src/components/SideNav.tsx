import Link from "next/link";
import { ebayLabel, ebaySearchUrl, REL_PAID } from "@/lib/affiliate";
import type { NavGroup } from "@/lib/nav";
import { REGIONS, type Region } from "@/lib/regions";
import { OutboundLink } from "./OutboundLink";

/**
 * The desktop sidebar (xl and up; owner, 2026-10-28: the empty left side of a wide screen becomes navigation, as on MTG Compare and
 * DexCompare): every game, product type, popular army and the deal pages (lib/nav.ts navGroups), sticky under the header and
 * scrolling on its own. Plain links in the server's HTML. Below xl the phone menu carries the same places.
 */
export function SideNav({ region, groups }: { region: Region; groups: NavGroup[] }) {
  const r = REGIONS[region];
  return (
    <aside className="hidden w-60 shrink-0 xl:block" data-sidenav="">
      <nav aria-label="Browse" className="sticky top-[var(--hdr)] max-h-[calc(100dvh-var(--hdr))] overflow-y-auto overscroll-contain py-6 pl-6 pr-3">
        <p className="mb-4 px-2 text-xs font-semibold text-muted">
          Prices in {r.name} · {r.currency}
        </p>
        {groups.map((g) => (
          <div key={g.title} className="mb-5">
            <h2 className="eyebrow mb-1 px-2">{g.title}</h2>
            <ul>
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} prefetch={false} className="block rounded-lg px-2 py-1.5 text-sm leading-5 text-muted transition-colors hover:bg-raised hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="ad-box mx-2 mb-6 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold">
            <span className="ad-pill">Ad</span> New on eBay
          </p>
          <OutboundLink href={ebaySearchUrl("Warhammer", region, "menu-ebay")} rel={REL_PAID} retailer={ebayLabel(region)} placement="menu-ebay" className="mt-2 block text-sm font-semibold text-brand">
            Search {ebayLabel(region)} →
          </OutboundLink>
        </div>
      </nav>
    </aside>
  );
}
