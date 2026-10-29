import { ImageResponse } from "next/og";
import { summariesFor, offersFor } from "@/lib/data";
import { formatPrice, REGION_LIST, type Region } from "@/lib/regions";
import { SITE_NAME } from "@/lib/site";
import { STORES, STORE_BY_KEY } from "@/lib/stores";
import { DISPLAY, OG, OG_BACKDROP, OgWordmark, SANS, ogFonts } from "@/lib/og/brand";

// The one share card (link previews on Reddit, Discord, X): drawn once a day at most, from nothing but text.
// No artwork: product photos are the stores', and nothing of Games Workshop's is drawn here. The right half is a real
// comparison from today's data (the UK kit most stores have in stock under its RRP); with no data it is left out.
export const runtime = "nodejs";
export const revalidate = 86400;
export const alt = `${SITE_NAME}: Warhammer prices compared across discount stores`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const { ink: INK, muted: MUTED, gold: GOLD, panel: PANEL, line: LINE, green: GREEN } = OG;

interface Example {
  region: Region;
  name: string;
  rrp: number;
  rows: { store: string; price: number }[];
  inStock: number;
}

function example(): Example | null {
  try {
    const region: Region = "uk";
    const pick = summariesFor(region)
      .filter((s) => s.rrp && s.off && s.off >= 0.15 && s.inStock >= 8 && s.product.name.length <= 40)
      .sort((a, b) => b.inStock - a.inStock)[0];
    if (!pick) return null;
    const seen = new Set<string>();
    const rows = offersFor(pick.product.id, region)
      .filter((o) => o.in)
      .sort((a, b) => a.p - b.p)
      .filter((o) => !seen.has(o.s) && seen.add(o.s))
      .slice(0, 3)
      .map((o) => ({ store: STORE_BY_KEY.get(o.s)?.name ?? o.s, price: o.p }));
    return rows.length === 3 ? { region, name: pick.product.name, rrp: pick.rrp!, rows, inStock: pick.inStock } : null;
  } catch {
    return null;
  }
}

export default function Image() {
  const ex = example();
  const regions = REGION_LIST.map((r) => r.short).join("   ");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", padding: "0 64px", gap: 48, color: INK, fontFamily: SANS, ...OG_BACKDROP }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <OgWordmark size={38} />
          <div style={{ marginTop: 36, fontFamily: DISPLAY, fontSize: 50, fontWeight: 900, lineHeight: 1.12, display: "flex" }}>
            Find the cheapest store for any Warhammer kit.
          </div>
          <div style={{ marginTop: 24, fontSize: 28, lineHeight: 1.35, color: MUTED, display: "flex" }}>
            {`${STORES.length} independent stores compared daily, in stock and cheapest first.`}
          </div>
          <div style={{ marginTop: 28, fontSize: 26, fontWeight: 700, color: GOLD, letterSpacing: 2, display: "flex" }}>{regions}</div>
        </div>
        {ex && (
          <div style={{ width: 470, display: "flex", flexDirection: "column", background: PANEL, border: `2px solid ${GOLD}`, borderRadius: 14, padding: "30px 32px" }}>
            <div style={{ fontSize: 18, color: MUTED, letterSpacing: 2, display: "flex" }}>TODAY IN THE UK</div>
            <div style={{ marginTop: 10, fontSize: 30, fontWeight: 800, lineHeight: 1.15, display: "flex" }}>{ex.name}</div>
            <div style={{ marginTop: 10, fontSize: 22, color: MUTED, display: "flex", gap: 10 }}>
              <span>RRP</span>
              <span style={{ textDecoration: "line-through" }}>{formatPrice(ex.rrp, ex.region)}</span>
            </div>
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column" }}>
              {ex.rows.map((r, i) => (
                <div key={r.store} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderTop: `1px solid ${LINE}` }}>
                  <div style={{ fontSize: 24, color: i === 0 ? INK : MUTED, display: "flex", maxWidth: 270, overflow: "hidden" }}>{r.store}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: i === 0 ? GREEN : INK, display: "flex" }}>{formatPrice(r.price, ex.region)}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 20, color: MUTED, display: "flex" }}>
              {`${Math.round((1 - ex.rows[0].price / ex.rrp) * 100)}% under RRP · ${ex.inStock} stores in stock`}
            </div>
          </div>
        )}
      </div>
    ),
    { ...size, fonts: ogFonts() },
  );
}
