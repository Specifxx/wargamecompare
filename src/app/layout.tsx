import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { VercelPageViews } from "@/components/VercelPageViews";
import { ShareArrival } from "@/components/ShareArrival";
import { jsonLd, siteJsonLd } from "@/lib/seo";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import { SEASON_BOOT_SCRIPT } from "@/lib/season";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
import { HOME_REGION_SCRIPT, REGION_BOOT_SCRIPT } from "@/lib/regions";
import { QuickView } from "@/components/QuickView";
import { RateCard } from "@/components/site-reviews/RateCard";
import "./globals.css";
import "@/components/site-reviews/site-reviews.css";

// The engine's two faces (DexCompare and MTG Compare: Bricolage Grotesque for headings, Inter for text), bundled as the latin
// subsets of the variable fonts (OFL, src/app/fonts): no font request at build or at runtime. Display is optional, not swap:
// both faces are preloaded, so a warm visit renders in them from the first paint, and a slow first visit keeps the size-adjusted
// fallback for that page instead of re-wrapping every line when the font lands (MTG Compare measured CLS 0.209 with swap).
const display = localFont({
  src: [{ path: "./fonts/BricolageGrotesque-latin.woff2", weight: "600 800" }],
  variable: "--font-display",
  display: "optional",
});
const sans = localFont({
  src: [{ path: "./fonts/Inter-latin.woff2", weight: "100 900" }],
  variable: "--font-sans",
  display: "optional",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}: Warhammer prices compared across stores`, template: `%s | ${SITE_NAME}` },
  description: SITE_TAGLINE,
  applicationName: SITE_NAME,
  robots: { googleBot: { "max-image-preview": "large", "max-snippet": -1 } },
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
};

// Dark by default (lib/theme.ts); the browser bar follows the default, not a saved light choice.
export const viewport: Viewport = { themeColor: "#0f1013" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The boot scripts below stamp data-theme, data-season, data-hr on this element before React hydrates; React must not report that.
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT + SEASON_BOOT_SCRIPT + REGION_BOOT_SCRIPT + HOME_REGION_SCRIPT }} />
        {/* Product photos are the stores' own, on Shopify's CDN: warming that connection is the cheapest LCP win there is. */}
        <link rel="preconnect" href="https://cdn.shopify.com" />
      </head>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">
          Skip to content
        </a>
        {/* Each layout under this one (and the 404) draws the Header, its <main> and the Footer itself: the footer's links depend
            on the page's region. */}
        {children}
        {/* On every page, the home page included: any product link opens the quick view. */}
        <QuickView />
        {/* Rate us (owner, 2026-11-03): the corner card, asking only after real use; RiftCompare keeps the ratings. */}
        <RateCard />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(siteJsonLd()) }} />
        <VercelPageViews />
        <ShareArrival />
      </body>
    </html>
  );
}
