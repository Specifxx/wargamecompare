import Link from "next/link";
import { CreatorAvatar } from "@/components/creators/CreatorAvatar";
import { featuredCreators } from "@/lib/creators";

// The landing page's way into /creators, like MTG Compare's and Gundam Compare's: the featured creators' faces and the
// newest one's name. Static data, server HTML, one followed link. Renders nothing without creators.
export function CreatorsTeaser() {
  const creators = featuredCreators().slice(0, 5);
  const first = creators[0];
  if (!first) return null;
  const handle = first.links[0]?.handle;
  return (
    <Link href="/creators" prefetch={false} className="card group mt-8 flex flex-col gap-4 p-4 transition-shadow hover:shadow-lift sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex items-center gap-4">
        <div className="flex shrink-0 -space-x-3">
          {creators.map((c) => (
            <span key={c.slug} className="rounded-full ring-2 ring-brand/60 ring-offset-2 ring-offset-surface">
              <CreatorAvatar creator={c} size={56} decorative />
            </span>
          ))}
        </div>
        <div className="min-w-0 text-left">
          <p className="eyebrow text-brand">Featured creator</p>
          <p className="mt-0.5 text-lg font-bold leading-snug group-hover:text-brand">
            {first.name}
            {handle && <span className="ml-2 text-sm font-medium text-muted">{handle}</span>}
          </p>
          <p className="text-sm text-muted">{first.blurb}</p>
        </div>
      </div>
      <span className="btn-ghost shrink-0">Meet our creators →</span>
    </Link>
  );
}
