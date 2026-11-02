import type { Metadata } from "next";
import { EbayStrip } from "@/components/EbayStrip";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OutboundLink } from "@/components/OutboundLink";
import { PriceList } from "@/components/PriceList";
import { ReportPrice } from "@/components/ReportForms";
import { PriceAlertForm } from "@/components/PriceAlertForm";
import { ALERT_SITE_KEY } from "@/lib/alert-feed";
import { ProductGrid } from "@/components/ProductCard";
import { StoreCode } from "@/components/StoreCode";
import {
  AMAZON_DISCLOSURE,
  amazonLabel,
  amazonSearchUrl,
  EBAY_DISCLOSURE,
  ebayAffiliateUrl,
  ebayLabel,
  ebaySearchUrl,
  REL_PAID,
  REL_STORE,
  storeUrl,
} from "@/lib/affiliate";
import { FACTION_BY_SLUG, SYSTEM_BY_SLUG, TYPE_BY_SLUG } from "@/lib/catalog";
import { ebayFor, meta, offersFor, product, regionsListing, rrpFor, summariesFor, summaryOf } from "@/lib/data";
import { thumb } from "@/lib/images";
import { productIndexable } from "@/lib/index-tiers";
import { priceRows } from "@/lib/price-rows";
import { regionOr404 } from "@/lib/page";
import { formatPrice, REGIONS, type Region } from "@/lib/regions";
import { jsonLd, ogFor, regionAlternates } from "@/lib/seo";
import { STORE_BY_KEY } from "@/lib/stores";
import { activeStoreCode, dealForHost } from "@/lib/store-partner-deals";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

function load(params: { region: string; slug: string }) {
  const r = regionOr404(params.region);
  const p = product(params.slug);
  if (!p) notFound();
  return { r, p, s: summaryOf(p.id, r.region) };
}

export function generateMetadata({ params }: { params: { region: string; slug: string } }): Metadata {
  const { r, p, s } = load(params);
  const listed = regionsListing(p.id);
  const indexable = productIndexable(s);
  const n = s?.stores ?? 0;
  const title = s?.best != null ? `${p.name}: ${formatPrice(s.best, r.region)} at ${n} ${n === 1 ? "store" : "stores"} in ${r.inName}` : `${p.name} price in ${r.inName}`;
  const description = s
    ? `Compare ${p.name} prices in ${r.inName}: ${s.inStock} of ${n} stores have it in stock${s.best != null ? `, from ${formatPrice(s.best, r.region)}` : ""}${s.rrp ? ` (RRP ${formatPrice(s.rrp, r.region)})` : ""}. Prices checked daily.`
    : `${p.name}: not listed by the stores we compare in ${r.inName} today. See other countries and eBay.`;
  return {
    title: { absolute: title.slice(0, 70) },
    description,
    alternates: regionAlternates(r.region, `/p/${p.id}`, listed.filter((x) => productIndexable(summaryOf(p.id, x)))),
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: { ...ogFor(`/${r.region}/p/${p.id}`, title, description), ...(p.image ? { images: [{ url: p.image }] } : {}) },
  };
}

