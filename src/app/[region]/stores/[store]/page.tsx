import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { OutboundLink } from "@/components/OutboundLink";
import { PageHead } from "@/components/PageHead";
import { Empty } from "@/components/Section";
import { ProductGrid } from "@/components/ProductCard";
import { storeRel, storeUrl } from "@/lib/affiliate";
import { meta, offersFor, summariesFor } from "@/lib/data";
import { regionOr404 } from "@/lib/page";
import { breadcrumbLd, jsonLd, ogFor } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { StoreBadgeBox } from "@/components/StoreBadgeBox";
import { storeBadge } from "@/lib/embed";
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
    <div className="page py-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd([{ name: r.name, path: `/${r.region}` }, { name: `Stores in ${r.inName}`, path: `/${r.region}/stores` }, { name: s.name, path: `/${r.region}/stores/${s.key}` }])) }} />
      {/* The trail only: this page writes its own BreadcrumbList above. */}
      <PageHead
        crumbs={[{ path: `/${r.region}`, label: r.name }, { path: `/${r.region}/stores`, label: `Stores in ${r.inName}` }, { path: `/${r.region}/stores/${s.key}`, label: s.name }]}
        title={s.name}
        lead={
          <p>
            {storeHost(s)} · <span className="tabular">{listed.toLocaleString("en")}</span> Games Workshop products listed{h?.lastOkAt ? `, last read ${new Date(h.lastOkAt).toUTCString().slice(5, 16)}` : ""}.
          </p>
        }
      >
        <p className="mt-5">
          <OutboundLink href={storeUrl(s.base, dealForHost(storeHost(s))?.ref)} rel={storeRel(storeUrl(s.base, dealForHost(storeHost(s))?.ref))} retailer={s.name} placement="store-page" className="btn-primary">
            Visit {s.name}
          </OutboundLink>
        </p>
      </PageHead>
      <section className="mt-12">
        <h2 className="sec-title mb-5">Cheapest at {s.name} today ({cheapest.length})</h2>
        {cheapest.length ? (
          <ProductGrid items={cheapest.slice(0, 48)} region={r.region} />
        ) : (
          <Empty actions={[{ href: `/${r.region}/stores`, label: `Stores in ${r.inName}` }, { href: `/${r.region}/deals`, label: "Today’s deals" }]}>
            {s.name} isn&rsquo;t the cheapest store for any kit today. Its prices still show on every product it lists.
          </Empty>
        )}
      </section>
      <StoreBadgeBox html={storeBadge(SITE_URL, SITE_NAME, "Tabletop", `/${r.region}/stores/${s.key}`)} storeName={s.name} />
    </div>
  );
}
