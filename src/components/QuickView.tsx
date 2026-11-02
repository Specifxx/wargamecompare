"use client";
// The quick view (owner, 2026-10-30: "I really like the kaeyoung quick view pop ups", ported from K Young). A click on
// any product tile (a[data-qv]) opens this panel at once with what the tile already knows (photo, name), then fills in
// every store's price from /api/quick/<region>/<id>, CDN-cached for a day. The tile stays a real link: crawlers, new
// tabs and modified clicks go to the product page, whose server HTML keeps every price. eBay first, Amazon second, as
// on the page.
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { PriceListData } from "@/lib/price-rows";
import { PriceList } from "./PriceList";
import { ShareButton } from "./ShareButton";

interface Head {
  key: string;
  href: string;
  api: string;
  name: string;
  img: string | null;
}
interface Data {
  stores: number;
  inStock: number;
  rows: PriceListData;
  name: string;
  img: string | null;
  /** the product page's path and the share message (lib/share-link.ts) */
  path?: string;
  share?: string;
}

const cache = new Map<string, Promise<Data | null>>();
function load(api: string): Promise<Data | null> {
  let p = cache.get(api);
  if (!p) {
    p = fetch(api)
      .then((r) => (r.ok ? (r.json() as Promise<Data>) : null))
      .catch(() => null);
    p.then((d) => d || cache.delete(api));
    cache.set(api, p);
  }
  return p;
}
// Every link to a product page opens it (owner, 2026-10-31: "whenever I click on any item … a quick view open like K Young"):
// a tile's data-qv attributes when it has them, else the region and id read from the href (/<region>/p/<id>), with the
// link's own photo and text until the response brings the product's own. Links in the quick view, and on the product's
// own page, navigate as usual.
const PRODUCT_PATH = /^\/(uk|au|nz|ca|us)\/p\/([^/?#]+)\/?$/;
function headOf(e: Event): Head | null {
  const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download") || a.closest("[role=dialog]")) return null;
  const href = a.getAttribute("href")!;
  let region: string, id: string, name: string, img: string | null;
  if (a.dataset.qv && a.dataset.qvRegion) {
    [region, id, name, img] = [a.dataset.qvRegion, a.dataset.qv, a.dataset.qvName || "", a.dataset.qvImg || null];
  } else {
    const m = PRODUCT_PATH.exec(href);
    if (!m || window.location.pathname.replace(/\/$/, "") === href.replace(/\/$/, "")) return null;
    const pic = a.querySelector("img");
    const text = (a.textContent || "").replace(/\s+/g, " ").trim();
    [region, id, name, img] = [m[1], decodeURIComponent(m[2]), pic?.alt || (text.length <= 140 ? text : ""), pic?.currentSrc || pic?.src || null];
  }
  const api = `/api/quick/${region}/${encodeURIComponent(id)}`;
  return { key: api, href, api, name, img };
}

export function QuickView() {
  const [head, setHead] = useState<Head | null>(null);
  const [data, setData] = useState<Data | null | "loading">(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setHead(null), []);

  useEffect(() => {
    // Capture phase on the document: runs before Next's Link, which then sees the click already handled.
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const h = headOf(e);
      if (!h) return;
      e.preventDefault();
      setHead(h);
      setData("loading");
      load(h.api).then((d) => setData((cur) => (cur === "loading" ? d : cur)));
    }
    // Warm the response when a mouse rests on a tile, so most opens are instant.
    function onOver(e: PointerEvent) {
      const h = e.pointerType === "mouse" ? headOf(e) : null;
      if (h) load(h.api);
    }
    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerover", onOver, { passive: true });
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerover", onOver);
    };
  }, []);

  useEffect(() => {
    if (!head) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [head, close]);

  if (!head) return null;
  const got = data && data !== "loading" ? data : null;
  const name = got?.name || head.name;
  const img = head.img || got?.img || null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={name}>
      <button type="button" aria-label="Close" tabIndex={-1} className="qv-backdrop absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={close} />
      <div className="qv-panel relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-2xl sm:rounded-2xl">
        <div className="flex items-start gap-4 border-b border-line p-4 sm:p-5">
          <div className="plate h-24 w-24 shrink-0">
            {img ? <img src={img} alt="" className="h-full w-full object-contain p-1.5" /> : <div className="flex h-full items-center justify-center text-xs text-sold">No photo</div>}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-bold leading-snug">{name || <span className="qv-shimmer inline-block h-5 w-48 rounded" />}</h2>
            {data && data !== "loading" && (
              <p className="mt-1 text-xs text-faint">
                {data.inStock} of {data.stores} {data.stores === 1 ? "store" : "stores"} in stock
              </p>
            )}
            {got?.share && got.path && <ShareButton title={name} path={got.path} text={got.share} className="mt-2" />}
          </div>
          <button ref={closeRef} type="button" onClick={close} aria-label="Close" className="-mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-raised hover:text-ink">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <h3 className="mb-3 text-sm font-semibold">Every store&rsquo;s price</h3>
          {data === "loading" ? (
            <Skeleton />
          ) : data ? (
            <PriceList {...data.rows} compact />
          ) : (
            <p className="rounded-xl border border-line p-4 text-sm text-muted">Prices did not load. The full page has every store&rsquo;s price.</p>
          )}
        </div>
        <div className="border-t border-line p-4 sm:px-5">
          <Link href={head.href} onClick={close} className="btn-primary flex w-full justify-center px-5 py-2.5 text-[15px]">
            See all details <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line" aria-label="Loading prices" aria-busy="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 space-y-1.5">
            <div className="qv-shimmer h-3.5 w-1/3 rounded" />
            <div className="qv-shimmer h-2.5 w-1/2 rounded" />
          </div>
          <div className="qv-shimmer h-8 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
