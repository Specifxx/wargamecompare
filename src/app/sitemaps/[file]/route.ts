import { sitemapPart, urlsetXml } from "@/lib/sitemap";

// One part of the sitemap: /sitemaps/site.xml, /sitemaps/uk.xml … (src/lib/sitemap.ts). Cached by Vercel's CDN (CDN_PAGES).
export const dynamic = "force-dynamic";

export function GET(_req: Request, { params }: { params: { file: string } }) {
  const part = params.file.replace(/\.xml$/, "");
  const urls = params.file.endsWith(".xml") ? sitemapPart(part) : null;
  if (!urls) return new Response("Not found", { status: 404 });
  return new Response(urlsetXml(urls), { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
