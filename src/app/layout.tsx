import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { VercelPageViews } from "@/components/VercelPageViews";
import { ShareArrival } from "@/components/ShareArrival";
import { jsonLd, siteJsonLd } from "@/lib/seo";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import { SEASON_BOOT_SCRIPT } from "@/lib/season";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
import { REGION_BOOT_SCRIPT } from "@/lib/regions";
import { QuickView } from "@/components/QuickView";
import "./globals.css";

// The display face is bundled (OFL, src/app/fonts): no font request at build or at runtime. Body text is the system stack.
const display = localFont({
  src: [
    { path: "./fonts/BricolageGrotesque-SemiBold.ttf", weight: "600" },
    { path: "./fonts/BricolageGrotesque-ExtraBold.ttf", weight: "800" },
  ],
  variable: "--font-display",
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

export const viewport: Viewport = { themeColor: "#171616" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={display.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT + SEASON_BOOT_SCRIPT + REGION_BOOT_SCRIPT }} />
        <link rel="preconnect" href="https://cdn.shopify.com" />
      </head>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">
          Skip to content
        </a>
        {children}
        {/* On every page, the home page included: any product link opens the quick view. */}
        <QuickView />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(siteJsonLd()) }} />
        <VercelPageViews />
        <ShareArrival />
      </body>
    </html>
  );
}
