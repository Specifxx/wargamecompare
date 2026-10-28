import { EBAY_DISCLOSURE, ebayLabel, ebaySearchUrl, REL_PAID, type Placement } from "@/lib/affiliate";
import type { Region } from "@/lib/regions";
import { OutboundLink } from "./OutboundLink";

const QUICK = ["Combat Patrol", "Spearhead", "Kill Team", "Citadel paint set", "Codex", "Battleforce"];

/** A labelled eBay block: one search button and quick searches. An ad, and it says so. */
export function EbayBox({ region, query, heading, placement }: { region: Region; query: string; heading: string; placement: Placement }) {
  return (
    <section className="ad-box p-5" aria-label="eBay (advertisement)">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="ad-pill">Ad</span>
          <h2 className="font-display text-lg font-bold">{heading}</h2>
        </div>
        <OutboundLink href={ebaySearchUrl(query, region, placement)} rel={REL_PAID} retailer={ebayLabel(region)} placement={placement} className="btn-ad">
          Search {ebayLabel(region)} for new {query}
        </OutboundLink>
      </div>
      {query === "Warhammer" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <OutboundLink key={q} href={ebaySearchUrl(`Warhammer ${q}`, region, placement)} rel={REL_PAID} retailer={ebayLabel(region)} placement={placement} className="rounded-full border border-dashed border-ad-line bg-surface px-3 py-1 text-xs font-medium">
              {q}
            </OutboundLink>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-faint">{EBAY_DISCLOSURE} New, Buy It Now listings. eBay sellers are not part of our store comparison.</p>
    </section>
  );
}
