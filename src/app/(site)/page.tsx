import type { Metadata } from "next";
import Link from "next/link";
import { RegionSuggest } from "@/components/RegionSuggest";
import { summariesFor } from "@/lib/data";
import { REGION_LIST, REGIONS } from "@/lib/regions";
import { ogFor } from "@/lib/seo";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import { storesInMarket } from "@/lib/stores";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME}: compare Warhammer prices across discount stores` },
  description: SITE_TAGLINE,
  alternates: { canonical: SITE_URL },
  openGraph: ogFor("/", SITE_NAME, SITE_TAGLINE),
};

export default function Landing() {
  return (
    <div className="page py-12">
      <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
        Stop paying full price for plastic. Compare Warhammer prices across the discount stores.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Warhammer 40,000, Age of Sigmar, Kill Team, The Horus Heresy, The Old World and Citadel paints: every kit matched by its box code across independent stores,
        cheapest in stock first, with the saving on RRP. Free, and no account needed.
      </p>
      <RegionSuggest />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {REGION_LIST.map((r) => {
          const n = storesInMarket(r.market).length;
          const products = summariesFor(r.region).filter((s) => s.inStock > 0).length;
          return (
            <Link key={r.region} href={`/${r.region}`} className="card p-5 transition-shadow hover:shadow-lift">
              <p className="font-display text-xl font-bold">{r.name}</p>
              <p className="mt-1 text-sm text-muted">
                {n} stores · {products.toLocaleString("en")} in stock · {REGIONS[r.region].currency}
              </p>
            </Link>
          );
        })}
      </div>
      <section className="prose-wg mt-12 max-w-3xl">
        <h2>Why compare?</h2>
        <p>
          Independent stockists sell the same boxes for 10 to 25% under RRP, and which one is cheapest changes from kit to kit. We read their catalogues every day so
          you don&rsquo;t have to open twenty tabs. Prices stay in your own currency and are never converted.
        </p>
      </section>
    </div>
  );
}
