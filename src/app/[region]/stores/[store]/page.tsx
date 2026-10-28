import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { OutboundLink } from "@/components/OutboundLink";
import { ProductGrid } from "@/components/ProductCard";
import { REL_STORE, storeUrl } from "@/lib/affiliate";
import { meta, offersFor, summariesFor } from "@/lib/data";
import { regionOr404 } from "@/lib/page";
import { ogFor } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { STORE_BY_KEY, storeHost } from "@/lib/stores";
import { dealForHost } from "@/lib/store-partner-deals";

export const dynamic = "force-dynamic";

function load(params: { region: string; store: string }) {
  const r = regionOr404(params.region);
  const s = STORE_BY_KEY.get(params.store);
  if (!s || s.market !== r.market) notFound();
  return { r, s };
}

export function generateMetadata({ params }: { params: { region: string; store: string } }): Metadata {
  const { r, s } = load(params);
  const title = `${s.name} Warhammer prices compared`;
  const description = `Where ${s.name} is the cheapest Warhammer stockist in ${r.inName} today, compared with the other stores we track.`;
  return { title: { absolute: title }, description, alternates: { canonical: `${SITE_URL}/${r.region}/stores/${s.key}` }, openGraph: ogFor(`/${r.region}/stores/${s.key}`, title, description) };
}

export default function StorePage({ params }: { params: { region: string; store: string } }) {
  const { r, s } = load(params);
  const all = summariesFor(r.region);
  const cheapest = all.filter((x) => x.bestStore === s.key && x.stores >= 2);
  const listed = all.filter((x) => offersFor(x.product.id, r.region).some((o) => o.s === s.key)).length;
  const h = meta().stores[s.key];
  return (
    <div className="page py-8">
      <nav className="mb-3 text-sm text-faint"><Link href={`/${r.region}/stores`} className="hover:text-ink">Stores in {r.inName}</Link></nav>
      <h1 className="font-display text-3xl font-extrabold">{s.name}</h1>
      <p className="mt-2 text-muted">
        {storeHost(s)} · {listed.toLocaleString("en")} Games Workshop products listed{h?.lastOkAt ? `, last read ${new Date(h.lastOkAt).toUTCString().slice(5, 16)}` : ""}.
      </p>
      <p className="mt-4">
        <OutboundLink href={storeUrl(s.base, dealForHost(storeHost(s))?.ref)} rel={REL_STORE} retailer={s.name} placement="store-page" className="btn-primary">
          Visit {s.name}
        </OutboundLink>
      </p>
      <section className="mt-8">
        <h2 className="mb-4 font-display text-xl font-bold">Cheapest at {s.name} today ({cheapest.length})</h2>
        <ProductGrid items={cheapest.slice(0, 48)} region={r.region} />
      </section>
    </div>
  );
}
