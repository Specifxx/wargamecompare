import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";
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
    <div className="page py-6 sm:py-8">
      <PageHead
        crumbs={[{ path: `/${r.region}`, label: r.name }, { path: `/${r.region}/guides`, label: "Guides" }]}
        title={<>Buying guides for {r.inName}</>}
        lead={<p>Every number in these guides is a real store price from this morning&rsquo;s comparison, in {r.currency}.</p>}
      />
      <ul role="list" className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
        {GUIDES.map((g) => (
          <li key={g.slug} className="min-w-0">
            <Link href={`/${r.region}/guides/${g.slug}`} className="guide-card group">
              <p className="font-display text-lg font-bold leading-snug group-hover:text-brand">{fill(g.h1, r.inName)}</p>
              <p className="mt-1.5 text-sm leading-6 text-muted">{fill(g.description, r.inName)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
