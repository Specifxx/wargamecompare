"use client";

import Link from "@/components/Link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { formatPrice, REGIONS, type Region } from "@/lib/regions";
import { Icon } from "./Icon";
import { StockPill } from "./StockPill";

// The site's search box (the engine's, from MTG Compare, on this site's own index): the header's (size "sm") and the region home
// hero's ("lg"). A plain GET form to /<region>/search?q=, so it works without script; with script, a typeahead over the region's
// browse index (/api/index/<region>: one CDN-cached JSON per region, loaded on the first focus or keystroke, once per page). Every
// keystroke is ranked in the browser; no query ever reaches a function. Up to 6 products (photo, name, price, stock) and, last,
// "See all results for “…”", the search page filtered by the same words.
//
// An ARIA 1.2 combobox: the input keeps focus (role=combobox, aria-activedescendant); ↑ ↓ move through the options, Enter opens the
// chosen one (or, with none chosen, the full results), Esc closes the list, then clears the box. Options are real links that are
// not tab stops. The list is a fixed layer: below lg the header's box opens it as a sheet across the screen under the header;
// anywhere else it hangs under the box.

/** One row of /api/index/<region>: id, name, system, faction, type, best price (cents) or null, in stock, stores, % off or null, photo. */
type Row = [string, string, string, string, string, number | null, number, number, number | null, string | null];

const LIMIT = 6;
const cache = new Map<Region, Promise<Row[]>>();
function loadIndex(region: Region): Promise<Row[]> {
  let p = cache.get(region);
  if (!p) {
    p = fetch(`/api/index/${region}`)
      .then((r) => (r.ok ? (r.json() as Promise<Row[]>) : []))
      .catch(() => []);
    cache.set(region, p);
  }
  return p;
}

export const norm = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** The rows whose name holds every word typed, the most stocked first (the index's order), in stock before sold out. Pure. */
export function rankRows(rows: Row[], q: string, limit = LIMIT): { hits: Row[]; total: number } {
  const words = norm(q).split(" ").filter(Boolean);
  if (!words.length) return { hits: [], total: 0 };
  const all = rows.filter((r) => {
    const n = norm(r[1]);
    return words.every((w) => n.includes(w));
  });
  const open = all.filter((r) => r[6] > 0);
  const sold = all.filter((r) => r[6] === 0);
  return { hits: [...open, ...sold].slice(0, limit), total: all.length };
}

function useDesktop(): boolean {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(m.matches);
    update();
    m.addEventListener("change", update);
    return () => m.removeEventListener("change", update);
  }, []);
  return desktop;
}

