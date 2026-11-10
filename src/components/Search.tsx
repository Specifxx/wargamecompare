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
  const typeName = new Map(types);
  const factionName = new Map(factions);

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

  const sel = "h-10 rounded-full border border-line bg-surface px-3 text-sm";
  return (
    <div>
      <div className="mt-4 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="sq">Search</label>
        <input id="sq" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-10 min-w-0 flex-1 rounded-full border border-line bg-surface px-4 text-base sm:text-sm" />
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
      <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {results.slice(0, shown).map((r) => (
          <Link key={r[0]} href={`/${region}/p/${r[0]}`} data-qv={r[0]} data-qv-region={region} data-qv-name={r[1]} data-qv-img={r[9] ?? undefined} className="group card flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lift">
            <div className="plate relative m-2 aspect-square lg:mb-0 lg:aspect-[8/7]">
              {r[9] ? (
                <img src={r[9]} alt={r[1]} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-contain p-3 mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.03]" />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-sm font-semibold text-[#5c606c]">{typeName.get(r[4]) ?? r[4]}</div>
              )}
              {r[4] && typeName.get(r[4]) && <span className="absolute left-2 top-2 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-semibold text-muted shadow-card backdrop-blur">{typeName.get(r[4])}</span>}
            </div>
            <div className="card-body flex flex-1 flex-col gap-2 px-3 pb-3 pt-1 sm:px-4 sm:pb-4 lg:pt-3">
              <div className="min-h-[2.5rem]">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-brand sm:text-[15px]">{r[1]}</h3>
                {r[3] && factionName.get(r[3]) && <p className="mt-0.5 text-xs text-faint">{factionName.get(r[3])}</p>}
              </div>
              {r[8] != null && r[8] >= 5 && <p className="text-[11px] font-semibold leading-4 text-open">{r[8]}% under RRP</p>}
              <div className="mt-auto">
                <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4 ${r[6] > 0 ? "bg-open-soft text-open" : "bg-sold-soft text-sold"}`}>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
                  {r[6] > 0 ? `In stock · ${r[6]} of ${r[7]}` : r[7] ? `Sold out · all ${r[7]}` : "Not in stock"}
                  <span className="stock-unit">{r[7] === 1 ? " store" : " stores"}</span>
                </span>
                {r[5] != null ? (
                  <p className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="text-xs font-medium text-muted">From</span>
                    <span className="tabular font-display text-lg font-bold">{formatPrice(r[5], region)}</span>
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs font-medium text-faint">No price while sold out</p>
                )}
              </div>
              <p aria-hidden="true" className="h-4 truncate text-[11px] font-semibold leading-4 text-brand-strong lg:h-5 lg:text-xs lg:leading-5 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100">
                {r[7] > 1 ? `Compare ${r[7]} prices` : "See the price"}&nbsp;→
              </p>
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
