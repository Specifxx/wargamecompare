import { ImageResponse } from "next/og";
import { offersFor, type Summary } from "@/lib/data";
import { formatPrice, REGIONS, type Region } from "@/lib/regions";
import { STORES } from "@/lib/stores";
import { DISPLAY, OG, OG_BACKDROP, OgWordmark, SANS, ogFonts } from "@/lib/og/brand";

// The share card of a game, army or product type page: its four kits most stores have in stock, each with the RRP the
// stores state, the typical (median) in stock store price and the cheapest. Text only, like the root share card: no
// product photo and nothing of Games Workshop's. Real data or no rows: a hub with no RRP'd kits draws its title alone.
const { ink: INK, muted: MUTED, gold: GOLD, line: LINE, green: GREEN } = OG;
export const HUB_IMAGE_SIZE = { width: 1200, height: 630 };

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

export function hubRows(region: Region, items: Summary[], n = 4) {
  return items
    .filter((s) => s.rrp && s.best && s.inStock >= 3 && s.product.name.length <= 44)
    .sort((a, b) => b.inStock - a.inStock)
    .slice(0, n)
    .map((s) => {
      const open = offersFor(s.product.id, region).filter((o) => o.in).map((o) => o.p);
      return { name: s.product.name, rrp: s.rrp!, typical: median(open), best: s.best!, stores: s.inStock };
    });
}

export function hubImage(region: Region, title: string, items: Summary[]) {
  const r = REGIONS[region];
  const stores = STORES.filter((s) => s.market === r.market).length;
  const rows = hubRows(region, items);
  const cell = { display: "flex", justifyContent: "flex-end", width: 170 } as const;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "44px 64px 56px", color: INK, fontFamily: SANS, ...OG_BACKDROP }}>
        <OgWordmark size={26} />
        <div style={{ marginTop: 26, fontFamily: DISPLAY, fontSize: 44, fontWeight: 900, lineHeight: 1.1, display: "flex" }}>{title}</div>
        <div style={{ marginTop: 10, fontSize: 26, color: MUTED, display: "flex" }}>{`RRP, the typical store and the cheapest of ${stores} stores in ${r.inName}`}</div>
        {rows.length > 0 && (
          <div style={{ marginTop: 26, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 18, color: MUTED, letterSpacing: 2, paddingBottom: 8 }}>
              <div style={{ display: "flex", flex: 1 }}>KIT</div>
              <div style={cell}>RRP</div>
              <div style={cell}>TYPICAL</div>
              <div style={cell}>CHEAPEST</div>
            </div>
            {rows.map((x) => (
              <div key={x.name} style={{ display: "flex", alignItems: "center", fontSize: 26, padding: "11px 0", borderTop: `1px solid ${LINE}` }}>
                <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>{x.name}</div>
                <div style={{ ...cell, color: MUTED, textDecoration: "line-through" }}>{formatPrice(x.rrp, region)}</div>
                <div style={cell}>{formatPrice(x.typical, region)}</div>
                <div style={{ ...cell, color: GREEN, fontWeight: 800 }}>{`${formatPrice(x.best, region)}`}</div>
              </div>
            ))}
          </div>
        )}
        {rows.length > 0 && (
          <div style={{ marginTop: "auto", fontSize: 26, color: GOLD, display: "flex" }}>
            {`Cheapest store up to ${Math.round(Math.max(...rows.map((x) => 1 - x.best / x.rrp)) * 100)}% under RRP. Prices checked daily.`}
          </div>
        )}
      </div>
    ),
    { ...HUB_IMAGE_SIZE, fonts: ogFonts() },
  );
}