export default function ProductPage({ params }: { params: { region: string; slug: string } }) {
  const { r, p, s } = load(params);
  const region = r.region;
  const offers = offersFor(p.id, region);
  const rrp = rrpFor(p.id, region);
  const best = offers.find((o) => o.in) ?? null;
  const ebay = ebayFor(p.id, region);
  const amazon = amazonSearchUrl(p.name, region, "product-amazon");
  const system = p.system ? SYSTEM_BY_SLUG.get(p.system) : null;
  const faction = p.faction ? FACTION_BY_SLUG.get(p.faction) : null;
  const type = TYPE_BY_SLUG.get(p.type);
  const others = (Object.keys(REGIONS) as Region[]).filter((x) => x !== region).map((x) => ({ x, s: summaryOf(p.id, x) })).filter((o) => o.s);
  const related = summariesFor(region)
    .filter((x) => x.product.id !== p.id && x.inStock > 0 && (faction ? x.product.faction === faction.slug : x.product.system === p.system))
    .slice(0, 6);
  const updated = meta().updatedAt;
  const storeName = (k: string) => STORE_BY_KEY.get(k)?.name ?? k;
  const photoStore = offers.find((o) => o.u && p.image)?.s;
  const ebayCurrencyRegion: Region = region === "nz" ? "au" : region;
  const ld =
    productIndexable(s) && offers.some((o) => o.in)
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          ...(p.image ? { image: p.image } : {}),
          ...(p.ean ? { gtin13: p.ean } : {}),
          ...(p.code ? { mpn: p.code } : {}),
          brand: { "@type": "Brand", name: "Games Workshop" },
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: r.currency,
            lowPrice: (Math.min(...offers.filter((o) => o.in).map((o) => o.p)) / 100).toFixed(2),
            highPrice: (Math.max(...offers.filter((o) => o.in).map((o) => o.p)) / 100).toFixed(2),
            offerCount: offers.filter((o) => o.in).length,
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/${region}/p/${p.id}`,
          },
        }
      : null;

  return (
    <div className="page py-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-faint">
        <Link href={`/${region}`} className="hover:text-ink">{r.short}</Link>
        {system && (
          <>
            {" › "}
            <Link href={`/${region}/game/${system.slug}`} className="hover:text-ink">{system.short}</Link>
          </>
        )}
        {faction && (
          <>
            {" › "}
            <Link href={`/${region}/faction/${faction.slug}`} className="hover:text-ink">{faction.name}</Link>
          </>
        )}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <div className="plate mx-auto aspect-square max-w-md">
            {p.image ? (
              <img src={thumb(p.image, 800) ?? undefined} alt={p.name} className="h-full w-full object-contain p-4" fetchPriority="high" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-sold">No photo</div>
            )}
          </div>
          {p.image && photoStore && <p className="mt-2 text-center text-xs text-faint">Photo: {storeName(photoStore)}</p>}
        </div>

        <div>
          <h1 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">{p.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {system && <Link href={`/${region}/game/${system.slug}`} className="chip py-1 text-xs">{system.name}</Link>}
            {faction && <Link href={`/${region}/faction/${faction.slug}`} className="chip py-1 text-xs">{faction.name}</Link>}
            {type && <Link href={`/${region}/type/${type.slug}`} className="chip py-1 text-xs">{type.name}</Link>}
            {p.code && <span className="chip py-1 text-xs">Box code {p.code}</span>}
          </div>

          <section className="card mt-5 p-5" aria-label="Best price">
            {best ? (
              <>
                <p className="eyebrow">Best price in {r.inName}</p>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="tabular font-display text-4xl font-extrabold">{formatPrice(best.p, region)}</span>
                  <span className="text-muted">at {storeName(best.s)}</span>
                </div>
                {rrp && rrp > best.p && (
                  <p className="mt-1 text-sm">
                    <span className="font-bold text-open">{Math.round(((rrp - best.p) / rrp) * 100)}% under RRP</span>{" "}
                    <span className="text-muted">({formatPrice(rrp, region)}, as the stores state it)</span>
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <OutboundLink href={storeUrl(best.u, dealForHost(new URL(best.u).hostname)?.ref)} rel={REL_STORE} retailer={storeName(best.s)} placement="product-best" className="btn-primary px-6 py-3 text-base">
                    Buy at {storeName(best.s)}
                  </OutboundLink>
                  <OutboundLink href={ebay ? ebayAffiliateUrl(ebay.u, region, "product-best-ebay") : ebaySearchUrl(p.name, region, "product-best-ebay")} rel={REL_PAID} retailer={ebayLabel(region)} placement="product-best-ebay" className="btn-ad px-5 py-3 text-base">
                    {ebay ? `Or ${formatPrice(ebay.p, ebayCurrencyRegion)} on eBay` : "Compare on eBay"}
                  </OutboundLink>
                  <span className="ad-pill">Ad</span>
                  <StoreCode code={activeStoreCode(best.u)} />
                </div>
                <p className="mt-3 text-xs text-faint">Item price only; shipping is added at the store&rsquo;s checkout. {r.taxNote}</p>
              </>
            ) : (
              <>
                <p className="eyebrow">Sold out in {r.inName}</p>
                <p className="mt-1 text-muted">
                  {offers.length ? `None of the ${offers.length} stores that list it has it in stock today.` : "None of the stores we compare lists it today."} New copies on eBay or Amazon:
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <OutboundLink href={ebaySearchUrl(p.name, region, "product-soldout")} rel={REL_PAID} retailer={ebayLabel(region)} placement="product-soldout" className="btn-ad">
                    Search {ebayLabel(region)}
                  </OutboundLink>
                  {amazon && (
                    <OutboundLink href={amazonSearchUrl(p.name, region, "product-soldout")!} rel={REL_PAID} retailer={amazonLabel(region)} placement="product-soldout" className="btn-amazon">
                      Check {amazonLabel(region)}
                    </OutboundLink>
                  )}
                </div>
                <p className="mt-2 text-xs text-faint">Ads. {EBAY_DISCLOSURE}</p>
              </>
            )}
          </section>
        </div>
      </div>

      <section id="prices" className="mt-8">
        <h2 className="mb-3 font-display text-xl font-bold">
          {offers.length ? `${p.name} prices at ${offers.length} ${offers.length === 1 ? "store" : "stores"} in ${r.inName}` : `Where to look for ${p.name} in ${r.inName}`}
        </h2>
        <PriceList {...priceRows(p, region, "product")} />
        <ReportPrice product={`${p.name}${p.code ? ` (${p.code})` : ""}`} region={r.short} buttonClassName="btn-ghost" stores={priceRows(p, region, "product").stores.map((s) => ({ name: s.name, price: s.price ?? "sold out" }))} />
        {/* RiftCompare's shared alert service emails when it drops (lib/alert-feed.ts, DECISIONS.md 2026-11-02). */}
        <PriceAlertForm site={ALERT_SITE_KEY} productId={p.id} region={r.market} priceCents={s?.best ?? null} className="mt-3" buttonClassName="btn-ghost" />
        <p className="mt-2 text-xs text-faint">
          eBay and Amazon are pinned first as labelled ads; the stores under them are sorted by price, in stock first, never by what we earn. {EBAY_DISCLOSURE} {amazon ? AMAZON_DISCLOSURE : ""}
          {updated && ` Store prices checked ${new Date(updated).toUTCString().slice(5, 22)} UTC.`}
        </p>
      </section>

      {others.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-lg font-bold">In other countries</h2>
          <div className="flex flex-wrap gap-2">
            {others.map(({ x, s: os }) => (
              <Link key={x} href={`/${x}/p/${p.id}`} className="chip">
                {REGIONS[x].short}: {os!.best != null ? `from ${formatPrice(os!.best, x)}` : "sold out"} <span className="text-faint">· {os!.stores} {os!.stores === 1 ? "store" : "stores"}</span>
              </Link>
            ))}
          </div>
          <p className="mt-2 text-xs text-faint">Each country in its own currency; we never convert prices.</p>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-xl font-bold">More {faction?.name ?? system?.name ?? ""} in stock</h2>
          <ProductGrid items={related} region={region} />
        </section>
      )}

      <div className="mt-10">
        <EbayStrip
          region={region}
          items={[...(s ? [s] : []), ...related, ...summariesFor(region).filter((x) => x.product.id !== p.id && x.product.system === p.system && x.inStock > 0).slice(0, 12)]}
          placement="ebay-strip-product"
          heading="This kit and similar on eBay"
        />
      </div>

      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />}
    </div>
  );
}