export function SearchBox({ region, size = "sm", autoFocus = false }: { region: Region; size?: "sm" | "lg"; autoFocus?: boolean }) {
  const router = useRouter();
  const big = size === "lg";
  const desktop = useDesktop();
  const sheet = !big && !desktop; // the header's box below lg
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const listId = `${uid}-list`;
  const optionId = (i: number) => `${uid}-opt-${i}`;

  useEffect(() => setMounted(true), []);
  const warm = () => {
    if (rows) return;
    loadIndex(region).then(setRows);
  };

  const term = q.trim();
  const ranked = useMemo(() => (rows ? rankRows(rows, term) : { hits: [], total: 0 }), [rows, term]);
  const allHref = `/${region}/search?q=${encodeURIComponent(term)}`;
  const n = ranked.hits.length + 1; // the hits and "See all"
  const visible = mounted && open && !!term;
  const act = active < n ? active : -1;

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  // Where the list hangs: under the box (and following it while the page scrolls); the phone sheet needs no measurement.
  useEffect(() => {
    if (!visible || sheet) return;
    const place = () => {
      const r = formRef.current?.getBoundingClientRect();
      if (!r) return;
      const vw = document.documentElement.clientWidth;
      const width = Math.min(vw - 16, big ? r.width : Math.max(r.width, 420));
      const left = Math.max(8, Math.min(big ? r.left : r.right - width, vw - width - 8));
      setPos({ top: r.bottom + 6, left, width });
    };
    place();
    window.addEventListener("scroll", place, { passive: true, capture: true });
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, { capture: true });
      window.removeEventListener("resize", place);
    };
  }, [visible, sheet, big]);

  const goAll = () => {
    close();
    inputRef.current?.blur();
    // A pasted store link goes to the "Is this a good price?" checker (lib/link-check.ts), in the fragment: one CDN copy.
    if (/^\s*(https?:\/\/|[a-z0-9-]+(\.[a-z0-9-]+)+\/)/i.test(term)) {
      router.push(`/is-this-a-good-price#link=${encodeURIComponent(term.trim())}`);
      return;
    }
    router.push(term ? allHref : `/${region}/search`);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp": {
        if (!term) return;
        e.preventDefault();
        warm();
        if (!visible) return setOpen(true);
        const down = e.key === "ArrowDown";
        setActive((a) => (a < 0 ? (down ? 0 : n - 1) : (a + (down ? 1 : -1) + n) % n));
        return;
      }
      case "Escape":
        if (visible) {
          e.preventDefault();
          close();
        } else if (q) {
          e.preventDefault();
          setQ("");
        }
        return;
      case "Enter":
        if (visible && act >= 0) {
          e.preventDefault();
          if (act < ranked.hits.length) {
            close();
            inputRef.current?.blur();
            router.push(`/${region}/p/${ranked.hits[act][0]}`);
          } else goAll();
        }
        return;
    }
  };

  const status = !visible ? "" : !rows ? "Loading suggestions…" : ranked.total ? `${ranked.total} products found` : "No products found";
  const list = visible ? (
    <>
      {sheet && <div aria-hidden="true" className="fixed inset-x-0 bottom-0 top-[var(--hdr)] z-40 bg-black/30" />}
      <div
        onMouseDown={(e) => e.preventDefault() /* keep focus in the box */}
        style={sheet ? undefined : pos ? { top: pos.top, left: pos.left, width: pos.width } : { visibility: "hidden" }}
        className={
          sheet
            ? "fixed inset-x-0 top-[var(--hdr)] z-50 max-h-[calc(100dvh-var(--hdr))] overflow-y-auto overscroll-contain border-b border-line bg-surface shadow-lift"
            : "fixed z-50 overflow-y-auto overscroll-contain rounded-xl border border-line bg-surface shadow-lift"
        }
      >
        {!rows && (
          <p className="flex items-center gap-2 px-4 pt-3 text-xs text-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-faint" aria-hidden="true" /> Loading products in {REGIONS[region].inName}…
          </p>
        )}
        {rows && ranked.total === 0 && (
          <p className="px-4 pt-3 text-sm text-muted">
            No product names match &ldquo;{term}&rdquo; in {REGIONS[region].inName}. Try a kit, an army or a paint name.
          </p>
        )}
        <div role="listbox" id={listId} aria-label="Search suggestions" className="py-1.5">
          {ranked.hits.map((r, i) => {
            const selected = i === act;
            return (
              <Link
                key={r[0]}
                href={`/${region}/p/${r[0]}`}
                role="option"
                id={optionId(i)}
                aria-selected={selected}
                tabIndex={-1}
                data-option="product"
                onClick={() => {
                  close();
                  inputRef.current?.blur();
                }}
                onMouseMove={() => setActive(i)}
                className={`flex items-center gap-3 px-3 py-2 sm:px-4 ${selected ? "bg-raised" : ""}`}
              >
                <span className="plate flex h-10 w-10 shrink-0 items-center justify-center">
                  {r[9] ? <img src={r[9]} alt={r[1]} width={40} height={40} loading="lazy" decoding="async" className="h-full w-full object-contain p-0.5" /> : <Icon name="tag" size={16} className="text-faint" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm leading-snug text-ink">{r[1]}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="tabular text-xs text-muted">
                      {r[5] != null ? (
                        <>
                          from <b className="font-semibold text-ink">{formatPrice(r[5], region)}</b>
                        </>
                      ) : (
                        "Sold out"
                      )}
                    </span>
                    <StockPill state={r[6] > 0 ? "open" : "soldout"} size="sm">
                      {r[6] > 0 ? `In stock · ${r[6]}` : `${r[7]} ${r[7] === 1 ? "store" : "stores"}`}
                    </StockPill>
                  </span>
                </span>
              </Link>
            );
          })}
          <Link
            href={allHref}
            role="option"
            id={optionId(ranked.hits.length)}
            aria-selected={act === ranked.hits.length}
            tabIndex={-1}
            data-option="all"
            onClick={(e) => {
              e.preventDefault();
              goAll();
            }}
            onMouseMove={() => setActive(ranked.hits.length)}
            className={`mt-1 flex min-h-12 items-center justify-between gap-3 border-t border-line px-4 py-2.5 text-sm font-semibold text-brand-strong ${act === ranked.hits.length ? "bg-raised" : ""}`}
          >
            <span className="min-w-0 truncate">See all results for &ldquo;{term}&rdquo;</span>
            <span className="flex shrink-0 items-center gap-2 text-muted">
              {ranked.total > ranked.hits.length && (
                <span className="tabular text-xs font-medium" aria-hidden="true">
                  {ranked.total.toLocaleString("en")}
                </span>
              )}
              <Icon name="arrow-right" size={16} />
            </span>
          </Link>
        </div>
      </div>
    </>
  ) : null;

  return (
    <form
      ref={formRef}
      role="search"
      action={`/${region}/search`}
      method="get"
      aria-label={big ? "Search products" : "Header search"}
      onSubmit={(e) => {
        e.preventDefault();
        if (visible && act >= 0 && act < ranked.hits.length) {
          close();
          router.push(`/${region}/p/${ranked.hits[act][0]}`);
          return;
        }
        goAll();
      }}
      className={`relative flex w-full items-center gap-2 rounded-full border border-line bg-surface transition-shadow focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15 ${big ? "p-1.5 pl-5 shadow-lift" : "h-11 px-3.5 lg:h-10"}`}
    >
      <Icon name="search" size={big ? 20 : 16} className="text-faint" />
      <input
        ref={inputRef}
        name="q"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setActive(-1);
          setOpen(true);
          warm();
        }}
        onFocus={() => {
          warm();
          if (term) setOpen(true);
        }}
        onBlur={close}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        role="combobox"
        aria-expanded={visible}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={visible && act >= 0 ? optionId(act) : undefined}
        placeholder={big ? "Combat Patrol, Intercessors, Contrast paint…" : "Search kits, paints, codexes…"}
        aria-label="Search products"
        className={`min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-faint ${big ? "py-2 text-base" : "text-base lg:text-sm"}`}
      />
      <span className="sr-only" aria-live="polite">
        {status}
      </span>
      {big && (
        <button type="submit" className="btn-primary min-h-11 px-5">
          Search
        </button>
      )}
      {list}
    </form>
  );
}
