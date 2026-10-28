// Product photos are the stores' own, hotlinked: never copied, never proxied through Vercel's metered image optimiser
// (next.config.js images.unoptimized). Shopify's CDN resizes on request, so grids ask for a small rendition.
export function thumb(url: string | null | undefined, width = 400): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith("//") ? `https:${url}` : url);
    if (u.protocol !== "https:") return null;
    if (/(^|\.)cdn\.shopify\.com$/.test(u.hostname) || u.pathname.includes("/cdn/shop/")) u.searchParams.set("width", String(width));
    return u.toString();
  } catch {
    return null;
  }
}
