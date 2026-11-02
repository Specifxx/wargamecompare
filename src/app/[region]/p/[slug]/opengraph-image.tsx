import { ImageResponse } from "next/og";
import { offersFor, product, rrpFor } from "@/lib/data";
import { HUB_IMAGE_SIZE } from "@/lib/og/hub-image";
import { formatPrice, isRegion, REGIONS } from "@/lib/regions";
import { priceGap } from "@/lib/share-link";
import { STORE_BY_KEY } from "@/lib/stores";

// A kit's share card (owner, 2026-11-02: word of mouth): the real price gap in the region, the cheapest and dearest
// in-stock store and how much less, with the RRP the stores state when there is one. Text only, like every share card
// here (nothing of Games Workshop's). Drawn per request and held by Vercel's CDN for a day (next.config.js CDN_PAGES),
// like the page: no ISR, nothing at build. No gap: the kit and its cheapest price, or its name alone.
export const dynamic = "force-dynamic";
export const alt = "Store prices compared";
export const size = HUB_IMAGE_SIZE;
export const contentType = "image/png";

const BG = "#0e0e0f";
const INK = "#f0ece4";
const MUTED = "#aca69c";
const GOLD = "#e2ac52";
const GREEN = "#7fc98a";

export default function Image({ params }: { params: { region: string; slug: string } }) {
  const region = isRegion(params.region) ? params.region : "uk";
  const r = REGIONS[region];
  const p = product(params.slug);
  const open = p ? offersFor(p.id, region).filter((o) => o.in) : [];
  const gap = priceGap(open.map((o) => ({ priceCents: o.p, storeName: STORE_BY_KEY.get(o.s)?.name ?? o.s })));
  const cheapest = open.length ? Math.min(...open.map((o) => o.p)) : null;
  const rrp = p ? rrpFor(p.id, region) : null;
  const name = p ? (p.name.length > 70 ? `${p.name.slice(0, 68)}…` : p.name) : "Wargame kit prices";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "44px 64px 56px", background: BG, color: INK }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, fontWeight: 800 }}>
          <svg viewBox="0 0 64 64" width="40" height="40">
            <path d="M32 6 54.5 19v26L32 58 9.5 45V19z" fill="none" stroke={GOLD} strokeWidth="5" strokeLinejoin="round" />
            <path d="M21 27h17l-5-5M43 37H26l5 5" fill="none" stroke={GOLD} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ display: "flex" }}>
            Wargame<span style={{ color: GOLD }}>Compare</span>
          </div>
          <div style={{ display: "flex", marginLeft: 12, fontSize: 22, color: MUTED }}>{r.name}</div>
        </div>
        <div style={{ marginTop: 34, fontSize: name.length > 40 ? 50 : 60, fontWeight: 800, lineHeight: 1.1, display: "flex" }}>{name}</div>
        {gap ? (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 34 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
              <span style={{ fontSize: 72, fontWeight: 800, color: GREEN }}>{formatPrice(gap.low.priceCents, region)}</span>
              <span style={{ fontSize: 30, color: INK }}>{`at ${gap.low.storeName}`}</span>
            </div>
            <div style={{ display: "flex", fontSize: 32, color: MUTED, marginTop: 6 }}>
              {`up to ${formatPrice(gap.high.priceCents, region)} elsewhere${rrp ? ` · RRP ${formatPrice(rrp, region)}` : ""}`}
            </div>
          </div>
        ) : cheapest != null ? (
          <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 34 }}>
            <span style={{ fontSize: 72, fontWeight: 800, color: GREEN }}>{formatPrice(cheapest, region)}</span>
            {rrp ? <span style={{ fontSize: 32, color: MUTED }}>{`RRP ${formatPrice(rrp, region)}`}</span> : null}
          </div>
        ) : null}
        <div style={{ marginTop: "auto", fontSize: 28, color: GOLD, display: "flex" }}>
          {gap ? `${gap.pct}% less at the cheapest of ${gap.sellers} stores. Prices checked daily.` : `Every store's price in ${r.inName}, checked daily.`}
        </div>
      </div>
    ),
    HUB_IMAGE_SIZE,
  );
}
