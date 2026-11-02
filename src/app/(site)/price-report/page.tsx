import type { Metadata } from "next";
import Link from "next/link";
import { meta, offersFor, summariesFor } from "@/lib/data";
import { REGION_LIST, formatPrice } from "@/lib/regions";
import { STORE_BY_KEY } from "@/lib/stores";
import { ogFor } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { pctText, regionStats, reportMonth, widelyStocked } from "@/lib/price-report";

// /price-report: the self-updating monthly price report (DECISIONS.md, "Self-updating price report", 2026-11-02),
// rebuilt from each day's committed prices. One URL for good. Force-dynamic and kept a day by the CDN
// (next.config.js CDN_PAGES "/price-report") like every page.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const month = reportMonth(meta().updatedAt);
  const title = `Tabletop Price Report, ${month}: Store Discounts vs RRP`;
  const description = "How far independent stores in the UK, Australia, New Zealand, Canada and the US sell miniatures, paints and books under RRP this month, region by region. Free to cite.";
  return { title, description, alternates: { canonical: "/price-report" }, openGraph: ogFor("/price-report", `${title} | ${SITE_NAME}`, description) };
}

export default function PriceReport() {
  const m = meta();
  const month = reportMonth(m.updatedAt);
  const asOf = new Date(m.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const regions = REGION_LIST.map((r) => {
    const rows = summariesFor(r.region);
    const stores = new Set(rows.flatMap((s) => offersFor(s.product.id, r.region).filter((o) => o.in).map((o) => o.s))).size;
    return { r, stats: regionStats(rows, stores), top: widelyStocked(rows, 8) };
  });
  const citation = `${SITE_NAME}, "Tabletop Price Report, ${month}", ${SITE_URL}/price-report`;
  return (
    <article className="page flex max-w-4xl flex-col gap-8 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold">Tabletop price report, {month}</h1>
        <p className="text-muted">
          How far independent stores sell miniatures, paints and books under the recommended retail price, in five regions. Rebuilt from each day&apos;s
          store prices; last updated {asOf}. Free to quote with a link.
        </p>
      </header>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Discount off RRP, by region</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr><th className="py-1 pr-3">Region</th><th className="py-1 pr-3 text-right">Stores in stock</th><th className="py-1 pr-3 text-right">Products in stock</th><th className="py-1 pr-3 text-right">Sold under RRP</th><th className="py-1 text-right">Median saving</th></tr>
            </thead>
            <tbody>
              {regions.map(({ r, stats }) => (
                <tr key={r.region} className="border-t border-line">
                  <td className="py-1.5 pr-3"><Link className="underline" href={`/${r.region}`}>{r.name}</Link></td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{stats.stores}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{stats.inStock.toLocaleString("en-GB")}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{stats.withRrp ? pctText(stats.underRrp / stats.withRrp) : "—"}</td>
                  <td className="py-1.5 text-right tabular-nums">{pctText(stats.medianOff)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted">
          &ldquo;Sold under RRP&rdquo;: of the in-stock products with a stated RRP in that region, the share where the cheapest store is below it.
          &ldquo;Median saving&rdquo;: the typical gap among those. Item prices before postage; each region compares only stores in its own currency.
        </p>
      </section>

      {regions.filter((x) => x.top.length).map(({ r, top }) => (
        <section key={r.region} className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">The most widely stocked products in {r.inName}</h2>
          <ol className="card divide-y divide-line">
            {top.map((s) => (
              <li key={s.product.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <Link className="flex-1 truncate hover:underline" href={`/${r.region}/p/${s.product.id}`}>{s.product.name}</Link>
                <span className="hidden text-muted sm:inline">{s.inStock} stores</span>
                <span className="tabular-nums font-semibold">{formatPrice(s.best!, r.region)}</span>
                <span className="w-24 text-right text-xs text-muted">{s.off ? `${pctText(s.off)} under RRP` : s.bestStore ? STORE_BY_KEY.get(s.bestStore)?.name ?? "" : ""}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <section className="card flex flex-col gap-2 p-4">
        <h2 className="text-lg font-bold">Quote this report</h2>
        <p className="text-sm">You&apos;re welcome to use any number here in an article, video or club post, with a link to this page. It updates itself, so the link stays current.</p>
        <p className="rounded bg-raised p-2 font-mono text-xs">{citation}</p>
        <p className="text-sm"><Link className="underline" href="/embed">Free price widgets for your site →</Link></p>
      </section>
    </article>
  );
}
