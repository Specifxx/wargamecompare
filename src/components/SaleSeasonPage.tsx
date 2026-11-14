import type { Metadata } from "next";
import Link from "next/link";
import { meta, mediansFor, summariesFor } from "@/lib/data";
import { deals } from "@/lib/deals";
import { saleIntro, saleYear, SALE_SEASONS, type SaleSlug } from "@/lib/sale-seasons";
import { thumb } from "@/lib/images";
import { regionOr404 } from "@/lib/page";
import { formatPrice, REGION_LIST } from "@/lib/regions";
import { ogFor, regionAlternates } from "@/lib/seo";
import { STORE_BY_KEY } from "@/lib/stores";

// The seasonal sale pages, /<region>/boxing-day, /<region>/january-sales and /<region>/lunar-new-year (DECISIONS.md, "Seasonal
// sale pages", 2026-11-02): one URL per region kept every year, with the Black Friday page's rows (in stock, 10%+ under RRP or the
// median of three or more stores, today). Never a "was" price, a countdown or an invented sale. Every region has its own page.

const today = () => (meta().updatedAt || new Date().toISOString()).slice(0, 10);

export function saleMetadata(slug: SaleSlug, { params }: { params: { region: string } }): Metadata {
  const r = regionOr404(params.region);
  const year = saleYear(slug, today());
  const name = SALE_SEASONS[slug].name;
  const title = `Warhammer ${name} deals ${year} in ${r.inName}: store prices under RRP`;
  const description = `${name} ${year} Warhammer deals in ${r.inName}: kits, Combat Patrols and paints at least 10% under RRP or the median store price today, updated every day.`;
  return { title: { absolute: title }, description, alternates: regionAlternates(r.region, `/${slug}`, REGION_LIST.map((x) => x.region)), openGraph: ogFor(`/${r.region}/${slug}`, title, description) };
}

export function SaleSeasonPage({ slug, params }: { slug: SaleSlug; params: { region: string } }) {
  const r = regionOr404(params.region);
  const now = today();
  const year = saleYear(slug, now);
  const list = deals(summariesFor(r.region), mediansFor(r.region)).slice(0, 100);
  return (
    <div className="page py-6 sm:py-8">
      <h1 className="ph-title">Warhammer {SALE_SEASONS[slug].name} deals in {r.inName}, {year}</h1>
      <p className="ph-lead">
        {saleIntro(slug, year, r.inName)} Below is every
        in-stock product at least 10% under the RRP stores state, or under the median price of three or more stores, today. The page updates every day through the
        sales, so bookmark it. We only see what a store asks when we read its prices: check the store&rsquo;s page before you buy. Item price; shipping extra.
      </p>
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
        {!list.length && <p className="px-5 py-6 text-muted">No product is 10% under RRP or the median store price in {r.inName} today.</p>}
      </div>
      <p className="link-line mt-8">
        <Link href={`/${r.region}/deals`} className="art-link">Today&rsquo;s deals</Link> · <Link href={`/${r.region}/black-friday`} className="art-link">Black Friday deals</Link> · <Link href={`/${r.region}/guides/discount-stores-vs-rrp`} className="art-link">Store savings vs RRP</Link> ·{" "}
        <Link href={`/${r.region}/stores`} className="art-link">Stores we compare</Link>
      </p>
    </div>
  );
}
