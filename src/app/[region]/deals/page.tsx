import type { Metadata } from "next";
import Link from "next/link";
import { EbayBox } from "@/components/EbayBox";
import { EbayStrip } from "@/components/EbayStrip";
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
    <div className="page py-8">
      <h1 className="font-display text-3xl font-extrabold">Warhammer deals in {r.inName} today</h1>
      <p className="mt-2 max-w-3xl text-muted">
        In-stock products whose cheapest price is at least 10% under the RRP two or more stores state, or under the median price of three or more stores today.
        Nothing here is history: it is today&rsquo;s prices only. Item price; shipping extra.
      </p>
      <div className="card mt-6 divide-y divide-line overflow-hidden">
        {list.map((d) => (
          <Link key={d.s.product.id} href={`/${r.region}/p/${d.s.product.id}`} className="flex items-center gap-3 px-3 py-3 hover:bg-raised">
            <div className="plate h-14 w-14 shrink-0">{d.s.product.image && <img src={thumb(d.s.product.image, 120) ?? undefined} alt="" loading="lazy" className="h-full w-full object-contain p-1" />}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{d.s.product.name}</p>
              <p className="text-xs text-faint">
                at {STORE_BY_KEY.get(d.s.bestStore ?? "")?.name ?? d.s.bestStore} · {d.basis === "rrp" ? "RRP" : "median"} {formatPrice(d.ref, r.region)}
              </p>
            </div>
            <div className="text-right">
              <p className="tabular font-bold">{formatPrice(d.s.best!, r.region)}</p>
              <p className="text-xs font-bold text-open">−{Math.round(d.saving * 100)}%</p>
            </div>
          </Link>
        ))}
        {!list.length && <p className="p-4 text-muted">No deals today.</p>}
      </div>
      <div className="mt-10">
        <EbayStrip region={r.region} items={list.map((d) => d.s)} placement="ebay-strip-deals" heading="These kits on eBay" />
      </div>
      <div className="mt-6">
        <EbayBox region={r.region} query="Warhammer" heading="More deals on eBay" placement="deals" />
      </div>
    </div>
  );
}
