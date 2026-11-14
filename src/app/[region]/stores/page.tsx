import type { Metadata } from "next";
import Link from "next/link";
import { meta, summariesFor } from "@/lib/data";
import { regionOr404 } from "@/lib/page";
import { REGION_LIST } from "@/lib/regions";
import { ogFor, regionAlternates } from "@/lib/seo";
import { storeHost, storesInMarket } from "@/lib/stores";
import { PageHead } from "@/components/PageHead";
import { SuggestStore } from "@/components/ReportForms";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { region: string } }): Metadata {
  const r = regionOr404(params.region);
  const n = storesInMarket(r.market).length;
  const title = `Where to buy Warhammer in ${r.inName}: ${n} discount stores compared`;
  const description = `The ${n} independent Warhammer stockists in ${r.inName} whose prices WargameCompare compares every day, with how much of each range they have in stock.`;
  return { title: { absolute: title }, description, alternates: regionAlternates(r.region, "/stores", REGION_LIST.map((x) => x.region)), openGraph: ogFor(`/${r.region}/stores`, title, description) };
}

export default function StoresPage({ params }: { params: { region: string } }) {
  const r = regionOr404(params.region);
  const stores = storesInMarket(r.market);
  const all = summariesFor(r.region);
  const health = meta().stores;
  const rows = stores
    .map((s) => ({ s, cheapest: all.filter((x) => x.bestStore === s.key).length, listed: health[s.key]?.listed ?? 0, ok: health[s.key]?.ok ?? false }))
    .sort((a, b) => b.cheapest - a.cheapest || a.s.name.localeCompare(b.s.name));
  return (
    <div className="page py-6 sm:py-8">
      <PageHead
        crumbs={[{ path: `/${r.region}`, label: r.name }, { path: `/${r.region}/stores`, label: "Stores" }]}
        title={<>Where to buy Warhammer in {r.inName}</>}
        lead={
          <p>
            The {stores.length} independent stores we compare in {r.inName}, by how many products they are the cheapest for today. Missing one? <a href="#suggest" className="art-link">Suggest it</a>.
          </p>
        }
      />
      <div className="card mt-6 divide-y divide-line overflow-hidden">
        {rows.map(({ s, cheapest, ok }) => (
          <Link key={s.key} href={`/${r.region}/stores/${s.key}`} className="group flex min-h-16 items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-raised sm:px-5">
            <div className="min-w-0">
              <p className="font-semibold leading-snug group-hover:text-brand">{s.name}</p>
              <p className="truncate text-xs leading-5 text-muted">{storeHost(s)}{!ok && " · not read at the last check"}</p>
            </div>
            <p className="shrink-0 text-right text-sm leading-tight">
              <span className="tabular block font-display text-lg font-bold text-ink">{cheapest}</span> <span className="text-xs text-muted">cheapest today</span>
            </p>
          </Link>
        ))}
      </div>
      <section id="suggest" className="mt-14 scroll-mt-24">
        <h2 className="sec-title">Suggest a store</h2>
        <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted">An independent store we don&apos;t compare yet? We check every suggestion and add the store if we can read its prices. Store owners welcome: listing is free.</p>
        <SuggestStore regions={REGION_LIST.map((x) => [x.short, x.name])} what="Games Workshop products" buttonClassName="btn-primary" />
      </section>
    </div>
  );
}
