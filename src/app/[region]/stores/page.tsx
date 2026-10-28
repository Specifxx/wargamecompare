import type { Metadata } from "next";
import Link from "next/link";
import { meta, summariesFor } from "@/lib/data";
import { regionOr404 } from "@/lib/page";
import { REGION_LIST } from "@/lib/regions";
import { ogFor, regionAlternates } from "@/lib/seo";
import { storeHost, storesInMarket } from "@/lib/stores";

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
    <div className="page py-8">
      <h1 className="font-display text-3xl font-extrabold">Where to buy Warhammer in {r.inName}</h1>
      <p className="mt-2 max-w-3xl text-muted">
        The {stores.length} independent stores we compare in {r.inName}, by how many products they are the cheapest for today. Missing one? <Link href="/contact" className="text-brand underline">Tell us</Link>.
      </p>
      <div className="card mt-6 divide-y divide-line">
        {rows.map(({ s, cheapest, ok }) => (
          <Link key={s.key} href={`/${r.region}/stores/${s.key}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-raised">
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-xs text-faint">{storeHost(s)}{!ok && " · not read at the last check"}</p>
            </div>
            <p className="text-right text-sm"><span className="font-bold">{cheapest}</span> <span className="text-faint">cheapest today</span></p>
          </Link>
        ))}
      </div>
    </div>
  );
}
