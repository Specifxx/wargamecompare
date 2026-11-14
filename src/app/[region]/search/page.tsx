import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";
import { Search } from "@/components/Search";
import { FACTIONS, SYSTEMS, TYPES } from "@/lib/catalog";
import { ebaySearchUrl } from "@/lib/affiliate";
import { regionOr404 } from "@/lib/page";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { region: string } }): Metadata {
  const r = regionOr404(params.region);
  // Search results are never indexed (a page per query is thin, duplicate content).
  return { title: `Search Warhammer prices in ${r.inName}`, robots: { index: false, follow: true } };
}

// The page itself is one static shell per region (it reads no searchParams on the server, so the CDN keeps one copy);
// the query, filters and results live in the browser, over the region's cached index.
export default function SearchPage({ params }: { params: { region: string } }) {
  const r = regionOr404(params.region);
  return (
    <div className="page py-6 sm:py-8">
      <PageHead crumbs={[{ path: `/${r.region}`, label: r.name }, { path: `/${r.region}/search`, label: "Search" }]} title={<>Search {r.inName}</>} />
      <Search
        region={r.region}
        systems={SYSTEMS.map((s) => [s.slug, s.name])}
        factions={FACTIONS.map((f) => [f.slug, f.name])}
        types={TYPES.map((t) => [t.slug, t.name])}
        ebayBase={ebaySearchUrl("QUERY", r.region, "browse-empty")}
        ebayBrowse={ebaySearchUrl("QUERY", r.region, "browse-ebay")}
        suggest={[
          { href: `/${r.region}/deals`, label: "Today’s deals" },
          { href: `/${r.region}/new-releases`, label: "New releases" },
          { href: `/${r.region}/type/combat-patrols`, label: "Combat Patrols" },
          { href: `/${r.region}/game/warhammer-40k`, label: "Warhammer 40,000" },
          { href: `/${r.region}/game/age-of-sigmar`, label: "Age of Sigmar" },
          { href: `/${r.region}/type/paints`, label: "Paints" },
        ]}
      />
    </div>
  );
}
