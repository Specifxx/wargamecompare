import Link from "next/link";

// Christmas (owner, 2026-11-01: "make all of the sites Christmas themed"): a winter-night card on the home page with its own
// snow and lights, a tree and presents, and one link to the gifts worth comparing. It is in the HTML all year (a few hundred
// bytes) and shown only while <html> carries data-season="christmas" (src/lib/season.ts, 1 November to Boxing Day), so it
// switches itself on and off with no deploy. The art is aria-hidden and takes no taps; the link is the only target.
export function ChristmasBanner({ title, text, href, cta }: { title: string; text: string; href: string; cta: string }) {
  return (
    <aside className="xmas-only xmas-banner" aria-label="Christmas gifts">
      <span className="xmas-snow" aria-hidden="true" />
      <span className="xmas-lights" aria-hidden="true" />
      <div className="xmas-banner-body">
        <p className="xmas-banner-title">{title}</p>
        <p className="xmas-banner-text">{text}</p>
        <Link href={href} prefetch={false} className="xmas-banner-link">
          {cta} <span aria-hidden="true">→</span>
        </Link>
      </div>
      <span className="xmas-banner-art" aria-hidden="true">
        <span className="xmas-art xmas-gift" />
        <span className="xmas-art xmas-tree" />
        <span className="xmas-art xmas-cane" />
      </span>
    </aside>
  );
}
