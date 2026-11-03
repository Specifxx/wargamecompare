import { sitemapIndexXml } from "@/lib/sitemap";

// The sitemap index (src/lib/sitemap.ts). Cached by Vercel's CDN through next.config.js (CDN_PAGES).
export const dynamic = "force-dynamic";

export function GET() {
  return new Response(sitemapIndexXml(), { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
