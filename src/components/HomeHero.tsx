import Link from "next/link";
import type { ReactNode } from "react";
import { HeroSparks } from "./HeroSparks";

/**
 * The home pages' hero (owner, 2026-11-03: RiftCompare's look, "less is more"): centred, the title with a soft gold glow, one
 * line under it, the search and the country row, and the living sparks behind it all. Server HTML throughout: the eyebrow, h1
 * and lead are exactly the words the page had before (the SEO stays as it was); only the dressing changed.
 */
export function HomeHero({ eyebrow, title, lead, children, note }: { eyebrow: ReactNode; title: ReactNode; lead: ReactNode; children?: ReactNode; note?: ReactNode }) {
  return (
    <section className="hero-band relative -mx-4 -mt-8 overflow-x-clip px-4 pb-10 pt-10 text-center sm:-mx-6 sm:px-6 sm:pb-12 sm:pt-14 lg:rounded-b-3xl">
      <HeroSparks />
      <p className="eyebrow inline-flex items-center justify-center gap-1.5 text-brand">{eyebrow}</p>
      <h1 className="hero-glow mx-auto mt-3 max-w-4xl font-display text-3xl font-extrabold leading-[1.1] sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-2xl text-base text-muted sm:text-lg">{lead}</p>
      {children}
      {note && <p className="mt-5 text-xs text-muted">{note}</p>}
    </section>
  );
}

/** A section's title row: the heading, one line under it and, with `href`, the link to all of it. */
export function SectionHead({ title, sub, href, all, as: As = "h2" }: { title: ReactNode; sub?: ReactNode; href?: string; all?: string; as?: "h2" | "p" }) {
  return (
    <div className="section-head">
      <div className="min-w-0">
        <As className="section-title">{title}</As>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {href && (
        <Link href={href} prefetch={false} className="shrink-0 text-sm font-semibold text-brand hover:underline">
          {all ?? "See all"} →
        </Link>
      )}
    </div>
  );
}
