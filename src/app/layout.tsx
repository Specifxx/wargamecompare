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

// Both faces are bundled (OFL, src/app/fonts; the latin subsets of the variable fonts): no font request at build or at
// runtime, and a metric-matched fallback so nothing moves when they arrive. Plus Jakarta Sans for headings and Inter for text,
// the family's faces since 2026-11-03 (owner: RiftCompare's look; the old game-styled display fonts were "way too tacky").
const display = localFont({
  src: [{ path: "./fonts/PlusJakartaSans-latin.woff2", weight: "200 800" }],
  variable: "--font-display",
  display: "swap",
});
const sans = localFont({
  src: [{ path: "./fonts/Inter-latin.woff2", weight: "100 900" }],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}: Warhammer prices compared across stores`, template: `%s | ${SITE_NAME}` },
  description: SITE_TAGLINE,
  applicationName: SITE_NAME,
  robots: { googleBot: { "max-image-preview": "large", "max-snippet": -1 } },
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
};

export const viewport: Viewport = { themeColor: "#12151c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT + SEASON_BOOT_SCRIPT + REGION_BOOT_SCRIPT + HOME_REGION_SCRIPT }} />
        <link rel="preconnect" href="https://cdn.shopify.com" />
      </head>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">
          Skip to content
        </a>
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
