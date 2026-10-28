import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

// The one share card (link previews on Reddit, Discord, X): drawn once a day at most, from nothing but text.
// No artwork: product photos are the stores', and nothing of Games Workshop's is drawn here.
export const runtime = "nodejs";
export const revalidate = 86400;
export const alt = `${SITE_NAME}: Warhammer prices compared across discount stores`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px", background: "#0e0e0f", color: "#f0ece4" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg viewBox="0 0 64 64" width="96" height="96">
            <path d="M32 6 54.5 19v26L32 58 9.5 45V19z" fill="none" stroke="#e2ac52" strokeWidth="5" strokeLinejoin="round" />
            <path d="M21 27h17l-5-5M43 37H26l5 5" fill="none" stroke="#e2ac52" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontSize: 72, fontWeight: 800, display: "flex" }}>
            Wargame<span style={{ color: "#e2ac52" }}>Compare</span>
          </div>
        </div>
        <div style={{ marginTop: 36, fontSize: 44, lineHeight: 1.25, maxWidth: 980, display: "flex" }}>Warhammer prices compared across independent stores, cheapest in stock first.</div>
        <div style={{ marginTop: 28, fontSize: 30, color: "#aca69c", display: "flex" }}>UK · Australia · New Zealand · Canada · US</div>
      </div>
    ),
    size,
  );
}
