import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { FamilyCluster } from "@/components/FamilyCluster";
import { mediansFor, summariesFor } from "@/lib/data";
import { deals } from "@/lib/deals";
import { thumb } from "@/lib/images";
import { regionOr404 } from "@/lib/page";
import { formatPrice, REGION_LIST } from "@/lib/regions";
import { ogFor, regionAlternates } from "@/lib/seo";
import { STORE_BY_KEY } from "@/lib/stores";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { region: string } }): Metadata {
  const r = regionOr404(params.region);
  const title = `Warhammer deals in ${r.inName} today: biggest savings on RRP`;
  const description = `Warhammer kits, Combat Patrols and paints at least 10% under RRP (or under the median store price) in ${r.inName} today, from the stores we compare.`;
  return { title: { absolute: title }, description, alternates: regionAlternates(r.region, "/deals", REGION_LIST.map((x) => x.region)), openGraph: ogFor(`/${r.region}/deals`, title, description) };
}

export default function DealsPage({ params }: { params: { region: string } }) {
  const r = regionOr404(params.region);
  const list = deals(summariesFor(r.region), mediansFor(r.region)).slice(0, 150);
  return (
    <div className="page py-6 sm:py-8">
      <PageHead
        crumbs={[{ path: `/${r.region}`, label: r.name }, { path: `/${r.region}/deals`, label: "Deals" }]}
        title={<>Warhammer deals in {r.inName} today</>}
        lead={
          <p>
            In-stock products whose cheapest price is at least 10% under the RRP two or more stores state, or under the median price of three or more stores today.
            Nothing here is history: it is today&rsquo;s prices only. Item price; shipping extra.
          </p>
        }
      />
      <div className="card mt-6 divide-y divide-line overflow-hidden">
        {list.map((d) => (
          <Link key={d.s.product.id} href={`/${r.region}/p/${d.s.product.id}`} className="lr group">
            <div className="plate h-14 w-14 shrink-0">{d.s.product.image && <img src={thumb(d.s.product.image, 120) ?? undefined} alt={d.s.product.name} width={56} height={56} loading="lazy" className="h-full w-full object-contain p-1 mix-blend-multiply" />}</div>
            <div className="min-w-0 flex-1">
              <p className="lr-name group-hover:text-brand">{d.s.product.name}</p>
              <p className="lr-sub">
                at {STORE_BY_KEY.get(d.s.bestStore ?? "")?.name ?? d.s.bestStore} · {d.basis === "rrp" ? "RRP" : "median"} <span className="tabular">{formatPrice(d.ref, r.region)}</span>
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="tabular font-display text-lg font-bold leading-6">{formatPrice(d.s.best!, r.region)}</p>
              <p className="tabular text-xs font-bold text-open">−{Math.round(d.saving * 100)}%</p>
            </div>
          </Link>
        ))}
        {!list.length && <p className="p-4 text-muted">No deals today.</p>}
      </div>
      <FamilyCluster region={r.region} />
    </div>
  );
}
