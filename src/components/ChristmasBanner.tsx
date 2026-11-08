import Link from "next/link";

// Christmas (1 November to Boxing Day, src/lib/season.ts): one quiet line on the home page to the gifts worth
// comparing, in the site's own colours (globals.css .xmas-pill). Owner, 2026-11-08: the first Christmas card (winter
// night, snow, lights, a tree and presents) was too much; the theme must match the domain. It is in the HTML all year
// and shown only while <html> carries data-season="christmas", so it switches itself on and off with no deploy.
export function ChristmasBanner({ title, href, cta }: { title: string; href: string; cta: string }) {
  return (
    <p className="xmas-pill-row">
      <Link href={href} prefetch={false} className="xmas-pill">
        <b>{title}</b>
        <span className="xmas-pill-more hidden sm:inline">· {cta} →</span>
      </Link>
    </p>
  );
}
