import Link from "@/components/Link";
import { ebayLabel, ebaySearchUrl, REL_PAID } from "@/lib/affiliate";
import { navGroups } from "@/lib/nav";
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
 * The desktop nav (lg and up), in order: Deals, New releases, Browse (the dropdown: every game, product type and popular army,
 * lib/nav.ts), Stores, Forum. `also`: other paths (under the region) that count as the section, for its current state: a game,
 * army or type page is part of "Browse"; the sale-season pages sit with "Deals".
 */
export function headerNavItems(region: Region): HeaderNavItem[] {
  const groups = navGroups(region);
  return [
    { href: `/${region}/deals`, label: "Deals", also: [`/${region}/black-friday`, `/${region}/boxing-day`, `/${region}/january-sales`, `/${region}/lunar-new-year`] },
    { href: `/${region}/new-releases`, label: "New releases" },
    // The Browse item opens the category dropdown (HeaderNav.tsx BrowseMenuPanel): games, kinds of product, armies.
    { href: `/${region}/search`, label: "Browse", also: [`/${region}/game`, `/${region}/type`, `/${region}/faction`], menu: groups.slice(0, 3) },
    { href: `/${region}/stores`, label: "Stores" },
    { href: "/forum", label: "Forum" },
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
  const groups = navGroups(built);
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
