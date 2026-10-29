import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { VercelPageViews } from "@/components/VercelPageViews";
import { jsonLd, siteJsonLd } from "@/lib/seo";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import { SEASON_BOOT_SCRIPT } from "@/lib/season";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
import "./globals.css";

// The display face is Cinzel (OFL, bundled in src/app/fonts): carved-stone capitals for the logo and headings. No font
// request at build or at runtime. "swap", not "optional": the wordmark is the brand. Body text and prices stay on the
// system stack.
const display = localFont({
  src: [
    { path: "./fonts/Cinzel-700.ttf", weight: "700" },
    { path: "./fonts/Cinzel-900.ttf", weight: "900" },
  ],
  variable: "--font-display",
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

export const viewport: Viewport = { themeColor: "#0b0b0d" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={display.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT + SEASON_BOOT_SCRIPT }} />
        <link rel="preconnect" href="https://cdn.shopify.com" />
      </head>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">
          Skip to content
        </a>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(siteJsonLd()) }} />
        <VercelPageViews />
      </body>
    </html>
  );
}
