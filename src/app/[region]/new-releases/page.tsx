import type { Metadata } from "next";
import Link from "next/link";
import { EbayBox } from "@/components/EbayBox";
import { FamilyCluster } from "@/components/FamilyCluster";
import { releasesFor } from "@/lib/data";
import { thumb } from "@/lib/images";
import { regionOr404 } from "@/lib/page";
import { formatPrice, REGION_LIST } from "@/lib/regions";
import type { ReleaseItem } from "@/lib/releases";
import { ogFor, regionAlternates } from "@/lib/seo";

// New releases and pre-orders (lib/releases.ts): what stores are taking pre-orders for, with the release date their own titles
// state, then what the import first saw in the last 45 days. Cached by the CDN like every region page (next.config.js).
export const dynamic = "force-dynamic";

const longDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function generateMetadata({ params }: { params: { region: string } }): Metadata {
  const r = regionOr404(params.region);
  const title = `New Warhammer releases and pre-orders in ${r.inName}: prices compared`;
  const description = `This week's Warhammer pre-orders and new releases in ${r.inName}: release dates, and which store is cheapest, from the stores we compare.`;
  return { title: { absolute: title }, description, alternates: regionAlternates(r.region, "/new-releases", REGION_LIST.map((x) => x.region)), openGraph: ogFor(`/${r.region}/new-releases`, title, description) };
}

function Rows({ items, region, kind }: { items: ReleaseItem[]; region: Parameters<typeof formatPrice>[1]; kind: "pre" | "new" }) {
  return (
    <div className="card mt-4 divide-y divide-line overflow-hidden">
      {items.map((it) => (
        <Link key={it.product.id} href={`/${region}/p/${it.product.id}`} className="flex items-center gap-3 px-3 py-3 hover:bg-raised">
          <div className="plate h-14 w-14 shrink-0">{it.product.image && <img src={thumb(it.product.image, 120) ?? undefined} alt={it.product.name} loading="lazy" className="h-full w-full object-contain p-1" />}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{it.product.name}</p>
            <p className="text-xs text-faint">
              {kind === "pre"
                ? `${it.preorder!.releaseDate ? `Out ${longDate(it.preorder!.releaseDate)} · ` : ""}${it.preorder!.stores} ${it.preorder!.stores === 1 ? "store" : "stores"} taking pre-orders`
                : `First seen ${longDate(it.product.firstSeen.slice(0, 10))} · ${it.stores} ${it.stores === 1 ? "store" : "stores"}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-faint">from</p>
            <p className="tabular font-bold">{formatPrice(kind === "pre" ? it.preorder!.cents : it.cents, region)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function NewReleasesPage({ params }: { params: { region: string } }) {
  const r = regionOr404(params.region);
  const { preorders, arrivals } = releasesFor(r.region);
  return (
    <div className="page py-8">
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">New Warhammer releases and pre-orders in {r.inName}</h1>
      <p className="mt-3 max-w-3xl text-[15px] leading-7 text-muted">
        Games Workshop opens pre-orders most Saturdays. Here is every product the stores we compare are taking pre-orders for, with the release date the stores
        state, then what has just arrived. Every price is the store&rsquo;s own, in {r.currency}, item price only; shipping is extra.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold">On pre-order now</h2>
        {preorders.length ? (
          <Rows items={preorders.slice(0, 120)} region={r.region} kind="pre" />
        ) : (
          <p className="card mt-4 p-4 text-muted">No store in {r.inName} is taking pre-orders right now. New ones usually open on Saturday.</p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold">Just arrived</h2>
        <p className="mt-1 text-sm text-muted">Products the stores listed for the first time in the last 45 days, newest first.</p>
        {arrivals.length ? <Rows items={arrivals.slice(0, 120)} region={r.region} kind="new" /> : <p className="card mt-4 p-4 text-muted">Nothing new in the last 45 days.</p>}
      </section>

      <div className="mt-8">
        <EbayBox region={r.region} query="Warhammer new release" heading="New releases on eBay" placement="new-releases" />
      </div>
      <FamilyCluster region={r.region} />
    </div>
  );
}
