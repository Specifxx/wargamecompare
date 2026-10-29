"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatPrice, type Region } from "@/lib/regions";
import { OutboundLink } from "./OutboundLink";

type Row = [string, string, string, string, string, number | null, number, number, number | null, string | null];

const norm = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Client-side search over /api/index/<region> (one CDN-cached file per region). Filters live in the URL's query string. */
export function Search({
  region,
  systems,
  factions,
  types,
  ebayBase,
  ebayBrowse,
}: {
  region: Region;
  systems: [string, string][];
  factions: [string, string][];
  types: [string, string][];
  ebayBase: string;
  ebayBrowse: string;
}) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState("");
  const [system, setSystem] = useState("");
  const [faction, setFaction] = useState("");
  const [type, setType] = useState("");
  const [stock, setStock] = useState(true);
  const [sort, setSort] = useState("relevance");
  const [shown, setShown] = useState(60);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ(p.get("q") ?? "");
    setSystem(p.get("system") ?? "");
    setFaction(p.get("faction") ?? "");
    setType(p.get("type") ?? "");
    fetch(`/api/index/${region}`)
      .then((r) => r.json())
      .then(setRows)
      .catch(() => setRows([]));
  }, [region]);

  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (system) p.set("system", system);
    if (faction) p.set("faction", faction);
    if (type) p.set("type", type);
    const s = p.toString();
    window.history.replaceState(null, "", s ? `?${s}` : window.location.pathname);
    setShown(60);
  }, [q, system, faction, type]);

  const results = useMemo(() => {
    if (!rows) return [];
    const words = norm(q).split(" ").filter(Boolean);
    const out = rows.filter((r) => {
      if (system && r[2] !== system) return false;
      if (faction && r[3] !== faction) return false;
      if (type && r[4] !== type) return false;
      if (stock && !r[6]) return false;
      if (!words.length) return true;
      const n = norm(r[1]);
      return words.every((w) => n.includes(w));
    });
    if (sort === "price") out.sort((a, b) => (a[5] ?? 1e12) - (b[5] ?? 1e12));
    else if (sort === "saving") out.sort((a, b) => (b[8] ?? -1) - (a[8] ?? -1));
    return out;
  }, [rows, q, system, faction, type, stock, sort]);

  const sel = "h-10 rounded-md border border-line bg-surface px-3 text-sm";
  return (
    <div>
      <div className="mt-4 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="sq">Search</label>
        <input id="sq" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-10 min-w-0 flex-1 rounded-md border border-line bg-surface px-4 text-base sm:text-sm" />
        <select aria-label="Game" value={system} onChange={(e) => setSystem(e.target.value)} className={sel}>
          <option value="">All games</option>
          {systems.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select aria-label="Army" value={faction} onChange={(e) => setFaction(e.target.value)} className={sel}>
          <option value="">All armies</option>
          {factions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select aria-label="Type" value={type} onChange={(e) => setType(e.target.value)} className={sel}>
          <option value="">All types</option>
          {types.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} className={sel}>
          <option value="relevance">Most stocked</option>
          <option value="price">Cheapest</option>
          <option value="saving">Biggest saving</option>
        </select>
        <label className="chip cursor-pointer">
          <input type="checkbox" checked={stock} onChange={(e) => setStock(e.target.checked)} /> In stock only
        </label>
      </div>
      <p className="mt-4 text-sm text-faint">{rows ? `${results.length.toLocaleString("en")} results` : "Loading…"}</p>
      {q && (results.length > 0 || !rows) && (
        <div className="ad-box mt-3 flex flex-wrap items-center gap-3 px-4 py-3">
          <p className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold">
            <span className="ad-pill">Ad</span> <span className="truncate">“{q}” on eBay, new and Buy It Now</span>
          </p>
          <OutboundLink href={ebayBrowse.replace("QUERY", encodeURIComponent(q))} rel="sponsored nofollow noopener" retailer="eBay" placement="browse-ebay" className="btn-ad">
            Search eBay
          </OutboundLink>
        </div>
      )}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {results.slice(0, shown).map((r) => (
          <Link key={r[0]} href={`/${region}/p/${r[0]}`} className="card group flex flex-col overflow-hidden hover:shadow-lift">
            <div className="plate m-2 aspect-square">{r[9] && <img src={r[9]} alt="" loading="lazy" className="h-full w-full object-contain p-2" />}</div>
            <div className="flex flex-1 flex-col gap-1 px-3 pb-3">
              <p className="line-clamp-2 text-sm font-semibold group-hover:text-brand">{r[1]}</p>
              <div className="mt-auto flex items-baseline justify-between pt-1">
                {r[5] != null ? <span className="tabular font-bold">{formatPrice(r[5], region)}</span> : <span className="text-sm text-sold">Sold out</span>}
                {r[8] != null && r[8] >= 5 && <span className="rounded bg-open-soft px-1.5 text-xs font-bold text-open">−{r[8]}%</span>}
              </div>
              <p className="text-xs text-faint">{r[6]} of {r[7]} stores in stock</p>
            </div>
          </Link>
        ))}
      </div>
      {results.length > shown && (
        <p className="mt-6 text-center">
          <button type="button" className="btn-ghost" onClick={() => setShown((n) => n + 60)}>Show more</button>
        </p>
      )}
      {rows && !results.length && q && (
        <div className="ad-box mt-6 p-5">
          <p className="flex items-center gap-2 font-semibold"><span className="ad-pill">Ad</span> Nothing at the stores we compare. Try eBay:</p>
          <OutboundLink href={ebayBase.replace("QUERY", encodeURIComponent(q))} rel="sponsored nofollow noopener" retailer="eBay" placement="browse-empty" className="btn-ad mt-3">
            Search eBay for “{q}”
          </OutboundLink>
        </div>
      )}
    </div>
  );
}
