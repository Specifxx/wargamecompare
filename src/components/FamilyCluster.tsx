// "More hobby deals from our sister sites" (DECISIONS.md "Sites that grow each other", 2026-11-02): one
// tile per hobby sister (Gunpla on Gundam Compare, FigureCompare) with its best real store deal today in
// this region, else the US, read from the committed data/family/family-cluster.json (lib/family.ts). One
// block per page; nothing when no sister has anything. Plain followed links: our own sites, no commission.
import { familyTiles } from "@/lib/family";
import { blockHeading, familyMoney, tileNote } from "@/lib/family-network";
import type { Region } from "@/lib/regions";

export function FamilyCluster({ region }: { region: Region }) {
  const tiles = familyTiles(region);
  if (!tiles.length) return null;
  return (
    <section className="mt-10" aria-labelledby="family-hobby">
      <h2 id="family-hobby" className="font-display text-xl font-bold">{blockHeading("hobby", "deal")}</h2>
      <p className="mt-1 text-sm text-muted">Today&rsquo;s best store price on each of our sister sites, from their own daily price check.</p>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tiles.map(({ site, item, more }) => (
          <li key={site.id} className="card flex min-w-0 gap-3 p-3">
            <div className="plate h-14 w-14 shrink-0">{item.image && <img src={item.image} alt="" aria-hidden="true" loading="lazy" className="h-full w-full object-contain p-1" />}</div>
            <div className="min-w-0 text-sm">
              <p className="eyebrow">{site.topic} · {site.name}</p>
              <a href={item.url} rel="noopener" className="line-clamp-2 font-semibold hover:underline">{item.title}</a>
              <p>
                <span className="tabular font-bold">{familyMoney(item.cents, item.currency)}</span> <span className="text-muted">at {item.store}</span>
              </p>
              <p className="text-xs text-faint">{tileNote(item)}</p>
              {more && <a href={more} rel="noopener" className="text-xs underline">More on {site.name}</a>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
