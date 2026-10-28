import type { Metadata } from "next";
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
    <div className="page py-8">
      <h1 className="font-display text-3xl font-extrabold">Search {r.inName}</h1>
      <Search
        region={r.region}
        systems={SYSTEMS.map((s) => [s.slug, s.name])}
        factions={FACTIONS.map((f) => [f.slug, f.name])}
        types={TYPES.map((t) => [t.slug, t.name])}
        ebayBase={ebaySearchUrl("QUERY", r.region, "browse-empty")}
        ebayBrowse={ebaySearchUrl("QUERY", r.region, "browse-ebay")}
      />
    </div>
  );
}
