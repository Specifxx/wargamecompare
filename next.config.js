/** @type {import('next').NextConfig} */

// Safe defaults on every response. CSP is report-only: product photos are hotlinked from many store CDNs.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy-Report-Only", value: "default-src 'self'; img-src https: data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://vitals.vercel-insights.com; frame-ancestors 'self'; object-src 'none'" },
];

// PAGES ARE CACHED BY VERCEL'S CDN FOR A DAY, NOT ISR (the sister sites' lesson, DECISIONS.md "Pages are CDN-cached,
// not ISR"): every data page is force-dynamic, and this header keeps its response at the CDN. The data changes only with
// a release, and a release empties the CDN. Safe because no page reads a cookie, a header or the session.
const CDN_CACHE = "public, s-maxage=86400, stale-while-revalidate=86400";
const CDN_PAGES = ["/", "/:region(uk|au|nz|ca|us)", "/:region(uk|au|nz|ca|us)/:path*", "/sitemap.xml", "/robots.txt", "/about", "/privacy", "/terms", "/affiliate-disclosure", "/contact"];

module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Store photos are plain <img> tags on the stores' own CDNs: never Vercel Image Optimization, which is metered.
  images: { unoptimized: true },
  // The public data files ride with every server function, which reads them instead of a database. The per-store cache
  // (data/cache) is the importer's alone and is NOT bundled.
  // The share images' two fonts (src/lib/og/brand.tsx) ride along too: 110 KB.
  experimental: { outputFileTracingIncludes: { "/**": ["./data/*.json", "./src/app/fonts/Cinzel-900.ttf", "./src/app/fonts/Inter-700.ttf"] } },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }, ...CDN_PAGES.map((source) => ({ source, headers: [{ key: "Vercel-CDN-Cache-Control", value: CDN_CACHE }] }))];
  },
};
