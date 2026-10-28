import { isRegion, type Region } from "./regions";

export type NavItem = { href: string; label: string };
export type NavGroup = { title: string; links: NavItem[] };

/**
 * Every place the site goes, grouped the way a buyer looks for it: which game, which army, what kind of product, and where the
 * value is. The desktop sidebar (components/SideNav.tsx, xl and up) and the phone menu (components/MobileMenu.tsx) draw this one
 * list, so they never disagree. Static: no data read, and every link is a page that exists (a thin hub is still served, noindex).
 * Owner, 2026-10-28: navigation from the first page, no "Continue to <region>" step first (as on MTG Compare and DexCompare).
 */
export function navGroups(region: Region): NavGroup[] {
  const game = (slug: string, label: string): NavItem => ({ href: `/${region}/game/${slug}`, label });
  const army = (slug: string, label: string): NavItem => ({ href: `/${region}/faction/${slug}`, label });
  const type = (slug: string, label: string): NavItem => ({ href: `/${region}/type/${slug}`, label });
  return [
    {
      title: "Games",
      links: [
        game("warhammer-40k", "Warhammer 40,000"),
        game("age-of-sigmar", "Age of Sigmar"),
        game("kill-team", "Kill Team"),
        game("horus-heresy", "The Horus Heresy"),
        game("old-world", "The Old World"),
        game("middle-earth", "Middle-earth"),
        game("necromunda", "Necromunda"),
        game("blood-bowl", "Blood Bowl"),
        game("underworlds", "Underworlds"),
        game("warcry", "Warcry"),
        game("citadel", "Paints and tools"),
        game("black-library", "Black Library novels"),
      ],
    },
    {
      title: "Shop by product",
      links: [
        type("combat-patrols", "Combat Patrols"),
        type("army-sets", "Army sets and Battleforces"),
        type("starter-sets", "Starter sets"),
        type("books", "Codexes and battletomes"),
        type("paints", "Paints"),
        type("paint-sets", "Paint sets"),
        type("tools", "Brushes and tools"),
        type("terrain", "Terrain"),
      ],
    },
    {
      title: "Popular armies",
      links: [
        army("space-marines", "Space Marines"),
        army("necrons", "Necrons"),
        army("orks", "Orks"),
        army("tyranids", "Tyranids"),
        army("astra-militarum", "Astra Militarum"),
        army("chaos-space-marines", "Chaos Space Marines"),
        army("aeldari", "Aeldari"),
        army("tau-empire", "T'au Empire"),
        army("stormcast-eternals", "Stormcast Eternals"),
        army("skaven", "Skaven"),
      ],
    },
    {
      title: "Deals & more",
      links: [
        { href: `/${region}/deals`, label: "Today's deals" },
        { href: `/${region}/stores`, label: "Stores we compare" },
        { href: "/about", label: "How it works" },
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
