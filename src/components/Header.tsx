import { saleStrip } from "@/lib/black-friday";
import Link from "@/components/Link";
import { ebayLabel, ebaySearchUrl, REL_PAID } from "@/lib/affiliate";
import { navGroups } from "@/lib/nav";
import { liveHubs } from "@/lib/nav-live";
import { REGIONS, X_DEFAULT_REGION, type Region } from "@/lib/regions";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NavLink } from "./NavLink";
import { OutboundLink } from "./OutboundLink";
import { RegionSwitcher } from "./RegionSwitcher";
import { HeaderNavItems, SoftHeaderNavItems, SoftRegionSwitcher, SoftSearchBox, type HeaderNavItem } from "./HeaderNav";
import { ThemeToggle } from "./ThemeToggle";
import { SearchBox } from "./SearchBox";
import { CartHeaderLink } from "@/components/cart/CartHeaderLink";

/**
 * The desktop nav (lg and up), in order: Games, Armies and Products (each a dropdown of real links, lib/nav.ts: the way a Games
 * Workshop buyer looks, system first, then faction, then kind of kit), Deals, New releases, then Stores and Forum from xl (the
 * sidebar and the footer carry them below). Seven at most, the sale page counted (it leads the row from 1 November). `also`: other
 * paths (under the region) that count as the section, for its current state.
 */
export function headerNavItems(region: Region, today = new Date().toISOString().slice(0, 10)): HeaderNavItem[] {
  const groups = navGroups(region, liveHubs(region));
  // From 1 November to the day after Cyber Monday, the sale page leads the row (lib/black-friday.ts saleStrip).
  const sale = saleStrip(today);
  const more = groups[3].links;
  const pick = (hrefs: string[]) => hrefs.map((h) => more.find((l) => l.href === h)).filter((l): l is NonNullable<typeof l> => !!l);
  const dealsColumn = { title: "Deals & releases", links: pick([`/${region}/deals`, `/${region}/new-releases`, `/${region}/black-friday`, `/${region}/cyber-monday`]) };
  const guidesColumn = {
    title: "Guides & community",
    links: more.filter((l) => !dealsColumn.links.includes(l) && l.href !== `/${region}/stores`),
  };
  return [
    ...(sale ? [{ href: `/${region}/${sale.event}`, label: sale.name }] : []),
    // The dropdowns open on hover and on focus; the label itself goes to the first hub in the list.
    { href: groups[0].links[0]?.href ?? `/${region}/search`, label: "Games", also: [`/${region}/game`], menu: [groups[0]] },
    { href: groups[2].links[0]?.href ?? `/${region}/search`, label: "Armies", also: [`/${region}/faction`], menu: [groups[2]] },
    { href: groups[1].links[0]?.href ?? `/${region}/search`, label: "Products", also: [`/${region}/type`], menu: [groups[1]] },
    // Deals and Guides open dropdowns too (owner, 2026-11-09); the "Deals & more" group of lib/nav.ts is split between them.
    { href: `/${region}/deals`, label: "Deals", also: [`/${region}/new-releases`, `/${region}/black-friday`, `/${region}/cyber-monday`, `/${region}/boxing-day`, `/${region}/january-sales`, `/${region}/lunar-new-year`], menu: [dealsColumn] },
    { href: `/${region}/guides`, label: "Guides", also: ["/forum", "/creators", "/about"], menu: [guidesColumn] },
    { href: `/${region}/stores`, label: "Stores" },
  ];
}

/**
 * The site header (the Dex / MTG Compare engine's): ONE row, var(--hdr) tall (60px; 64px from lg), sticky. Everything a page needs
 * to go somewhere else is in it at every width, so nothing below it has to repeat it. From xl it spans the shell (the sidebar's
 * column and the page's). No cookie, header or session is read: one CDN copy per URL.
 *
 * - Below lg: the logo mark (the word from sm), the search box filling the row, the flag-only country button and the menu button
 *   (components/MobileMenu.tsx: every game, product type, army and section, then the countries).
 * - lg and up: logo, the sections (NavLink marks the current one), eBay's labelled search link (xl, region pages), search, country.
 * - No region (the landing page, About, the legal pages, a 404): the same header, for the visitor's country (owner, 2026-10-28: the
 *   whole navigation from the first page, no "Continue to <region>" step). The server's HTML has the default country's links; the
 *   browser moves them to the suggested one (HeaderNav.tsx), and a country picked there switches the page in place.
 */
export function Header({ region }: { region: Region | null }) {
  const home = region ? `/${region}` : "/";
  const built = region ?? X_DEFAULT_REGION;
  const items = headerNavItems(built);
  const groups = navGroups(built, liveHubs(region));
  return (
    <header className="sticky top-0 z-40 h-[var(--hdr)] border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="page flex h-full items-center gap-2 sm:gap-3 lg:gap-4 xl:max-w-shell">
        <Link href={home} className="flex h-11 shrink-0 items-center rounded-lg" aria-label={`WargameCompare${region ? ` ${REGIONS[region].name}` : ""} home`}>
          <Logo wordmark="hidden sm:inline" />
        </Link>
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {region ? <HeaderNavItems items={items} /> : <SoftHeaderNavItems items={items} />}
          {/* A discreet, labelled sponsored item (xl and up only): eBay's search, tagged. Not a section of the site. */}
          {/* On a page with no region of its own it is built for the US, as the old header was (the server HTML is one CDN copy). */}
          {
            <OutboundLink href={ebaySearchUrl("Warhammer", built, "header")} rel={REL_PAID} retailer={ebayLabel(built)} placement="header" className="hidden items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-raised hover:text-ink xl:inline-flex">
              <span className="ad-pill">Ad</span> eBay
            </OutboundLink>
          }
        </nav>
        <div className="hdr-search min-w-0 flex-1 lg:ml-auto lg:w-56 lg:flex-none xl:w-64">{region ? <SearchBox region={region} size="sm" /> : <SoftSearchBox />}</div>
        <ThemeToggle />
        {region ? <RegionSwitcher region={region} compact /> : <SoftRegionSwitcher />}
        {/* The cart list (components/cart, owner 2026-11-06): every width, with its count. */}
        <CartHeaderLink />
        <MobileMenu region={region} groups={groups} built={built} className="lg:hidden" />
      </div>
    </header>
  );
}

/** The site's main sections with their icons, in order (all under /<region>): the 404's "Where to next" tiles. */
export const MENU_ROWS: { path: string; label: string; icon: "tag" | "calendar" | "search" | "store" | "info" }[] = [
  { path: "/deals", label: "Today's deals", icon: "tag" },
  { path: "/new-releases", label: "New releases and pre-orders", icon: "calendar" },
  { path: "/type/combat-patrols", label: "Combat Patrols", icon: "search" },
  { path: "/type/paints", label: "Paints", icon: "search" },
  { path: "/stores", label: "Stores we compare", icon: "store" },
  { path: "/guides/cheapest-way-to-start", label: "How to start for less", icon: "info" },
];

// NavLink is re-exported for pages that draw their own small nav rows.
export { NavLink };
