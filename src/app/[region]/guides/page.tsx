import type { Metadata } from "next";
import Link from "next/link";
import { fill, GUIDES } from "@/lib/guides";
import { regionOr404 } from "@/lib/page";
import { REGION_LIST } from "@/lib/regions";
import { ogFor, regionAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { region: string } }): Metadata {
  const r = regionOr404(params.region);
  const title = `Warhammer buying guides for ${r.inName}`;
  const description = `Buying guides written around today's Warhammer prices in ${r.inName}: how to start for less and how much each discount store saves.`;
  return { title: { absolute: title }, description, alternates: regionAlternates(r.region, "/guides", REGION_LIST.map((x) => x.region)), openGraph: ogFor(`/${r.region}/guides`, title, description) };
}

export default function GuidesIndex({ params }: { params: { region: string } }) {
  const r = regionOr404(params.region);
  return (
    <div className="page py-8">
      <h1 className="font-display text-3xl font-extrabold">Buying guides for {r.inName}</h1>
      <p className="mt-2 max-w-3xl text-muted">Every number in these guides is a real store price from this morning&rsquo;s comparison, in {r.currency}.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {GUIDES.map((g) => (
          <Link key={g.slug} href={`/${r.region}/guides/${g.slug}`} className="card block p-4 hover:shadow-lift">
            <p className="font-display text-lg font-bold">{fill(g.h1, r.inName)}</p>
            <p className="mt-1 text-sm text-muted">{fill(g.description, r.inName)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
