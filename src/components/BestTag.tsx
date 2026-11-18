"use client";
// The small, neutral "Best price" tag on a plain (non-affiliate) cheapest row (owner, 2026-11-18), with an optional "i" hint: the
// title and aria-label carry the text for a pointer and a screen reader; a tap flips data-hint-open on the row, which shows the
// row's muted `.or-hint` line (the tag's own line is clipped on a phone, so the text sits on the row's last line).
import { BEST_PRICE_TAG } from "@/lib/best-tag";

export function BestTag({ hint }: { hint?: string | null }) {
  return (
    <>
      <span className="chip shrink-0 px-2 py-0 text-[10px] font-semibold uppercase tracking-wide" data-best-tag="">
        {BEST_PRICE_TAG}
      </span>
      {hint && (
        <button
          type="button"
          title={hint}
          aria-label={hint}
          aria-expanded={false}
          onClick={(e) => {
            const li = e.currentTarget.closest("li");
            if (!li) return;
            const open = li.toggleAttribute("data-hint-open");
            e.currentTarget.setAttribute("aria-expanded", String(open));
          }}
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-line text-[10px] font-semibold leading-none text-muted hover:border-ink/30"
        >
          i
        </button>
      )}
    </>
  );
}
