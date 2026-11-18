import { isRegion, type Region } from "./regions";

export type NavItem = { href: string; label: string };
export type NavGroup = { title: string; links: NavItem[] };

/**
 * Every place the site goes, grouped the way a buyer looks for it: which game, which army, what kind of product, and where the
 * value is. The desktop sidebar (components/SideNav.tsx, xl and up) and the phone menu (components/MobileMenu.tsx) draw this one
 * list, so they never disagree. Static: no data read, and every link is a page that exists (a thin hub is still served, noindex).
 * Owner, 2026-10-28: navigation from the first page, no "Continue to <region>" step first (as on MTG Compare and DexCompare).
 */
/** The hubs that hold at least one product (lib/nav-live.ts): a menu links only to a hub with something on it (no dead ends). */
export interface LiveHubs {
  game: ReadonlySet<string>;
  faction: ReadonlySet<string>;
  type: ReadonlySet<string>;
}

export function navGroups(region: Region, live?: LiveHubs): NavGroup[] {
  const item = (kind: keyof LiveHubs, slug: string, label: string): NavItem[] => (live && !live[kind].has(slug) ? [] : [{ href: `/${region}/${kind}/${slug}`, label }]);
  const game = (slug: string, label: string) => item("game", slug, label);
  const army = (slug: string, label: string) => item("faction", slug, label);
  const type = (slug: string, label: string) => item("type", slug, label);
  return [
    {
      title: "Games",
      links: [
        ...game("warhammer-40k", "Warhammer 40,000"),
        ...game("age-of-sigmar", "Age of Sigmar"),
        ...game("kill-team", "Kill Team"),
        ...game("old-world", "The Old World"),
        ...game("citadel", "Paints and tools"),
      ],
    },
    {
      title: "Shop by product",
      links: [
        ...type("combat-patrols", "Combat Patrols"),
        ...type("starter-sets", "Starter sets"),
        ...type("books", "Codexes and battletomes"),
        ...type("paints", "Paints"),
        ...type("tools", "Brushes and tools"),
      ],
    },
    {
      title: "Popular armies",
      links: [
        ...army("space-marines", "Space Marines"),
        ...army("necrons", "Necrons"),
        ...army("orks", "Orks"),
        ...army("tyranids", "Tyranids"),
        ...army("tau-empire", "T'au Empire"),
        ...army("stormcast-eternals", "Stormcast Eternals"),
      ],
    },
    {
      title: "Deals & more",
      links: [
        { href: `/${region}/new-releases`, label: "New releases and pre-orders" },
        { href: `/${region}/deals`, label: "Today's deals" },
        { href: `/${region}/black-friday`, label: "Black Friday deals" },
        { href: `/${region}/stores`, label: "Stores we compare" },
        { href: `/${region}/guides/cheapest-way-to-start`, label: "How to start for less" },
        { href: `/${region}/guides/warhammer-prices-where-they-are-heading`, label: "Where prices are heading" },
        { href: "/creators", label: "Creators we feature" },
        { href: "/about", label: "Who runs this site" },
        { href: "/contact", label: "Add a store" },
      ],
    },
  ];
}

/** The same link in another region: "/uk/deals" → "/au/deals". Links outside a region ("/about") are left alone. Pure. */
export function retargetHref(href: string, to: Region): string {
  const m = /^\/([a-z]{2})(?=\/|$|\?|#)/.exec(href);
  return m && isRegion(m[1]) ? `/${to}${href.slice(m[0].length)}` : href;
}

/** navGroups built for one region, moved to another (pages with no region follow the visitor's in the browser). */
export function retargetGroups(groups: NavGroup[], to: Region): NavGroup[] {
  return groups.map((g) => ({ ...g, links: g.links.map((l) => ({ ...l, href: retargetHref(l.href, to) })) }));
}
