import Link from "next/link";
import { CHRISTMAS_FESTIVE_LAYER } from "@/lib/season";

// Christmas (1 November to Boxing Day, src/lib/season.ts): a one-line gift-guide card on the home page, in the site's own
// colours with a cranberry left border and a pine badge (globals.css .xmas-gift). Owner, 2026-11-08: the first Christmas card
// (winter night, snow, lights, a tree and presents) was too much; 2026-11-12: more festive again, tastefully. It is server
// HTML all year, shown only while <html> carries data-season="christmas", so it switches itself on and off with no deploy.
// Not a heading. With CHRISTMAS_FESTIVE_LAYER false it is the plain gifts pill again.
export function ChristmasBanner({ title, href, cta }: { title: string; href: string; cta: string }) {
  if (!CHRISTMAS_FESTIVE_LAYER) {
    return (
      <p className="xmas-pill-row">
        <Link href={href} prefetch={false} className="xmas-pill">
          <b>{title}</b>
          <span className="xmas-pill-more hidden sm:inline">· {cta} →</span>
        </Link>
      </p>
    );
  }
  return (
    <div className="xmas-gift" data-xmas-gift>
      <Link href={href} prefetch={false}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="8" width="18" height="4" rx="1" />
          <path d="M5 12v8h14v-8M12 8v12M12 8c-2.5 0-4-1-4-2.5S9.5 3 12 8c2.5-5 4-3.5 4-2.5S14.5 8 12 8z" />
        </svg>
        <span className="xmas-gift-text">
          <b>Christmas gift guide</b>
          <span className="xmas-gift-sub">{cta}</span>
        </span>
        <span className="xmas-gift-badge">Gifts →</span>
      </Link>
    </div>
  );
}
